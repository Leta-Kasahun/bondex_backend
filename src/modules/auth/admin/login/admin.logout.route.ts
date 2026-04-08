import { Router } from "express";
import { authenticateAdmin } from "../../../../middlewares/auth.middleware";
import { authorizeAdminOnly } from "../../../../middlewares/authorize.middleware";
import { logoutAdminAuthController } from "./admin.logout.controller";

const router = Router();

router.post("/", authenticateAdmin, authorizeAdminOnly, logoutAdminAuthController);

export default router;
