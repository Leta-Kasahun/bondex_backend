import { Request } from "express";
import { AUTH_MESSAGES } from "../../constants/messages.constant";
import { ApiException } from "../../exceptions/api.exception";
import { asyncHandler } from "../../utils/asyncHandler";
import {
	NotificationListInput,
	NotificationParams,
	NotificationUnreadCountQuery,
} from "./notification.types";
import {
	countUnreadNotificationsService,
	listNotificationsService,
	markNotificationAsReadService,
} from "./appNotification/app.notification.service";

const getUserIdFromRequest = (req: Request): string => {
	const userId = req.auth?.id;
	if (!userId || req.auth?.type !== "USER") {
		throw ApiException.unauthorized("User authentication is required");
	}
	return userId;
};

export const listNotificationsController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const query = req.query as unknown as NotificationListInput;
	const result = await listNotificationsService(userId, query);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.NOTIFICATIONS_LISTED,
		data: result.items,
		meta: {
			total: result.total,
			page: result.page,
			limit: result.limit,
			offset: result.offset,
		},
	});
});

export const markNotificationAsReadController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const params = req.params as unknown as NotificationParams;
	const notification = await markNotificationAsReadService(userId, params.notificationId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.NOTIFICATION_MARKED_AS_READ,
		data: notification,
	});
});

export const getUnreadNotificationCountController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const query = req.query as unknown as NotificationUnreadCountQuery;
	const unreadCount = await countUnreadNotificationsService(userId, query.businessId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.NOTIFICATIONS_UNREAD_COUNT_FETCHED,
		data: { unreadCount },
	});
});
