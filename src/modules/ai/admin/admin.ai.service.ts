import { runAiPrompt } from "../core.ai.service";
import { ADMIN_PROMPTS } from "./admin.prompts";

export const generateSystemOverviewService = async () =>
	runAiPrompt(ADMIN_PROMPTS.systemOverview());

export const generateAiPerformanceSummaryService = async (
	responseTime: number,
	accuracy: number,
	alerts: number
) => runAiPrompt(ADMIN_PROMPTS.aiPerformanceSummary(responseTime, accuracy, alerts));

export const generateAlertConfigurationGuideService = async () =>
	runAiPrompt(ADMIN_PROMPTS.alertConfigurationGuide());

export const generateDataMonitoringService = async () =>
	runAiPrompt(ADMIN_PROMPTS.dataMonitoring());

export const generateDailySummaryService = async (
	totalLeads: number,
	highPriorityLeads: number,
	alerts: number
) => runAiPrompt(ADMIN_PROMPTS.dailySummary(totalLeads, highPriorityLeads, alerts));

export const generateWeeklySummaryService = async (
	totalLeads: number,
	avgAccuracy: number,
	alerts: number
) => runAiPrompt(ADMIN_PROMPTS.weeklySummary(totalLeads, avgAccuracy, alerts));

export const generateSystemPerformanceOverviewService = async (
	uptime: number,
	responseTime: number,
	criticalAlerts: number
) =>
	runAiPrompt(
		ADMIN_PROMPTS.systemPerformanceOverview(uptime, responseTime, criticalAlerts)
	);
