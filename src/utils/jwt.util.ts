import { Response } from "express";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtConfig, jwtCookieOptions } from "../config/jwt.config";

export type AuthTokenPayload = {
	userId: string;
	email?: string;
	role?: string;
};

export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

const getRefreshCookieMaxAgeMs = (): number => {
	const fallbackDays = 7;
	const fromEnv = Number(process.env.JWT_REFRESH_COOKIE_DAYS ?? fallbackDays);
	const safeDays = Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : fallbackDays;
	return safeDays * 24 * 60 * 60 * 1000;
};

const buildPayload = (payload: AuthTokenPayload): AuthTokenPayload => {
	const tokenPayload: AuthTokenPayload = { userId: payload.userId };
	if (payload.email) tokenPayload.email = payload.email;
	if (payload.role) tokenPayload.role = payload.role;
	return tokenPayload;
};

export const generateAccessToken = (payload: AuthTokenPayload): string => {
	return jwt.sign(buildPayload(payload), jwtConfig.access.secret, {
		expiresIn: jwtConfig.access.expiresIn as NonNullable<SignOptions["expiresIn"]>,
	});
};

export const generateRefreshToken = (payload: AuthTokenPayload): string => {
	return jwt.sign(buildPayload(payload), jwtConfig.refresh.secret, {
		expiresIn: jwtConfig.refresh.expiresIn as NonNullable<SignOptions["expiresIn"]>,
	});
};

export const generateTokenPair = (payload: AuthTokenPayload): {
	accessToken: string;
	refreshToken: string;
} => {
	return {
		accessToken: generateAccessToken(payload),
		refreshToken: generateRefreshToken(payload),
	};
};

const verifyToken = (token: string, secret: string): JwtPayload & AuthTokenPayload => {
	const decoded = jwt.verify(token, secret);
	if (typeof decoded === "string") {
		throw new Error("Invalid token payload");
	}
	return decoded as JwtPayload & AuthTokenPayload;
};

export const verifyAccessToken = (token: string): JwtPayload & AuthTokenPayload => {
	return verifyToken(token, jwtConfig.access.secret);
};

export const verifyRefreshToken = (token: string): JwtPayload & AuthTokenPayload => {
	return verifyToken(token, jwtConfig.refresh.secret);
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
	res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
		...jwtCookieOptions,
		maxAge: getRefreshCookieMaxAgeMs(),
	});
};

export const clearRefreshTokenCookie = (res: Response): void => {
	res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
		...jwtCookieOptions,
	});
};
