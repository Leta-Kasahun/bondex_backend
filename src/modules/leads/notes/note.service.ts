import prisma from "../../../config/prisma";
import { AUTH_MESSAGES } from "../../../constants/messages.constant";
import { ApiException } from "../../../exceptions/api.exception";
import { LeadNoteInput, LeadNoteView } from "../lead.types";

const toLeadNoteView = (note: {
	id: string;
	leadId: string;
	authorId: string;
	content: string;
	createdAt: Date;
}): LeadNoteView => ({
	id: note.id,
	leadId: note.leadId,
	authorId: note.authorId,
	content: note.content,
	createdAt: note.createdAt,
});

const ensureOwnedLead = async (leadId: string, userId: string): Promise<void> => {
	const lead = await prisma.lead.findFirst({
		where: {
			id: leadId,
			business: {
				ownerId: userId,
			},
		},
		select: { id: true },
	});

	if (!lead) {
		throw ApiException.notFound(AUTH_MESSAGES.LEAD_NOT_FOUND);
	}
};

export const createLeadNoteService = async (
	userId: string,
	leadId: string,
	input: LeadNoteInput
): Promise<LeadNoteView> => {
	await ensureOwnedLead(leadId, userId);

	const note = await prisma.note.create({
		data: {
			leadId,
			authorId: userId,
			content: input.content,
		},
		select: {
			id: true,
			leadId: true,
			authorId: true,
			content: true,
			createdAt: true,
		},
	});

	return toLeadNoteView(note);
};

export const updateLeadNoteService = async (
	userId: string,
	leadId: string,
	noteId: string,
	input: LeadNoteInput
): Promise<LeadNoteView> => {
	await ensureOwnedLead(leadId, userId);

	const existingNote = await prisma.note.findFirst({
		where: {
			id: noteId,
			leadId,
			authorId: userId,
		},
		select: { id: true },
	});

	if (!existingNote) {
		throw ApiException.notFound(AUTH_MESSAGES.LEAD_NOTE_NOT_FOUND);
	}

	const note = await prisma.note.update({
		where: { id: noteId },
		data: {
			content: input.content,
		},
		select: {
			id: true,
			leadId: true,
			authorId: true,
			content: true,
			createdAt: true,
		},
	});

	return toLeadNoteView(note);
};

export const listLeadNotesService = async (
	userId: string,
	leadId: string
): Promise<LeadNoteView[]> => {
	await ensureOwnedLead(leadId, userId);

	const notes = await prisma.note.findMany({
		where: {
			leadId,
			authorId: userId,
		},
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			leadId: true,
			authorId: true,
			content: true,
			createdAt: true,
		},
	});

	return notes.map(toLeadNoteView);
};
