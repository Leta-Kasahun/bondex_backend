import { z } from "zod";
import { ValidationIssue } from "../../../exceptions/validation.exception";
import { ValidationResult } from "../../../middlewares/validate.middleware";
import {
	ForgotPasswordBody,
	ForgotPasswordInput,
	GoogleLoginBody,
	GoogleSignupBody,
	LoginUserBody,
	LoginUserInput,
	RegisterUserBody,
	RegisterUserInput,
	ResetPasswordBody,
	ResetPasswordInput,
	VerifyResetOtpBody,
	VerifyResetOtpInput,
	VerifyRegistrationOtpBody,
	VerifyRegistrationOtpInput,
} from "./auth.types";

const registerUserSchema = z
	.object({
		name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name must be at most 80 characters"),
		email: z.string().trim().toLowerCase().email("A valid email is required"),
		password: z.string().min(6, "Password must be at least 6 characters").max(72, "Password must be at most 72 characters"),
		confirmPassword: z
			.string()
			.min(6, "Confirm password must be at least 6 characters")
			.max(72, "Confirm password must be at most 72 characters")
			.optional(),
	})
	.refine((data) => data.confirmPassword === undefined || data.password === data.confirmPassword, {
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

const loginUserSchema = z.object({
	email: z.string().trim().toLowerCase().email("A valid email is required"),
	password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
	email: z.string().trim().toLowerCase().email("A valid email is required"),
});

const resetPasswordSchema = z
	.object({
		newPassword: z
			.string()
			.min(6, "New password must be at least 6 characters")
			.max(72, "New password must be at most 72 characters"),
		confirmPassword: z
			.string()
			.min(6, "Confirm password must be at least 6 characters")
			.max(72, "Confirm password must be at most 72 characters"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "New password and confirm password must match",
	});

const verifyResetOtpSchema = z.object({
	otp: z
		.string()
		.trim()
		.regex(/^\d{6}$/, "OTP must be a 6 digit code"),
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

export const validateLoginUserInput = (input: unknown): ValidationResult<LoginUserInput> => {
	const parsed = loginUserSchema.safeParse(input);

	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value: LoginUserBody = parsed.data;

	return {
		value: {
			email: value.email,
			password: value.password,
		},
	};
};

export const validateGoogleLoginInput = (input: unknown): ValidationResult<GoogleLoginBody> => {
	const parsed = googleSignupSchema.safeParse(input);

	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	return {
		value: parsed.data,
	};
};

export const validateForgotPasswordInput = (input: unknown): ValidationResult<ForgotPasswordInput> => {
	const parsed = forgotPasswordSchema.safeParse(input);

	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value: ForgotPasswordBody = parsed.data;

	return {
		value: {
			email: value.email,
		},
	};
};

export const validateResetPasswordInput = (input: unknown): ValidationResult<ResetPasswordInput> => {
	const parsed = resetPasswordSchema.safeParse(input);

	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value: ResetPasswordBody = parsed.data;

	return {
		value: {
			newPassword: value.newPassword,
		},
	};
};

export const validateVerifyResetOtpInput = (
	input: unknown
): ValidationResult<VerifyResetOtpInput> => {
	const parsed = verifyResetOtpSchema.safeParse(input);

	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value: VerifyResetOtpBody = parsed.data;

	return {
		value: {
			otp: value.otp,
		},
	};
};
