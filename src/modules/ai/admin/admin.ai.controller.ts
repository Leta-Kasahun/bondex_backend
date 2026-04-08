import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import {
	generateAiPerformanceSummaryService,
	generateAlertConfigurationGuideService,
	generateDailySummaryService,
	generateDataMonitoringService,
	generateSystemOverviewService,
	generateSystemPerformanceOverviewService,
	generateWeeklySummaryService,
} from "./admin.ai.service";

const adminAiRouter = Router();

const numberOrDefault = (value: unknown, fallback = 0): number => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

adminAiRouter.post(
	"/system-overview",
	asyncHandler(async (_req, res) => {
		const output = await generateSystemOverviewService();
		res.status(200).json({ success: true, data: { feature: "systemOverview", output } });
	})
);

adminAiRouter.post(
	"/ai-performance-summary",
	asyncHandler(async (req, res) => {
		const responseTime = numberOrDefault(req.body?.responseTime, 0);
		const accuracy = numberOrDefault(req.body?.accuracy, 0);
		const alerts = numberOrDefault(req.body?.alerts, 0);
		const output = await generateAiPerformanceSummaryService(responseTime, accuracy, alerts);
		res.status(200).json({ success: true, data: { feature: "aiPerformanceSummary", output } });
	})
);

adminAiRouter.post(
	"/alert-configuration-guide",
	asyncHandler(async (_req, res) => {
		const output = await generateAlertConfigurationGuideService();
		res.status(200).json({ success: true, data: { feature: "alertConfigurationGuide", output } });
	})
);

adminAiRouter.post(
	"/data-monitoring",
	asyncHandler(async (_req, res) => {
		const output = await generateDataMonitoringService();
		res.status(200).json({ success: true, data: { feature: "dataMonitoring", output } });
	})
);

adminAiRouter.post(
	"/daily-summary",
	asyncHandler(async (req, res) => {
		const totalLeads = numberOrDefault(req.body?.totalLeads, 0);
		const highPriorityLeads = numberOrDefault(req.body?.highPriorityLeads, 0);
		const alerts = numberOrDefault(req.body?.alerts, 0);
		const output = await generateDailySummaryService(totalLeads, highPriorityLeads, alerts);
		res.status(200).json({ success: true, data: { feature: "dailySummary", output } });
	})
);

adminAiRouter.post(
	"/weekly-summary",
	asyncHandler(async (req, res) => {
		const totalLeads = numberOrDefault(req.body?.totalLeads, 0);
		const avgAccuracy = numberOrDefault(req.body?.avgAccuracy, 0);
		const alerts = numberOrDefault(req.body?.alerts, 0);
		const output = await generateWeeklySummaryService(totalLeads, avgAccuracy, alerts);
		res.status(200).json({ success: true, data: { feature: "weeklySummary", output } });
	})
);

adminAiRouter.post(
	"/system-performance-overview",
	asyncHandler(async (req, res) => {
		const uptime = numberOrDefault(req.body?.uptime, 0);
		const responseTime = numberOrDefault(req.body?.responseTime, 0);
		const criticalAlerts = numberOrDefault(req.body?.criticalAlerts, 0);
		const output = await generateSystemPerformanceOverviewService(
			uptime,
			responseTime,
			criticalAlerts
		);
		res.status(200).json({ success: true, data: { feature: "systemPerformanceOverview", output } });
	})
);

export default adminAiRouter;
