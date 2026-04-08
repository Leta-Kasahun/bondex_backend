export type CreateDirectChatLeadInput = {
	businessId: string;
	message: string;
	customerName?: string;
	customerEmail?: string;
	customerPhone?: string;
};

export type DirectChatLeadView = {
	id: string;
	businessId: string;
	customerName: string | null;
	customerEmail: string | null;
	customerPhone: string | null;
	message: string;
	platform: "direct_chat";
	status: string;
	priority: string;
	createdAt: Date;
};

export type PublicBusinessParams = {
	id: string;
};

export type PublicBusinessView = {
	id: string;
	name: string;
	type: string | null;
	description: string | null;
	logo: string | null;
};
