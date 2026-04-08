import { gmailConfig } from "../../config/gmail.config";
import prisma from "../../config/prisma";
import { ApiException } from "../../exceptions/api.exception";
import {
	createGmailClient,
	getIncomingMessage,
	getProfileHistoryId,
	isHistoryTooOldError,
	listMessageIdsSince,
	listRecentMessageIds,
	sendThreadReply,
	waitForRateLimit,
} from "../../utils/gmail.util";
import { createLeadCreatedNotification } from "../notifications/notification.service";
import {
	GmailConnectionStatusView,
	GmailDisconnectInput,
	GmailReplyInput,
} from "./gmail.types";

const ensureOwnedBusiness = async (businessId: string, userId: string): Promise<void> => {
	const business = await prisma.business.findFirst({
		where: { id: businessId, ownerId: userId },
		select: { id: true },
	});
	if (!business) {
		throw ApiException.notFound("Business not found");
	}
};

const leadSubjectFromMessage = (message: string): string => {
	const firstLine = message.split("\n")[0] ?? "";
	const subject = firstLine.replace(/^Subject:\s*/i, "").trim();
	return subject || "CRM conversation";
};

const persistGmailLeadIfNew = async (input: {
	businessId: string;
	threadId: string;
	senderName: string;
	senderEmail: string;
	subject: string;
	body: string;
	historyId: string;
}): Promise<string | null> => {
	const duplicate = await prisma.lead.findFirst({
		where: {
			businessId: input.businessId,
			platform: "gmail",
			platformUserId: input.threadId,
			customerEmail: input.senderEmail,
			message: `Subject: ${input.subject}\n\n${input.body}`,
		},
		select: { id: true },
	});

	if (duplicate) {
		return null;
	}

	const lead = await prisma.lead.create({
		data: {
			businessId: input.businessId,
			customerName: input.senderName,
			customerEmail: input.senderEmail,
			message: `Subject: ${input.subject}\n\n${input.body}`,
			platform: "gmail",
			platformUserId: input.threadId,
			aiReasoning: `gmail_history:${input.historyId}`,
		},
		select: { id: true },
	});

	await createLeadCreatedNotification(lead.id);
	return lead.id;
};

const getBusinessGmailIntegrations = async () =>
	prisma.integration.findMany({
		where: { gmailRefreshToken: { not: null } },
		select: {
			businessId: true,
			gmailRefreshToken: true,
		},
	});

const pollBusinessGmail = async (businessId: string, refreshToken: string): Promise<void> => {
	const gmail = createGmailClient(refreshToken);

	const cursor = await prisma.syncCursor.findUnique({
		where: {
			businessId_provider: {
				businessId,
				provider: "gmail",
			},
		},
		select: { cursor: true },
	});

	let messageIds: string[] = [];
	try {
		messageIds = cursor?.cursor
			? await listMessageIdsSince(gmail, cursor.cursor)
			: await listRecentMessageIds(gmail, gmailConfig.initialSyncWindowHours);
	} catch (error) {
		if (!isHistoryTooOldError(error)) {
			throw error;
		}
		messageIds = await listRecentMessageIds(gmail, gmailConfig.initialSyncWindowHours);
	}

	for (const messageId of messageIds) {
		await waitForRateLimit();
		const incoming = await getIncomingMessage(gmail, messageId);
		if (!incoming) {
			continue;
		}

		await persistGmailLeadIfNew({
			businessId,
			threadId: incoming.threadId,
			senderName: incoming.sender.name,
			senderEmail: incoming.sender.email,
			subject: incoming.subject,
			body: incoming.body,
			historyId: incoming.historyId,
		});
	}

	const latestHistoryId = await getProfileHistoryId(gmail);
	await prisma.syncCursor.upsert({
		where: {
			businessId_provider: {
				businessId,
				provider: "gmail",
			},
		},
		create: {
			businessId,
			provider: "gmail",
			cursor: latestHistoryId,
			lastSyncAt: new Date(),
		},
		update: {
			cursor: latestHistoryId,
			lastSyncAt: new Date(),
		},
	});
};

export const pollGmailLeadsOnce = async (): Promise<void> => {
	const integrations = await getBusinessGmailIntegrations();
	for (const item of integrations) {
		if (!item.gmailRefreshToken) {
			continue;
		}
		try {
			await pollBusinessGmail(item.businessId, item.gmailRefreshToken);
		} catch (error) {
			console.error("[gmail-poll] business sync failed", item.businessId, error);
		}
	}
};

let gmailPoller: NodeJS.Timeout | null = null;
let polling = false;

export const startGmailLeadPolling = (): void => {
	if (gmailPoller) {
		return;
	}

	const run = async (): Promise<void> => {
		if (polling) {
			return;
		}
		polling = true;
		try {
			await pollGmailLeadsOnce();
		} finally {
			polling = false;
		}
	};

	void run();
	gmailPoller = setInterval(() => {
		void run();
	}, gmailConfig.pollIntervalMs);
};

export const sendGmailReplyService = async (
	userId: string,
	input: GmailReplyInput
): Promise<void> => {
	const lead = await prisma.lead.findFirst({
		where: {
			id: input.leadId,
			platform: "gmail",
			business: { ownerId: userId },
		},
		select: {
			id: true,
			message: true,
			customerEmail: true,
			platformUserId: true,
			firstReplyAt: true,
			business: {
				select: {
					integrations: {
						select: {
							gmailRefreshToken: true,
						},
					},
				},
			},
		},
	});

	if (!lead) {
		throw ApiException.notFound("Lead not found");
	}

	if (!lead.customerEmail || !lead.platformUserId) {
		throw ApiException.badRequest("Lead has incomplete Gmail metadata");
	}

	const refreshToken = lead.business.integrations?.gmailRefreshToken;
	if (!refreshToken) {
		throw ApiException.badRequest("Gmail is not connected for this business");
	}

	const gmail = createGmailClient(refreshToken);
	await sendThreadReply({
		gmail,
		to: lead.customerEmail,
		threadId: lead.platformUserId,
		subject: leadSubjectFromMessage(lead.message),
		body: input.message,
	});

	await prisma.lead.update({
		where: { id: lead.id },
		data: {
			status: "contacted",
			...(lead.firstReplyAt ? {} : { firstReplyAt: new Date() }),
		},
	});
};

export const disconnectGmailService = async (
	userId: string,
	input: GmailDisconnectInput
): Promise<void> => {
	await ensureOwnedBusiness(input.businessId, userId);

	await prisma.integration.upsert({
		where: { businessId: input.businessId },
		create: {
			businessId: input.businessId,
			gmailRefreshToken: null,
			gmailEmail: null,
		},
		update: {
			gmailRefreshToken: null,
			gmailEmail: null,
		},
	});
};

export const getGmailConnectionStatusService = async (
	userId: string,
	businessId: string
): Promise<GmailConnectionStatusView> => {
	await ensureOwnedBusiness(businessId, userId);

	const integration = await prisma.integration.findUnique({
		where: { businessId },
		select: { gmailRefreshToken: true, gmailEmail: true },
	});

	return {
		businessId,
		connected: Boolean(integration?.gmailRefreshToken),
		email: integration?.gmailEmail ?? null,
	};
};
