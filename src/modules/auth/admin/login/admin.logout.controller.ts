import { RequestHandler } from "express";
import { AUTH_MESSAGES } from "../../../../constants/messages.constant";
import { asyncHandler } from "../../../../utils/asyncHandler";
import {
	ADMIN_REFRESH_TOKEN_COOKIE_NAME,
	clearAdminRefreshTokenCookie,
} from "../../../../utils/jwt.util";
import { logoutAdminAuthService } from "./admin.logout.service";

export const logoutAdminAuthController: RequestHandler = asyncHandler(async (req, res) => {
	const refreshToken = req.cookies?.[ADMIN_REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
	await logoutAdminAuthService(refreshToken);
	clearAdminRefreshTokenCookie(res);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.ADMIN_LOGOUT_SUCCESS,
	});
});
