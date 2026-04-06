import { ErrorRequestHandler } from "express";
import { ApiException } from "../exceptions/api.exception";
import { BaseException } from "../exceptions/base.exception";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
	const normalized = error instanceof BaseException
		? error
		: ApiException.internal("Unexpected server error");

	const response = normalized.toJSON();
	const includeStack = process.env.NODE_ENV !== "production";

	return res.status(normalized.statusCode).json({
		...response,
		...(includeStack ? { stack: error instanceof Error ? error.stack : null } : {}),
	});
};

