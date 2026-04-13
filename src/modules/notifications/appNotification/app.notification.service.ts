import prisma from "../../../config/prisma";
import { AUTH_MESSAGES } from "../../../constants/messages.constant";
import { ApiException } from "../../../exceptions/api.exception";
import { AuthSubject } from "../../../types/jwt.types";
import {
	NotificationListInput,
	NotificationView,
} from "../notification.types";

const notificationSelect = {
	id: true,
	businessId: true,
	leadId: true,
	type: true,
	title: true,
	body: true,
	read: true,
	createdAt: true,
} as const;

const toNotificationView = (item: {
	id: string;
	businessId: string;
	leadId: string;
	type: string;
	title: string;
	body: string;
	read: boolean;
	createdAt: Date;
}): NotificationView => ({
	id: item.id,
	businessId: item.businessId,
	leadId: item.leadId,
	type: item.type as NotificationView["type"],
	title: item.title,
	body: item.body,
	read: item.read,
	createdAt: item.createdAt,
});

export type LeadNotificationContext = {
	leadId: string;
	businessId: string;
	businessName: string;
	ownerEmail: string;
	leadName: string;
	platform: string;
	messagePreview: string;
};

const ensureOwnedBusiness = async (businessId: string, userId: string): Promise<void> => {
	const business = await prisma.business.findFirst({
		where: { id: businessId, ownerId: userId },
		select: { id: true },
	});

	if (!business) {
		throw ApiException.notFound(AUTH_MESSAGES.BUSINESS_NOT_FOUND);
	}
};

export const getLeadNotificationContext = async (
	leadId: string
): Promise<LeadNotificationContext | null> => {
	const lead = await prisma.lead.findUnique({
		where: { id: leadId },
		select: {
			id: true,
			businessId: true,
			customerName: true,
			message: true,
			platform: true,
			business: {
				select: {
					name: true,
					owner: { select: { email: true } },
				},
			},
		},
	});

	if (!lead) {
		return null;
	}

	return {
		leadId: lead.id,
		businessId: lead.businessId,
		businessName: lead.business.name,
		ownerEmail: lead.business.owner.email,
		leadName: lead.customerName ?? "Customer",
		platform: lead.platform,
		messagePreview: lead.message.slice(0, 140),
	};
};

export const createAppNotification = async (input: {
	businessId: string;
	leadId: string;
	type: "lead_created" | "high_priority_lead" | "stale_high_priority";
	title: string;
	body: string;
}): Promise<void> => {
	await prisma.notification.create({
		data: input,
	});
};

export const hasStaleNotification = async (leadId: string): Promise<boolean> => {
	const existing = await prisma.notification.findFirst({
		where: { leadId, type: "stale_high_priority" },
		select: { id: true },
	});
	return !!existing;
};

export const listStaleHighPriorityLeads = async (): Promise<Array<{
	id: string;
	businessId: string;
	leadName: string;
	platform: string;
	messagePreview: string;
	businessName: string;
	ownerEmail: string;
}>> => {
	const staleThreshold = new Date(Date.now() - 60 * 60 * 1000);

	const leads = await prisma.lead.findMany({
		where: {
			priority: "high",
			status: "new",
			firstReplyAt: null,
			createdAt: { lte: staleThreshold },
		},
		select: {
			id: true,
			businessId: true,
			customerName: true,
			message: true,
			platform: true,
			business: {
				select: {
					name: true,
					owner: { select: { email: true } },
				},
			},
		},
	});

	return leads.map((lead) => ({
		id: lead.id,
		businessId: lead.businessId,
		leadName: lead.customerName ?? "Customer",
		platform: lead.platform,
		messagePreview: lead.message.slice(0, 140),
		businessName: lead.business.name,
		ownerEmail: lead.business.owner.email,
	}));
};

export const listNotificationsService = async (
	actorId: string,
	actorType: AuthSubject,
	input: NotificationListInput
): Promise<{ items: NotificationView[]; total: number; page: number; limit: number; offset: number }> => {
	if (input.businessId && actorType === "USER") {
		await ensureOwnedBusiness(input.businessId, actorId);
	}

	const page = Number.isFinite(input.page) && input.page > 0 ? Math.trunc(input.page) : 1;
	const limit = Number.isFinite(input.limit) && input.limit > 0 ? Math.trunc(input.limit) : 10;
	const offset = (page - 1) * limit;
	const baseWhere = input.businessId
		? {
				businessId: input.businessId,
				...(input.read !== undefined ? { read: input.read } : {}),
		  }
		: {
				...(actorType === "USER" ? { business: { ownerId: actorId } } : {}),
				...(input.read !== undefined ? { read: input.read } : {}),
		  };

	const where = baseWhere;

	const totalResult = await prisma.notification.aggregate({
		where,
		_count: { _all: true },
	});

	const items = await prisma.notification.findMany({
		where,
		orderBy: { createdAt: "desc" },
		skip: offset,
		take: limit,
		select: notificationSelect,
	});

	const total = totalResult._count?._all ?? 0;

	return {
		items: items.map(toNotificationView),
		total,
		page,
		limit,
		offset,
	};
};

export const countUnreadNotificationsService = async (
	actorId: string,
	actorType: AuthSubject,
	businessId?: string
): Promise<number> => {
	if (businessId && actorType === "USER") {
		await ensureOwnedBusiness(businessId, actorId);
	}

	const where = businessId
		? { businessId, read: false }
		: {
				...(actorType === "USER" ? { business: { ownerId: actorId } } : {}),
				read: false,
		  };

	const result = await prisma.notification.aggregate({
		where,
		_count: { _all: true },
	});

	return result._count?._all ?? 0;
};

export const markNotificationAsReadService = async (
	actorId: string,
	actorType: AuthSubject,
	notificationId: string
): Promise<NotificationView> => {
	const notification = await prisma.notification.findFirst({
		where: {
			id: notificationId,
			...(actorType === "USER" ? { business: { ownerId: actorId } } : {}),
		},
		select: { id: true },
	});

	if (!notification) {
		throw ApiException.notFound(AUTH_MESSAGES.NOTIFICATION_NOT_FOUND);
	}

	const updated = await prisma.notification.update({
		where: { id: notificationId },
		data: { read: true },
		select: notificationSelect,
	});

	return toNotificationView(updated);
};
