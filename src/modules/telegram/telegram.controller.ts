import { Request } from "express";
import { AUTH_MESSAGES } from "../../constants/messages.constant";
import { TELEGRAM_CONSTANTS } from "../../constants/telegram.constant";
import { ApiException } from "../../exceptions/api.exception";
import { asyncHandler } from "../../utils/asyncHandler";
import {
	ConnectTelegramInput,
	DisconnectTelegramInput,
	SendTelegramReplyInput,
	TelegramLeadParams,
	TelegramWebhookParams,
} from "./telegram.types";
import {
	connectTelegramService,
	disconnectTelegramService,
	getTelegramThreadService,
	handleTelegramWebhookService,
	sendTelegramReplyService,
} from "./telegram.service";

const getUserIdFromRequest = (req: Request): string => {
	const userId = req.auth?.id;
	if (!userId || req.auth?.type !== "USER") {
		throw ApiException.unauthorized("User authentication is required");
	}
	return userId;
};

export const connectTelegramController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const payload = req.body as ConnectTelegramInput;
	const result = await connectTelegramService(userId, payload);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.TELEGRAM_CONNECTED,
		data: result,
	});
});

export const disconnectTelegramController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const payload = req.body as DisconnectTelegramInput;
	await disconnectTelegramService(userId, payload);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.TELEGRAM_DISCONNECTED,
	});
});

export const sendTelegramReplyController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const payload = req.body as SendTelegramReplyInput;
	await sendTelegramReplyService(userId, payload);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.TELEGRAM_REPLY_SENT,
	});
});

export const getTelegramThreadController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const params = req.params as TelegramLeadParams;
	const thread = await getTelegramThreadService(userId, params.leadId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.TELEGRAM_THREAD_FETCHED,
		data: thread,
	});
});

export const telegramWebhookController = asyncHandler(async (req, res) => {
	const params = req.params as TelegramWebhookParams;
	const secretHeader = req.headers[TELEGRAM_CONSTANTS.WEBHOOK_SECRET_HEADER] as string | undefined;
	const webhookInput = {
		businessId: params.businessId,
		update: req.body,
		...(secretHeader ? { secretHeader } : {}),
	};
	await handleTelegramWebhookService({
		...webhookInput,
	});

	res.status(200).json({ success: true });
});
