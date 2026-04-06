export const HttpStatus = {
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,
	TOO_MANY_REQUESTS: 429,
	INTERNAL_SERVER_ERROR: 500,
} as const;

export type ExceptionDetails = unknown;

type CaptureStackTrace = {
	captureStackTrace?: (targetObject: object, constructorOpt?: Function) => void;
};

export class BaseException extends Error {
	public readonly statusCode: number;
	public readonly errorCode: string;
	public readonly details?: ExceptionDetails;
	public readonly isOperational: boolean;

	constructor(
		message: string,
		statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
		errorCode = "INTERNAL_SERVER_ERROR",
		details?: ExceptionDetails,
		isOperational = true
	) {
		super(message);

		this.name = new.target.name;
		this.statusCode = statusCode;
		this.errorCode = errorCode;
		this.details = details;
		this.isOperational = isOperational;

		const errorWithStack = Error as ErrorConstructor & CaptureStackTrace;
		errorWithStack.captureStackTrace?.(this, new.target);
	}

	toJSON() {
		return {
			success: false,
			error: {
				code: this.errorCode,
				message: this.message,
				details: this.details ?? null,
			},
		};
	}
}

