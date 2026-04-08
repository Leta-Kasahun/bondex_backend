import { Router } from "express";
import { authenticateAdmin, authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeAdminOnly, authorizeUserOnly } from "../../middlewares/authorize.middleware";
import adminAiRouter from "./admin/admin.ai.controller";
import internalAiRouter from "./internal/internal.ai.controller";
import privateAiRouter from "./private/private.ai.controller";
import publicAiRouter from "./public/public.ai.controller";

const aiRouter = Router();

aiRouter.use("/public", publicAiRouter);
aiRouter.use("/internal", internalAiRouter);
aiRouter.use("/private", authenticateUser, authorizeUserOnly, privateAiRouter);
aiRouter.use("/admin", authenticateAdmin, authorizeAdminOnly, adminAiRouter);

export default aiRouter;
