import prisma from "../../config/prisma";
import { AUTH_MESSAGES } from "../../constants/messages.constant";
import { ApiException } from "../../exceptions/api.exception";
import {
	ConvertLeadToDealInput,
	DealListInput,
	DealView,
	UpdateDealStageInput,
} from "./deal.types";

const dealSelect = {
	id: true,
	businessId: true,
	leadId: true,
	name: true,
	value: true,
	stage: true,
	closedAt: true,
	createdAt: true,
	updatedAt: true,
} as const;

const toDealView = (deal: {
	id: string;
	businessId: string;
	leadId: string;
	name: string;
	value: number | null;
	stage: string;
	closedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}): DealView => ({
	id: deal.id,
	businessId: deal.businessId,
	leadId: deal.leadId,
	name: deal.name,
	value: deal.value,
	stage: deal.stage as DealView["stage"],
	closedAt: deal.closedAt,
	createdAt: deal.createdAt,
	updatedAt: deal.updatedAt,
});

const ensureOwnedBusiness = async (businessId: string, userId: string): Promise<void> => {
	const business = await prisma.business.findFirst({
		where: { id: businessId, ownerId: userId },
		select: { id: true },
	});

	if (!business) {
		throw ApiException.notFound(AUTH_MESSAGES.BUSINESS_NOT_FOUND);
	}
};

const findOwnedLead = async (leadId: string, userId: string): Promise<{ id: string; businessId: string }> => {
	const lead = await prisma.lead.findFirst({
		where: { id: leadId, business: { ownerId: userId } },
		select: { id: true, businessId: true },
	});

	if (!lead) {
		throw ApiException.notFound(AUTH_MESSAGES.LEAD_NOT_FOUND);
	}

	return lead;
};

const findOwnedDeal = async (dealId: string, userId: string) => {
	const deal = await prisma.deal.findFirst({
		where: { id: dealId, business: { ownerId: userId } },
		select: dealSelect,
	});

	if (!deal) {
		throw ApiException.notFound(AUTH_MESSAGES.DEAL_NOT_FOUND);
	}

	return deal;
};

export const convertLeadToDealService = async (
	userId: string,
	input: ConvertLeadToDealInput
): Promise<DealView> => {
	const lead = await findOwnedLead(input.leadId, userId);

	const existingDeal = await prisma.deal.findFirst({
		where: { leadId: input.leadId },
		select: { id: true },
	});

	if (existingDeal) {
		throw ApiException.conflict(AUTH_MESSAGES.DEAL_ALREADY_EXISTS_FOR_LEAD);
	}

	const deal = await prisma.$transaction(async (tx) => {
		const createdDeal = await tx.deal.create({
			data: {
				businessId: lead.businessId,
				leadId: lead.id,
				name: input.name,
				...(input.value !== undefined ? { value: input.value } : {}),
			},
			select: dealSelect,
		});

		await tx.lead.update({
			where: { id: lead.id },
			data: { status: "converted" },
		});

		return createdDeal;
	});

	return toDealView(deal);
};

export const listDealsService = async (
	userId: string,
	input: DealListInput
): Promise<{ items: DealView[]; total: number; page: number; limit: number; offset: number }> => {
	await ensureOwnedBusiness(input.businessId, userId);

	const page = Number.isFinite(input.page) && input.page > 0 ? Math.trunc(input.page) : 1;
	const limit = Number.isFinite(input.limit) && input.limit > 0 ? Math.trunc(input.limit) : 10;
	const offset = (page - 1) * limit;
	const search = input.search;

	const where = {
		businessId: input.businessId,
		...(input.stage !== undefined ? { stage: input.stage } : {}),
		...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
	};

	const [{ _count }, deals] = await prisma.$transaction([
		prisma.deal.aggregate({
			where,
			_count: { _all: true },
		}),
		prisma.deal.findMany({
			where,
			orderBy: { updatedAt: "desc" },
			skip: offset,
			take: limit,
			select: dealSelect,
		}),
	]);

	const total = _count._all;

	return {
		items: deals.map(toDealView),
		total,
		page,
		limit,
		offset,
	};
};

export const updateDealStageService = async (
	userId: string,
	dealId: string,
	input: UpdateDealStageInput
): Promise<DealView> => {
	const existingDeal = await findOwnedDeal(dealId, userId);
	const isClosedStage = input.stage === "won" || input.stage === "lost";

	const deal = await prisma.deal.update({
		where: { id: dealId },
		data: {
			stage: input.stage,
			...(input.value !== undefined ? { value: input.value } : {}),
			closedAt: isClosedStage ? existingDeal.closedAt ?? new Date() : null,
		},
		select: dealSelect,
	});

	return toDealView(deal);
};

export const deleteDealService = async (userId: string, dealId: string): Promise<void> => {
	await findOwnedDeal(dealId, userId);

	await prisma.deal.delete({
		where: { id: dealId },
	});
};
