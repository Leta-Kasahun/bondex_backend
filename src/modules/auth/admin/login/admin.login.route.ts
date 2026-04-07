import { Router } from "express";
import { validateBody } from "../../../../middlewares/validate.middleware";
import { adminLoginController } from "./adminlogin.controller";
import { validateAdminLoginInput } from "./admin.auth.validation";

const router = Router();

router.post("/", validateBody(validateAdminLoginInput), adminLoginController);

export default router;
