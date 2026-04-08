export type AdminUserListQueryInput = {
	page: number;
	limit: number;
	search?: string;
	isActive?: boolean;
};

export type AdminUserParams = {
	userId: string;
};

export type AdminUserListItem = {
	id: string;
	email: string;
	name: string;
	isActive: boolean;
	createdAt: Date;
	totalLeads: number;
	totalDeals: number;
	totalBusinesses: number;
};

export type AdminUserDetailBusiness = {
	id: string;
	name: string;
	type: string | null;
	createdAt: Date;
	updatedAt: Date;
	leadCount: number;
	dealCount: number;
};

export type AdminUserLoginHistoryItem = {
	id: string;
	createdAt: Date;
	expiresAt: Date;
	revokedAt: Date | null;
};

export type AdminUserDetailView = {
	id: string;
	email: string;
	name: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	businesses: AdminUserDetailBusiness[];
	loginHistory: AdminUserLoginHistoryItem[];
};

export type AdminSystemStatsView = {
	totalUsers: number;
	totalActiveUsers: number;
	totalBusinesses: number;
	totalLeads: number;
	totalDeals: number;
	totalWonDeals: number;
	totalRevenue: number;
	newUsersThisWeek: number;
	newLeadsThisWeek: number;
	leadsByPlatform: Array<{ platform: string; count: number }>;
	leadsByStatus: Array<{ status: string; count: number }>;
	dealsByStage: Array<{ stage: string; count: number }>;
};
