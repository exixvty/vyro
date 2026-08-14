import { describe, expect, it } from "vitest";
import viteConfig from "../vite.config";

type ViteRuntimeConfig = {
  optimizeDeps?: { include?: string[] };
  resolve?: { dedupe?: string[] };
};

describe("Vite React runtime configuration", () => {
  const config = viteConfig as ViteRuntimeConfig;

  it("forces React and React DOM to resolve from one root runtime", () => {
    expect(config.resolve?.dedupe).toEqual(
      expect.arrayContaining(["react", "react-dom"])
    );
  });

  it("prebundles React, React DOM, and tRPC together for the development preview", () => {
    expect(config.optimizeDeps?.include).toEqual(
      expect.arrayContaining(["react", "react-dom", "@trpc/react-query"])
    );
  });
});
