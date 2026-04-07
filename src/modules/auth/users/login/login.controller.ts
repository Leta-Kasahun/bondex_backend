import { RequestHandler } from "express";
import { jwtCookieOptions } from "../../../../config/jwt.config";
import { ApiException } from "../../../../exceptions/api.exception";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { setUserRefreshTokenCookie } from "../../../../utils/jwt.util";
import {
	ForgotPasswordInput,
	GoogleLoginBody,
	LoginUserInput,
	ResetPasswordInput,
	VerifyResetOtpInput,
} from "../auth.types";
import { forgotPasswordService } from "./forgotpassword.services";
import { googleLoginService, loginUserService } from "./login.services";
import { resetPasswordService, verifyResetOtpService } from "./resetPassword.services";

const RESET_PASSWORD_VERIFIED_COOKIE_NAME = "resetPasswordVerifiedUserId";

export const loginUserController: RequestHandler = asyncHandler(async (req, res) => {
	const payload = req.body as LoginUserInput;
	const result = await loginUserService(payload);

	setUserRefreshTokenCookie(res, result.refreshToken);

	res.status(200).json({
		success: true,
		message: result.message,
		data: {
			userId: result.userId,
			email: result.email,
			name: result.name,
			accessToken: result.accessToken,
		},
	});
});

export const googleLoginController: RequestHandler = asyncHandler(async (req, res) => {
	const payload = req.body as GoogleLoginBody;
	const result = await googleLoginService(payload);

	setUserRefreshTokenCookie(res, result.refreshToken);

	res.status(200).json({
		success: true,
		message: result.message,
		data: {
			userId: result.userId,
			email: result.email,
			name: result.name,
			accessToken: result.accessToken,
		},
	});
});

export const forgotPasswordController: RequestHandler = asyncHandler(async (req, res) => {
	const payload = req.body as ForgotPasswordInput;
	const result = await forgotPasswordService(payload);

	res.status(200).json({
		success: true,
		message: result.message,
	});
});

export const verifyResetOtpController: RequestHandler = asyncHandler(async (req, res) => {
	const payload = req.body as VerifyResetOtpInput;
	const result = await verifyResetOtpService(payload);

	res.cookie(RESET_PASSWORD_VERIFIED_COOKIE_NAME, result.userId, {
		...jwtCookieOptions,
		maxAge: 10 * 60 * 1000,
	});

	res.status(200).json({
		success: true,
		message: result.message,
	});
});

export const resetPasswordController: RequestHandler = asyncHandler(async (req, res) => {
	const payload = req.body as ResetPasswordInput;
	const verifiedUserId = req.cookies[RESET_PASSWORD_VERIFIED_COOKIE_NAME] as string | undefined;

	if (!verifiedUserId) {
		throw ApiException.badRequest("Please verify reset OTP first");
	}

	const result = await resetPasswordService(verifiedUserId, payload);

	res.clearCookie(RESET_PASSWORD_VERIFIED_COOKIE_NAME, { ...jwtCookieOptions });

	res.status(200).json({
		success: true,
		message: result.message,
	});
});
