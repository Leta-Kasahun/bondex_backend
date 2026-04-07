import { RequestHandler } from "express";
import { ValidationException, ValidationIssue } from "../exceptions/validation.exception";

type ValidationResult<T> = {
	value?: T;
	issues?: ValidationIssue[];
};

type Validator<T> = (input: unknown) => ValidationResult<T>;

const buildValidatorMiddleware = <T>(
	pickInput: (req: Parameters<RequestHandler>[0]) => unknown,
	assignValue: (req: Parameters<RequestHandler>[0], value: T) => void,
	validator: Validator<T>
): RequestHandler => {
	return (req, _res, next) => {
		const result = validator(pickInput(req));
		const issues = result.issues ?? [];

		if (issues.length > 0 || result.value === undefined) {
			return next(new ValidationException("Validation failed", issues));
		}

		assignValue(req, result.value);
		next();
	};
};

export const validateBody = <T>(validator: Validator<T>): RequestHandler =>
	buildValidatorMiddleware<T>((req) => req.body, (req, value) => {
		req.body = value;
	}, validator);

export const validateQuery = <T>(validator: Validator<T>): RequestHandler =>
	buildValidatorMiddleware<T>((req) => req.query, (req, value) => {
		req.query = value as typeof req.query;
	}, validator);

export const validateParams = <T>(validator: Validator<T>): RequestHandler =>
	buildValidatorMiddleware<T>((req) => req.params, (req, value) => {
		req.params = value as typeof req.params;
	}, validator);

export type { ValidationResult, Validator };
