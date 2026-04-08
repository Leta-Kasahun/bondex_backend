import prisma from "../../../../config/prisma";
import { jwtConfig } from "../../../../config/jwt.config";
import { AUTH_MESSAGES } from "../../../../constants/messages.constant";
import { ApiException } from "../../../../exceptions/api.exception";
import { generateAdminTokenPair } from "../../../../utils/jwt.util";
import { AdminVerifyOtpInput, AdminVerifyOtpResponse } from "./admin.auth.types";

const OTP_MAX_ATTEMPTS = 3;

const refreshExpiryFromNow = (): Date => {
	const value = jwtConfig.refresh.expiresIn.trim();
	const match = value.match(/^(\d+)([smhd])$/i);
	if (!match) {
		return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	}

	const amount = Number(match[1]);
	const unit = (match[2] ?? "d").toLowerCase();
	const multiplier = unit === "s" ? 1000 : unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : 86_400_000;
	return new Date(Date.now() + amount * multiplier);
};

export const verifyAdminLoginOtpService = async (
	input: AdminVerifyOtpInput
): Promise<AdminVerifyOtpResponse> => {
	const admin = await prisma.admin.findUnique({
		where: { id: input.adminId },
		select: {
			id: true,
			email: true,
			name: true,
			role: true,
			isActive: true,
			otps: {
				select: {
					id: true,
					otpCode: true,
					expiresAt: true,
					used: true,
				},
			},
			adminVerification: {
				select: {
					loginAttempts: true,
					lockedUntil: true,
				},
			},
		},
	});

	if (!admin || !admin.isActive || admin.otps.length === 0) {
		throw ApiException.badRequest(AUTH_MESSAGES.ADMIN_OTP_INVALID);
	}

	const otp = admin.otps[0]!;

	if (admin.adminVerification?.lockedUntil && admin.adminVerification.lockedUntil.getTime() > Date.now()) {
		throw ApiException.tooManyRequests(AUTH_MESSAGES.ADMIN_OTP_ATTEMPTS_EXCEEDED);
	}

	if (otp.used) {
		throw ApiException.badRequest(AUTH_MESSAGES.ADMIN_OTP_INVALID);
	}

	if (otp.expiresAt.getTime() < Date.now()) {
		throw ApiException.badRequest(AUTH_MESSAGES.ADMIN_OTP_EXPIRED);
	}

	if (otp.otpCode !== input.otp) {
		const attempts = (admin.adminVerification?.loginAttempts ?? 0) + 1;
		const shouldBlock = attempts >= OTP_MAX_ATTEMPTS;

		await prisma.adminVerification.upsert({
			where: { adminId: admin.id },
			create: {
				adminId: admin.id,
				loginAttempts: attempts,
				lockedUntil: shouldBlock ? otp.expiresAt : null,
			},
			update: {
				loginAttempts: attempts,
				lockedUntil: shouldBlock ? otp.expiresAt : null,
			},
		});

		if (shouldBlock) {
			throw ApiException.tooManyRequests(AUTH_MESSAGES.ADMIN_OTP_ATTEMPTS_EXCEEDED);
		}

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
				loginAttempts: 0,
				lockedUntil: null,
				lastLoginAt: new Date(),
			},
			update: {
				loginAttempts: 0,
				lockedUntil: null,
				lastLoginAt: new Date(),
			},
		});
	});

	const tokenPair = generateAdminTokenPair({ id: admin.id, email: admin.email, role: "ADMIN" });

	await prisma.adminSession.upsert({
		where: { adminId: admin.id },
		create: {
			adminId: admin.id,
			refreshToken: tokenPair.refreshToken,
			expiresAt: refreshExpiryFromNow(),
		},
		update: {
			refreshToken: tokenPair.refreshToken,
			expiresAt: refreshExpiryFromNow(),
			revokedAt: null,
		},
	});

	return {
		userId: admin.id,
		email: admin.email,
		name: admin.name,
		accessToken: tokenPair.accessToken,
		refreshToken: tokenPair.refreshToken,
		message: AUTH_MESSAGES.ADMIN_LOGIN_SUCCESS,
	};
};
