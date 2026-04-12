import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiConfig } from "../config/ai.config";
import { ApiException } from "../exceptions/api.exception";

const client = new GoogleGenerativeAI(aiConfig.apiKey);

const CANDIDATE_MODELS = Array.from(
	new Set([
		"gemini-2.5-flash",
		aiConfig.model,
	])
);

const extractOutput = (response: { text?: () => string }): string => {
	try {
		return response.text?.().trim() ?? "";
	} catch {
		return "";
	}
};

export const generateGeminiText = async (prompt: string): Promise<string> => {
	if (!prompt.trim()) {
		throw ApiException.badRequest("Prompt is required");
	}

	let lastError: unknown;

	for (const modelName of CANDIDATE_MODELS) {
		for (let attempt = 0; attempt < 2; attempt++) {
			try {
				const model = client.getGenerativeModel({
					model: modelName,
					generationConfig: {
						temperature: aiConfig.temperature,
					},
				});

				const result = await model.generateContent(prompt);
				const output = extractOutput(result.response);

				if (output) {
					return output;
				}

				lastError = new Error(`Empty response from model: ${modelName}`);
			} catch (error) {
				lastError = error;
			}
		}
	}

	if (lastError instanceof ApiException) {
		throw lastError;
	}

	throw ApiException.internal("Failed to generate AI response");
};
