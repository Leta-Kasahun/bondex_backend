import { z } from "zod";
import { ValidationIssue } from "../../exceptions/validation.exception";
import { ValidationResult } from "../../middlewares/validate.middleware";
import {
	GmailBusinessParams,
	GmailDisconnectInput,
	GmailReplyInput,
} from "./gmail.types";

const mapZodIssues = (issues: z.ZodIssue[]): ValidationIssue[] =>
	issues.map((issue) => ({
		field: issue.path.join(".") || "body",
		message: issue.message,
	}));

const businessParamsSchema = z.object({
	businessId: z.string().trim().min(1, "Business id is required"),
});

const disconnectSchema = z.object({
	businessId: z.string().trim().min(1, "Business id is required"),
});

const replySchema = z.object({
	leadId: z.string().trim().min(1, "Lead id is required"),
	message: z.string().trim().min(1, "Reply message is required").max(5000, "Reply message is too long"),
});

export const validateGmailBusinessParams = (
	input: unknown
): ValidationResult<GmailBusinessParams> => {
	const parsed = businessParamsSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	return { value: { businessId: value.businessId } };
};

export const validateGmailDisconnectInput = (
	input: unknown
): ValidationResult<GmailDisconnectInput> => {
	const parsed = disconnectSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	return { value: { businessId: value.businessId } };
};

export const validateGmailReplyInput = (
	input: unknown
): ValidationResult<GmailReplyInput> => {
	const parsed = replySchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	return { value: { leadId: value.leadId, message: value.message } };
};
