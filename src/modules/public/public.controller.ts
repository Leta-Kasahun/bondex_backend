import { AUTH_MESSAGES } from "../../constants/messages.constant";
import { asyncHandler } from "../../utils/asyncHandler";
import { CreateDirectChatLeadInput, PublicBusinessParams } from "./public.types";
import {
	createDirectChatLeadService,
	getPublicBusinessByIdService,
	listPublicBusinessesService,
} from "./public.service";

export const listPublicBusinessesController = asyncHandler(async (_req, res) => {
	const businesses = await listPublicBusinessesService();

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.BUSINESS_LISTED,
		data: businesses,
	});
});

export const getPublicBusinessByIdController = asyncHandler(async (req, res) => {
	const params = req.params as PublicBusinessParams;
	const business = await getPublicBusinessByIdService(params.id);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.BUSINESS_FETCHED,
		data: business,
	});
});

export const submitPublicContactController = asyncHandler(async (req, res) => {
	const payload = req.body as CreateDirectChatLeadInput;
	const lead = await createDirectChatLeadService(payload);

	res.status(201).json({
		success: true,
		message: AUTH_MESSAGES.LEAD_CREATED,
		data: lead,
	});
});
