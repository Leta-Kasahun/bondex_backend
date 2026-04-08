import { runAiPrompt } from "../core.ai.service";
import { PRIVATE_PROMPTS } from "./private.prompts";

export const generateQuickTourService = async (businessName: string) =>
	runAiPrompt(PRIVATE_PROMPTS.quickTour(businessName));

export const generateGettingStartedService = async (businessName: string) =>
	runAiPrompt(PRIVATE_PROMPTS.gettingStarted(businessName));

export const generateNoLeadsYetService = async (businessName: string) =>
	runAiPrompt(PRIVATE_PROMPTS.noLeadsYet(businessName));

export const generateDailyCheckInService = async (businessName: string, leadCount: number) =>
	runAiPrompt(PRIVATE_PROMPTS.dailyCheckIn(businessName, leadCount));

export const generateExplainMessageService = async (message: string) =>
	runAiPrompt(PRIVATE_PROMPTS.explainMessage(message));

export const generateSuggestReplyService = async (
	businessName: string,
	customerName: string,
	message: string
) => runAiPrompt(PRIVATE_PROMPTS.suggestReply(businessName, customerName, message));

export const generateLeadSummaryService = async (
	customerName: string,
	message: string,
	notes: string[],
	status: string
) => runAiPrompt(PRIVATE_PROMPTS.leadSummary(customerName, message, notes, status));

export const generateFollowUpReminderService = async (
	customerName: string,
	context: string,
	dueAt: string
) => runAiPrompt(PRIVATE_PROMPTS.followUpReminder(customerName, context, dueAt));

export const generateHelpMessageService = async () =>
	runAiPrompt(PRIVATE_PROMPTS.helpMessage());
