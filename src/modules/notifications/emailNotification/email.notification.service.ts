import {
	sendHighPriorityEmail,
	sendNewLeadEmail,
	sendStaleLeadEmail,
} from "../../../utils/email.util";
import { LeadNotificationContext } from "../appNotification/app.notification.service";

const sendEmailSafe = async (work: () => Promise<void>): Promise<void> => {
	try {
		await work();
	} catch {
		// Email failures should not block core workflow.
	}
};

export const sendLeadCreatedNotificationEmail = async (
	ctx: LeadNotificationContext
): Promise<void> => {
	await sendEmailSafe(() =>
		sendNewLeadEmail({
			to: ctx.ownerEmail,
			businessName: ctx.businessName,
			leadName: ctx.leadName,
			leadId: ctx.leadId,
			platform: ctx.platform,
			messagePreview: ctx.messagePreview,
		})
	);
};

export const sendHighPriorityNotificationEmail = async (
	ctx: LeadNotificationContext
): Promise<void> => {
	await sendEmailSafe(() =>
		sendHighPriorityEmail({
			to: ctx.ownerEmail,
			businessName: ctx.businessName,
			leadName: ctx.leadName,
			leadId: ctx.leadId,
			platform: ctx.platform,
			messagePreview: ctx.messagePreview,
		})
	);
};

export const sendStaleHighPriorityNotificationEmail = async (input: {
	to: string;
	businessName: string;
	leadName: string;
	leadId: string;
	platform: string;
	messagePreview: string;
}): Promise<void> => {
	await sendEmailSafe(() =>
		sendStaleLeadEmail({
			to: input.to,
			businessName: input.businessName,
			leadName: input.leadName,
			leadId: input.leadId,
			platform: input.platform,
			messagePreview: input.messagePreview,
		})
	);
};
