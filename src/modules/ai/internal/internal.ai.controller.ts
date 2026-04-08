import { Router } from "express";
import { ApiException } from "../../../exceptions/api.exception";
import { asyncHandler } from "../../../utils/asyncHandler";
import {
	generateExtractContactInfoService,
	generatePriorityScoringService,
	generateSentimentAnalysisService,
} from "./internal.ai.service";

const internalAiRouter = Router();

const requiredText = (value: unknown, field: string): string => {
	if (typeof value !== "string" || !value.trim()) {
		throw ApiException.badRequest(`${field} is required`);
	}
	return value.trim();
};

internalAiRouter.post(
	"/priority-scoring",
	asyncHandler(async (req, res) => {
		const message = requiredText(req.body?.message, "message");
		const businessType =
			typeof req.body?.businessType === "string" && req.body.businessType.trim()
				? req.body.businessType.trim()
				: "general";
		const output = await generatePriorityScoringService(message, businessType);
		res.status(200).json({ success: true, data: { feature: "priorityScoring", output } });
	})
);

internalAiRouter.post(
	"/sentiment-analysis",
	asyncHandler(async (req, res) => {
		const message = requiredText(req.body?.message, "message");
		const output = await generateSentimentAnalysisService(message);
		res.status(200).json({ success: true, data: { feature: "sentimentAnalysis", output } });
	})
);

internalAiRouter.post(
	"/extract-contact-info",
	asyncHandler(async (req, res) => {
		const message = requiredText(req.body?.message, "message");
		const output = await generateExtractContactInfoService(message);
		res.status(200).json({ success: true, data: { feature: "extractContactInfo", output } });
	})
);

export default internalAiRouter;
