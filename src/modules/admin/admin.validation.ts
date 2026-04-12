import { z } from "zod";
import { BUSINESS_CONSTANTS } from "../../constants/business.constant";
import { ValidationIssue } from "../../exceptions/validation.exception";
import { ValidationResult } from "../../middlewares/validate.middleware";
import { AdminSystemStatsQueryInput, AdminUserListQueryInput, AdminUserParams } from "./admin.types";

const mapZodIssues = (issues: z.ZodIssue[]): ValidationIssue[] =>
	issues.map((issue) => ({
		field: issue.path.join(".") || "body",
		message: issue.message,
	}));

const trimToUndefined = (value: string | undefined): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const adminUserListQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(BUSINESS_CONSTANTS.DEFAULT_PAGE),
	limit: z.coerce
		.number()
		.int()
		.min(1)
		.max(BUSINESS_CONSTANTS.MAX_LIMIT)
		.default(BUSINESS_CONSTANTS.DEFAULT_LIMIT),
	search: z.string().trim().max(120).optional(),
	isActive: z
		.union([z.boolean(), z.string().trim().toLowerCase().regex(/^(true|false)$/).transform((v) => v === "true")])
		.optional(),
});

const adminUserParamsSchema = z.object({
	userId: z.string().trim().min(1, "User id is required"),
});

const adminSystemStatsQuerySchema = z.object({
	range: z.enum(["today", "weekly", "monthly"]).default("weekly"),
});

export const validateAdminUserListQuery = (
	input: unknown
): ValidationResult<AdminUserListQueryInput> => {
	const parsed = adminUserListQuerySchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	const search = trimToUndefined(value.search);
	return {
		value: {
			page: value.page,
			limit: value.limit,
			...(search !== undefined ? { search } : {}),
			...(value.isActive !== undefined ? { isActive: value.isActive } : {}),
		},
	};
};

export const validateAdminUserParams = (input: unknown): ValidationResult<AdminUserParams> => {
	const parsed = adminUserParamsSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	return { value: { userId: value.userId } };
};

export const validateAdminSystemStatsQuery = (
	input: unknown
): ValidationResult<AdminSystemStatsQueryInput> => {
	const parsed = adminSystemStatsQuerySchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	return { value: parsed.data };
};
