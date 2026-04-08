import { runAiJsonPrompt } from "../core.ai.service";
import { INTERNAL_PROMPTS } from "./internal.prompts";

type PriorityResult = {
	score: number;
	priority: "low" | "medium" | "high";
	reasoning: string;
};

type SentimentResult = {
	sentiment: "positive" | "neutral" | "negative";
	confidence: number;
	reason: string;
};

type ContactInfoResult = {
	name: string | null;
	phone: string | null;
	email: string | null;
	address: string | null;
};

export const generatePriorityScoringService = async (message: string, businessType: string) =>
	runAiJsonPrompt<PriorityResult>(INTERNAL_PROMPTS.priorityScoring(message, businessType));

export const generateSentimentAnalysisService = async (message: string) =>
	runAiJsonPrompt<SentimentResult>(INTERNAL_PROMPTS.sentimentAnalysis(message));

export const generateExtractContactInfoService = async (message: string) =>
	runAiJsonPrompt<ContactInfoResult>(INTERNAL_PROMPTS.extractContactInfo(message));
