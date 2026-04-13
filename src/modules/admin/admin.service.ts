import prisma from "../../config/prisma";
import { AUTH_MESSAGES } from "../../constants/messages.constant";
import { ApiException } from "../../exceptions/api.exception";
import {
	AdminSystemStatsQueryInput,
	AdminSystemStatsView,
	AdminUserDetailView,
	AdminUserListItem,
	AdminUserListQueryInput,
} from "./admin.types";

const userSelect = {
	id: true,
	email: true,
	name: true,
	isActive: true,
	createdAt: true,
	updatedAt: true,
} as const;

const weekStart = (): Date => {
	const now = new Date();
	const start = new Date(now);
	const diff = (start.getDay() + 6) % 7;
	start.setDate(start.getDate() - diff);
	start.setHours(0, 0, 0, 0);
	return start;
};

const rangeStart = (range: AdminSystemStatsQueryInput["range"]): Date => {
	const now = new Date();

	if (range === "today") {
		const start = new Date(now);
		start.setHours(0, 0, 0, 0);
		return start;
	}

	if (range === "monthly") {
		const start = new Date(now.getFullYear(), now.getMonth(), 1);
		start.setHours(0, 0, 0, 0);
		return start;
	}

	return weekStart();
};

const getUserOrThrow = async (userId: string) => {
	const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect });
	if (!user) {
		throw ApiException.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
	}
	return user;
};

const userAggregateCounts = async (userId: string) => {
	const [businessAggregate, leadsAggregate, dealsAggregate] = await prisma.$transaction([
		prisma.business.aggregate({ where: { ownerId: userId }, _count: { _all: true } }),
		prisma.lead.aggregate({ where: { business: { ownerId: userId } }, _count: { _all: true } }),
		prisma.deal.aggregate({ where: { business: { ownerId: userId } }, _count: { _all: true } }),
	]);

	const totalBusinesses = businessAggregate._count._all;
	const totalLeads = leadsAggregate._count._all;
	const totalDeals = dealsAggregate._count._all;
	return { totalBusinesses, totalLeads, totalDeals };
};

export const listUsersForAdminService = async (
	input: AdminUserListQueryInput
): Promise<{ items: AdminUserListItem[]; total: number; page: number; limit: number; offset: number }> => {
	const page = Number.isFinite(input.page) && input.page > 0 ? Math.floor(input.page) : 1;
	const limit = Number.isFinite(input.limit) && input.limit > 0 ? Math.floor(input.limit) : 10;
	const offset = (page - 1) * limit;

	const where = {
		...(input.search
			? {
				OR: [
					{ name: { contains: input.search, mode: "insensitive" as const } },
					{ email: { contains: input.search, mode: "insensitive" as const } },
				],
			}
			: {}),
		...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
	};

	const [totalAggregate, users] = await prisma.$transaction([
		prisma.user.aggregate({ where, _count: { _all: true } }),
		prisma.user.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: offset,
			take: limit,
			select: userSelect,
		}),
	]);

	const total = totalAggregate._count._all;

	const items = await Promise.all(
		users.map(async (user) => {
			const counts = await userAggregateCounts(user.id);
			return {
				id: user.id,
				email: user.email,
				name: user.name,
				isActive: user.isActive,
				createdAt: user.createdAt,
				...counts,
			};
		})
	);

	return { items, total, page, limit, offset };
};

export const getUserDetailsForAdminService = async (userId: string): Promise<AdminUserDetailView> => {
	const user = await getUserOrThrow(userId);

	const [businessesRaw, sessions] = await prisma.$transaction([
		prisma.business.findMany({
			where: { ownerId: userId },
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				name: true,
				type: true,
				createdAt: true,
				updatedAt: true,
				_count: { select: { leads: true, deals: true } },
			},
		}),
		prisma.session.findMany({
			where: { userId, userType: "USER" },
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				createdAt: true,
				expiresAt: true,
				revokedAt: true,
			},
		}),
	]);

	return {
		id: user.id,
		email: user.email,
		name: user.name,
		isActive: user.isActive,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		businesses: businessesRaw.map((business) => ({
			id: business.id,
			name: business.name,
			type: business.type,
			createdAt: business.createdAt,
			updatedAt: business.updatedAt,
			leadCount: business._count.leads,
			dealCount: business._count.deals,
		})),
		loginHistory: sessions,
	};
};

