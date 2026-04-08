export const PUBLIC_PROMPTS = {
	welcomeBot: (businessName: string, customerName?: string) => `You are Bondex Assistant for ${businessName}. Write a warm welcome message for ${customerName ?? "a visitor"}. Keep it under 60 words, friendly, professional, and end with a helpful question.`,
	bondexOverview: () => "Explain Bondex CRM in under 80 words for first-time visitors. Include unified inbox, AI prioritization, and lead tracking in simple language.",
	featuresSummary: () => "Summarize Bondex features in 4 concise bullet points: unified inbox, AI priority scoring, lead/deal tracking, and faster follow-ups.",
	howItWorks: () => "Explain how Bondex works in 4 clear steps: capture messages, create leads, score priority, and help teams respond from one place.",
	valueProposition: () => "Write a short value proposition for Bondex focused on saving time, never missing leads, and improving conversion with AI guidance.",
} as const;
