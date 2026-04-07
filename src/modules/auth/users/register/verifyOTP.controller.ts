import { RequestHandler } from "express";
import { setUserRefreshTokenCookie } from "../../../../utils/jwt.util";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { VerifyRegistrationOtpInput } from "../auth.types";
import { verifyRegistrationOtpService } from "../verifyOTP.services";

export const verifyRegistrationOtpController: RequestHandler = asyncHandler(async (req, res) => {
	const payload = req.body as VerifyRegistrationOtpInput;
	const result = await verifyRegistrationOtpService(payload);

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
