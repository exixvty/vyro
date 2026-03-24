import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { Zap } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface XPToast {
  id: number;
  amount: number;
  label?: string;
  x: number; // % from left
  y: number; // px from top
}

interface XPToastContextValue {
  showXP: (amount: number, label?: string, anchorEl?: HTMLElement | null) => void;
}

/* ─── Context ────────────────────────────────────────────────────────────── */
const XPToastContext = createContext<XPToastContextValue>({ showXP: () => {} });

export function useXPToast() {
  return useContext(XPToastContext);
}

/* ─── Global emitter (for use outside React tree) ────────────────────────── */
type XPEmitFn = (amount: number, label?: string, anchorEl?: HTMLElement | null) => void;
let globalEmit: XPEmitFn = () => {};

export function emitXPGain(amount: number, label?: string, anchorEl?: HTMLElement | null) {
  globalEmit(amount, label, anchorEl);
}

/* ─── Provider ───────────────────────────────────────────────────────────── */
export function XPToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<XPToast[]>([]);
  const idRef = useRef(0);

  const showXP = useCallback((amount: number, label?: string, anchorEl?: HTMLElement | null) => {
    // Calculate position based on anchor element or random screen position
    let x = 40 + Math.random() * 20; // default center-ish
    let y = 200;

    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
      y = rect.top + window.scrollY - 20;
    }

    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, amount, label, x, y }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1400);
  }, []);

  // Register global emitter
  useEffect(() => {
    globalEmit = showXP;
    return () => { globalEmit = () => {}; };
  }, [showXP]);

  return (
    <XPToastContext.Provider value={{ showXP }}>
      {children}
      {/* Floating XP toasts */}
      <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
        {toasts.map((toast) => (
          <FloatingXP key={toast.id} toast={toast} />
        ))}
      </div>
    </XPToastContext.Provider>
  );
}

/* ─── Floating XP particle ───────────────────────────────────────────────── */
function FloatingXP({ toast }: { toast: XPToast }) {
  return (
    <div
      className="absolute flex flex-col items-center gap-0.5"
      style={{
        left: `${toast.x}%`,
        top: toast.y,
        transform: "translateX(-50%)",
        animation: "xp-float-up 1.4s cubic-bezier(0.22, 1, 0.36, 1) both",
      }}
    >
      {/* Main XP badge */}
      <div
        className="flex items-center gap-1 px-3 py-1.5 rounded-full font-display font-extrabold text-sm"
        style={{
          background: "linear-gradient(135deg, oklch(0.80 0.2 85), oklch(0.75 0.22 55))",
          boxShadow: "0 4px 20px oklch(0.80 0.2 85 / 0.5), 0 2px 8px oklch(0 0 0 / 0.3)",
          color: "oklch(0.10 0.01 85)",
          whiteSpace: "nowrap",
        }}
      >
        <Zap size={12} fill="currentColor" />
        +{toast.amount} XP
      </div>
      {/* Optional label */}
      {toast.label && (
        <span
          className="text-xs font-semibold"
          style={{
            color: "oklch(0.80 0.2 85)",
            textShadow: "0 0 12px oklch(0.80 0.2 85 / 0.8)",
            animation: "xp-float-up 1.4s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
        >
          {toast.label}
        </span>
      )}
    </div>
  );
}
