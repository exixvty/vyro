import { useState, useCallback } from "react";

export interface LevelUpData {
  newLevel: number;
  oldLevel: number;
  newTier?: string;
  oldTier?: string;
  tierChanged?: boolean;
  xpEarned?: number;
}

// Global event emitter for level-up events
type LevelUpListener = (data: LevelUpData) => void;
const listeners = new Set<LevelUpListener>();

export function emitLevelUp(data: LevelUpData) {
  listeners.forEach((fn) => fn(data));
}

export function useLevelUp() {
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);

  const subscribe = useCallback(() => {
    const handler: LevelUpListener = (data) => setLevelUpData(data);
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  const dismiss = useCallback(() => setLevelUpData(null), []);

  return { levelUpData, subscribe, dismiss };
}

// Helper to check XP result from mutations and emit level-up if needed
export function checkAndEmitLevelUp(result: {
  leveledUp?: boolean;
  newLevel?: number;
  oldLevel?: number;
  tierChanged?: boolean;
  newTier?: string;
  oldTier?: string;
  xpEarned?: number;
}) {
  if (result.leveledUp && result.newLevel && result.oldLevel) {
    emitLevelUp({
      newLevel: result.newLevel,
      oldLevel: result.oldLevel,
      newTier: result.newTier,
      oldTier: result.oldTier,
      tierChanged: result.tierChanged,
      xpEarned: result.xpEarned,
    });
  }
}
