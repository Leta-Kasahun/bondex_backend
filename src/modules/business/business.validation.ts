import { z } from "zod";
import { BUSINESS_CONSTANTS } from "../../constants/business.constant";
import { ValidationIssue } from "../../exceptions/validation.exception";
import { ValidationResult } from "../../middlewares/validate.middleware";
import {
	BusinessListInput,
	BusinessParams,
	CreateBusinessInput,
	UpdateBusinessInput,
} from "./business.types";

const mapZodIssues = (issues: z.ZodIssue[]): ValidationIssue[] =>
	issues.map((issue) => ({
		field: issue.path.join(".") || "body",
		message: issue.message,
	}));

const trimToUndefined = (value: string | undefined): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const createBusinessSchema = z.object({
	name: z.string().trim().min(2, "Business name must be at least 2 characters").max(120, "Business name must be at most 120 characters"),
	type: z.string().trim().min(2, "Business type must be at least 2 characters").max(80, "Business type must be at most 80 characters").optional(),
	description: z.string().trim().min(2, "Description must be at least 2 characters").max(500, "Description must be at most 500 characters").optional(),
	logo: z.string().trim().url("Logo must be a valid URL").max(500, "Logo URL is too long").optional(),
});

const updateBusinessSchema = z
	.object({
		name: z.string().trim().min(2, "Business name must be at least 2 characters").max(120, "Business name must be at most 120 characters").optional(),
		type: z.string().trim().min(2, "Business type must be at least 2 characters").max(80, "Business type must be at most 80 characters").optional(),
		description: z.string().trim().min(2, "Description must be at least 2 characters").max(500, "Description must be at most 500 characters").optional(),
		logo: z.string().trim().url("Logo must be a valid URL").max(500, "Logo URL is too long").optional(),
	})
	.refine((data) => Object.values(data).some((value) => value !== undefined), {
		message: "At least one field is required to update",
		path: ["body"],
	});

const businessParamsSchema = z.object({
	businessId: z.string().trim().min(1, "Business id is required"),
});

const businessListQuerySchema = z.object({
	page: z.coerce.number().int().min(1, "Page must be at least 1").default(BUSINESS_CONSTANTS.DEFAULT_PAGE),
	limit: z
		.coerce.number()
		.int()
		.min(1, "Limit must be at least 1")
		.max(BUSINESS_CONSTANTS.MAX_LIMIT, `Limit must be at most ${BUSINESS_CONSTANTS.MAX_LIMIT}`)
		.default(BUSINESS_CONSTANTS.DEFAULT_LIMIT),
	search: z.string().trim().max(120, "Search term is too long").optional(),
});

export const validateCreateBusinessInput = (
	input: unknown
): ValidationResult<CreateBusinessInput> => {
	const parsed = createBusinessSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	const type = trimToUndefined(value.type);
	const description = trimToUndefined(value.description);
	const logo = trimToUndefined(value.logo);
	return {
		value: {
			name: value.name,
			...(type !== undefined ? { type } : {}),
			...(description !== undefined ? { description } : {}),
			...(logo !== undefined ? { logo } : {}),
		},
	};
};

export const validateUpdateBusinessInput = (
	input: unknown
): ValidationResult<UpdateBusinessInput> => {
	const parsed = updateBusinessSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	const name = trimToUndefined(value.name);
	const type = trimToUndefined(value.type);
	const description = trimToUndefined(value.description);
	const logo = trimToUndefined(value.logo);
	return {
		value: {
			...(name !== undefined ? { name } : {}),
			...(type !== undefined ? { type } : {}),
			...(description !== undefined ? { description } : {}),
			...(logo !== undefined ? { logo } : {}),
		},
	};
};

export const validateBusinessParams = (input: unknown): ValidationResult<BusinessParams> => {
	const parsed = businessParamsSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value: BusinessParams = parsed.data;
	return {
		value: {
			businessId: value.businessId,
		},
	};
};

export const validateBusinessListQuery = (
	input: unknown
): ValidationResult<BusinessListInput> => {
	const parsed = businessListQuerySchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	const search = trimToUndefined(value.search);
	return {
		value: {
			page: value.page ?? BUSINESS_CONSTANTS.DEFAULT_PAGE,
			limit: value.limit ?? BUSINESS_CONSTANTS.DEFAULT_LIMIT,
			...(search !== undefined ? { search } : {}),
		},
	};
};
