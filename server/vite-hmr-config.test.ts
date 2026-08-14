import { afterEach, describe, expect, it, vi } from "vitest";
import type { Server } from "http";
import { createViteServerOptions } from "./_core/vite";

describe("Vite HMR configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the managed preview HTTPS port for the browser HMR WebSocket", () => {
    vi.stubEnv("MANUS_WEBDEV_PROJECT_ID", "vyro-preview");

    const options = createViteServerOptions({} as Server);

    expect(options.hmr.clientPort).toBe(443);
  });

  it("keeps local development on the server's native HMR port", () => {
    vi.stubEnv("MANUS_WEBDEV_PROJECT_ID", "");

    const options = createViteServerOptions({} as Server);

    expect(options.hmr.clientPort).toBeUndefined();
  });
});
