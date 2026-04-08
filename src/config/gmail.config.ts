import { authConfig } from "./auth.config";
import { GMAIL_CONSTANTS } from "../constants/gmail.constant";

export const gmailConfig = {
	googleClientId: authConfig.google.clientId,
	googleClientSecret: authConfig.google.clientSecret,
	googleRedirectUri: authConfig.google.redirectUri,
	defaultRefreshToken: authConfig.gmail.refreshToken,
	pollIntervalMs: GMAIL_CONSTANTS.POLL_INTERVAL_MS,
	initialSyncWindowHours: GMAIL_CONSTANTS.INITIAL_SYNC_WINDOW_HOURS,
	rateLimitDelayMs: GMAIL_CONSTANTS.RATE_LIMIT_DELAY_MS,
};
