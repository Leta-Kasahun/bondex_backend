import prisma from "../../config/prisma";
import { AUTH_MESSAGES } from "../../constants/messages.constant";
import { OTP_CONSTANTS } from "../../constants/otp.constant";
import { ApiException } from "../../exceptions/api.exception";
import { sendOtpEmail } from "../../utils/email.util";
import { generateOtpCode, getOtpExpiryDate } from "../../utils/otp.util";
import {
	ConfirmEmailChangeInput,
	RequestEmailChangeInput,
	UpdateUserProfileInput,
	UserProfileView,
	UserStatsView,
} from "./user.types";

const emailChangeToken = (email: string): string => `email-change:${email}`;

const userProfileSelect = {
	id: true,
	name: true,
	email: true,
	isActive: true,
	createdAt: true,
	updatedAt: true,
} as const;

const getOwnedUser = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			...userProfileSelect,
			userOTP: {
				select: {
					otpCode: true,
					otpExpiresAt: true,
					attempts: true,
				},
			},
			userVerification: {
				select: {
					verificationToken: true,
					isVerified: true,
					emailVerified: true,
				},
			},
		},
	});

	if (!user) {
		throw ApiException.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
	}

	return user;
};

const toUserProfileView = (user: {
	id: string;
	name: string;
	email: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}): UserProfileView => ({
	id: user.id,
	name: user.name,
	email: user.email,
	isActive: user.isActive,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
});

export const getUserProfileService = async (userId: string): Promise<UserProfileView> => {
	const user = await getOwnedUser(userId);
	return toUserProfileView(user);
};

export const updateUserProfileService = async (
	userId: string,
	input: UpdateUserProfileInput
): Promise<UserProfileView> => {
	await getOwnedUser(userId);

	const updated = await prisma.user.update({
		where: { id: userId },
		data: { name: input.name },
		select: userProfileSelect,
	});

	return toUserProfileView(updated);
};

export const getUserStatsService = async (userId: string): Promise<UserStatsView> => {
	const [businesses, leads, deals, unreadNotifications, highPriorityLeads] = await prisma.$transaction([
		prisma.business.count({ where: { ownerId: userId } }),
		prisma.lead.count({ where: { business: { ownerId: userId } } }),
		prisma.deal.count({ where: { business: { ownerId: userId } } }),
		prisma.notification.count({ where: { business: { ownerId: userId }, read: false } }),
		prisma.lead.count({ where: { business: { ownerId: userId }, priority: "high" } }),
	]);

	return { businesses, leads, deals, unreadNotifications, highPriorityLeads };
};

export const requestUserEmailChangeService = async (
	userId: string,
	input: RequestEmailChangeInput
): Promise<void> => {
	const user = await getOwnedUser(userId);

	if (user.email === input.email) {
		throw ApiException.badRequest(AUTH_MESSAGES.USER_EMAIL_SAME_AS_CURRENT);
	}

	const existing = await prisma.user.findUnique({
		where: { email: input.email },
		select: { id: true },
	});

	if (existing && existing.id !== userId) {
		throw ApiException.conflict(AUTH_MESSAGES.USER_ALREADY_EXISTS);
	}

	const otpCode = generateOtpCode();
	const otpExpiresAt = getOtpExpiryDate();

	await prisma.$transaction(async (tx) => {
		await tx.userOTP.upsert({
			where: { userId },
			create: {
				userId,
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

		await tx.userVerification.upsert({
			where: { userId },
			create: {
				userId,
				emailVerified: user.userVerification?.emailVerified ?? true,
				isVerified: user.userVerification?.isVerified ?? true,
				verificationToken: emailChangeToken(input.email),
			},
			update: {
				verificationToken: emailChangeToken(input.email),
			},
		});
	});

	await sendOtpEmail({
		to: input.email,
		name: user.name,
		otp: otpCode,
	});
};

export const confirmUserEmailChangeService = async (
	userId: string,
	input: ConfirmEmailChangeInput
): Promise<UserProfileView> => {
	const user = await getOwnedUser(userId);

	if (!user.userOTP || !user.userVerification) {
		throw ApiException.badRequest(AUTH_MESSAGES.USER_EMAIL_CHANGE_REQUEST_REQUIRED);
	}

	if (user.userVerification.verificationToken !== emailChangeToken(input.email)) {
		throw ApiException.badRequest(AUTH_MESSAGES.USER_EMAIL_CHANGE_REQUEST_REQUIRED);
	}

	if (user.userOTP.attempts >= OTP_CONSTANTS.MAX_ATTEMPTS) {
		throw ApiException.tooManyRequests(AUTH_MESSAGES.USER_OTP_ATTEMPTS_EXCEEDED);
	}

	if (user.userOTP.otpExpiresAt.getTime() < Date.now()) {
		throw ApiException.badRequest(AUTH_MESSAGES.USER_OTP_EXPIRED);
	}

	if (user.userOTP.otpCode !== input.otp) {
		const attempts = user.userOTP.attempts + 1;
		await prisma.userOTP.update({
			where: { userId },
			data: { attempts },
		});

		if (attempts >= OTP_CONSTANTS.MAX_ATTEMPTS) {
			throw ApiException.tooManyRequests(AUTH_MESSAGES.USER_OTP_ATTEMPTS_EXCEEDED);
		}

		throw ApiException.badRequest(AUTH_MESSAGES.USER_OTP_INVALID);
	}

	const existing = await prisma.user.findUnique({
		where: { email: input.email },
		select: { id: true },
	});

	if (existing && existing.id !== userId) {
		throw ApiException.conflict(AUTH_MESSAGES.USER_ALREADY_EXISTS);
	}

	const updated = await prisma.$transaction(async (tx) => {
		const saved = await tx.user.update({
			where: { id: userId },
			data: { email: input.email },
			select: userProfileSelect,
		});

		await tx.userVerification.update({
			where: { userId },
			data: {
				emailVerified: true,
				emailVerifiedAt: new Date(),
				isVerified: true,
				verifiedAt: new Date(),
				verificationToken: null,
			},
		});

		await tx.userOTP.delete({
			where: { userId },
		});

		await tx.userGoogleAuth.updateMany({
			where: { userId },
			data: { email: input.email },
		});

		return saved;
	});

	return toUserProfileView(updated);
};
