export type RecoveryNotificationAction = { action: string; title: string };

export function buildCravingAlertNotification(addictionId: number) {
  return {
    title: "You've Got This! 💪",
    body: "A craving hit you, but you're stronger. Log it, breathe, and move forward.",
    tag: "craving-alert",
    data: {
      url: "/recovery",
      type: "craving_alert",
      logUrgeUrl: `/recovery?addUrge=${addictionId}`,
      supportUrl: "/recovery?tab=tips",
    },
    actions: [
      { action: "log_urge", title: "Log urge" },
      { action: "support", title: "Get support" },
    ] satisfies RecoveryNotificationAction[],
  };
}

export function buildSobrietyReminderNotification(avgDays: number, addictionList: string, addictionCount: number) {
  return {
    title: `You're ${avgDays} Days Sober 🔥`,
    body: `${avgDays} days free from ${addictionList}. Keep going!`,
    tag: "sobriety-reminder",
    data: {
      url: "/recovery",
      type: "sobriety_reminder",
      avgDays,
      addictionCount,
    },
  };
}
