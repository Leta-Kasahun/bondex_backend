import prisma from "../../config/prisma";
import { AUTH_MESSAGES } from "../../constants/messages.constant";
import { ApiException } from "../../exceptions/api.exception";
import {
	createHighPriorityNotification,
	createLeadCreatedNotification,
} from "../notifications/notification.service";
import {
	CreateLeadInput,
	LeadListInput,
	LeadView,
	UpdateLeadInput,
} from "./lead.types";

const leadSelect = {
	id: true,
	businessId: true,
	customerName: true,
	customerEmail: true,
	customerPhone: true,
	message: true,
	platform: true,
	status: true,
	priority: true,
	aiScore: true,
	aiReasoning: true,
	platformUserId: true,
	firstReplyAt: true,
	responseTimeMinutes: true,
	createdAt: true,
	updatedAt: true,
} as const;

const toLeadView = (lead: {
	id: string;
	businessId: string;
	customerName: string | null;
	customerEmail: string | null;
	customerPhone: string | null;
	message: string;
	platform: string;
	status: string;
	priority: string;
	aiScore: number | null;
	aiReasoning: string | null;
	platformUserId: string | null;
	firstReplyAt: Date | null;
	responseTimeMinutes: number | null;
	createdAt: Date;
	updatedAt: Date;
}): LeadView => ({
	id: lead.id,
	businessId: lead.businessId,
	customerName: lead.customerName,
	customerEmail: lead.customerEmail,
	customerPhone: lead.customerPhone,
	message: lead.message,
	platform: lead.platform as LeadView["platform"],
	status: lead.status as LeadView["status"],
	priority: lead.priority as LeadView["priority"],
	aiScore: lead.aiScore,
	aiReasoning: lead.aiReasoning,
	platformUserId: lead.platformUserId,
	firstReplyAt: lead.firstReplyAt,
	responseTimeMinutes: lead.responseTimeMinutes,
	createdAt: lead.createdAt,
	updatedAt: lead.updatedAt,
});

const ensureOwnedBusiness = async (businessId: string, userId: string): Promise<void> => {
	const business = await prisma.business.findFirst({
		where: {
			id: businessId,
			ownerId: userId,
		},
		select: { id: true },
	});

	if (!business) {
		throw ApiException.notFound(AUTH_MESSAGES.BUSINESS_NOT_FOUND);
	}
};

const findOwnedLead = async (leadId: string, userId: string) => {
	const lead = await prisma.lead.findFirst({
		where: {
			id: leadId,
			business: {
				ownerId: userId,
			},
		},
		select: leadSelect,
	});

	if (!lead) {
		throw ApiException.notFound(AUTH_MESSAGES.LEAD_NOT_FOUND);
	}

	return lead;
};

export const createLeadService = async (userId: string, input: CreateLeadInput): Promise<LeadView> => {
	await ensureOwnedBusiness(input.businessId, userId);

	const lead = await prisma.lead.create({
		data: {
			businessId: input.businessId,
			message: input.message,
			platform: "manual",
			...(input.customerName !== undefined ? { customerName: input.customerName } : {}),
			...(input.customerEmail !== undefined ? { customerEmail: input.customerEmail } : {}),
			...(input.customerPhone !== undefined ? { customerPhone: input.customerPhone } : {}),
			...(input.status !== undefined ? { status: input.status } : {}),
			...(input.priority !== undefined ? { priority: input.priority } : {}),
		},
		select: leadSelect,
	});

	await createLeadCreatedNotification(lead.id);
	if (lead.priority === "high") {
		await createHighPriorityNotification(lead.id);
	}

	return toLeadView(lead);
};

export const listLeadsService = async (
	userId: string,
	input: LeadListInput
): Promise<{ items: LeadView[]; total: number; page: number; limit: number; offset: number }> => {
	await ensureOwnedBusiness(input.businessId, userId);

	const page = Number.isFinite(input.page) && input.page > 0 ? Math.trunc(input.page) : 1;
	const limit = Number.isFinite(input.limit) && input.limit > 0 ? Math.trunc(input.limit) : 10;
	const offset = (page - 1) * limit;
	const search = input.search;

	const where = {
		businessId: input.businessId,
		...(input.status !== undefined ? { status: input.status } : {}),
		...(input.priority !== undefined ? { priority: input.priority } : {}),
		...(input.platform !== undefined ? { platform: input.platform } : {}),
		...(search
			? {
				OR: [
					{ customerName: { contains: search, mode: "insensitive" as const } },
					{ customerEmail: { contains: search, mode: "insensitive" as const } },
					{ customerPhone: { contains: search, mode: "insensitive" as const } },
					{ message: { contains: search, mode: "insensitive" as const } },
				],
			}
			: {}),
	};

	const [{ _count }, leads] = await prisma.$transaction([
		prisma.lead.aggregate({
			where,
			_count: { _all: true },
		}),
		prisma.lead.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: offset,
			take: limit,
			select: leadSelect,
		}),
	]);

	const total = _count._all;

	return {
		items: leads.map(toLeadView),
		total,
		page,
		limit,
		offset,
	};
};

export const getLeadByIdService = async (userId: string, leadId: string): Promise<LeadView> => {
	const lead = await findOwnedLead(leadId, userId);
	return toLeadView(lead);
};

export const updateLeadService = async (
	userId: string,
	leadId: string,
	input: UpdateLeadInput
): Promise<LeadView> => {
	const existingLead = await findOwnedLead(leadId, userId);
	const shouldSetFirstReplyAt =
		input.status === "contacted" &&
		existingLead.status !== "contacted" &&
		existingLead.firstReplyAt === null;

	const lead = await prisma.lead.update({
		where: { id: leadId },
		data: {
			...(input.message !== undefined ? { message: input.message } : {}),
			...(input.platform !== undefined ? { platform: input.platform } : {}),
			...(input.customerName !== undefined ? { customerName: input.customerName } : {}),
			...(input.customerEmail !== undefined ? { customerEmail: input.customerEmail } : {}),
			...(input.customerPhone !== undefined ? { customerPhone: input.customerPhone } : {}),
			...(input.status !== undefined ? { status: input.status } : {}),
			...(input.priority !== undefined ? { priority: input.priority } : {}),
			...(shouldSetFirstReplyAt ? { firstReplyAt: new Date() } : {}),
		},
		select: leadSelect,
	});

	if (existingLead.priority !== "high" && lead.priority === "high") {
		await createHighPriorityNotification(lead.id);
	}

	return toLeadView(lead);
};

export const deleteLeadService = async (userId: string, leadId: string): Promise<void> => {
	await findOwnedLead(leadId, userId);

	await prisma.lead.delete({
		where: { id: leadId },
	});
};
