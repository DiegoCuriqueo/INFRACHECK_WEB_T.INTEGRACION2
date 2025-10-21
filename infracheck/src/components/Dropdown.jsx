import React, { useEffect, useRef } from "react";

const cls = (...c) => c.filter(Boolean).join(" ");

const ChevronDown = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Dropdown({ label, open, onToggle, onClose, children, className = "", flash }) {
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (!open) return;
      const btn = btnRef.current;
      const panel = panelRef.current;
      if (!panel || !btn) return;
      if (!panel.contains(e.target) && !btn.contains(e.target)) {
        onClose && onClose();
      }
    };
    const handleKey = (e) => {
      if (open && e.key === "Escape") onClose && onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  const toneText = (tone) => {
    return (
      tone === "danger" ? "text-red-300" :
      tone === "warn" ? "text-amber-300" :
      tone === "success" ? "text-emerald-300" :
      tone === "info" ? "text-sky-300" :
      tone === "gray" ? "text-slate-300" :
      tone === "violet" ? "text-fuchsia-300" :
      "text-slate-200"
    );
  };

  const labelText = flash?.active ? flash.text : label;
  const labelToneClass = flash?.active ? toneText(flash.tone) : "text-slate-200";

  const toneValues = (tone) => {
    switch (tone) {
      case "danger": return { rgb: "239, 68, 68" }; // red-500
      case "warn": return { rgb: "245, 158, 11" }; // amber-500
      case "success": return { rgb: "16, 185, 129" }; // emerald-500
      case "info": return { rgb: "14, 165, 233" }; // sky-500
      case "violet": return { rgb: "217, 70, 239" }; // fuchsia-500
      case "gray": return { rgb: "148, 163, 184" }; // slate-400
      default: return { rgb: "148, 163, 184" }; // neutral slate
    }
  };

  const flashTone = toneValues(flash?.tone);
  const btnFlashStyle = flash?.active
    ? {
        boxShadow: `0 0 0 1px rgba(${flashTone.rgb}, 0.35), 0 12px 30px -12px rgba(${flashTone.rgb}, 0.30)`,
        backgroundImage: `linear-gradient(to bottom, rgba(${flashTone.rgb}, 0.12), rgba(${flashTone.rgb}, 0.06))`,
        transitionProperty: "box-shadow, background-image",
        transitionDuration: "220ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }
    : {};

  return (
    <div className={cls("relative inline-block", className)}>
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={cls(
          "group inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm",
          "ring-1 ring-white/10 shadow-sm shadow-black/30 backdrop-blur-sm",
          open
            ? "bg-gradient-to-b from-slate-800/70 to-slate-900/80 text-slate-100 ring-slate-600"
            : "bg-slate-800/40 text-slate-200 hover:bg-slate-800/60 hover:ring-white/15"
        )}
        style={btnFlashStyle}
      >
        <span
          className={cls(
            "inline-block",
            labelToneClass
          )}
          style={{
            transitionProperty: "transform, opacity, color",
            transitionDuration: "220ms",
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            opacity: flash?.active ? 1 : 0.95,
            transform: flash?.active ? "translateY(0px)" : "translateY(1px)",
          }}
        >
          {labelText}
        </span>
        <ChevronDown
          className={cls("h-4 w-4 transform-gpu transition-transform", open ? "rotate-180" : "")}
          style={{
            color: flash?.active ? `rgba(${flashTone.rgb}, 0.85)` : undefined,
            transitionDuration: "220ms",
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </button>
      <div
        ref={panelRef}
        role="menu"
        aria-hidden={!open}
        className={cls(
          "absolute left-0 z-20 mt-1 w-max min-w-[240px] sm:w-auto origin-top rounded-2xl",
          "backdrop-blur-md ring-1 ring-white/10 shadow-2xl shadow-black/40 border border-white/5",
          open
            ? "opacity-100 translate-y-0 bg-slate-900/80"
            : "pointer-events-none opacity-0 -translate-y-2 bg-slate-900/80"
        )}
        style={{
          transitionProperty: "transform, opacity",
          transitionDuration: "220ms",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform, opacity",
        }}
      >
        <div
          className="p-3"
          style={{
            transitionProperty: "opacity, transform",
            transitionDuration: "220ms",
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            opacity: open ? 1 : 0.92,
            transform: open ? "translateY(0px)" : "translateY(2px)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}