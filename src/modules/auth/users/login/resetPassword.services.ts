import prisma from "../../../../config/prisma";
import { AUTH_MESSAGES } from "../../../../constants/messages.constant";
import { OTP_CONSTANTS } from "../../../../constants/otp.constant";
import { ApiException } from "../../../../exceptions/api.exception";
import { hashPassword } from "../../../../utils/password.util";
import { ResetPasswordInput, VerifyResetOtpInput } from "../auth.types";

export type ResetPasswordResponse = {
	message: string;
};

export type VerifyResetOtpResponse = {
	userId: string;
	message: string;
};

export const verifyResetOtpService = async (
	input: VerifyResetOtpInput
): Promise<VerifyResetOtpResponse> => {
	const matchingOtps = await prisma.userOTP.findMany({
		where: { otpCode: input.otp },
		select: {
			userId: true,
			otpExpiresAt: true,
			attempts: true,
		},
		take: 2,
	});

	if (matchingOtps.length !== 1) {
		throw ApiException.badRequest(AUTH_MESSAGES.USER_RESET_OTP_INVALID);
	}

	const otpRecord = matchingOtps[0]!;

	if (otpRecord.attempts >= OTP_CONSTANTS.MAX_ATTEMPTS) {
		throw ApiException.tooManyRequests(AUTH_MESSAGES.USER_RESET_OTP_ATTEMPTS_EXCEEDED);
	}

	if (otpRecord.otpExpiresAt.getTime() < Date.now()) {
		throw ApiException.badRequest(AUTH_MESSAGES.USER_RESET_OTP_EXPIRED);
	}

	return {
		userId: otpRecord.userId,
		message: "OTP verified successfully",
	};
};

export const resetPasswordService = async (
	userId: string,
	input: ResetPasswordInput
): Promise<ResetPasswordResponse> => {
	const otpRecord = await prisma.userOTP.findUnique({
		where: { userId },
		select: {
			otpExpiresAt: true,
		},
	});

	if (!otpRecord) {
		throw ApiException.badRequest(AUTH_MESSAGES.USER_RESET_OTP_INVALID);
	}

	if (otpRecord.otpExpiresAt.getTime() < Date.now()) {
		throw ApiException.badRequest(AUTH_MESSAGES.USER_RESET_OTP_EXPIRED);
	}

	const hashedPassword = await hashPassword(input.newPassword);

	await prisma.$transaction(async (tx) => {
		await tx.user.update({
			where: { id: userId },
			data: {
				password: hashedPassword,
			},
		});

		await tx.userOTP.delete({
			where: { userId },
		});
	});

	return {
		message: AUTH_MESSAGES.USER_PASSWORD_RESET_SUCCESS,
	};
};
