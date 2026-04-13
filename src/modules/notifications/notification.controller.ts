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

const getNotificationActorFromRequest = (req: Request): { actorId: string; actorType: "USER" | "ADMIN" } => {
	const actorId = req.auth?.id;
	const actorType = req.auth?.type;

	if (!actorId || (actorType !== "USER" && actorType !== "ADMIN")) {
		throw ApiException.unauthorized("User or admin authentication is required");
	}

	return { actorId, actorType };
};

export const listNotificationsController = asyncHandler(async (req, res) => {
	const { actorId, actorType } = getNotificationActorFromRequest(req);
	const query = req.query as unknown as NotificationListInput;
	const result = await listNotificationsService(actorId, actorType, query);

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
	const { actorId, actorType } = getNotificationActorFromRequest(req);
	const params = req.params as unknown as NotificationParams;
	const notification = await markNotificationAsReadService(actorId, actorType, params.notificationId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.NOTIFICATION_MARKED_AS_READ,
		data: notification,
	});
});

export const getUnreadNotificationCountController = asyncHandler(async (req, res) => {
	const { actorId, actorType } = getNotificationActorFromRequest(req);
	const query = req.query as unknown as NotificationUnreadCountQuery;
	const unreadCount = await countUnreadNotificationsService(actorId, actorType, query.businessId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.NOTIFICATIONS_UNREAD_COUNT_FETCHED,
		data: { unreadCount },
	});
});
