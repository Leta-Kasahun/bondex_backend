import { Request } from "express";
import { AUTH_MESSAGES } from "../../constants/messages.constant";
import { ApiException } from "../../exceptions/api.exception";
import { asyncHandler } from "../../utils/asyncHandler";
import {
	BusinessListInput,
	BusinessParams,
	CreateBusinessInput,
	UpdateBusinessInput,
} from "./business.types";
import {
	createBusinessService,
	deleteBusinessService,
	getBusinessByIdService,
	listBusinessesService,
	updateBusinessService,
} from "./business.service";

const getUserIdFromRequest = (req: Request): string => {
	const userId = req.auth?.id;
	if (!userId || req.auth?.type !== "USER") {
		throw ApiException.unauthorized("User authentication is required");
	}
	return userId;
};

export const createBusinessController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const payload = req.body as CreateBusinessInput;
	const business = await createBusinessService(userId, payload);

	res.status(201).json({
		success: true,
		message: AUTH_MESSAGES.BUSINESS_CREATED,
		data: business,
	});
});

export const listBusinessesController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const query = req.query as unknown as BusinessListInput;
	const result = await listBusinessesService(userId, query);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.BUSINESS_LISTED,
		data: result.items,
		meta: {
			total: result.total,
			page: result.page,
			limit: result.limit,
		},
	});
});

export const getBusinessByIdController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const params = req.params as BusinessParams;
	const business = await getBusinessByIdService(userId, params.businessId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.BUSINESS_FETCHED,
		data: business,
	});
});

export const updateBusinessController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const params = req.params as BusinessParams;
	const payload = req.body as UpdateBusinessInput;
	const business = await updateBusinessService(userId, params.businessId, payload);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.BUSINESS_UPDATED,
		data: business,
	});
});

export const deleteBusinessController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const params = req.params as BusinessParams;
	await deleteBusinessService(userId, params.businessId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.BUSINESS_DELETED,
	});
});
