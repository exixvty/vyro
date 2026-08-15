import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import {
  WEB_MANIFEST_CONTENT_TYPE,
  WEB_MANIFEST_PATH,
  createWebManifestHandler,
  getWebManifestFilePath,
} from "./config/webManifest";

describe("web manifest endpoint", () => {
  it("uses Bubblewrap's conventional manifest path and manifest JSON content type", () => {
    expect(WEB_MANIFEST_PATH).toBe("/manifest.webmanifest");
    expect(WEB_MANIFEST_CONTENT_TYPE).toBe("application/manifest+json");
  });

  it("returns the existing VYRO manifest verbatim", async () => {
    const sourceManifestPath = getWebManifestFilePath(true);
    const sourceManifest = readFileSync(sourceManifestPath, "utf8");
    const response = {
      status: vi.fn(),
      type: vi.fn(),
      send: vi.fn(),
    };
    response.status.mockReturnValue(response);
    response.type.mockReturnValue(response);

    await createWebManifestHandler(sourceManifestPath)(
      {} as Request,
      response as unknown as Response,
      vi.fn()
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.type).toHaveBeenCalledWith(WEB_MANIFEST_CONTENT_TYPE);
    expect(response.send).toHaveBeenCalledWith(sourceManifest);
    expect(JSON.parse(sourceManifest)).toMatchObject({ name: "VYRO — All-in-One Fitness App" });
  });

  it("resolves a production manifest artifact with the original filename", () => {
    expect(getWebManifestFilePath(false)).toMatch(/manifest\.json$/);
  });
});
