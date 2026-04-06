import { BaseException, HttpStatus } from "./base.exception";

export type ValidationIssue = {
	field: string;
	message: string;
	value?: unknown;
};

export class ValidationException extends BaseException {
	public readonly issues: ValidationIssue[];

	constructor(message = "Validation failed", issues: ValidationIssue[] = []) {
		super(
			message,
			HttpStatus.UNPROCESSABLE_ENTITY,
			"VALIDATION_ERROR",
			{ issues },
			true
		);

		this.issues = issues;
	}
}

