import { z } from "zod";
import { ValidationIssue } from "../../exceptions/validation.exception";
import { ValidationResult } from "../../middlewares/validate.middleware";
import {
	NotificationListInput,
	NotificationParams,
	NotificationUnreadCountQuery,
} from "./notification.types";

const mapZodIssues = (issues: z.ZodIssue[]): ValidationIssue[] =>
	issues.map((issue) => ({
		field: issue.path.join(".") || "query",
		message: issue.message,
	}));

const listQuerySchema = z.object({
	businessId: z.string().trim().min(1, "Business id is required").optional(),
	page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
	limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(50, "Limit must be at most 50").default(10),
	read: z
		.enum(["true", "false"])
		.transform((value) => value === "true")
		.optional(),
});

const paramsSchema = z.object({
	notificationId: z.string().trim().min(1, "Notification id is required"),
});

const unreadCountQuerySchema = z.object({
	businessId: z.string().trim().min(1, "Business id is required").optional(),
});

export const validateNotificationListQuery = (
	input: unknown
): ValidationResult<NotificationListInput> => {
	const parsed = listQuerySchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	return {
		value: {
			...(value.businessId !== undefined ? { businessId: value.businessId } : {}),
			page: value.page,
			limit: value.limit,
			...(value.read !== undefined ? { read: value.read } : {}),
		},
	};
};

export const validateNotificationParams = (
	input: unknown
): ValidationResult<NotificationParams> => {
	const parsed = paramsSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	return {
		value: {
			notificationId: parsed.data.notificationId,
		},
	};
};

export const validateNotificationUnreadCountQuery = (
	input: unknown
): ValidationResult<NotificationUnreadCountQuery> => {
	const parsed = unreadCountQuerySchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	return {
		value: parsed.data.businessId !== undefined ? { businessId: parsed.data.businessId } : {},
	};
};
