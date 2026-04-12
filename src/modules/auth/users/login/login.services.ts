import { authConfig } from "../../../../config/auth.config";
import prisma from "../../../../config/prisma";
import { AUTH_MESSAGES } from "../../../../constants/messages.constant";
import { ApiException } from "../../../../exceptions/api.exception";
import { generateUserTokenPair } from "../../../../utils/jwt.util";
import { comparePassword, hashPassword } from "../../../../utils/password.util";
import { GoogleLoginBody, LoginUserInput, UserAuthSuccess } from "../auth.types";

type UserLoginResponse = UserAuthSuccess & {
	message: string;
};

type GoogleTokenInfo = {
	aud?: string;
	azp?: string;
	iss?: string;
	email?: string;
	email_verified?: string | boolean;
	name?: string;
	sub?: string;
	picture?: string;
};

const GOOGLE_VALID_ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);

const getAllowedGoogleAudiences = (): string[] =>
	authConfig.google.clientId
		.split(",")
		.map((value) => value.trim())
		.filter(Boolean);

const verifyGoogleIdToken = async (
	idToken: string
): Promise<Required<Pick<GoogleTokenInfo, "sub" | "email">> & GoogleTokenInfo> => {
	let response: Response;

	try {
		response = await fetch(
			`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
		);
	} catch {
		throw ApiException.unauthorized(AUTH_MESSAGES.GOOGLE_TOKEN_INVALID);
	}

	if (!response.ok) {
		throw ApiException.unauthorized(AUTH_MESSAGES.GOOGLE_TOKEN_INVALID);
	}

	const tokenInfo = (await response.json()) as GoogleTokenInfo;
	const isEmailVerified = tokenInfo.email_verified === true || tokenInfo.email_verified === "true";
	const allowedAudiences = getAllowedGoogleAudiences();
	const audience = tokenInfo.aud?.trim();
	const isAudienceAllowed = audience ? allowedAudiences.includes(audience) : false;
	const issuer = tokenInfo.iss?.trim();
	const isIssuerValid = issuer ? GOOGLE_VALID_ISSUERS.has(issuer) : true;
	const isAuthorizedPartyAllowed = tokenInfo.azp
		? allowedAudiences.includes(tokenInfo.azp.trim())
		: true;

	if (!tokenInfo.sub || !tokenInfo.email || !isAudienceAllowed || !isIssuerValid || !isAuthorizedPartyAllowed) {
		throw ApiException.unauthorized(AUTH_MESSAGES.GOOGLE_TOKEN_INVALID);
	}

	if (!isEmailVerified) {
		throw ApiException.badRequest(AUTH_MESSAGES.GOOGLE_EMAIL_NOT_VERIFIED);
	}

	return tokenInfo as Required<Pick<GoogleTokenInfo, "sub" | "email">> & GoogleTokenInfo;
};

export const loginUserService = async (input: LoginUserInput): Promise<UserLoginResponse> => {
	const user = await prisma.user.findUnique({
		where: { email: input.email },
		select: {
			id: true,
			email: true,
			name: true,
			password: true,
			userVerification: {
				select: {
					isVerified: true,
				},
			},
		},
	});

	if (!user) {
		throw ApiException.unauthorized(AUTH_MESSAGES.USER_INVALID_CREDENTIALS);
	}

	const isPasswordValid = await comparePassword(input.password, user.password);
	if (!isPasswordValid) {
		throw ApiException.unauthorized(AUTH_MESSAGES.USER_INVALID_CREDENTIALS);
	}

	if (!user.userVerification?.isVerified) {
		throw ApiException.forbidden(AUTH_MESSAGES.USER_EMAIL_NOT_VERIFIED);
	}

	const tokenPair = generateUserTokenPair({ id: user.id, email: user.email });

	return {
		userId: user.id,
		email: user.email,
		name: user.name,
		accessToken: tokenPair.accessToken,
		refreshToken: tokenPair.refreshToken,
		message: AUTH_MESSAGES.USER_LOGIN_SUCCESS,
	};
};

export const googleLoginService = async (input: GoogleLoginBody): Promise<UserLoginResponse> => {
	const tokenInfo = await verifyGoogleIdToken(input.idToken);
	const email = tokenInfo.email.toLowerCase();
	const fallbackName = email.split("@")[0] ?? "User";
	const name = (tokenInfo.name ?? fallbackName).trim();
	const avatar = tokenInfo.picture ?? null;

	const user = await prisma.$transaction(async (tx) => {
		const existingUser = await tx.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				name: true,
			},
		});

		const resolvedUser = existingUser ?? await (async () => {
			const randomPassword = `${tokenInfo.sub}.${Date.now()}`;
			const hashedPassword = await hashPassword(randomPassword);

			return tx.user.create({
				data: {
					name,
					email,
					password: hashedPassword,
				},
				select: {
					id: true,
					email: true,
					name: true,
				},
			});
		})();

		await tx.userVerification.upsert({
			where: { userId: resolvedUser.id },
			create: {
				userId: resolvedUser.id,
				emailVerified: true,
				emailVerifiedAt: new Date(),
				isVerified: true,
				verifiedAt: new Date(),
			},
			update: {
				emailVerified: true,
				emailVerifiedAt: new Date(),
				isVerified: true,
				verifiedAt: new Date(),
			},
		});

		await tx.userGoogleAuth.upsert({
			where: { userId: resolvedUser.id },
			create: {
				userId: resolvedUser.id,
				googleId: tokenInfo.sub,
				email,
				name,
				avatar,
			},
			update: {
				googleId: tokenInfo.sub,
				email,
				name,
				avatar,
			},
		});

		return resolvedUser;
	});

	const tokenPair = generateUserTokenPair({ id: user.id, email: user.email });

	return {
		userId: user.id,
		email: user.email,
		name: user.name,
		accessToken: tokenPair.accessToken,
		refreshToken: tokenPair.refreshToken,
		message: AUTH_MESSAGES.GOOGLE_LOGIN_SUCCESS,
	};
};
