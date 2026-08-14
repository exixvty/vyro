# Phase 48 — Read-only Audit of Published Manus Elements

## Initial source and rendered-page findings

An exact-text search across VYRO's application source (`client`, `server`, `shared`, and project configuration) found no occurrences of **Made with Manus**, **Made by Manus**, or **Make signing up easy**.

On the published root page, the browser's rendered element listing showed two top-level elements: the VYRO `#root` container and a separate `div` labelled **Made with Manus**. A direct standard-DOM text search returned no matching element, which is consistent with a platform-rendered overlay that is outside the application source and may be isolated from the normal document tree. No project files or configuration were changed as part of this audit.

## Hosted authentication evidence

VYRO's `client/src/const.ts` builds the application sign-in URL from the configured `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`, and the VYRO OAuth callback. Visiting that generated `https://manus.im/app-auth?...` page showed the hosted Manus account-selection interface with **Powered by Manus** branding. The application controls only the invocation of this hosted flow through `getLoginUrl()` and the sign-in anchor in `client/src/pages/Home.tsx`; the hosted screen and its branding are not supplied by a VYRO component.

The current hosted account-selection page did not show the exact phrase **Make signing up easy**. The phrase is therefore attributable to the same Manus-hosted authentication/registration experience, rather than a text literal in VYRO source. It may appear in a hosted sign-up variant instead of the already-signed-in account-selection state viewed here.

## Exact published badge host and configuration

The published page contains a platform-injected custom element named `MANUS-CONTENT-ROOT` with an open shadow root. Its page-level configuration is `window.__manus_space_editor_info = { spaceId: "ABaDZShuwigi7srSSPoYho", hideBadge: false, patchList: [] }`. The page also injects `https://files.manuscdn.com/manus-space-dispatcher/spaceEditor-DPV-_I11.js`.

This is the exact runtime responsible for the **Made with Manus** badge: it is platform-level Manus Space/editor injection into `MANUS-CONTENT-ROOT`, controlled by platform configuration `hideBadge: false`. It is not emitted by any VYRO source file, imported VYRO component, or VYRO authentication code.

## Direct registration-variant check

The generated hosted URL was also opened with `type=signUp`. It still rendered the same `manus.im/app-auth` hosted account-selection interface and **Powered by Manus** copy, rather than any VYRO-rendered sign-up component. The exact phrase **Make signing up easy** was not present in the account-selection state available to this signed-in browser. The evidence nevertheless establishes that any such link/message on that flow belongs to the Manus-hosted authentication surface, not to the VYRO bundle.
