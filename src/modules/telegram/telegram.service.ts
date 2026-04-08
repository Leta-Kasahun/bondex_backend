import { telegramConfig } from "../../config/telegram.config";
import prisma from "../../config/prisma";
import { TELEGRAM_CONSTANTS } from "../../constants/telegram.constant";
import { ApiException } from "../../exceptions/api.exception";
import { getTelegramThreadToken, processTelegramWebhook } from "./telegram.handler";
import {
	ConnectTelegramInput,
	DisconnectTelegramInput,
	HandleTelegramWebhookInput,
	SendTelegramReplyInput,
	TelegramConnectionView,
	TelegramThreadView,
} from "./telegram.types";

type TelegramApiSuccess<T> = { ok: true; result: T };
type TelegramApiError = { ok: false; description?: string };

const telegramApi = async <T>(
	botToken: string,
	method: string,
	body?: Record<string, unknown>
): Promise<T> => {
	const init: RequestInit = {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		...(body ? { body: JSON.stringify(body) } : {}),
	};

	const response = await fetch(`${TELEGRAM_CONSTANTS.API_BASE_URL}/bot${botToken}/${method}`, {
		...init,
	});

	const data = (await response.json()) as TelegramApiSuccess<T> | TelegramApiError;
	if (!response.ok || !data.ok) {
		const description = "description" in data ? data.description : undefined;
		throw ApiException.badRequest(description ?? "Telegram API request failed");
	}

	return data.result;
};

const ensureOwnedBusiness = async (businessId: string, userId: string) => {
	const business = await prisma.business.findFirst({
		where: { id: businessId, ownerId: userId },
		select: { id: true },
	});

	if (!business) {
		throw ApiException.notFound("Business not found");
	}
};

const webhookUrl = (businessId: string): string => {
	const base = telegramConfig.webhook.baseUrl?.trim();
	if (!base) {
		throw ApiException.badRequest("Telegram webhook base URL is not configured");
	}
	return `${base.replace(/\/$/, "")}${telegramConfig.webhook.publicRoutePrefix}/${businessId}`;
};

export const connectTelegramService = async (
	userId: string,
	input: ConnectTelegramInput
): Promise<TelegramConnectionView> => {
	await ensureOwnedBusiness(input.businessId, userId);

	const me = await telegramApi<{ username?: string }>(input.botToken, "getMe");

	await telegramApi(input.botToken, "setWebhook", {
		url: webhookUrl(input.businessId),
		...(telegramConfig.webhook.secret
			? { secret_token: telegramConfig.webhook.secret }
			: {}),
	});

	await prisma.integration.upsert({
		where: { businessId: input.businessId },
		create: {
			businessId: input.businessId,
			telegramBotToken: input.botToken,
			telegramBotUser: me.username ?? null,
		},
		update: {
			telegramBotToken: input.botToken,
			telegramBotUser: me.username ?? null,
		},
	});

	return {
		businessId: input.businessId,
		botUsername: me.username ?? "unknown",
	};
};

export const disconnectTelegramService = async (
	userId: string,
	input: DisconnectTelegramInput
): Promise<void> => {
	await ensureOwnedBusiness(input.businessId, userId);

	const integration = await prisma.integration.findUnique({
		where: { businessId: input.businessId },
		select: { telegramBotToken: true },
	});

	if (integration?.telegramBotToken) {
		await telegramApi(integration.telegramBotToken, "deleteWebhook");
	}

	await prisma.integration.upsert({
		where: { businessId: input.businessId },
		create: {
			businessId: input.businessId,
			telegramBotToken: null,
			telegramBotUser: null,
		},
		update: {
			telegramBotToken: null,
			telegramBotUser: null,
		},
	});
};

export const handleTelegramWebhookService = async (
	input: HandleTelegramWebhookInput
): Promise<void> => {
	await processTelegramWebhook(input);
};

export const sendTelegramReplyService = async (
	userId: string,
	input: SendTelegramReplyInput
): Promise<void> => {
	const lead = await prisma.lead.findFirst({
		where: {
			id: input.leadId,
			platform: "telegram",
			business: { ownerId: userId },
		},
		select: {
			id: true,
			businessId: true,
			platformUserId: true,
			firstReplyAt: true,
			business: {
				select: {
					integrations: {
						select: { telegramBotToken: true },
					},
				},
			},
		},
	});

	if (!lead) {
		throw ApiException.notFound("Lead not found");
	}

	if (!lead.platformUserId) {
		throw ApiException.badRequest("Lead has no Telegram user id");
	}

	const botToken = lead.business.integrations?.telegramBotToken;
	if (!botToken) {
		throw ApiException.badRequest("Telegram bot is not connected for this business");
	}

	await telegramApi(botToken, "sendMessage", {
		chat_id: lead.platformUserId,
		text: input.message,
	});

	await prisma.$transaction(async (tx) => {
		await tx.lead.update({
			where: { id: lead.id },
			data: {
				status: "contacted",
				...(lead.firstReplyAt ? {} : { firstReplyAt: new Date() }),
			},
		});

		const sessionToken = getTelegramThreadToken(lead.businessId, lead.platformUserId!);
		await tx.chatSession.upsert({
			where: { sessionToken },
			create: {
				businessId: lead.businessId,
				sessionToken,
				status: "active",
			},
			update: {},
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
				direction: "outbound",
				message: input.message,
			},
		});
	});
};

export const getTelegramThreadService = async (
	userId: string,
	leadId: string
): Promise<TelegramThreadView> => {
	const lead = await prisma.lead.findFirst({
		where: {
			id: leadId,
			platform: "telegram",
			business: { ownerId: userId },
		},
		select: {
			id: true,
			businessId: true,
			platformUserId: true,
		},
	});

	if (!lead || !lead.platformUserId) {
		throw ApiException.notFound("Telegram thread not found");
	}

	const session = await prisma.chatSession.findUnique({
		where: { sessionToken: getTelegramThreadToken(lead.businessId, lead.platformUserId) },
		select: {
			messages: {
				orderBy: { createdAt: "asc" },
				select: {
					id: true,
					direction: true,
					message: true,
					read: true,
					createdAt: true,
				},
			},
		},
	});

	return {
		leadId: lead.id,
		businessId: lead.businessId,
		platformUserId: lead.platformUserId,
		messages: session?.messages ?? [],
	};
};
