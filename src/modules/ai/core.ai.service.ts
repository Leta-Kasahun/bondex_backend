import { ApiException } from "../../exceptions/api.exception";
import { generateGeminiText } from "../../utils/ai.util";

export const runAiPrompt = async (prompt: string): Promise<string> =>
	generateGeminiText(prompt);

export const runAiJsonPrompt = async <T>(prompt: string): Promise<T> => {
	const response = await runAiPrompt(prompt);

	try {
		return JSON.parse(response) as T;
	} catch {
		throw ApiException.internal("AI returned invalid JSON");
	}
};
