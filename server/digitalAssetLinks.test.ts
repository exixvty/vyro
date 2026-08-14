import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import {
  DIGITAL_ASSET_LINK_STATEMENTS,
  DIGITAL_ASSET_LINKS_PATH,
  digitalAssetLinksHandler,
} from "./config/digitalAssetLinks";

describe("Digital Asset Links endpoint", () => {
  it("uses the exact Android verification path", () => {
    expect(DIGITAL_ASSET_LINKS_PATH).toBe("/.well-known/assetlinks.json");
  });

  it("returns HTTP 200 with JSON content and the VYRO-controlled statement data", () => {
    const response = {
      status: vi.fn(),
      type: vi.fn(),
      send: vi.fn(),
    };

    response.status.mockReturnValue(response);
    response.type.mockReturnValue(response);

    digitalAssetLinksHandler({} as Request, response as unknown as Response, vi.fn());

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.type).toHaveBeenCalledWith("application/json");
    expect(response.send).toHaveBeenCalledWith(
      JSON.stringify(DIGITAL_ASSET_LINK_STATEMENTS)
    );
  });
});
