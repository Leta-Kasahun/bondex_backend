import prisma from "../../config/prisma";
import { AUTH_MESSAGES } from "../../constants/messages.constant";
import { ApiException } from "../../exceptions/api.exception";
import { createLeadCreatedNotification } from "../notifications/notification.service";
import {
	CreateDirectChatLeadInput,
	DirectChatLeadView,
	PublicBusinessView,
} from "./public.types";

const publicBusinessSelect = {
	id: true,
	name: true,
	type: true,
	description: true,
	logo: true,
	createdAt: true,
} as const;

const toPublicBusinessView = (business: {
	id: string;
	name: string;
	type: string | null;
	description: string | null;
	logo: string | null;
	createdAt: Date;
}): PublicBusinessView => ({
	id: business.id,
	name: business.name,
	type: business.type,
	description: business.description,
	logo: business.logo,
	createdAt: business.createdAt,
});

export const listPublicBusinessesService = async (): Promise<PublicBusinessView[]> => {
	const businesses = await prisma.business.findMany({
		orderBy: { updatedAt: "desc" },
		select: publicBusinessSelect,
	});

	return businesses.map(toPublicBusinessView);
};

export const getPublicBusinessByIdService = async (businessId: string): Promise<PublicBusinessView> => {
	const business = await prisma.business.findUnique({
		where: { id: businessId },
		select: publicBusinessSelect,
	});

	if (!business) {
		throw ApiException.notFound(AUTH_MESSAGES.BUSINESS_NOT_FOUND);
	}

	return toPublicBusinessView(business);
};

const ensureBusinessExists = async (businessId: string): Promise<void> => {
	const business = await prisma.business.findUnique({
		where: { id: businessId },
		select: { id: true },
	});
	if (!business) {
		throw ApiException.notFound(AUTH_MESSAGES.BUSINESS_NOT_FOUND);
	}
};

export const createDirectChatLeadService = async (
	input: CreateDirectChatLeadInput
): Promise<DirectChatLeadView> => {
	await ensureBusinessExists(input.businessId);

	const lead = await prisma.lead.create({
		data: {
			businessId: input.businessId,
			message: input.message,
			platform: "direct_chat",
			...(input.customerName !== undefined ? { customerName: input.customerName } : {}),
			...(input.customerEmail !== undefined ? { customerEmail: input.customerEmail } : {}),
			...(input.customerPhone !== undefined ? { customerPhone: input.customerPhone } : {}),
		},
		select: {
			id: true,
			businessId: true,
			customerName: true,
			customerEmail: true,
			customerPhone: true,
			message: true,
			platform: true,
			status: true,
			priority: true,
			createdAt: true,
		},
	});

	await createLeadCreatedNotification(lead.id);

	return {
		id: lead.id,
		businessId: lead.businessId,
		customerName: lead.customerName,
		customerEmail: lead.customerEmail,
		customerPhone: lead.customerPhone,
		message: lead.message,
		platform: "direct_chat",
		status: lead.status,
		priority: lead.priority,
		createdAt: lead.createdAt,
	};
};
