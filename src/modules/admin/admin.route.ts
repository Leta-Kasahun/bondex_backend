import { Router } from "express";
import { authenticateAdmin } from "../../middlewares/auth.middleware";
import { authorizeAdminOnly } from "../../middlewares/authorize.middleware";
import { validateParams, validateQuery } from "../../middlewares/validate.middleware";
import {
	blockUserForAdminController,
	deleteUserForAdminController,
	getAdminSystemStatsController,
	getUserDetailsForAdminController,
	listUsersForAdminController,
	unblockUserForAdminController,
} from "./admin.controller";
import {
	validateAdminSystemStatsQuery,
	validateAdminUserListQuery,
	validateAdminUserParams,
} from "./admin.validation";

const adminRouter = Router();

adminRouter.use(authenticateAdmin, authorizeAdminOnly);

adminRouter.get("/users", validateQuery(validateAdminUserListQuery), listUsersForAdminController);
adminRouter.get("/users/:userId", validateParams(validateAdminUserParams), getUserDetailsForAdminController);
adminRouter.patch("/users/:userId/block", validateParams(validateAdminUserParams), blockUserForAdminController);
adminRouter.patch("/users/:userId/unblock", validateParams(validateAdminUserParams), unblockUserForAdminController);
adminRouter.delete("/users/:userId", validateParams(validateAdminUserParams), deleteUserForAdminController);
adminRouter.get("/stats/system", validateQuery(validateAdminSystemStatsQuery), getAdminSystemStatsController);

export default adminRouter;
