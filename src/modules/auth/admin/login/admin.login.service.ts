import prisma from "../../../../config/prisma";
import { AUTH_MESSAGES } from "../../../../constants/messages.constant";
import { ApiException } from "../../../../exceptions/api.exception";
import { comparePassword } from "../../../../utils/password.util";
import { generateOtpCode, getOtpExpiryDate } from "../../../../utils/otp.util";
import { sendOtpEmail } from "../../../../utils/email.util";
import { AdminLoginInput, AdminLoginResponse } from "./admin.auth.types";

export const adminLoginService = async (input: AdminLoginInput): Promise<AdminLoginResponse> => {
	const admin = await prisma.admin.findUnique({
		where: { email: input.email.toLowerCase() },
		select: {
			id: true,
			email: true,
			name: true,
			password: true,
			isActive: true,
		},
	});

	if (!admin || !admin.isActive) {
		throw ApiException.unauthorized(AUTH_MESSAGES.ADMIN_INVALID_CREDENTIALS);
	}

	const isPasswordValid = await comparePassword(input.password, admin.password);
	if (!isPasswordValid) {
		throw ApiException.unauthorized(AUTH_MESSAGES.ADMIN_INVALID_CREDENTIALS);
	}

	const otpCode = generateOtpCode();
	const expiresAt = getOtpExpiryDate();

	await prisma.adminOTP.upsert({
		where: { adminId: admin.id },
		create: {
			adminId: admin.id,
			otpCode,
			expiresAt,
			used: false,
		},
		update: {
			otpCode,
			expiresAt,
			used: false,
		},
	});

	await sendOtpEmail({
		to: admin.email,
		name: admin.name,
		otp: otpCode,
	});

	return {
		message: AUTH_MESSAGES.ADMIN_LOGIN_OTP_SENT,
	};
};
