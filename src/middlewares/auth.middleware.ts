import { Request } from "express";
import {
	ADMIN_REFRESH_TOKEN_COOKIE_NAME,
	USER_REFRESH_TOKEN_COOKIE_NAME,
	VerifiedAuthTokenPayload,
	verifyAccessToken,
	verifyRefreshToken,
} from "../utils/jwt.util";
import { ApiException } from "../exceptions/api.exception";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthSubject } from "../types/jwt.types";

const getBearerToken = (authorization?: string): string | null => {
	if (!authorization || !authorization.startsWith("Bearer ")) {
		return null;
	}
	const token = authorization.slice(7).trim();
	return token.length ? token : null;
};

const getTokenFromRequest = (
	req: Request,
	refreshCookieName?: string
): { token: string | null; source: "header" | "cookie" | "none" } => {
	const fromHeader = getBearerToken(req.headers.authorization);
	if (fromHeader) {
		return { token: fromHeader, source: "header" };
	}

	if (!refreshCookieName) {
		const fromUserCookie = req.cookies?.[USER_REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
		if (fromUserCookie) {
			return { token: fromUserCookie, source: "cookie" };
		}

		const fromAdminCookie = req.cookies?.[ADMIN_REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
		if (fromAdminCookie) {
			return { token: fromAdminCookie, source: "cookie" };
		}

		return { token: null, source: "none" };
	}

	const fromCookie = req.cookies?.[refreshCookieName] as string | undefined;
	if (fromCookie) {
		return { token: fromCookie, source: "cookie" };
	}

	return { token: null, source: "none" };
};

const getRefreshTokenFromCookie = (
	req: Request,
	refreshCookieName?: string
): string | null => {
	if (!refreshCookieName) {
		return null;
	}

	const token = req.cookies?.[refreshCookieName] as string | undefined;
	return token && token.length ? token : null;
};

const attachAuth = (req: Request, payload: VerifiedAuthTokenPayload): void => {
	req.auth = {
		id: payload.id,
		type: payload.type,
		...(payload.role ? { role: payload.role } : {}),
		...(payload.email ? { email: payload.email } : {}),
	};
};

const authenticate = ({
	expectedSubject,
	missingTokenMessage,
	refreshCookieName,
}: {
	expectedSubject?: AuthSubject;
	missingTokenMessage: string;
	refreshCookieName?: string;
}) =>
	asyncHandler(async (req, _res, next) => {
		const { token, source } = getTokenFromRequest(req, refreshCookieName);
		if (!token) {
			throw ApiException.unauthorized(missingTokenMessage);
		}

		let payload: VerifiedAuthTokenPayload;

		if (source === "cookie") {
			payload = verifyRefreshToken(token);
		} else {
			try {
				payload = verifyAccessToken(token);
			} catch {
				const refreshToken = refreshCookieName
					? getRefreshTokenFromCookie(req, refreshCookieName)
					: (req.cookies?.[USER_REFRESH_TOKEN_COOKIE_NAME] as string | undefined) ??
					  (req.cookies?.[ADMIN_REFRESH_TOKEN_COOKIE_NAME] as string | undefined) ??
					  null;
				if (!refreshToken) {
					throw ApiException.unauthorized(missingTokenMessage);
				}
				payload = verifyRefreshToken(refreshToken);
			}
		}

		if (expectedSubject && payload.type !== expectedSubject) {
			throw ApiException.forbidden(`${expectedSubject === "USER" ? "User" : "Admin"} token required`);
		}

		attachAuth(req, payload);
		next();
	});

export const authenticateUser = authenticate({
	expectedSubject: "USER",
	missingTokenMessage: "User token is required",
	refreshCookieName: USER_REFRESH_TOKEN_COOKIE_NAME,
});

export const authenticateAdmin = authenticate({
	expectedSubject: "ADMIN",
	missingTokenMessage: "Admin token is required",
	refreshCookieName: ADMIN_REFRESH_TOKEN_COOKIE_NAME,
});

export const authenticateAny = authenticate({
	missingTokenMessage: "Authorization token is required",
});

