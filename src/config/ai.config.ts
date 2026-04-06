import { env } from "./env.config";

export const aiConfig = {
	provider: "gemini",
	apiKey: env.GEMINI_API_KEY,
	model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
	temperature: Number(process.env.AI_TEMPERATURE ?? 0.4),
};

