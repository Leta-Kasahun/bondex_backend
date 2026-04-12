import prisma from "../../../../config/prisma";
import { AUTH_MESSAGES } from "../../../../constants/messages.constant";
import { ApiException } from "../../../../exceptions/api.exception";
import { comparePassword } from "../../../../utils/password.util";
import { generateOtpCode, getOtpExpiryDate } from "../../../../utils/otp.util";
import { sendOtpEmail } from "../../../../utils/email.util";
import { AdminLoginInput, AdminLoginResponse } from "./admin.auth.types";

const PASSWORD_MAX_ATTEMPTS = 5;
const PASSWORD_LOCK_MINUTES = 30;

export const adminLoginService = async (input: AdminLoginInput): Promise<AdminLoginResponse> => {
	const admin = await prisma.admin.findUnique({
		where: { email: input.email.toLowerCase() },
		select: {
			id: true,
			email: true,
			name: true,
			password: true,
			isActive: true,
			adminVerification: {
				select: {
					loginAttempts: true,
					lockedUntil: true,
				},
			},
		},
	});

	if (!admin || !admin.isActive) {
		throw ApiException.unauthorized(AUTH_MESSAGES.ADMIN_INVALID_CREDENTIALS);
	}

	if (admin.adminVerification?.lockedUntil && admin.adminVerification.lockedUntil.getTime() > Date.now()) {
		throw ApiException.tooManyRequests(AUTH_MESSAGES.ADMIN_ACCOUNT_LOCKED);
	}

	const isPasswordValid = await comparePassword(input.password, admin.password);
	if (!isPasswordValid) {
		const attempts = (admin.adminVerification?.loginAttempts ?? 0) + 1;
		const shouldLock = attempts >= PASSWORD_MAX_ATTEMPTS;
		const lockedUntil = shouldLock
			? new Date(Date.now() + PASSWORD_LOCK_MINUTES * 60 * 1000)
			: null;

		await prisma.adminVerification.upsert({
			where: { adminId: admin.id },
			create: {
				adminId: admin.id,
				loginAttempts: attempts,
				lockedUntil,
			},
			update: {
				loginAttempts: attempts,
				lockedUntil,
			},
		});

		if (shouldLock) {
			throw ApiException.tooManyRequests(AUTH_MESSAGES.ADMIN_ACCOUNT_LOCKED);
		}

		throw ApiException.unauthorized(AUTH_MESSAGES.ADMIN_INVALID_CREDENTIALS);
	}

	await prisma.adminVerification.upsert({
		where: { adminId: admin.id },
		create: {
			adminId: admin.id,
			loginAttempts: 0,
			lockedUntil: null,
		},
		update: {
			loginAttempts: 0,
			lockedUntil: null,
		},
	});

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
		adminId: admin.id,
		message: AUTH_MESSAGES.ADMIN_LOGIN_OTP_SENT,
	};
};