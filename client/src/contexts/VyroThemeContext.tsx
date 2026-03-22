import React, { createContext, useContext, useEffect, useState } from "react";

type AccentColor = "violet" | "blue" | "green" | "orange" | "red" | "gold";

interface VyroThemeContextValue {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const VyroThemeContext = createContext<VyroThemeContextValue>({
  accentColor: "violet",
  setAccentColor: () => {},
});

export function VyroThemeProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    return (localStorage.getItem("vyro-accent") as AccentColor) || "violet";
  });

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    localStorage.setItem("vyro-accent", color);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (accentColor === "violet") {
      root.removeAttribute("data-accent");
    } else {
      root.setAttribute("data-accent", accentColor);
    }
  }, [accentColor]);

  return (
    <VyroThemeContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
    </VyroThemeContext.Provider>
  );
}

export function useVyroTheme() {
  return useContext(VyroThemeContext);
}
