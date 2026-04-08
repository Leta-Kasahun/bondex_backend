import { google, gmail_v1 } from "googleapis";
import { gmailConfig } from "../config/gmail.config";
import { GMAIL_CONSTANTS } from "../constants/gmail.constant";
import { ApiException } from "../exceptions/api.exception";
import { GmailIncomingMessage } from "../types/gmail.types";

const oauth2Client = () =>
	new google.auth.OAuth2(
		gmailConfig.googleClientId,
		gmailConfig.googleClientSecret,
		gmailConfig.googleRedirectUri
	);

export const resolveGmailRefreshToken = (refreshToken?: string): string => {
	const token = refreshToken?.trim() || gmailConfig.defaultRefreshToken?.trim();
	if (!token) {
		throw ApiException.badRequest("Gmail refresh token is not configured");
	}
	return token;
};

export const createGmailClient = (refreshToken?: string): gmail_v1.Gmail => {
	const client = oauth2Client();
	client.setCredentials({ refresh_token: resolveGmailRefreshToken(refreshToken) });
	return google.gmail({ version: "v1", auth: client });
};

export const toAfterQuery = (hours: number): string => {
	const afterUnix = Math.floor((Date.now() - hours * 60 * 60 * 1000) / 1000);
	return `after:${afterUnix}`;
};

const decodeBase64 = (raw: string): string =>
	Buffer.from(raw.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");

const findHeader = (headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string): string =>
	headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

const extractBodyFromPart = (part?: gmail_v1.Schema$MessagePart): string => {
	if (!part) {
		return "";
	}
	if (part.body?.data && part.mimeType === "text/plain") {
		return decodeBase64(part.body.data);
	}
	for (const nested of part.parts ?? []) {
		const value = extractBodyFromPart(nested);
		if (value) {
			return value;
		}
	}
	if (part.body?.data && !part.parts?.length) {
		return decodeBase64(part.body.data);
	}
	return "";
};

export const cleanEmailBody = (text: string): string => {
	const withoutQuotes = text
		.replace(/\r/g, "")
		.split("\n")
		.filter((line) => !/^>/.test(line.trim()))
		.filter((line) => !/^On\s.+wrote:$/i.test(line.trim()))
		.filter((line) => !/^From:\s/i.test(line.trim()))
		.filter((line) => !/^Sent from my/i.test(line.trim()))
		.join("\n");

	const beforeSignature = withoutQuotes.split("--\n")[0] ?? "";
	return beforeSignature.trim().slice(0, 5000);
};

const parseSender = (fromHeader: string): { name: string; email: string } => {
	const match = fromHeader.match(/^(.*?)\s*<(.+?)>\s*$/);
	if (match) {
		return {
			name: match[1]?.replace(/"/g, "").trim() || "Customer",
			email: match[2]?.trim().toLowerCase() || "unknown@example.com",
		};
	}
	return {
		name: fromHeader.split("@")[0]?.trim() || "Customer",
		email: fromHeader.trim().toLowerCase() || "unknown@example.com",
	};
};

export const getProfileHistoryId = async (gmail: gmail_v1.Gmail): Promise<string> => {
	const profile = await gmail.users.getProfile({ userId: "me" });
	const historyId = profile.data.historyId;
	if (!historyId) {
		throw ApiException.internal("Unable to resolve Gmail history id");
	}
	return historyId;
};

export const listMessageIdsSince = async (
	gmail: gmail_v1.Gmail,
	startHistoryId: string
): Promise<string[]> => {
	const ids = new Set<string>();
	let pageToken: string | undefined;

	do {
		const params: gmail_v1.Params$Resource$Users$History$List = {
			userId: "me",
			startHistoryId,
			historyTypes: ["messageAdded"],
			...(pageToken ? { pageToken } : {}),
		};

		const res = await gmail.users.history.list(params);

		for (const history of res.data.history ?? []) {
			for (const added of history.messagesAdded ?? []) {
				if (added.message?.id) {
					ids.add(added.message.id);
				}
			}
		}

		pageToken = res.data.nextPageToken ?? undefined;
	} while (pageToken);

	return Array.from(ids);
};

export const listRecentMessageIds = async (gmail: gmail_v1.Gmail, hours: number): Promise<string[]> => {
	const ids = new Set<string>();
	let pageToken: string | undefined;

	do {
		const params: gmail_v1.Params$Resource$Users$Messages$List = {
			userId: "me",
			q: toAfterQuery(hours),
			maxResults: 100,
			...(pageToken ? { pageToken } : {}),
		};

		const res = await gmail.users.messages.list(params);

		for (const msg of res.data.messages ?? []) {
			if (msg.id) {
				ids.add(msg.id);
			}
		}

		pageToken = res.data.nextPageToken ?? undefined;
	} while (pageToken);

	return Array.from(ids);
};

export const getIncomingMessage = async (
	gmail: gmail_v1.Gmail,
	messageId: string
): Promise<GmailIncomingMessage | null> => {
	const res = await gmail.users.messages.get({
		userId: "me",
		id: messageId,
		format: "full",
	});

	const payload = res.data.payload;
	if (!payload || !res.data.threadId || !res.data.historyId) {
		return null;
	}

	const fromHeader = findHeader(payload.headers, "From");
	if (!fromHeader) {
		return null;
	}

	const sender = parseSender(fromHeader);
	const subject = findHeader(payload.headers, "Subject") || "No subject";
	const rawBody = extractBodyFromPart(payload);
	const body = cleanEmailBody(rawBody || res.data.snippet || "");
	if (!body) {
		return null;
	}

	const internalDate = new Date(Number(res.data.internalDate ?? Date.now()));

	return {
		id: res.data.id ?? messageId,
		threadId: res.data.threadId,
		historyId: res.data.historyId,
		subject,
		body,
		sender,
		internalDate,
	};
};

export const sendThreadReply = async (input: {
	gmail: gmail_v1.Gmail;
	to: string;
	threadId: string;
	subject: string;
	body: string;
}): Promise<void> => {
	const mime = [
		`To: ${input.to}`,
		`Subject: Re: ${input.subject}`,
		"Content-Type: text/plain; charset=UTF-8",
		"",
		input.body,
	].join("\n");

	const raw = Buffer.from(mime)
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");

	await input.gmail.users.messages.send({
		userId: "me",
		requestBody: {
			raw,
			threadId: input.threadId,
		},
	});
};

export const isHistoryTooOldError = (error: unknown): boolean => {
	const status = (error as { code?: number })?.code;
	const message = (error as { message?: string })?.message ?? "";
	return status === 404 || /startHistoryId/i.test(message);
};

export const waitForRateLimit = async (): Promise<void> => {
	await new Promise((resolve) => setTimeout(resolve, GMAIL_CONSTANTS.RATE_LIMIT_DELAY_MS));
};
