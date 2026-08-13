import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildCravingAlertNotification,
  buildSobrietyReminderNotification,
} from "./recoveryNotifications";

describe("recovery notifications", () => {
  it("provides actionable craving-alert buttons with safe in-app destinations", () => {
    const notification = buildCravingAlertNotification(42);

    expect(notification.data).toMatchObject({
      url: "/recovery",
      type: "craving_alert",
      logUrgeUrl: "/recovery?addUrge=42",
      supportUrl: "/recovery?tab=tips",
    });
    expect(notification.actions).toEqual([
      { action: "log_urge", title: "Log urge" },
      { action: "support", title: "Get support" },
    ]);
  });

  it("includes sober-day count and a Recovery deep link in scheduled reminder payloads", () => {
    const notification = buildSobrietyReminderNotification(18, "Alcohol", 1);

    expect(notification.title).toBe("You're 18 Days Sober 🔥");
    expect(notification.body).toContain("18 days free from Alcohol");
    expect(notification.data).toEqual({
      url: "/recovery",
      type: "sobriety_reminder",
      avgDays: 18,
      addictionCount: 1,
    });
  });

  it("renders payload-defined action buttons and routes their clicks in the service worker", () => {
    const serviceWorker = readFileSync(resolve(process.cwd(), "client/public/sw.js"), "utf8");

    expect(serviceWorker).toContain("Array.isArray(data.actions)");
    expect(serviceWorker).toContain("event.action === 'log_urge'");
    expect(serviceWorker).toContain("event.action === 'support'");
  });

  it("shows the latest craving-alert time and handles the log-urge deep link in Recovery", () => {
    const recoveryPage = readFileSync(resolve(process.cwd(), "client/src/pages/Recovery.tsx"), "utf8");

    expect(recoveryPage).toContain("getCravingAlertStatus.useQuery");
    expect(recoveryPage).toContain("Last craving alert");
    expect(recoveryPage).toContain('query.get("addUrge")');
  });
});
