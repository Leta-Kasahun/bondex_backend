import { RequestHandler } from "express";
import { authConfig } from "../../../config/auth.config";
import { asyncHandler } from "../../../utils/asyncHandler";

export const getGoogleClientConfigController: RequestHandler = asyncHandler(async (_req, res) => {
	res.status(200).json({
		success: true,
		data: {
			clientId: authConfig.google.clientId,
		},
	});
});
