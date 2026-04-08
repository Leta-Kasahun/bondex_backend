import { Request } from "express";
import { AUTH_MESSAGES } from "../../constants/messages.constant";
import { ApiException } from "../../exceptions/api.exception";
import { asyncHandler } from "../../utils/asyncHandler";
import { AdminUserListQueryInput, AdminUserParams } from "./admin.types";
import {
	blockUserForAdminService,
	deleteUserForAdminService,
	getAdminSystemStatsService,
	getUserDetailsForAdminService,
	listUsersForAdminService,
	unblockUserForAdminService,
} from "./admin.service";

const ensureAdminAuth = (req: Request): string => {
	const adminId = req.auth?.id;
	if (!adminId || req.auth?.type !== "ADMIN") {
		throw ApiException.unauthorized("Admin authentication is required");
	}
	return adminId;
};

export const listUsersForAdminController = asyncHandler(async (req, res) => {
	ensureAdminAuth(req);
	const query = req.query as unknown as AdminUserListQueryInput;
	const result = await listUsersForAdminService(query);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.ADMIN_USERS_LISTED,
		data: result.items,
		meta: {
			total: result.total,
			page: result.page,
			limit: result.limit,
			offset: result.offset,
		},
	});
});

export const getUserDetailsForAdminController = asyncHandler(async (req, res) => {
	ensureAdminAuth(req);
	const params = req.params as unknown as AdminUserParams;
	const user = await getUserDetailsForAdminService(params.userId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.ADMIN_USER_FETCHED,
		data: user,
	});
});

export const blockUserForAdminController = asyncHandler(async (req, res) => {
	ensureAdminAuth(req);
	const params = req.params as unknown as AdminUserParams;
	const user = await blockUserForAdminService(params.userId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.ADMIN_USER_BLOCKED,
		data: user,
	});
});

export const unblockUserForAdminController = asyncHandler(async (req, res) => {
	ensureAdminAuth(req);
	const params = req.params as unknown as AdminUserParams;
	const user = await unblockUserForAdminService(params.userId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.ADMIN_USER_UNBLOCKED,
		data: user,
	});
});

export const deleteUserForAdminController = asyncHandler(async (req, res) => {
	ensureAdminAuth(req);
	const params = req.params as unknown as AdminUserParams;
	await deleteUserForAdminService(params.userId);

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.ADMIN_USER_DELETED,
	});
});

export const getAdminSystemStatsController = asyncHandler(async (req, res) => {
	ensureAdminAuth(req);
	const stats = await getAdminSystemStatsService();

	res.status(200).json({
		success: true,
		message: AUTH_MESSAGES.ADMIN_SYSTEM_STATS_FETCHED,
		data: stats,
	});
});
