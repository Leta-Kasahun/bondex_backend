import { z } from "zod";
import { ValidationIssue } from "../../../exceptions/validation.exception";
import { ValidationResult } from "../../../middlewares/validate.middleware";
import {
	GoogleSignupBody,
	RegisterUserBody,
	RegisterUserInput,
	VerifyRegistrationOtpBody,
	VerifyRegistrationOtpInput,
} from "./auth.types";

const registerUserSchema = z
	.object({
		name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name must be at most 80 characters"),
		email: z.string().trim().toLowerCase().email("A valid email is required"),
		password: z.string().min(6, "Password must be at least 6 characters").max(72, "Password must be at most 72 characters"),
		confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters").max(72, "Confirm password must be at most 72 characters"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Password and confirm password must match",
	});

const mapZodIssues = (issues: z.ZodIssue[]): ValidationIssue[] =>
	issues.map((issue) => ({
		field: issue.path.join(".") || "body",
		message: issue.message,
	}));

const verifyRegistrationOtpSchema = z.object({
	email: z.string().trim().toLowerCase().email("A valid email is required"),
	otp: z
		.string()
		.trim()
		.regex(/^\d{6}$/, "OTP must be a 6 digit code"),
});

const googleSignupSchema = z.object({
	idToken: z.string().trim().min(1, "Google idToken is required"),
});

export const validateRegisterUserInput = (input: unknown): ValidationResult<RegisterUserInput> => {
	const parsed = registerUserSchema.safeParse(input);

	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value: RegisterUserBody = parsed.data;

	return {
		value: {
			name: value.name,
			email: value.email,
			password: value.password,
		},
	};
};

export const validateVerifyRegistrationOtpInput = (
	input: unknown
): ValidationResult<VerifyRegistrationOtpInput> => {
	const parsed = verifyRegistrationOtpSchema.safeParse(input);

	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value: VerifyRegistrationOtpBody = parsed.data;

	return {
		value: {
			email: value.email,
			otp: value.otp,
		},
	};
};

export const validateGoogleSignupInput = (input: unknown): ValidationResult<GoogleSignupBody> => {
	const parsed = googleSignupSchema.safeParse(input);

	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	return {
		value: parsed.data,
	};
};
