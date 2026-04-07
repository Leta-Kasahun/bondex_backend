export const LEAD_STATUS_VALUES = ["new", "contacted", "converted", "ignored"] as const;
export const LEAD_PRIORITY_VALUES = ["low", "medium", "high"] as const;
export const LEAD_PLATFORM_VALUES = [
	"manual",
	"telegram",
	"gmail",
	"facebook",
	"instagram",
	"website_form",
	"direct_chat",
	"email",
	"website",
] as const;

export const LEAD_CONSTANTS = {
	DEFAULT_PAGE: 1,
	DEFAULT_LIMIT: 10,
	MAX_LIMIT: 50,
} as const;
