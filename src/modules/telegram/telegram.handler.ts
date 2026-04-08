import { telegramConfig } from "../../config/telegram.config";
import prisma from "../../config/prisma";
import { ApiException } from "../../exceptions/api.exception";
import { createLeadCreatedNotification } from "../notifications/notification.service";
import { HandleTelegramWebhookInput } from "./telegram.types";

export const getTelegramThreadToken = (businessId: string, platformUserId: string): string =>
	`telegram:${businessId}:${platformUserId}`;

const displayName = (from?: { first_name?: string; last_name?: string; username?: string }) => {
	const first = from?.first_name?.trim();
	const last = from?.last_name?.trim();
	const full = [first, last].filter(Boolean).join(" ");
	return full || from?.username || "Telegram User";
};

export const processTelegramWebhook = async (
	input: HandleTelegramWebhookInput
): Promise<void> => {
	if (telegramConfig.webhook.secret && input.secretHeader !== telegramConfig.webhook.secret) {
		throw ApiException.forbidden("Invalid Telegram webhook secret");
	}

	const text = input.update.message?.text?.trim();
	const from = input.update.message?.from;
	if (!text || !from?.id) {
		return;
	}

	const integration = await prisma.integration.findUnique({
		where: { businessId: input.businessId },
		select: { telegramBotToken: true },
	});

	if (!integration?.telegramBotToken) {
		return;
	}

	const platformUserId = String(from.id);
	const sessionToken = getTelegramThreadToken(input.businessId, platformUserId);

	const lead = await prisma.$transaction(async (tx) => {
		await tx.chatSession.upsert({
			where: { sessionToken },
			create: {
				businessId: input.businessId,
				customerName: displayName(from),
				sessionToken,
				status: "active",
			},
			update: {
				customerName: displayName(from),
			},
		});

		const session = await tx.chatSession.findUnique({
			where: { sessionToken },
			select: { id: true },
		});

		if (!session) {
			throw ApiException.internal("Failed to resolve Telegram conversation thread");
		}

		await tx.chatMessage.create({
			data: {
				sessionId: session.id,
				direction: "inbound",
				message: text,
			},
		});

		return tx.lead.create({
			data: {
				businessId: input.businessId,
				customerName: displayName(from),
				message: text,
				platform: "telegram",
				platformUserId,
			},
			select: { id: true },
		});
	});

	await createLeadCreatedNotification(lead.id);
};
