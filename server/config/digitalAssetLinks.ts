import type { RequestHandler } from "express";

export const DIGITAL_ASSET_LINKS_PATH = "/.well-known/assetlinks.json";

export type DigitalAssetLinkStatement = {
  relation: readonly string[];
  target: {
    namespace: "android_app";
    package_name: string;
    sha256_cert_fingerprints: readonly string[];
  };
};

/**
 * VYRO-controlled Digital Asset Links data.
 *
 * Add the final Android package name and Play App Signing SHA-256 certificate
 * fingerprint here when the Android application is created. Keeping this as a
 * dedicated source prevents authentication, frontend, and PWA configuration
 * from being coupled to Android verification metadata.
 */
export const DIGITAL_ASSET_LINK_STATEMENTS: readonly DigitalAssetLinkStatement[] = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.vyrofit.app",
      sha256_cert_fingerprints: [
        "02:4A:ED:99:E4:42:0B:1C:8B:86:35:19:A2:97:84:BA:63:F5:63:B0:79:7E:38:C3:8D:04:59:9E:75:A6:93:5A",
      ],
    },
  },
];

export const digitalAssetLinksHandler: RequestHandler = (_req, res) => {
  res
    .status(200)
    .type("application/json")
    .send(JSON.stringify(DIGITAL_ASSET_LINK_STATEMENTS));
};
