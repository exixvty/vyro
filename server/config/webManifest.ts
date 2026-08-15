import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { RequestHandler } from "express";

export const WEB_MANIFEST_PATH = "/manifest.webmanifest";
export const WEB_MANIFEST_CONTENT_TYPE = "application/manifest+json";

export function getWebManifestFilePath(isDevelopment = process.env.NODE_ENV === "development") {
  if (isDevelopment) {
    return path.resolve(import.meta.dirname, "../../client/public/manifest.json");
  }

  // In a bundled deployment `import.meta.dirname` is the dist directory;
  // source-mode production verification uses the existing build output.
  const bundledManifest = path.resolve(import.meta.dirname, "public/manifest.json");
  return existsSync(bundledManifest)
    ? bundledManifest
    : path.resolve(import.meta.dirname, "../../dist/public/manifest.json");
}

export function createWebManifestHandler(
  manifestFilePath = getWebManifestFilePath()
): RequestHandler {
  return async (_req, res, next) => {
    try {
      // Send the existing manifest file verbatim; it remains VYRO's only
      // manifest source of truth in development and the production build.
      const manifest = await readFile(manifestFilePath, "utf8");
      res.status(200).type(WEB_MANIFEST_CONTENT_TYPE).send(manifest);
    } catch (error) {
      next(error);
    }
  };
}

export const webManifestHandler = createWebManifestHandler();
