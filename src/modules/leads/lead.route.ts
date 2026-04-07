import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeUserOnly } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate.middleware";
import {
	createLeadController,
	createLeadNoteController,
	deleteLeadController,
	getLeadByIdController,
	listLeadsController,
	listLeadNotesController,
	updateLeadNoteController,
	updateLeadController,
} from "./lead.controller";
import {
	validateCreateLeadInput,
	validateLeadListQuery,
	validateLeadNoteInput,
	validateLeadNoteParams,
	validateLeadParams,
	validateUpdateLeadInput,
} from "./lead.validation";

const leadRouter = Router();

leadRouter.use(authenticateUser, authorizeUserOnly);

leadRouter.post("/", validateBody(validateCreateLeadInput), createLeadController);
leadRouter.get("/", validateQuery(validateLeadListQuery), listLeadsController);
leadRouter.get("/:leadId", validateParams(validateLeadParams), getLeadByIdController);
leadRouter.get("/:leadId/notes", validateParams(validateLeadParams), listLeadNotesController);
leadRouter.put("/:leadId", validateParams(validateLeadParams), validateBody(validateUpdateLeadInput), updateLeadController);
leadRouter.delete("/:leadId", validateParams(validateLeadParams), deleteLeadController);
leadRouter.post("/:leadId/notes", validateParams(validateLeadParams), validateBody(validateLeadNoteInput), createLeadNoteController);
leadRouter.put("/:leadId/notes/:noteId", validateParams(validateLeadNoteParams), validateBody(validateLeadNoteInput), updateLeadNoteController);

export default leadRouter;
