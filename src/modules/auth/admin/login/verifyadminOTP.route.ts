import { Router } from "express";
import { validateBody } from "../../../../middlewares/validate.middleware";
import { verifyAdminLoginOtpController } from "./verifyadminOTP.controller";
import { validateAdminVerifyOtpInput } from "./admin.auth.validation";

const router = Router();

router.post("/", validateBody(validateAdminVerifyOtpInput), verifyAdminLoginOtpController);

export default router;
