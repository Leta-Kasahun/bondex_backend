import { env } from "./env.config";

export const emailConfig = {
	host: env.SMTP_HOST,
	port: env.SMTP_PORT,
	secure: env.SMTP_PORT === 465,
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASS,
	},
	from: {
		email: env.SMTP_FROM_EMAIL,
		name: env.SMTP_FROM_NAME,
	},
};

