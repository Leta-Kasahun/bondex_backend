import { Request } from "express";
import { AUTH_MESSAGES } from "../../constants/messages.constant";
import { ApiException } from "../../exceptions/api.exception";
import { asyncHandler } from "../../utils/asyncHandler";
import {
	ConfirmEmailChangeInput,
	RequestEmailChangeInput,
	UpdateUserProfileInput,
} from "./user.types";
import {
	confirmUserEmailChangeService,
	getUserProfileService,
	getUserStatsService,
	requestUserEmailChangeService,
	updateUserProfileService,
} from "./user.service";

const getUserIdFromRequest = (req: Request): string => {
	const userId = req.auth?.id;
	if (!userId || req.auth?.type !== "USER") {
		throw ApiException.unauthorized("User authentication is required");
	}
	return userId;
};

export const getUserProfileController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const profile = await getUserProfileService(userId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.USER_PROFILE_FETCHED,
		data: profile,
	});
});

export const updateUserProfileController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const payload = req.body as UpdateUserProfileInput;
	const profile = await updateUserProfileService(userId, payload);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.USER_PROFILE_UPDATED,
		data: profile,
	});
});

export const getUserStatsController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const stats = await getUserStatsService(userId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.USER_STATS_FETCHED,
		data: stats,
	});
});

export const requestUserEmailChangeController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const payload = req.body as RequestEmailChangeInput;
	await requestUserEmailChangeService(userId, payload);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.USER_EMAIL_CHANGE_OTP_SENT,
	});
});

export const confirmUserEmailChangeController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const payload = req.body as ConfirmEmailChangeInput;
	const profile = await confirmUserEmailChangeService(userId, payload);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.USER_EMAIL_UPDATED,
		data: profile,
	});
});
