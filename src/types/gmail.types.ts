export type GmailSender = {
	name: string;
	email: string;
};

export type GmailIncomingMessage = {
	id: string;
	threadId: string;
	historyId: string;
	subject: string;
	body: string;
	sender: GmailSender;
	internalDate: Date;
};
