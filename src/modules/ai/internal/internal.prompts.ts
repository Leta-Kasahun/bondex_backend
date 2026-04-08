export const INTERNAL_PROMPTS = {
	priorityScoring: (message: string, businessType: string) => `You are an AI sales scorer for ${businessType}. Analyze: "${message}" and return only JSON: {"score": number, "priority": "low" | "medium" | "high", "reasoning": string}.`,
	sentimentAnalysis: (message: string) => `Analyze sentiment for: "${message}" and return only JSON: {"sentiment": "positive" | "neutral" | "negative", "confidence": number, "reason": string}.`,
	extractContactInfo: (message: string) => `Extract contact details from: "${message}" and return only JSON: {"name": string | null, "phone": string | null, "email": string | null, "address": string | null}.`,
} as const;
