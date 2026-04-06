import { Request } from "express";
import {
	ADMIN_REFRESH_TOKEN_COOKIE_NAME,
	USER_REFRESH_TOKEN_COOKIE_NAME,
	VerifiedAuthTokenPayload,
	verifyAccessToken,
	verifyAdminAccessToken,
	verifyUserAccessToken,
} from "../utils/jwt.util";
import { ApiException } from "../exceptions/api.exception";
import { asyncHandler } from "../utils/asyncHandler";

const getBearerToken = (authorization?: string): string | null => {
	if (!authorization || !authorization.startsWith("Bearer ")) {
		return null;
	}
	const token = authorization.slice(7).trim();
	return token.length ? token : null;
};

const getTokenFromRequest = (req: Request, refreshCookieName?: string): string | null => {
	const fromHeader = getBearerToken(req.headers.authorization);
	if (fromHeader) {
		return fromHeader;
	}

	if (!refreshCookieName) {
		return null;
	}

	const fromCookie = req.cookies?.[refreshCookieName] as string | undefined;
	return fromCookie ?? null;
};

const attachAuth = (req: Request, payload: VerifiedAuthTokenPayload): void => {
	req.auth = {
		id: payload.id,
		type: payload.type,
		...(payload.role ? { role: payload.role } : {}),
		...(payload.email ? { email: payload.email } : {}),
	};
};

const authenticate = (
	verify: (token: string) => VerifiedAuthTokenPayload,
	missingTokenMessage: string,
	refreshCookieName?: string
) =>
	asyncHandler(async (req, _res, next) => {
		const token = getTokenFromRequest(req, refreshCookieName);
		if (!token) {
			throw ApiException.unauthorized(missingTokenMessage);
		}

		attachAuth(req, verify(token));
		next();
	});

export const authenticateUser = authenticate(
	verifyUserAccessToken,
	"User token is required",
	USER_REFRESH_TOKEN_COOKIE_NAME
);

export const authenticateAdmin = authenticate(
	verifyAdminAccessToken,
	"Admin token is required",
	ADMIN_REFRESH_TOKEN_COOKIE_NAME
);

export const authenticateAny = authenticate(
	verifyAccessToken,
	"Authorization token is required"
);

