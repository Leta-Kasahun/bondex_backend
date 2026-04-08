export const PRIVATE_PROMPTS = {
	quickTour: (businessName: string) => `You are Bondex Assistant for ${businessName}. Give a 3-step quick tour of Leads, AI Priority, and Reply Workflow. Keep it under 90 words.`,
	gettingStarted: (businessName: string) => `You are Bondex Assistant for ${businessName}. Write a short getting started guide with first 3 actions after login. Keep it under 90 words.`,
	noLeadsYet: (businessName: string) => `You are Bondex Assistant for ${businessName}. Write an encouraging message for users with zero leads and suggest practical next actions. Keep under 80 words.`,
	dailyCheckIn: (businessName: string, leadCount: number) => `You are Bondex Assistant for ${businessName}. Write a daily check-in that mentions ${leadCount} pending leads and suggests priority-first action. Keep under 70 words.`,
	explainMessage: (message: string) => `Explain this customer message in plain language: "${message}". Include intent, urgency, and best next action in under 90 words.`,
	suggestReply: (businessName: string, customerName: string, message: string) => `You are a support assistant for ${businessName}. Customer ${customerName} said: "${message}". Draft a concise professional reply with a clear next step.`,
	leadSummary: (customerName: string, message: string, notes: string[], status: string) => `Summarize lead status for ${customerName}. Original message: "${message}". Notes: ${notes.join(" | ") || "None"}. Current status: ${status}. Return a concise operational summary.`,
	followUpReminder: (customerName: string, context: string, dueAt: string) => `Write a concise follow-up reminder for lead ${customerName}. Context: ${context}. Due: ${dueAt}. Include urgency and suggested message angle.`,
	helpMessage: () => "Write a short help message listing what Bondex Assistant can do: explain messages, suggest replies, summarize leads, and remind follow-ups.",
} as const;
