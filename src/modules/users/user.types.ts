export type UserProfileView = {
	id: string;
	name: string;
	email: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export type UpdateUserProfileBody = {
	name: string;
};

export type UpdateUserProfileInput = UpdateUserProfileBody;

export type RequestEmailChangeBody = {
	email: string;
};

export type RequestEmailChangeInput = RequestEmailChangeBody;

export type ConfirmEmailChangeBody = {
	email: string;
	otp: string;
};

export type ConfirmEmailChangeInput = ConfirmEmailChangeBody;

export type UserStatsView = {
	businesses: number;
	leads: number;
	deals: number;
	unreadNotifications: number;
	highPriorityLeads: number;
};
