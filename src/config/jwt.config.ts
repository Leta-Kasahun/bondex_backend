import { CookieOptions } from "express";
import { env } from "./env.config";

const isProduction = env.NODE_ENV === "production";

export const jwtConfig = {
	access: {
		secret: env.JWT_ACCESS_SECRET,
		expiresIn: env.JWT_ACCESS_EXPIRES_IN,
	},
	refresh: {
		secret: env.JWT_REFRESH_SECRET,
		expiresIn: env.JWT_REFRESH_EXPIRES_IN,
	},
};

export const jwtCookieOptions: CookieOptions = {
	httpOnly: env.JWT_COOKIE_HTTP_ONLY,
	secure: isProduction,
	sameSite: isProduction ? "none" : "lax",
	path: "/",
};

