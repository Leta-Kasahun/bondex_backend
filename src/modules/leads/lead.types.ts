import {
	LEAD_PLATFORM_VALUES,
	LEAD_PRIORITY_VALUES,
	LEAD_STATUS_VALUES,
} from "../../constants/leadstatus.constant";

export type LeadPlatform = (typeof LEAD_PLATFORM_VALUES)[number];
export type LeadPriority = (typeof LEAD_PRIORITY_VALUES)[number];
export type LeadStatus = (typeof LEAD_STATUS_VALUES)[number];

export type CreateLeadBody = {
	businessId: string;
	message: string;
	customerName?: string;
	customerEmail?: string;
	customerPhone?: string;
	status?: LeadStatus;
	priority?: LeadPriority;
};

export type CreateLeadInput = CreateLeadBody;

export type UpdateLeadBody = {
	message?: string;
	customerName?: string;
	customerEmail?: string;
	customerPhone?: string;
	status?: LeadStatus;
	priority?: LeadPriority;
	platform?: LeadPlatform;
};

export type UpdateLeadInput = UpdateLeadBody;

export type LeadParams = {
	leadId: string;
};

export type LeadListQuery = {
	businessId: string;
	page?: number;
	limit?: number;
	search?: string;
	status?: LeadStatus;
	priority?: LeadPriority;
	platform?: LeadPlatform;
};

export type LeadListInput = {
	businessId: string;
	page: number;
	limit: number;
	search?: string;
	status?: LeadStatus;
	priority?: LeadPriority;
	platform?: LeadPlatform;
};

export type LeadView = {
	id: string;
	businessId: string;
	customerName: string | null;
	customerEmail: string | null;
	customerPhone: string | null;
	message: string;
	platform: LeadPlatform;
	status: LeadStatus;
	priority: LeadPriority;
	aiScore: number | null;
	aiReasoning: string | null;
	platformUserId: string | null;
	firstReplyAt: Date | null;
	responseTimeMinutes: number | null;
	createdAt: Date;
	updatedAt: Date;
};

export type LeadNoteBody = {
	content: string;
};

export type LeadNoteInput = LeadNoteBody;

export type LeadNoteParams = {
	leadId: string;
	noteId: string;
};

export type LeadNoteView = {
	id: string;
	leadId: string;
	authorId: string;
	content: string;
	createdAt: Date;
};
