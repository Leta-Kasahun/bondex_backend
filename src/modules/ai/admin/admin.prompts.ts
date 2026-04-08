export const ADMIN_PROMPTS = {
  systemOverview: () =>
    "Provide an admin-level overview of Bondex AI modules, including lead scoring, sentiment analysis, contact extraction, assistant recommendations, and alert flows.",
  aiPerformanceSummary: (responseTime: number, accuracy: number, alerts: number) =>
    `Summarize AI performance with average response time ${responseTime} minutes, scoring accuracy ${accuracy}%, and ${alerts} triggered alerts. Keep it concise and action-oriented.`,
  alertConfigurationGuide: () =>
    "Write a concise guide to configure AI alert thresholds, channels, escalation rules, and notification cadence for administrators.",
  dataMonitoring: () =>
    "Explain how admins can monitor AI data quality, lead throughput, error trends, and model reliability in Bondex.",
  dailySummary: (totalLeads: number, highPriorityLeads: number, alerts: number) =>
    `Generate a daily summary using ${totalLeads} processed leads, ${highPriorityLeads} high-priority leads, and ${alerts} alerts. Include one recommended action for admins.`,
  weeklySummary: (totalLeads: number, avgAccuracy: number, alerts: number) =>
    `Generate a weekly summary using ${totalLeads} processed leads, ${avgAccuracy}% average scoring accuracy, and ${alerts} total alerts. Include operational recommendations.`,
  systemPerformanceOverview: (uptime: number, responseTime: number, criticalAlerts: number) =>
    `Provide a concise system performance overview with uptime ${uptime}%, average response time ${responseTime} minutes, and ${criticalAlerts} critical alerts. Mention any risk signals.`,
} as const;