import { Router } from "express";
import { validateBody } from "../../../../middlewares/validate.middleware";
import {
	validateGoogleSignupInput,
	validateRegisterUserInput,
	validateVerifyRegistrationOtpInput,
} from "../auth.validation";
import { googleSignupController } from "./google.signup.controller";
import { registerUserController } from "./resgister.controller";
import { verifyRegistrationOtpController } from "./verifyOTP.controller";

const registerRouter = Router();

registerRouter.post("/", validateBody(validateRegisterUserInput), registerUserController);
registerRouter.post(
	"/verify-otp",
	validateBody(validateVerifyRegistrationOtpInput),
	verifyRegistrationOtpController
);
registerRouter.post("/google-signup", validateBody(validateGoogleSignupInput), googleSignupController);
export default registerRouter;
