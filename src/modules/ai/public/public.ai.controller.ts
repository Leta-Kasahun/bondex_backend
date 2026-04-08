import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import {
	generateBondexOverviewService,
	generateFeaturesSummaryService,
	generateHowItWorksService,
	generateValuePropositionService,
	generateWelcomeBotService,
} from "./public.ai.service";

const publicAiRouter = Router();

publicAiRouter.post(
	"/welcome-bot",
	asyncHandler(async (req, res) => {
		const businessName =
			typeof req.body?.businessName === "string" && req.body.businessName.trim()
				? req.body.businessName.trim()
				: "Bondex";
		const customerName =
			typeof req.body?.customerName === "string" && req.body.customerName.trim()
				? req.body.customerName.trim()
				: undefined;
		const output = await generateWelcomeBotService(businessName, customerName);
		res.status(200).json({ success: true, data: { feature: "welcomeBot", output } });
	})
);

publicAiRouter.post(
	"/bondex-overview",
	asyncHandler(async (_req, res) => {
		const output = await generateBondexOverviewService();
		res.status(200).json({ success: true, data: { feature: "bondexOverview", output } });
	})
);

publicAiRouter.post(
	"/features-summary",
	asyncHandler(async (_req, res) => {
		const output = await generateFeaturesSummaryService();
		res.status(200).json({ success: true, data: { feature: "featuresSummary", output } });
	})
);

publicAiRouter.post(
	"/how-it-works",
	asyncHandler(async (_req, res) => {
		const output = await generateHowItWorksService();
		res.status(200).json({ success: true, data: { feature: "howItWorks", output } });
	})
);

publicAiRouter.post(
	"/value-proposition",
	asyncHandler(async (_req, res) => {
		const output = await generateValuePropositionService();
		res.status(200).json({ success: true, data: { feature: "valueProposition", output } });
	})
);

export default publicAiRouter;
