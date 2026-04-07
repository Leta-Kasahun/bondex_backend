import { z } from "zod";
import {
	LEAD_CONSTANTS,
	LEAD_PLATFORM_VALUES,
	LEAD_PRIORITY_VALUES,
	LEAD_STATUS_VALUES,
} from "../../constants/leadstatus.constant";
import { ValidationIssue } from "../../exceptions/validation.exception";
import { ValidationResult } from "../../middlewares/validate.middleware";
import {
	CreateLeadInput,
	LeadListInput,
	LeadNoteInput,
	LeadNoteParams,
	LeadParams,
	UpdateLeadInput,
} from "./lead.types";

const mapZodIssues = (issues: z.ZodIssue[]): ValidationIssue[] =>
	issues.map((issue) => ({
		field: issue.path.join(".") || "body",
		message: issue.message,
	}));

const trimToUndefined = (value: string | undefined): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const createLeadSchema = z.object({
	businessId: z.string().trim().min(1, "Business id is required"),
	message: z.string().trim().min(1, "Message is required").max(2000, "Message is too long"),
	customerName: z.string().trim().min(2, "Customer name must be at least 2 characters").max(120, "Customer name is too long").optional(),
	customerEmail: z.string().trim().email("Customer email must be valid").optional(),
	customerPhone: z.string().trim().min(6, "Customer phone must be at least 6 characters").max(25, "Customer phone is too long").optional(),
	status: z.enum(LEAD_STATUS_VALUES).optional(),
	priority: z.enum(LEAD_PRIORITY_VALUES).optional(),
});

const updateLeadSchema = z
	.object({
		message: z.string().trim().min(1, "Message is required").max(2000, "Message is too long").optional(),
		platform: z.enum(LEAD_PLATFORM_VALUES).optional(),
		customerName: z.string().trim().min(2, "Customer name must be at least 2 characters").max(120, "Customer name is too long").optional(),
		customerEmail: z.string().trim().email("Customer email must be valid").optional(),
		customerPhone: z.string().trim().min(6, "Customer phone must be at least 6 characters").max(25, "Customer phone is too long").optional(),
		status: z.enum(LEAD_STATUS_VALUES).optional(),
		priority: z.enum(LEAD_PRIORITY_VALUES).optional(),
	})
	.refine((data) => Object.values(data).some((value) => value !== undefined), {
		message: "At least one field is required to update",
		path: ["body"],
	});

const leadParamsSchema = z.object({
	leadId: z.string().trim().min(1, "Lead id is required"),
});

const leadNoteParamsSchema = z.object({
	leadId: z.string().trim().min(1, "Lead id is required"),
	noteId: z.string().trim().min(1, "Note id is required"),
});

const leadNoteSchema = z.object({
	content: z.string().trim().min(1, "Note content is required").max(1000, "Note is too long"),
});

const leadListQuerySchema = z.object({
	businessId: z.string().trim().min(1, "Business id is required"),
	page: z.coerce.number().int().min(1, "Page must be at least 1").default(LEAD_CONSTANTS.DEFAULT_PAGE),
	limit: z.coerce
		.number()
		.int()
		.min(1, "Limit must be at least 1")
		.max(LEAD_CONSTANTS.MAX_LIMIT, `Limit must be at most ${LEAD_CONSTANTS.MAX_LIMIT}`)
		.default(LEAD_CONSTANTS.DEFAULT_LIMIT),
	search: z.string().trim().max(120, "Search term is too long").optional(),
	status: z.enum(LEAD_STATUS_VALUES).optional(),
	priority: z.enum(LEAD_PRIORITY_VALUES).optional(),
	platform: z.enum(LEAD_PLATFORM_VALUES).optional(),
});

export const validateCreateLeadInput = (input: unknown): ValidationResult<CreateLeadInput> => {
	const parsed = createLeadSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	const customerName = trimToUndefined(value.customerName);
	const customerEmail = trimToUndefined(value.customerEmail);
	const customerPhone = trimToUndefined(value.customerPhone);

	return {
		value: {
			businessId: value.businessId,
			message: value.message,
			...(customerName !== undefined ? { customerName } : {}),
			...(customerEmail !== undefined ? { customerEmail } : {}),
			...(customerPhone !== undefined ? { customerPhone } : {}),
			...(value.status !== undefined ? { status: value.status } : {}),
			...(value.priority !== undefined ? { priority: value.priority } : {}),
		},
	};
};

export const validateUpdateLeadInput = (input: unknown): ValidationResult<UpdateLeadInput> => {
	const parsed = updateLeadSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	const message = trimToUndefined(value.message);
	const customerName = trimToUndefined(value.customerName);
	const customerEmail = trimToUndefined(value.customerEmail);
	const customerPhone = trimToUndefined(value.customerPhone);

	return {
		value: {
			...(message !== undefined ? { message } : {}),
			...(value.platform !== undefined ? { platform: value.platform } : {}),
			...(customerName !== undefined ? { customerName } : {}),
			...(customerEmail !== undefined ? { customerEmail } : {}),
			...(customerPhone !== undefined ? { customerPhone } : {}),
			...(value.status !== undefined ? { status: value.status } : {}),
			...(value.priority !== undefined ? { priority: value.priority } : {}),
		},
	};
};

export const validateLeadParams = (input: unknown): ValidationResult<LeadParams> => {
	const parsed = leadParamsSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	return {
		value: {
			leadId: value.leadId,
		},
	};
};

export const validateLeadListQuery = (input: unknown): ValidationResult<LeadListInput> => {
	const parsed = leadListQuerySchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	const search = trimToUndefined(value.search);

	return {
		value: {
			businessId: value.businessId,
			page: value.page,
			limit: value.limit,
			...(search !== undefined ? { search } : {}),
			...(value.status !== undefined ? { status: value.status } : {}),
			...(value.priority !== undefined ? { priority: value.priority } : {}),
			...(value.platform !== undefined ? { platform: value.platform } : {}),
		},
	};
};

export const validateLeadNoteInput = (input: unknown): ValidationResult<LeadNoteInput> => {
	const parsed = leadNoteSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	return {
		value: {
			content: value.content,
		},
	};
};

export const validateLeadNoteParams = (input: unknown): ValidationResult<LeadNoteParams> => {
	const parsed = leadNoteParamsSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	return {
		value: {
			leadId: value.leadId,
			noteId: value.noteId,
		},
	};
};
