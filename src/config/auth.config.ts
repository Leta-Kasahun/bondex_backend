import { env } from "./env.config";

export const authConfig = {
	google: {
		clientId: env.GOOGLE_CLIENT_ID,
		clientSecret: env.GOOGLE_CLIENT_SECRET,
		redirectUri: env.GOOGLE_REDIRECT_URI,
	},
	gmail: {
		refreshToken: env.GMAIL_REFRESH_TOKEN,
	},
};
