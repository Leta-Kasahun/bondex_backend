import { Response } from "express";
import { jwtCookieOptions } from "../../config/jwt.config";
import { JWT_CONSTANTS } from "../../constants/jwt.constant";

export const USER_REFRESH_TOKEN_COOKIE_NAME = JWT_CONSTANTS.COOKIE_NAME.USER_REFRESH;
export const ADMIN_REFRESH_TOKEN_COOKIE_NAME = JWT_CONSTANTS.COOKIE_NAME.ADMIN_REFRESH;

const refreshCookieMaxAgeMs = (): number => {
	const fallback = JWT_CONSTANTS.REFRESH_COOKIE_DAYS_FALLBACK;
	const days = Number(process.env.JWT_REFRESH_COOKIE_DAYS ?? fallback);
	const safe = Number.isFinite(days) && days > 0 ? days : fallback;
	return safe * 24 * 60 * 60 * 1000;
};

const setCookie = (res: Response, name: string, token: string): void => {
	res.cookie(name, token, { ...jwtCookieOptions, maxAge: refreshCookieMaxAgeMs() });
};

const clearCookie = (res: Response, name: string): void => {
	res.clearCookie(name, { ...jwtCookieOptions });
};

export const setUserRefreshTokenCookie = (res: Response, token: string): void => {
	setCookie(res, USER_REFRESH_TOKEN_COOKIE_NAME, token);
};

export const clearUserRefreshTokenCookie = (res: Response): void => {
	clearCookie(res, USER_REFRESH_TOKEN_COOKIE_NAME);
};

export const setAdminRefreshTokenCookie = (res: Response, token: string): void => {
	setCookie(res, ADMIN_REFRESH_TOKEN_COOKIE_NAME, token);
};

export const clearAdminRefreshTokenCookie = (res: Response): void => {
	clearCookie(res, ADMIN_REFRESH_TOKEN_COOKIE_NAME);
};
