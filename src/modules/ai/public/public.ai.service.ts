import { runAiPrompt } from "../core.ai.service";
import { PUBLIC_PROMPTS } from "./public.prompts";

export const generateWelcomeBotService = async (businessName: string, customerName?: string) =>
	runAiPrompt(PUBLIC_PROMPTS.welcomeBot(businessName, customerName));

export const generateBondexOverviewService = async () =>
	runAiPrompt(PUBLIC_PROMPTS.bondexOverview());

export const generateFeaturesSummaryService = async () =>
	runAiPrompt(PUBLIC_PROMPTS.featuresSummary());

export const generateHowItWorksService = async () =>
	runAiPrompt(PUBLIC_PROMPTS.howItWorks());

export const generateValuePropositionService = async () =>
	runAiPrompt(PUBLIC_PROMPTS.valueProposition());
