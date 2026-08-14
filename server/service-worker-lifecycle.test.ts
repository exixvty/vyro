import { describe, expect, it, vi } from "vitest";
import {
  shouldRegisterServiceWorker,
  unregisterDevelopmentServiceWorkers,
} from "../client/src/lib/serviceWorkerLifecycle";

describe("development service-worker lifecycle", () => {
  it("registers the PWA service worker only outside development", () => {
    expect(shouldRegisterServiceWorker(true, true)).toBe(false);
    expect(shouldRegisterServiceWorker(false, true)).toBe(true);
    expect(shouldRegisterServiceWorker(false, false)).toBe(false);
  });

  it("unregisters all stale service workers for a clean development dependency graph", async () => {
    const firstUnregister = vi.fn().mockResolvedValue(true);
    const secondUnregister = vi.fn().mockResolvedValue(true);

    await unregisterDevelopmentServiceWorkers({
      getRegistrations: vi.fn().mockResolvedValue([
        { unregister: firstUnregister },
        { unregister: secondUnregister },
      ]),
    });

    expect(firstUnregister).toHaveBeenCalledOnce();
    expect(secondUnregister).toHaveBeenCalledOnce();
  });
});
