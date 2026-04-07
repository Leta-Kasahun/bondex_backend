import { RequestHandler } from "express";
import { setUserRefreshTokenCookie } from "../../../../utils/jwt.util";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { GoogleSignupBody } from "../auth.types";
import { googleSignupService } from "./google.signup.services";

export const googleSignupController: RequestHandler = asyncHandler(async (req, res) => {
	const payload = req.body as GoogleSignupBody;
	const result = await googleSignupService(payload);

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
