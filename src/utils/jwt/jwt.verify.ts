import jwt from "jsonwebtoken";
import { jwtConfig } from "../../config/jwt.config";
import { AUTH_SUBJECT } from "../../constants/jwt.constant";
import { ApiException } from "../../exceptions/api.exception";
import { ValidationException } from "../../exceptions/validation.exception";
import { VerifiedAuthTokenPayload } from "../../types/jwt.types";

const ensureToken = (token: string): string => {
	if (!token || typeof token !== "string") {
		throw new ValidationException("Token is required", [{ field: "token", message: "Token is required" }]);
	}
	return token;
};

const verifyToken = (token: string, secret: string): VerifiedAuthTokenPayload => {
	try {
		const decoded = jwt.verify(ensureToken(token), secret);
		if (typeof decoded === "string") throw ApiException.unauthorized("Invalid token payload");
		const typed = decoded as Partial<VerifiedAuthTokenPayload>;
		if (!typed.id || !typed.type) throw ApiException.unauthorized("Invalid token claims");
		return typed as VerifiedAuthTokenPayload;
	} catch {
		throw ApiException.unauthorized("Invalid or expired token");
	}
};

export const verifyAccessToken = (token: string): VerifiedAuthTokenPayload =>
	verifyToken(token, jwtConfig.access.secret);

export const verifyRefreshToken = (token: string): VerifiedAuthTokenPayload =>
	verifyToken(token, jwtConfig.refresh.secret);

export const verifyUserAccessToken = (token: string): VerifiedAuthTokenPayload => {
	const payload = verifyAccessToken(token);
	if (payload.type !== AUTH_SUBJECT.USER) throw ApiException.forbidden("User token required");
	return payload;
};

export const verifyAdminAccessToken = (token: string): VerifiedAuthTokenPayload => {
	const payload = verifyAccessToken(token);
	if (payload.type !== AUTH_SUBJECT.ADMIN) throw ApiException.forbidden("Admin token required");
	return payload;
};
