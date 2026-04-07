import { z } from "zod";
import { DEAL_CONSTANTS, DEAL_STAGE_VALUES } from "../../constants/deal.constant";
import { ValidationIssue } from "../../exceptions/validation.exception";
import { ValidationResult } from "../../middlewares/validate.middleware";
import {
	ConvertLeadToDealInput,
	DealListInput,
	DealParams,
	UpdateDealStageInput,
} from "./deal.types";

const mapZodIssues = (issues: z.ZodIssue[]): ValidationIssue[] =>
	issues.map((issue) => ({
		field: issue.path.join(".") || "body",
		message: issue.message,
	}));

const trimToUndefined = (value: string | undefined): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const convertLeadToDealSchema = z.object({
	leadId: z.string().trim().min(1, "Lead id is required"),
	name: z.string().trim().min(2, "Deal name must be at least 2 characters").max(160, "Deal name is too long"),
	value: z.number().positive("Deal value must be greater than 0").optional(),
});

const dealListQuerySchema = z.object({
	businessId: z.string().trim().min(1, "Business id is required"),
	page: z.coerce.number().int().min(1, "Page must be at least 1").default(DEAL_CONSTANTS.DEFAULT_PAGE),
	limit: z.coerce
		.number()
		.int()
		.min(1, "Limit must be at least 1")
		.max(DEAL_CONSTANTS.MAX_LIMIT, `Limit must be at most ${DEAL_CONSTANTS.MAX_LIMIT}`)
		.default(DEAL_CONSTANTS.DEFAULT_LIMIT),
	stage: z.enum(DEAL_STAGE_VALUES).optional(),
	search: z.string().trim().max(120, "Search term is too long").optional(),
});

const dealParamsSchema = z.object({
	dealId: z.string().trim().min(1, "Deal id is required"),
});

const updateDealStageSchema = z.object({
	stage: z.enum(DEAL_STAGE_VALUES),
	value: z.number().positive("Deal value must be greater than 0").optional(),
});

export const validateConvertLeadToDealInput = (
	input: unknown
): ValidationResult<ConvertLeadToDealInput> => {
	const parsed = convertLeadToDealSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	return {
		value: {
			leadId: value.leadId,
			name: value.name,
			...(value.value !== undefined ? { value: value.value } : {}),
		},
	};
};

export const validateDealListQuery = (input: unknown): ValidationResult<DealListInput> => {
	const parsed = dealListQuerySchema.safeParse(input);
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
			...(value.stage !== undefined ? { stage: value.stage } : {}),
			...(search !== undefined ? { search } : {}),
		},
	};
};

export const validateDealParams = (input: unknown): ValidationResult<DealParams> => {
	const parsed = dealParamsSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	return {
		value: {
			dealId: value.dealId,
		},
	};
};

export const validateUpdateDealStageInput = (
	input: unknown
): ValidationResult<UpdateDealStageInput> => {
	const parsed = updateDealStageSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	return {
		value: {
			stage: value.stage,
			...(value.value !== undefined ? { value: value.value } : {}),
		},
	};
};
