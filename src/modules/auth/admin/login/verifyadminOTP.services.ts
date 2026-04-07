import prisma from "../../../../config/prisma";
import { AUTH_MESSAGES } from "../../../../constants/messages.constant";
import { ApiException } from "../../../../exceptions/api.exception";
import { generateAdminTokenPair } from "../../../../utils/jwt.util";
import { AdminVerifyOtpInput, AdminVerifyOtpResponse } from "./admin.auth.types";

export const verifyAdminLoginOtpService = async (
	input: AdminVerifyOtpInput
): Promise<AdminVerifyOtpResponse> => {
	const admin = await prisma.admin.findUnique({
		where: { email: input.email.toLowerCase() },
		select: {
			id: true,
			email: true,
			name: true,
			isActive: true,
			otps: {
				select: {
					otpCode: true,
					expiresAt: true,
					used: true,
				},
			},
		},
	});

	if (!admin || !admin.isActive || admin.otps.length === 0) {
		throw ApiException.badRequest(AUTH_MESSAGES.ADMIN_OTP_INVALID);
	}

	const otp = admin.otps[0]!;

	if (otp.used) {
		throw ApiException.badRequest(AUTH_MESSAGES.ADMIN_OTP_INVALID);
	}

	if (otp.expiresAt.getTime() < Date.now()) {
		throw ApiException.badRequest(AUTH_MESSAGES.ADMIN_OTP_EXPIRED);
	}

	if (otp.otpCode !== input.otp) {
		throw ApiException.badRequest(AUTH_MESSAGES.ADMIN_OTP_INVALID);
	}

	await prisma.$transaction(async (tx) => {
		await tx.adminOTP.update({
			where: { adminId: admin.id },
			data: { used: true },
		});

		await tx.adminVerification.upsert({
			where: { adminId: admin.id },
			create: {
				adminId: admin.id,
				emailVerified: true,
				emailVerifiedAt: new Date(),
				lastLoginAt: new Date(),
			},
			update: {
				lastLoginAt: new Date(),
			},
		});
	});

	const tokenPair = generateAdminTokenPair({ id: admin.id, email: admin.email });

	return {
		userId: admin.id,
		email: admin.email,
		name: admin.name,
		accessToken: tokenPair.accessToken,
		refreshToken: tokenPair.refreshToken,
		message: AUTH_MESSAGES.ADMIN_LOGIN_SUCCESS,
	};
};
