import { Request } from "express";
import { ApiException } from "../exceptions/api.exception";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthSubject } from "../types/jwt.types";

const ensureAuth = (req: Request) => req.auth ?? (() => {
	throw ApiException.unauthorized("Authentication required");
})();

export const authorizeSubject = (...subjects: AuthSubject[]) =>
	asyncHandler(async (req, _res, next) => {
		const auth = ensureAuth(req);
		if (!subjects.includes(auth.type)) {
			throw ApiException.forbidden("Not allowed for this account type");
		}
		next();
	});

export const authorizeRole = (...roles: string[]) =>
	asyncHandler(async (req, _res, next) => {
		const auth = ensureAuth(req);
		if (!auth.role || !roles.includes(auth.role)) {
			throw ApiException.forbidden("Insufficient permissions");
		}
		next();
	});

export const authorizeUserOnly = authorizeSubject("USER");
export const authorizeAdminOnly = authorizeSubject("ADMIN");
