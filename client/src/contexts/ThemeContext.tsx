import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

export interface ThemeCustomization {
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
  buttonStyle: "solid" | "outline" | "gradient" | "glassmorphism";
  fontFamily: "inter" | "space-grotesk" | "syne" | "poppins" | "roboto";
  appName: string;
  logoUrl?: string;
  presetTheme: "custom" | "neon" | "sunset" | "ocean" | "forest" | "cyberpunk";
}

export const PRESET_THEMES: Record<string, Partial<ThemeCustomization>> = {
  neon: {
    primaryColor: "cyan",
    accentColor: "magenta",
    secondaryColor: "lime",
    presetTheme: "neon",
  },
  sunset: {
    primaryColor: "orange",
    accentColor: "pink",
    secondaryColor: "red",
    presetTheme: "sunset",
  },
  ocean: {
    primaryColor: "blue",
    accentColor: "cyan",
    secondaryColor: "teal",
    presetTheme: "ocean",
  },
  forest: {
    primaryColor: "green",
    accentColor: "lime",
    secondaryColor: "teal",
    presetTheme: "forest",
  },
  cyberpunk: {
    primaryColor: "violet",
    accentColor: "cyan",
    secondaryColor: "magenta",
    presetTheme: "cyberpunk",
  },
};

export const COLOR_MAP: Record<string, string> = {
  violet: "oklch(0.67 0.24 290)",
  cyan: "oklch(0.72 0.18 200)",
  pink: "oklch(0.72 0.22 340)",
  magenta: "oklch(0.68 0.26 320)",
  lime: "oklch(0.72 0.2 145)",
  orange: "oklch(0.75 0.2 55)",
  red: "oklch(0.62 0.24 25)",
  blue: "oklch(0.65 0.2 240)",
  teal: "oklch(0.68 0.15 180)",
  green: "oklch(0.72 0.2 145)",
  gold: "oklch(0.80 0.2 85)",
};

export const FONT_MAP: Record<string, string> = {
  inter: "'Inter', system-ui, sans-serif",
  "space-grotesk": "'Space Grotesk', system-ui, sans-serif",
  syne: "'Syne', system-ui, sans-serif",
  poppins: "'Poppins', system-ui, sans-serif",
  roboto: "'Roboto', system-ui, sans-serif",
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
  customization: ThemeCustomization;
  setCustomization: (updates: Partial<ThemeCustomization>) => void;
  applyCustomization: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [customization, setCustomizationState] = useState<ThemeCustomization>(() => {
    const saved = localStorage.getItem("vyro-customization");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load customization:", e);
      }
    }
    return {
      primaryColor: "violet",
      accentColor: "cyan",
      secondaryColor: "pink",
      buttonStyle: "solid",
      fontFamily: "inter",
      appName: "VYRO",
      presetTheme: "custom",
    };
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  const applyCustomizationToDOM = (custom: ThemeCustomization) => {
    const root = document.documentElement;
    const body = document.body;

    // Set data-accent attribute to apply all color CSS variables at once
    root.setAttribute("data-accent", custom.primaryColor);

    // Apply font family to body
    body.style.fontFamily = FONT_MAP[custom.fontFamily] || FONT_MAP.inter;

    // Store button style for component usage
    root.style.setProperty("--button-style", custom.buttonStyle);
  };

  useEffect(() => {
    applyCustomizationToDOM(customization);
  }, [customization]);

  const setCustomization = (updates: Partial<ThemeCustomization>) => {
    const newCustomization = { ...customization, ...updates };
    setCustomizationState(newCustomization);
    localStorage.setItem("vyro-customization", JSON.stringify(newCustomization));
  };

  const applyCustomization = () => {
    applyCustomizationToDOM(customization);
  };

  const toggleTheme = switchable
    ? () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable, customization, setCustomization, applyCustomization }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
