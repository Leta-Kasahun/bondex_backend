import { Request } from "express";
import { AUTH_MESSAGES } from "../../constants/messages.constant";
import { ApiException } from "../../exceptions/api.exception";
import { asyncHandler } from "../../utils/asyncHandler";
import {
	disconnectGmailService,
	getGmailConnectionStatusService,
	sendGmailReplyService,
} from "./gmail.service";
import { GmailBusinessParams, GmailDisconnectInput, GmailReplyInput } from "./gmail.types";

const getUserIdFromRequest = (req: Request): string => {
	const userId = req.auth?.id;
	if (!userId || req.auth?.type !== "USER") {
		throw ApiException.unauthorized("User authentication is required");
	}
	return userId;
};

export const getGmailConnectionStatusController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const params = req.params as GmailBusinessParams;
	const data = await getGmailConnectionStatusService(userId, params.businessId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.GMAIL_STATUS_FETCHED,
		data,
	});
});

export const disconnectGmailController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const payload = req.body as GmailDisconnectInput;
	await disconnectGmailService(userId, payload);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.GMAIL_DISCONNECTED,
	});
});

export const sendGmailReplyController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const payload = req.body as GmailReplyInput;
	await sendGmailReplyService(userId, payload);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.GMAIL_REPLY_SENT,
	});
});
