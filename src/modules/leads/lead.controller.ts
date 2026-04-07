import { Request } from "express";
import { AUTH_MESSAGES } from "../../constants/messages.constant";
import { ApiException } from "../../exceptions/api.exception";
import { asyncHandler } from "../../utils/asyncHandler";
import {
	CreateLeadInput,
	LeadListInput,
	LeadNoteInput,
	LeadNoteParams,
	LeadParams,
	UpdateLeadInput,
} from "./lead.types";
import {
	createLeadService,
	deleteLeadService,
	getLeadByIdService,
	listLeadsService,
	updateLeadService,
} from "./lead.service";
import {
	createLeadNoteService,
	listLeadNotesService,
	updateLeadNoteService,
} from "./notes/note.service";

const getUserIdFromRequest = (req: Request): string => {
	const userId = req.auth?.id;
	if (!userId || req.auth?.type !== "USER") {
		throw ApiException.unauthorized("User authentication is required");
	}
	return userId;
};

export const createLeadController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const payload = req.body as CreateLeadInput;
	const lead = await createLeadService(userId, payload);

	res.status(201).json({
		success: true,
		message: AUTH_MESSAGES.LEAD_CREATED,
		data: lead,
	});
});

export const listLeadsController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const query = req.query as unknown as LeadListInput;
	const result = await listLeadsService(userId, query);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.LEADS_LISTED,
		data: result.items,
		meta: {
			total: result.total,
			page: result.page,
			limit: result.limit,
			offset: result.offset,
		},
	});
});

export const getLeadByIdController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const params = req.params as LeadParams;
	const lead = await getLeadByIdService(userId, params.leadId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.LEAD_FETCHED,
		data: lead,
	});
});

export const updateLeadController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const params = req.params as LeadParams;
	const payload = req.body as UpdateLeadInput;
	const lead = await updateLeadService(userId, params.leadId, payload);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.LEAD_UPDATED,
		data: lead,
	});
});

export const deleteLeadController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const params = req.params as LeadParams;
	await deleteLeadService(userId, params.leadId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.LEAD_DELETED,
	});
});

export const createLeadNoteController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const params = req.params as LeadParams;
	const payload = req.body as LeadNoteInput;
	const note = await createLeadNoteService(userId, params.leadId, payload);

	res.status(201).json({
		success: true,
		message: AUTH_MESSAGES.LEAD_NOTE_CREATED,
		data: note,
	});
});

export const updateLeadNoteController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const params = req.params as LeadNoteParams;
	const payload = req.body as LeadNoteInput;
	const note = await updateLeadNoteService(userId, params.leadId, params.noteId, payload);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.LEAD_NOTE_UPDATED,
		data: note,
	});
});

export const listLeadNotesController = asyncHandler(async (req, res) => {
	const userId = getUserIdFromRequest(req);
	const params = req.params as LeadParams;
	const notes = await listLeadNotesService(userId, params.leadId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.LEAD_NOTES_LISTED,
		data: notes,
	});
});
