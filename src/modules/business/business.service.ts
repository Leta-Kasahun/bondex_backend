import prisma from "../../config/prisma";
import { AUTH_MESSAGES } from "../../constants/messages.constant";
import { ApiException } from "../../exceptions/api.exception";
import {
	BusinessListInput,
	BusinessView,
	CreateBusinessInput,
	UpdateBusinessInput,
} from "./business.types";

const businessSelect = {
	id: true,
	name: true,
	type: true,
	description: true,
	logo: true,
	ownerId: true,
	createdAt: true,
	updatedAt: true,
} as const;

const toBusinessView = (
	business: {
		id: string;
		name: string;
		type: string | null;
		description: string | null;
		logo: string | null;
		ownerId: string;
		createdAt: Date;
		updatedAt: Date;
	}
): BusinessView => ({
	id: business.id,
	name: business.name,
	type: business.type,
	description: business.description,
	logo: business.logo,
	ownerId: business.ownerId,
	createdAt: business.createdAt,
	updatedAt: business.updatedAt,
});

const findOwnedBusiness = async (businessId: string, userId: string) => {
	const business = await prisma.business.findFirst({
		where: {
			id: businessId,
			ownerId: userId,
		},
		select: businessSelect,
	});

	if (!business) {
		throw ApiException.notFound(AUTH_MESSAGES.BUSINESS_NOT_FOUND);
	}

	return business;
};

export const createBusinessService = async (
	userId: string,
	input: CreateBusinessInput
): Promise<BusinessView> => {
	const business = await prisma.business.create({
		data: {
			ownerId: userId,
			name: input.name,
			type: input.type ?? null,
			description: input.description ?? null,
			logo: input.logo ?? null,
		},
		select: businessSelect,
	});

	return toBusinessView(business);
};

export const listBusinessesService = async (
	userId: string,
	input: BusinessListInput
): Promise<{ items: BusinessView[]; total: number; page: number; limit: number }> => {
	const skip = (input.page - 1) * input.limit;
	const search = input.search;

	const where = {
		ownerId: userId,
		...(search
			? {
				OR: [
					{ name: { contains: search, mode: "insensitive" as const } },
					{ type: { contains: search, mode: "insensitive" as const } },
				],
			}
			: {}),
	};

	const [total, businesses] = await prisma.$transaction([
		prisma.business.count({ where }),
		prisma.business.findMany({
			where,
			orderBy: { updatedAt: "desc" },
			skip,
			take: input.limit,
			select: businessSelect,
		}),
	]);

	return {
		items: businesses.map(toBusinessView),
		total,
		page: input.page,
		limit: input.limit,
	};
};

export const getBusinessByIdService = async (
	userId: string,
	businessId: string
): Promise<BusinessView> => {
	const business = await findOwnedBusiness(businessId, userId);
	return toBusinessView(business);
};

export const updateBusinessService = async (
	userId: string,
	businessId: string,
	input: UpdateBusinessInput
): Promise<BusinessView> => {
	await findOwnedBusiness(businessId, userId);

	const updated = await prisma.business.update({
		where: { id: businessId },
		data: {
			...(input.name !== undefined ? { name: input.name } : {}),
			...(input.type !== undefined ? { type: input.type ?? null } : {}),
			...(input.description !== undefined ? { description: input.description ?? null } : {}),
			...(input.logo !== undefined ? { logo: input.logo ?? null } : {}),
		},
		select: businessSelect,
	});

	return toBusinessView(updated);
};

export const deleteBusinessService = async (
	userId: string,
	businessId: string
): Promise<void> => {
	await findOwnedBusiness(businessId, userId);

	await prisma.business.delete({
		where: { id: businessId },
	});
};