export const blockUserForAdminService = async (userId: string) => {
	await getUserOrThrow(userId);

	const [updated] = await prisma.$transaction([
		prisma.user.update({ where: { id: userId }, data: { isActive: false }, select: userSelect }),
		prisma.session.updateMany({
			where: { userId, userType: "USER", revokedAt: null },
			data: { revokedAt: new Date() },
		}),
	]);

	return updated;
};

export const unblockUserForAdminService = async (userId: string) => {
	await getUserOrThrow(userId);
	return prisma.user.update({ where: { id: userId }, data: { isActive: true }, select: userSelect });
};

export const deleteUserForAdminService = async (userId: string): Promise<void> => {
	await getUserOrThrow(userId);

	await prisma.$transaction(async (tx) => {
		await tx.session.deleteMany({ where: { userId, userType: "USER" } });
		await tx.userGoogleAuth.deleteMany({ where: { userId } });
		await tx.userOTP.deleteMany({ where: { userId } });
		await tx.userVerification.deleteMany({ where: { userId } });
		await tx.business.deleteMany({ where: { ownerId: userId } });
		await tx.user.delete({ where: { id: userId } });
	});
};

export const getAdminSystemStatsService = async (
	input: AdminSystemStatsQueryInput
): Promise<AdminSystemStatsView> => {
	const start = rangeStart(input.range);
	const rangeFilter = { createdAt: { gte: start } };

	const [
		totalUsersAggregate,
		totalActiveUsersAggregate,
		totalBusinessesAggregate,
		totalLeadsAggregate,
		totalDealsAggregate,
		totalWonDealsAggregate,
		totalRevenueAggregate,
		newUsersAggregate,
		newLeadsAggregate,
		leadsByPlatformRaw,
		leadsByStatusRaw,
		dealsByStageRaw,
	] = await prisma.$transaction([
		prisma.user.aggregate({ _count: { _all: true } }),
		prisma.user.aggregate({ where: { isActive: true }, _count: { _all: true } }),
		prisma.business.aggregate({ _count: { _all: true } }),
		prisma.lead.aggregate({ where: rangeFilter, _count: { _all: true } }),
		prisma.deal.aggregate({ where: rangeFilter, _count: { _all: true } }),
		prisma.deal.aggregate({ where: { stage: "won", ...rangeFilter }, _count: { _all: true } }),
		prisma.deal.aggregate({ where: { stage: "won", ...rangeFilter }, _sum: { value: true } }),
		prisma.user.aggregate({ where: rangeFilter, _count: { _all: true } }),
		prisma.lead.aggregate({ where: rangeFilter, _count: { _all: true } }),
		prisma.lead.groupBy({ by: ["platform"], where: rangeFilter, _count: { _all: true } }),
		prisma.lead.groupBy({ by: ["status"], where: rangeFilter, _count: { _all: true } }),
		prisma.deal.groupBy({ by: ["stage"], where: rangeFilter, _count: { _all: true } }),
	]);

	const totalUsers = totalUsersAggregate._count._all;
	const totalActiveUsers = totalActiveUsersAggregate._count._all;
	const totalBusinesses = totalBusinessesAggregate._count._all;
	const totalLeads = totalLeadsAggregate._count._all;
	const totalDeals = totalDealsAggregate._count._all;
	const totalWonDeals = totalWonDealsAggregate._count._all;
	const newUsersThisWeek = newUsersAggregate._count._all;
	const newLeadsThisWeek = newLeadsAggregate._count._all;

	return {
		totalUsers,
		totalActiveUsers,
		totalBusinesses,
		totalLeads,
		totalDeals,
		totalWonDeals,
		totalRevenue: Number(totalRevenueAggregate._sum.value ?? 0),
		newUsersInRange: newUsersThisWeek,
		newLeadsInRange: newLeadsThisWeek,
		newUsersThisWeek,
		newLeadsThisWeek,
		leadsByPlatform: leadsByPlatformRaw.map((item) => ({ platform: item.platform, count: item._count._all })),
		leadsByStatus: leadsByStatusRaw.map((item) => ({ status: item.status, count: item._count._all })),
		dealsByStage: dealsByStageRaw.map((item) => ({ stage: item.stage, count: item._count._all })),
	};
};
