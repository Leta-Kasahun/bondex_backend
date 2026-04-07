import dotenv from "dotenv";

dotenv.config();

const requireEnv = (key: string, fallback?: string): string => {
	const value = process.env[key] ?? fallback;
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
	if (value === undefined) {
		return fallback;
	}
	return value.toLowerCase() === "true";
};

export const env = {
	NODE_ENV: process.env.NODE_ENV ?? "development",
	PORT: Number(process.env.PORT ?? 7000),
	CLIENT_URL: requireEnv("CLIENT_URL", "http://localhost:3000"),
	FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
	DATABASE_URL: requireEnv("DATABASE_URL"),
	GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),
	GOOGLE_CLIENT_SECRET: requireEnv("GOOGLE_CLIENT_SECRET"),
	GOOGLE_REDIRECT_URI: requireEnv("GOOGLE_REDIRECT_URI"),
	SMTP_HOST: requireEnv("SMTP_HOST"),
	SMTP_PORT: Number(requireEnv("SMTP_PORT")),
	SMTP_USER: requireEnv("SMTP_USER"),
	SMTP_PASS: requireEnv("SMTP_PASS"),
	SMTP_FROM_EMAIL: requireEnv("SMTP_FROM_EMAIL"),
	SMTP_FROM_NAME: requireEnv("SMTP_FROM_NAME"),
	GMAIL_REFRESH_TOKEN: requireEnv("GMAIL_REFRESH_TOKEN"),
	TELEGRAM_BOT_TOKEN: requireEnv("TELEGRAM_BOT_TOKEN"),
	GEMINI_API_KEY: requireEnv("GEMINI_API_KEY"),
	JWT_SECRET: requireEnv("JWT_SECRET"),
	JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? requireEnv("JWT_SECRET"),
	JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? requireEnv("JWT_SECRET"),
	JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
	JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
	JWT_COOKIE_HTTP_ONLY: parseBoolean(process.env.JWT_COOKIE_HTTP_ONLY, true),
	TELEGRAM_WEBHOOK_ENABLED: parseBoolean(process.env.TELEGRAM_WEBHOOK_ENABLED, false),
	TELEGRAM_WEBHOOK_PATH: process.env.TELEGRAM_WEBHOOK_PATH ?? "/webhooks/telegram",
	TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET,
	TELEGRAM_WEBHOOK_BASE_URL: process.env.TELEGRAM_WEBHOOK_BASE_URL,
};

