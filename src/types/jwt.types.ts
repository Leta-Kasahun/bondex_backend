import { JwtPayload } from "jsonwebtoken";
import { AUTH_SUBJECT } from "../constants/jwt.constant";

export type AuthSubject = (typeof AUTH_SUBJECT)[keyof typeof AUTH_SUBJECT];

export type AuthTokenPayload = {
	id: string;
	type: AuthSubject;
	email?: string;
	role?: string;
};

export type UserTokenPayload = Omit<AuthTokenPayload, "type"> & {
	type?: never;
};

export type AdminTokenPayload = Omit<AuthTokenPayload, "type"> & {
	type?: never;
};

export type VerifiedAuthTokenPayload = JwtPayload & AuthTokenPayload;

export type TokenPair = {
	accessToken: string;
	refreshToken: string;
};
