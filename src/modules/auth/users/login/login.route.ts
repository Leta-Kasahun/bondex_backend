import { Router } from "express";
import { validateBody } from "../../../../middlewares/validate.middleware";
import {
	validateForgotPasswordInput,
	validateGoogleLoginInput,
	validateLoginUserInput,
	validateResetPasswordInput,
	validateVerifyResetOtpInput,
} from "../auth.validation";
import {
	forgotPasswordController,
	googleLoginController,
	loginUserController,
	resetPasswordController,
	verifyResetOtpController,
} from "./login.controller";

const loginRouter = Router();

loginRouter.post("/", validateBody(validateLoginUserInput), loginUserController);
loginRouter.post("/google", validateBody(validateGoogleLoginInput), googleLoginController);
loginRouter.post("/forgot-password", validateBody(validateForgotPasswordInput), forgotPasswordController);
loginRouter.post("/verify-reset-otp", validateBody(validateVerifyResetOtpInput), verifyResetOtpController);
loginRouter.post("/reset-password", validateBody(validateResetPasswordInput), resetPasswordController);

export default loginRouter;
