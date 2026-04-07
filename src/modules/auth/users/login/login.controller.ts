import { RequestHandler } from "express";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { setUserRefreshTokenCookie } from "../../../../utils/jwt.util";
import { GoogleLoginBody, LoginUserInput } from "../auth.types";
import { googleLoginService, loginUserService } from "./login.services";

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
