import { z } from "zod";
import { ValidationIssue } from "../../exceptions/validation.exception";
import { ValidationResult } from "../../middlewares/validate.middleware";
import { CreateDirectChatLeadInput, PublicBusinessParams } from "./public.types";

const mapZodIssues = (issues: z.ZodIssue[]): ValidationIssue[] =>
	issues.map((issue) => ({
		field: issue.path.join(".") || "body",
		message: issue.message,
	}));

const trimToUndefined = (value: string | undefined): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const publicBusinessParamsSchema = z.object({
	id: z.string().trim().min(1, "Business id is required"),
});

const publicContactSchema = z.object({
	businessId: z.string().trim().min(1, "Business id is required"),
	message: z.string().trim().min(1, "Message is required").max(2000, "Message is too long"),
	customerName: z.string().trim().min(2, "Customer name must be at least 2 characters").max(120, "Customer name is too long").optional(),
	customerEmail: z.string().trim().email("Customer email must be valid").optional(),
	customerPhone: z.string().trim().min(6, "Customer phone must be at least 6 characters").max(25, "Customer phone is too long").optional(),
});

export const validatePublicBusinessParams = (
	input: unknown
): ValidationResult<PublicBusinessParams> => {
	const parsed = publicBusinessParamsSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	return { value: { id: parsed.data.id } };
};

export const validatePublicContactInput = (
	input: unknown
): ValidationResult<CreateDirectChatLeadInput> => {
	const parsed = publicContactSchema.safeParse(input);
	if (!parsed.success) {
		return { issues: mapZodIssues(parsed.error.issues) };
	}

	const value = parsed.data;
	const customerName = trimToUndefined(value.customerName);
	const customerEmail = trimToUndefined(value.customerEmail);
	const customerPhone = trimToUndefined(value.customerPhone);

	return {
		value: {
			businessId: value.businessId,
			message: value.message,
			...(customerName !== undefined ? { customerName } : {}),
			...(customerEmail !== undefined ? { customerEmail } : {}),
			...(customerPhone !== undefined ? { customerPhone } : {}),
		},
	};
};
