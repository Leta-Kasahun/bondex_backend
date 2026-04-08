import { Router } from "express";
import { ApiException } from "../../../exceptions/api.exception";
import { asyncHandler } from "../../../utils/asyncHandler";
import {
	generateDailyCheckInService,
	generateExplainMessageService,
	generateFollowUpReminderService,
	generateGettingStartedService,
	generateHelpMessageService,
	generateLeadSummaryService,
	generateNoLeadsYetService,
	generateQuickTourService,
	generateSuggestReplyService,
} from "./private.ai.service";

const privateAiRouter = Router();

const requiredText = (value: unknown, field: string): string => {
	if (typeof value !== "string" || !value.trim()) {
		throw ApiException.badRequest(`${field} is required`);
	}
	return value.trim();
};

const numberOrDefault = (value: unknown, fallback = 0): number => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

privateAiRouter.post(
	"/quick-tour",
	asyncHandler(async (req, res) => {
		const businessName =
			typeof req.body?.businessName === "string" && req.body.businessName.trim()
				? req.body.businessName.trim()
				: "Bondex";
		const output = await generateQuickTourService(businessName);
		res.status(200).json({ success: true, data: { feature: "quickTour", output } });
	})
);

privateAiRouter.post(
	"/getting-started",
	asyncHandler(async (req, res) => {
		const businessName =
			typeof req.body?.businessName === "string" && req.body.businessName.trim()
				? req.body.businessName.trim()
				: "Bondex";
		const output = await generateGettingStartedService(businessName);
		res.status(200).json({ success: true, data: { feature: "gettingStarted", output } });
	})
);

privateAiRouter.post(
	"/no-leads-yet",
	asyncHandler(async (req, res) => {
		const businessName =
			typeof req.body?.businessName === "string" && req.body.businessName.trim()
				? req.body.businessName.trim()
				: "Bondex";
		const output = await generateNoLeadsYetService(businessName);
		res.status(200).json({ success: true, data: { feature: "noLeadsYet", output } });
	})
);

privateAiRouter.post(
	"/daily-check-in",
	asyncHandler(async (req, res) => {
		const businessName =
			typeof req.body?.businessName === "string" && req.body.businessName.trim()
				? req.body.businessName.trim()
				: "Bondex";
		const leadCount = numberOrDefault(req.body?.leadCount, 0);
		const output = await generateDailyCheckInService(businessName, leadCount);
		res.status(200).json({ success: true, data: { feature: "dailyCheckIn", output } });
	})
);

privateAiRouter.post(
	"/explain-message",
	asyncHandler(async (req, res) => {
		const message = requiredText(req.body?.message, "message");
		const output = await generateExplainMessageService(message);
		res.status(200).json({ success: true, data: { feature: "explainMessage", output } });
	})
);

privateAiRouter.post(
	"/suggest-reply",
	asyncHandler(async (req, res) => {
		const businessName =
			typeof req.body?.businessName === "string" && req.body.businessName.trim()
				? req.body.businessName.trim()
				: "Bondex";
		const customerName = requiredText(req.body?.customerName, "customerName");
		const message = requiredText(req.body?.message, "message");
		const output = await generateSuggestReplyService(businessName, customerName, message);
		res.status(200).json({ success: true, data: { feature: "suggestReply", output } });
	})
);

privateAiRouter.post(
	"/lead-summary",
	asyncHandler(async (req, res) => {
		const customerName = requiredText(req.body?.customerName, "customerName");
		const message = requiredText(req.body?.message, "message");
		const notes = Array.isArray(req.body?.notes)
			? req.body.notes.filter((item: unknown): item is string => typeof item === "string")
			: [];
		const status =
			typeof req.body?.status === "string" && req.body.status.trim()
				? req.body.status.trim()
				: "unknown";
		const output = await generateLeadSummaryService(customerName, message, notes, status);
		res.status(200).json({ success: true, data: { feature: "leadSummary", output } });
	})
);

privateAiRouter.post(
	"/follow-up-reminder",
	asyncHandler(async (req, res) => {
		const customerName = requiredText(req.body?.customerName, "customerName");
		const context = requiredText(req.body?.context, "context");
		const dueAt = requiredText(req.body?.dueAt, "dueAt");
		const output = await generateFollowUpReminderService(customerName, context, dueAt);
		res.status(200).json({ success: true, data: { feature: "followUpReminder", output } });
	})
);

privateAiRouter.post(
	"/help-message",
	asyncHandler(async (_req, res) => {
		const output = await generateHelpMessageService();
		res.status(200).json({ success: true, data: { feature: "helpMessage", output } });
	})
);

export default privateAiRouter;
