import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiConfig } from "../config/ai.config";
import { ApiException } from "../exceptions/api.exception";

const client = new GoogleGenerativeAI(aiConfig.apiKey);
const model = client.getGenerativeModel({
	model: "gemini-2.5-flash",
	generationConfig: {
		temperature: aiConfig.temperature,
	},
});

export const generateGeminiText = async (prompt: string): Promise<string> => {
	if (!prompt.trim()) {
		throw ApiException.badRequest("Prompt is required");
	}

	try {
		const result = await model.generateContent(prompt);
		const output = result.response.text().trim();

		if (!output) {
			throw ApiException.internal("AI returned an empty response");
		}

		return output;
	} catch (error) {
		if (error instanceof ApiException) {
			throw error;
		}
		throw ApiException.internal("Failed to generate AI response");
	}
};
