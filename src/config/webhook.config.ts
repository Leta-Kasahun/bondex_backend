import { env } from "./env.config";

export const webhookConfig = {
	telegram: {
		enabled: env.TELEGRAM_WEBHOOK_ENABLED,
		path: env.TELEGRAM_WEBHOOK_PATH,
		secret: env.TELEGRAM_WEBHOOK_SECRET,
		baseUrl: env.TELEGRAM_WEBHOOK_BASE_URL,
	},
};
