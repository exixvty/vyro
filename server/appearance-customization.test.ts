import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const appearancePage = readFileSync(resolve(root, "client/src/pages/Appearance.tsx"), "utf8");
const themeContext = readFileSync(resolve(root, "client/src/contexts/ThemeContext.tsx"), "utf8");
const themeRouter = readFileSync(resolve(root, "server/routers/theme.ts"), "utf8");
const buttonComponent = readFileSync(resolve(root, "client/src/components/ui/button.tsx"), "utf8");
const styles = readFileSync(resolve(root, "client/src/index.css"), "utf8");
const workoutPage = readFileSync(resolve(root, "client/src/pages/Workout.tsx"), "utf8");

describe("Premium Appearance customization", () => {
  it("offers the expanded Premium font catalogue in the client and accepts it in the server contract", () => {
    for (const font of ["outfit", "manrope", "dm-sans", "plus-jakarta-sans", "sora"]) {
      expect(themeContext).toContain(`"${font}"`);
      expect(themeRouter).toContain(`"${font}"`);
    }

    expect(appearancePage).toContain("const FONTS = Object.keys(FONT_MAP)");
  });

  it("hydrates saved account preferences and applies selected font and button style immediately", () => {
    expect(appearancePage).toContain("if (!savedTheme) return;");
    expect(appearancePage).toContain("setCustomization(persisted);");
    expect(appearancePage).toContain("handlePremiumAppearanceChange({ fontFamily: font })");
    expect(appearancePage).toContain("handlePremiumAppearanceChange({ buttonStyle: style })");
    expect(themeContext).toContain('root.setAttribute("data-button-style", custom.buttonStyle)');
    expect(themeContext).toContain('root.style.setProperty("--vyro-font-family", fontFamily)');
  });

  it("applies the four saved Premium button styles through the shared Button primitive", () => {
    expect(buttonComponent).toContain('"vyro-button"');
    for (const style of ["solid", "outline", "gradient", "glassmorphism"]) {
      expect(styles).toContain(`[data-button-style="${style}"] .vyro-button`);
    }
  });
});

describe("Workout completion layout", () => {
  it("centers the Finish Workout panel and its completion action", () => {
    expect(workoutPage).toContain('bg-black/60 flex items-center justify-center p-5');
    expect(workoutPage).toContain('w-full max-w-sm rounded-3xl p-6');
    expect(workoutPage).toContain('w-full max-w-xs mx-auto h-14');
  });
});
