import { BaseException, ExceptionDetails, HttpStatus } from "./base.exception";

export class ApiException extends BaseException {
	constructor(
		message = "Request failed",
		statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
		errorCode = "API_ERROR",
		details?: ExceptionDetails
	) {
		super(message, statusCode, errorCode, details, true);
	}

	static badRequest(message = "Invalid request", details?: ExceptionDetails) {
		return new ApiException(message, HttpStatus.BAD_REQUEST, "BAD_REQUEST", details);
	}

	static unauthorized(message = "Authentication required", details?: ExceptionDetails) {
		return new ApiException(message, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", details);
	}

	static forbidden(message = "Forbidden", details?: ExceptionDetails) {
		return new ApiException(message, HttpStatus.FORBIDDEN, "FORBIDDEN", details);
	}

	static notFound(message = "Resource not found", details?: ExceptionDetails) {
		return new ApiException(message, HttpStatus.NOT_FOUND, "NOT_FOUND", details);
	}

	static conflict(message = "Conflict detected", details?: ExceptionDetails) {
		return new ApiException(message, HttpStatus.CONFLICT, "CONFLICT", details);
	}

	static tooManyRequests(message = "Too many requests", details?: ExceptionDetails) {
		return new ApiException(
			message,
			HttpStatus.TOO_MANY_REQUESTS,
			"TOO_MANY_REQUESTS",
			details
		);
	}

	static internal(message = "Internal server error", details?: ExceptionDetails) {
		return new ApiException(
			message,
			HttpStatus.INTERNAL_SERVER_ERROR,
			"INTERNAL_SERVER_ERROR",
			details
		);
	}
}

