import { z } from "zod";
import { ValidationIssue } from "../../exceptions/validation.exception";
import { ValidationResult } from "../../middlewares/validate.middleware";
import {
	ConnectTelegramInput,
	DisconnectTelegramInput,
	SendTelegramReplyInput,
	TelegramLeadParams,
	TelegramWebhookParams,
} from "./telegram.types";

const mapZodIssues = (issues: z.ZodIssue[]): ValidationIssue[] =>
	issues.map((issue) => ({
		field: issue.path.join(".") || "body",
		message: issue.message,
	}));

const connectSchema = z.object({
	businessId: z.string().trim().min(1, "Business id is required"),
	botToken: z.string().trim().min(1, "Bot token is required"),
});

const disconnectSchema = z.object({
	businessId: z.string().trim().min(1, "Business id is required"),
});

const replySchema = z.object({
	leadId: z.string().trim().min(1, "Lead id is required"),
	message: z.string().trim().min(1, "Message is required").max(4000, "Message is too long"),
});

const leadParamsSchema = z.object({
	leadId: z.string().trim().min(1, "Lead id is required"),
});

const webhookParamsSchema = z.object({
	businessId: z.string().trim().min(1, "Business id is required"),
});

export const validateConnectTelegramInput = (
	input: unknown
): ValidationResult<ConnectTelegramInput> => {
	const parsed = connectSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}
	const value = parsed.data;
	return { value: { businessId: value.businessId, botToken: value.botToken } };
};

export const validateDisconnectTelegramInput = (
	input: unknown
): ValidationResult<DisconnectTelegramInput> => {
	const parsed = disconnectSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}
	const value = parsed.data;
	return { value: { businessId: value.businessId } };
};

export const validateSendTelegramReplyInput = (
	input: unknown
): ValidationResult<SendTelegramReplyInput> => {
	const parsed = replySchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}
	const value = parsed.data;
	return { value: { leadId: value.leadId, message: value.message } };
};

export const validateTelegramLeadParams = (
	input: unknown
): ValidationResult<TelegramLeadParams> => {
	const parsed = leadParamsSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}
	const value = parsed.data;
	return { value: { leadId: value.leadId } };
};

export const validateTelegramWebhookParams = (
	input: unknown
): ValidationResult<TelegramWebhookParams> => {
	const parsed = webhookParamsSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}
	const value = parsed.data;
	return { value: { businessId: value.businessId } };
};
