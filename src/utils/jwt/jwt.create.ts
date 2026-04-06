import jwt, { SignOptions } from "jsonwebtoken";
import { jwtConfig } from "../../config/jwt.config";
import { AUTH_SUBJECT } from "../../constants/jwt.constant";
import { ValidationException } from "../../exceptions/validation.exception";
import { AdminTokenPayload, AuthTokenPayload, TokenPair, UserTokenPayload } from "../../types/jwt.types";

const buildPayload = (payload: AuthTokenPayload): AuthTokenPayload => {
	if (!payload.id) {
		throw new ValidationException("Token payload is invalid", [{ field: "id", message: "id is required" }]);
	}
	return { id: payload.id, type: payload.type, email: payload.email, role: payload.role };
};

const createToken = (payload: AuthTokenPayload, secret: string, expiresIn: string): string =>
	jwt.sign(buildPayload(payload), secret, {
		expiresIn: expiresIn as NonNullable<SignOptions["expiresIn"]>,
	});

export const generateAccessToken = (payload: AuthTokenPayload): string =>
	createToken(payload, jwtConfig.access.secret, jwtConfig.access.expiresIn);

export const generateRefreshToken = (payload: AuthTokenPayload): string =>
	createToken(payload, jwtConfig.refresh.secret, jwtConfig.refresh.expiresIn);

export const generateTokenPair = (payload: AuthTokenPayload): TokenPair => ({
	accessToken: generateAccessToken(payload),
	refreshToken: generateRefreshToken(payload),
});

export const generateUserTokenPair = (payload: UserTokenPayload): TokenPair =>
	generateTokenPair({ ...payload, type: AUTH_SUBJECT.USER });

export const generateAdminTokenPair = (payload: AdminTokenPayload): TokenPair =>
	generateTokenPair({ ...payload, type: AUTH_SUBJECT.ADMIN });
