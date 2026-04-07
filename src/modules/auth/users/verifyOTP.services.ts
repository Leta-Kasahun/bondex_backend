import prisma from "../../../config/prisma";
import { AUTH_MESSAGES } from "../../../constants/messages.constant";
import { OTP_CONSTANTS } from "../../../constants/otp.constant";
import { ApiException } from "../../../exceptions/api.exception";
import { generateUserTokenPair } from "../../../utils/jwt.util";
import { UserAuthSuccess, VerifyRegistrationOtpInput } from "./auth.types";

export type VerifyRegistrationOtpResponse = UserAuthSuccess & {
	message: string;
};

export const verifyRegistrationOtpService = async (
	input: VerifyRegistrationOtpInput
): Promise<VerifyRegistrationOtpResponse> => {
	const user = await prisma.user.findUnique({
		where: { email: input.email },
		select: {
			id: true,
			email: true,
			name: true,
			userOTP: {
				select: {
					id: true,
					otpCode: true,
					otpExpiresAt: true,
					attempts: true,
				},
			},
			userVerification: {
				select: {
					id: true,
					isVerified: true,
				},
			},
		},
	});

	if (!user || !user.userOTP || !user.userVerification) {
		throw ApiException.badRequest(AUTH_MESSAGES.USER_OTP_INVALID);
	}

	if (user.userVerification.isVerified) {
		throw ApiException.conflict(AUTH_MESSAGES.USER_ALREADY_VERIFIED);
	}

	if (user.userOTP.attempts >= OTP_CONSTANTS.MAX_ATTEMPTS) {
		throw ApiException.tooManyRequests(AUTH_MESSAGES.USER_OTP_ATTEMPTS_EXCEEDED);
	}

	if (user.userOTP.otpExpiresAt.getTime() < Date.now()) {
		throw ApiException.badRequest(AUTH_MESSAGES.USER_OTP_EXPIRED);
	}

	if (user.userOTP.otpCode !== input.otp) {
		const nextAttempts = user.userOTP.attempts + 1;
		await prisma.userOTP.update({
			where: { userId: user.id },
			data: { attempts: nextAttempts },
		});

		if (nextAttempts >= OTP_CONSTANTS.MAX_ATTEMPTS) {
			throw ApiException.tooManyRequests(AUTH_MESSAGES.USER_OTP_ATTEMPTS_EXCEEDED);
		}

		throw ApiException.badRequest(AUTH_MESSAGES.USER_OTP_INVALID);
	}

	await prisma.$transaction(async (tx) => {
		await tx.userVerification.update({
			where: { userId: user.id },
			data: {
				emailVerified: true,
				emailVerifiedAt: new Date(),
				isVerified: true,
				verifiedAt: new Date(),
			},
		});

		await tx.userOTP.delete({
			where: { userId: user.id },
		});
	});

	const tokenPair = generateUserTokenPair({ id: user.id, email: user.email });

	return {
		userId: user.id,
		email: user.email,
		name: user.name,
		accessToken: tokenPair.accessToken,
		refreshToken: tokenPair.refreshToken,
		message: AUTH_MESSAGES.USER_REGISTRATION_OTP_VERIFIED,
	};
};
