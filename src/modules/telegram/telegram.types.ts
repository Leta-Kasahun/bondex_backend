import { TelegramWebhookUpdate } from "../../types/telegram.types";

export type ConnectTelegramBody = {
	businessId: string;
	botToken: string;
};

export type ConnectTelegramInput = ConnectTelegramBody;

export type DisconnectTelegramBody = {
	businessId: string;
};

export type DisconnectTelegramInput = DisconnectTelegramBody;

export type SendTelegramReplyBody = {
	leadId: string;
	message: string;
};

export type SendTelegramReplyInput = SendTelegramReplyBody;

export type TelegramLeadParams = {
	leadId: string;
};

export type TelegramWebhookParams = {
	businessId: string;
};

export type TelegramConnectionView = {
	businessId: string;
	botUsername: string;
};

export type TelegramThreadMessageView = {
	id: string;
	direction: string;
	message: string;
	read: boolean;
	createdAt: Date;
};

export type TelegramThreadView = {
	leadId: string;
	businessId: string;
	platformUserId: string;
	messages: TelegramThreadMessageView[];
};

export type HandleTelegramWebhookInput = {
	businessId: string;
	update: TelegramWebhookUpdate;
	secretHeader?: string;
};
