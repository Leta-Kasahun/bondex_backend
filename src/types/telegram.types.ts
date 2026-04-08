export type TelegramWebhookUser = {
	id: number;
	first_name?: string;
	last_name?: string;
	username?: string;
};

export type TelegramWebhookChat = {
	id: number;
	type: string;
};

export type TelegramWebhookMessage = {
	message_id: number;
	text?: string;
	from?: TelegramWebhookUser;
	chat?: TelegramWebhookChat;
};

export type TelegramWebhookUpdate = {
	update_id: number;
	message?: TelegramWebhookMessage;
};
