import { useCallback } from "react";
import type { LevelUpData } from "@/components/LevelUpModal";

/**
 * A tiny event bus so any component can trigger the global LevelUpModal
 * without prop-drilling through the entire tree.
 *
 * Usage:
 *   const triggerLevelUp = useLevelUp();
 *   triggerLevelUp({ newLevel: 5, oldLevel: 4, ... });
 */

const LEVEL_UP_EVENT = "vyro:levelup";

export function useLevelUp() {
  return useCallback((data: LevelUpData) => {
    window.dispatchEvent(new CustomEvent(LEVEL_UP_EVENT, { detail: data }));
  }, []);
}

export function onLevelUpEvent(handler: (data: LevelUpData) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<LevelUpData>).detail);
  window.addEventListener(LEVEL_UP_EVENT, listener);
  return () => window.removeEventListener(LEVEL_UP_EVENT, listener);
}
