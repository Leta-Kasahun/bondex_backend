import { RequestHandler } from "express";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { adminLoginService } from "./admin.login.service";
import { AdminLoginInput } from "./admin.auth.types";

export const adminLoginController: RequestHandler = asyncHandler(async (req, res) => {
	const payload = req.body as AdminLoginInput;
	const result = await adminLoginService(payload);

	res.status(200).json({
		success: true,
		message: result.message,
		data: {
			adminId: result.adminId,
		},
	});
});
