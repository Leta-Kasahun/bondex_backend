export interface NotificationListQuery {
	businessId: string;
	page?: number;
	limit?: number;
	read?: boolean;
}

export interface NotificationListInput {
	businessId: string;
	page: number;
	limit: number;
	read?: boolean;
}

export interface NotificationUnreadCountQuery {
	businessId: string;
}

export interface NotificationParams {
	notificationId: string;
}

export interface NotificationView {
	id: string;
	businessId: string;
	leadId: string;
	type: "lead_created" | "high_priority_lead" | "stale_high_priority";
	title: string;
	body: string;
	read: boolean;
	createdAt: Date;
}
