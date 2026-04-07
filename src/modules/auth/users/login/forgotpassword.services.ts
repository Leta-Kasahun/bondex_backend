import prisma from "../../../../config/prisma";
import { AUTH_MESSAGES } from "../../../../constants/messages.constant";
import { sendPasswordResetOtpEmail } from "../../../../utils/email.util";
import { generateOtpCode, getOtpExpiryDate } from "../../../../utils/otp.util";
import { ForgotPasswordInput } from "../auth.types";

export type ForgotPasswordResponse = {
	message: string;
};

export const forgotPasswordService = async (
	input: ForgotPasswordInput
): Promise<ForgotPasswordResponse> => {
	const user = await prisma.user.findUnique({
		where: { email: input.email },
		select: {
			id: true,
			email: true,
			name: true,
			userVerification: {
				select: {
					isVerified: true,
				},
			},
		},
	});

	const genericResponse: ForgotPasswordResponse = {
		message: AUTH_MESSAGES.USER_FORGOT_PASSWORD_OTP_SENT,
	};

	if (!user || !user.userVerification?.isVerified) {
		return genericResponse;
	}

	const otpCode = generateOtpCode();
	const otpExpiresAt = getOtpExpiryDate();

	await prisma.userOTP.upsert({
		where: { userId: user.id },
		create: {
			userId: user.id,
			otpCode,
			otpExpiresAt,
			attempts: 0,
		},
		update: {
			otpCode,
			otpExpiresAt,
			attempts: 0,
		},
	});

	await sendPasswordResetOtpEmail({
		to: user.email,
		name: user.name,
		otp: otpCode,
	});

	return genericResponse;
};
