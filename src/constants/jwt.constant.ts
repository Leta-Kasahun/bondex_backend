export const AUTH_SUBJECT = {
	USER: "USER",
	ADMIN: "ADMIN",
} as const;

export const JWT_CONSTANTS = {
	COOKIE_NAME: {
		USER_REFRESH: "userRefreshToken",
		ADMIN_REFRESH: "adminRefreshToken",
	},
	REFRESH_COOKIE_DAYS_FALLBACK: 7,
} as const;
