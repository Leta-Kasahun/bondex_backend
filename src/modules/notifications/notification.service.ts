import {
	createAppNotification,
	getLeadNotificationContext,
	hasStaleNotification,
	listStaleHighPriorityLeads,
} from "./appNotification/app.notification.service";
import {
	sendHighPriorityNotificationEmail,
	sendLeadCreatedNotificationEmail,
	sendStaleHighPriorityNotificationEmail,
} from "./emailNotification/email.notification.service";

export const createLeadCreatedNotification = async (leadId: string): Promise<void> => {
	const ctx = await getLeadNotificationContext(leadId);
	if (!ctx) {
		return;
	}

	await createAppNotification({
		businessId: ctx.businessId,
		leadId: ctx.leadId,
		type: "lead_created",
		title: "New Lead",
		body: `New lead from ${ctx.leadName} on ${ctx.platform}`,
	});

	await sendLeadCreatedNotificationEmail(ctx);
};

export const createHighPriorityNotification = async (leadId: string): Promise<void> => {
	const ctx = await getLeadNotificationContext(leadId);
	if (!ctx) {
		return;
	}

	await createAppNotification({
		businessId: ctx.businessId,
		leadId: ctx.leadId,
		type: "high_priority_lead",
		title: "High Priority Lead",
		body: `${ctx.leadName} is marked as high priority`,
	});

	await sendHighPriorityNotificationEmail(ctx);
};

export const processStaleHighPriorityNotifications = async (): Promise<number> => {
	const leads = await listStaleHighPriorityLeads();
	let createdCount = 0;

	for (const lead of leads) {
		const alreadyNotified = await hasStaleNotification(lead.id);
		if (alreadyNotified) {
			continue;
		}

		await createAppNotification({
			businessId: lead.businessId,
			leadId: lead.id,
			type: "stale_high_priority",
			title: "Stale High Priority Lead",
			body: `${lead.leadName} has not been replied to for over 1 hour`,
		});

		await sendStaleHighPriorityNotificationEmail({
			to: lead.ownerEmail,
			businessName: lead.businessName,
			leadName: lead.leadName,
			leadId: lead.id,
			platform: lead.platform,
			messagePreview: lead.messagePreview,
		});

		createdCount += 1;
	}

	return createdCount;
};

let staleLeadTimer: NodeJS.Timeout | null = null;

export const startStaleHighPriorityLeadMonitor = (): void => {
	if (staleLeadTimer) {
		return;
	}

	void processStaleHighPriorityNotifications();

	staleLeadTimer = setInterval(() => {
		void processStaleHighPriorityNotifications();
	}, 5 * 60 * 1000);
};
