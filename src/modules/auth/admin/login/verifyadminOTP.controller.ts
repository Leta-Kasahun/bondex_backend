import { RequestHandler } from "express";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { setAdminRefreshTokenCookie } from "../../../../utils/jwt.util";
import { verifyAdminLoginOtpService } from "./verifyadminOTP.services";
import { AdminVerifyOtpInput } from "./admin.auth.types";

export const verifyAdminLoginOtpController: RequestHandler = asyncHandler(async (req, res) => {
	const payload = req.body as AdminVerifyOtpInput;
	const result = await verifyAdminLoginOtpService(payload);

	setAdminRefreshTokenCookie(res, result.refreshToken);

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
