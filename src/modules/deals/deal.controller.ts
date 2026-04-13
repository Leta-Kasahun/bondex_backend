import { Request } from "express";
import { AUTH_MESSAGES } from "../../constants/messages.constant";
import { ApiException } from "../../exceptions/api.exception";
import { asyncHandler } from "../../utils/asyncHandler";
import {
	ConvertLeadToDealInput,
	DealListInput,
	DealParams,
	UpdateDealStageInput,
} from "./deal.types";
import {
	convertLeadToDealService,
	deleteDealService,
	listDealsService,
	updateDealStageService,
} from "./deal.service";

const getUserIdFromRequest = (req: Request): string => {
	const userId = req.auth?.id;
	if (!userId || req.auth?.type !== "USER") {
		throw ApiException.unauthorized("User authentication is required");
	}
	return userId;
};

export const convertLeadToDealController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const payload = req.body as ConvertLeadToDealInput;
	const deal = await convertLeadToDealService(userId, payload);

	res.status(201).json({
		success: true,
		message: AUTH_MESSAGES.DEAL_CREATED,
		data: deal,
	});
});

export const listDealsController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const query = req.query as unknown as DealListInput;
	const result = await listDealsService(userId, query);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.DEALS_LISTED,
		data: result.items,
		meta: {
			total: result.total,
			page: result.page,
			limit: result.limit,
			offset: result.offset,
		},
	});
});

export const updateDealStageController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const params = req.params as unknown as DealParams;
	const payload = req.body as UpdateDealStageInput;
	const deal = await updateDealStageService(userId, params.dealId, payload);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.DEAL_STAGE_UPDATED,
		data: deal,
	});
});

export const deleteDealController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const params = req.params as unknown as DealParams;
	await deleteDealService(userId, params.dealId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.DEAL_DELETED,
	});
});
