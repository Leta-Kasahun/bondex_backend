import prisma from "../../../../config/prisma";
import { AUTH_MESSAGES } from "../../../../constants/messages.constant";
import { ApiException } from "../../../../exceptions/api.exception";
import { sendOtpEmail } from "../../../../utils/email.util";
import { generateOtpCode, getOtpExpiryDate } from "../../../../utils/otp.util";
import { hashPassword } from "../../../../utils/password.util";
import { RegisterUserInput } from "../auth.types";

export type RegisterUserResponse = {
	userId: string;
	email: string;
	message: string;
};

export const registerUserService = async (
	input: RegisterUserInput
): Promise<RegisterUserResponse> => {
	const existingUser = await prisma.user.findUnique({
		where: { email: input.email },
		select: { id: true },
	});

	if (existingUser) {
		throw ApiException.conflict(AUTH_MESSAGES.USER_ALREADY_EXISTS);
	}

	const hashedPassword = await hashPassword(input.password);
	const otpCode = generateOtpCode();
	const otpExpiresAt = getOtpExpiryDate();

	const createdUser = await prisma.$transaction(async (tx) => {
		const user = await tx.user.create({
			data: {
				name: input.name,
				email: input.email,
				password: hashedPassword,
			},
			select: {
				id: true,
				email: true,
				name: true,
			},
		});

		await tx.userVerification.create({
			data: {
				userId: user.id,
				emailVerified: false,
				isVerified: false,
			},
		});

		await tx.userOTP.create({
			data: {
				userId: user.id,
				otpCode,
				otpExpiresAt,
				attempts: 0,
			},
		});

		return user;
	});

	try {
		await sendOtpEmail({
			to: createdUser.email,
			name: createdUser.name,
			otp: otpCode,
		});
	} catch {
		throw ApiException.internal(AUTH_MESSAGES.USER_REGISTRATION_EMAIL_FAILED);
	}

	return {
		userId: createdUser.id,
		email: createdUser.email,
		message: AUTH_MESSAGES.USER_REGISTERED_OTP_SENT,
	};
};
