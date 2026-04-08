import { env } from "./env.config";

export const telegramConfig = {
	botToken: env.TELEGRAM_BOT_TOKEN,
	webhook: {
		enabled: env.TELEGRAM_WEBHOOK_ENABLED,
		path: env.TELEGRAM_WEBHOOK_PATH,
		publicRoutePrefix: "/api/telegram/webhook",
		secret: env.TELEGRAM_WEBHOOK_SECRET,
		baseUrl: env.TELEGRAM_WEBHOOK_BASE_URL,
	},
};

