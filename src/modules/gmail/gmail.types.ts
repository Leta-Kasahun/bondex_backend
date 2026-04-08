export type GmailBusinessParams = {
	businessId: string;
};

export type GmailDisconnectBody = {
	businessId: string;
};

export type GmailDisconnectInput = GmailDisconnectBody;

export type GmailReplyBody = {
	leadId: string;
	message: string;
};

export type GmailReplyInput = GmailReplyBody;

export type GmailConnectionStatusView = {
	businessId: string;
	connected: boolean;
	email: string | null;
};
