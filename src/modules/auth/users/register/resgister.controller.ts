import { RequestHandler } from "express";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { RegisterUserInput } from "../auth.types";
import { registerUserService } from "./register.services";

export const registerUserController: RequestHandler = asyncHandler(async (req, res) => {
	const payload = req.body as RegisterUserInput;
	const result = await registerUserService(payload);

	res.status(201).json({
		success: true,
		message: result.message,
		data: {
			userId: result.userId,
			email: result.email,
		},
	});
});
