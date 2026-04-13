import { Router } from "express";
import { authenticateAny } from "../../middlewares/auth.middleware";
import { authorizeSubject } from "../../middlewares/authorize.middleware";
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

notificationRouter.use(authenticateAny, authorizeSubject("USER", "ADMIN"));

notificationRouter.get("/unread-count", validateQuery(validateNotificationUnreadCountQuery), getUnreadNotificationCountController);
notificationRouter.get("/", validateQuery(validateNotificationListQuery), listNotificationsController);
notificationRouter.patch("/:notificationId/read", validateParams(validateNotificationParams), markNotificationAsReadController);

export default notificationRouter;
