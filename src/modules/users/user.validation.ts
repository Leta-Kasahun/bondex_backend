import { z } from "zod";
import { ValidationIssue } from "../../exceptions/validation.exception";
import { ValidationResult } from "../../middlewares/validate.middleware";
import {
	ConfirmEmailChangeBody,
	ConfirmEmailChangeInput,
	RequestEmailChangeBody,
	RequestEmailChangeInput,
	UpdateUserProfileBody,
	UpdateUserProfileInput,
} from "./user.types";

const mapZodIssues = (issues: z.ZodIssue[]): ValidationIssue[] =>
	issues.map((issue) => ({
		field: issue.path.join(".") || "body",
		message: issue.message,
	}));

const updateUserProfileSchema = z.object({
	name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name must be at most 80 characters"),
});

const requestEmailChangeSchema = z.object({
	email: z.string().trim().toLowerCase().email("A valid email is required"),
});

const confirmEmailChangeSchema = z.object({
	email: z.string().trim().toLowerCase().email("A valid email is required"),
	otp: z
		.string()
		.trim()
		.regex(/^\d{6}$/, "OTP must be a 6 digit code"),
});

export const validateUpdateUserProfileInput = (
	input: unknown
): ValidationResult<UpdateUserProfileInput> => {
	const parsed = updateUserProfileSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value: UpdateUserProfileBody = parsed.data;
	return { value: { name: value.name } };
};

export const validateRequestEmailChangeInput = (
	input: unknown
): ValidationResult<RequestEmailChangeInput> => {
	const parsed = requestEmailChangeSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value: RequestEmailChangeBody = parsed.data;
	return { value: { email: value.email } };
};

export const validateConfirmEmailChangeInput = (
	input: unknown
): ValidationResult<ConfirmEmailChangeInput> => {
	const parsed = confirmEmailChangeSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value: ConfirmEmailChangeBody = parsed.data;
	return { value: { email: value.email, otp: value.otp } };
};
