import { RequestHandler } from "express";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { setUserRefreshTokenCookie } from "../../../../utils/jwt.util";
import { ForgotPasswordInput, GoogleLoginBody, LoginUserInput, ResetPasswordInput } from "../auth.types";
import { forgotPasswordService } from "./forgotpassword.services";
import { googleLoginService, loginUserService } from "./login.services";
import { resetPasswordService } from "./resetPassword.services";

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

export const resetPasswordController: RequestHandler = asyncHandler(async (req, res) => {
	const payload = req.body as ResetPasswordInput;
	const result = await resetPasswordService(payload);

	res.status(200).json({
		success: true,
		message: result.message,
	});
});
