import { z } from "zod";
import { ValidationIssue } from "../../../../exceptions/validation.exception";
import { ValidationResult } from "../../../../middlewares/validate.middleware";
import { AdminLoginInput, AdminVerifyOtpInput } from "./admin.auth.types";

const mapZodIssues = (issues: z.ZodIssue[]): ValidationIssue[] =>
	issues.map((issue) => ({
		field: issue.path.join(".") || "body",
		message: issue.message,
	}));

const strongPasswordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.regex(/[a-z]/, "Password must include at least one lowercase letter")
	.regex(/[A-Z]/, "Password must include at least one uppercase letter")
	.regex(/[0-9]/, "Password must include at least one digit")
	.regex(/[^A-Za-z0-9]/, "Password must include at least one special character");

const adminLoginSchema = z.object({
	email: z.string().trim().toLowerCase().email("A valid email is required"),
	password: strongPasswordSchema,
});

const verifyAdminOtpSchema = z.object({
	adminId: z.string().trim().min(1, "Admin id is required"),
	otp: z.string().trim().regex(/^\d{6}$/, "OTP must be a 6 digit code"),
});

export const validateAdminLoginInput = (
	input: unknown
): ValidationResult<AdminLoginInput> => {
	const parsed = adminLoginSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value: AdminLoginInput = parsed.data;
	return {
		value: {
			email: value.email,
			password: value.password,
		},
	};
};

export const validateAdminVerifyOtpInput = (
	input: unknown
): ValidationResult<AdminVerifyOtpInput> => {
	const parsed = verifyAdminOtpSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value: AdminVerifyOtpInput = parsed.data;
	return {
		value: {
			adminId: value.adminId,
			otp: value.otp,
		},
	};
};
