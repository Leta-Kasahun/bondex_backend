import prisma from "../../../../config/prisma";
import { AUTH_MESSAGES } from "../../../../constants/messages.constant";
import { OTP_CONSTANTS } from "../../../../constants/otp.constant";
import { ApiException } from "../../../../exceptions/api.exception";
import { hashPassword } from "../../../../utils/password.util";
import { ResetPasswordInput } from "../auth.types";

export type ResetPasswordResponse = {
	message: string;
};

export const resetPasswordService = async (
	input: ResetPasswordInput
): Promise<ResetPasswordResponse> => {
	const user = await prisma.user.findUnique({
		where: { email: input.email },
		select: {
			id: true,
			userOTP: {
				select: {
					otpCode: true,
					otpExpiresAt: true,
					attempts: true,
				},
			},
		},
	});

	if (!user || !user.userOTP) {
		throw ApiException.badRequest(AUTH_MESSAGES.USER_RESET_OTP_INVALID);
	}

	if (user.userOTP.attempts >= OTP_CONSTANTS.MAX_ATTEMPTS) {
		throw ApiException.tooManyRequests(AUTH_MESSAGES.USER_RESET_OTP_ATTEMPTS_EXCEEDED);
	}

	if (user.userOTP.otpExpiresAt.getTime() < Date.now()) {
		throw ApiException.badRequest(AUTH_MESSAGES.USER_RESET_OTP_EXPIRED);
	}

	if (user.userOTP.otpCode !== input.otp) {
		const nextAttempts = user.userOTP.attempts + 1;
		await prisma.userOTP.update({
			where: { userId: user.id },
			data: { attempts: nextAttempts },
		});

		if (nextAttempts >= OTP_CONSTANTS.MAX_ATTEMPTS) {
			throw ApiException.tooManyRequests(AUTH_MESSAGES.USER_RESET_OTP_ATTEMPTS_EXCEEDED);
		}

		throw ApiException.badRequest(AUTH_MESSAGES.USER_RESET_OTP_INVALID);
	}

	const hashedPassword = await hashPassword(input.newPassword);

	await prisma.$transaction(async (tx) => {
		await tx.user.update({
			where: { id: user.id },
			data: {
				password: hashedPassword,
			},
		});

		await tx.userOTP.delete({
			where: { userId: user.id },
		});
	});

	return {
		message: AUTH_MESSAGES.USER_PASSWORD_RESET_SUCCESS,
	};
};
