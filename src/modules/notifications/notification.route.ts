import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeUserOnly } from "../../middlewares/authorize.middleware";
import { validateParams, validateQuery } from "../../middlewares/validate.middleware";
import {
	getUnreadNotificationCountController,
	listNotificationsController,
	markNotificationAsReadController,
} from "./notification.controller";
import {
	validateNotificationListQuery,
	validateNotificationParams,
	validateNotificationUnreadCountQuery,
} from "./notification.validation";

const notificationRouter = Router();

notificationRouter.use(authenticateUser, authorizeUserOnly);

notificationRouter.get("/unread-count", validateQuery(validateNotificationUnreadCountQuery), getUnreadNotificationCountController);
notificationRouter.get("/", validateQuery(validateNotificationListQuery), listNotificationsController);
notificationRouter.patch("/:notificationId/read", validateParams(validateNotificationParams), markNotificationAsReadController);

export default notificationRouter;
