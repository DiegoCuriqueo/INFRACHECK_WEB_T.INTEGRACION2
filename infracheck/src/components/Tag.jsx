import React from 'react';

const Tag = React.memo(({ theme, tone = "slate", className = "", children, ...props }) => {
  const tones = {
    slate: theme === "dark" ? "bg-white/5 text-slate-300 ring-1 ring-white/10" : "bg-gray-100/50 text-gray-700 ring-1 ring-gray-300",
    purple: theme === "dark" ? "bg-[#8A2BE2]/20 text-[#C6A0FF] ring-1 ring-[#8A2BE2]/30" : "bg-purple-100/50 text-purple-700 ring-1 ring-purple-300",
    indigo: theme === "dark" ? "bg-indigo-600/20 text-indigo-200 ring-1 ring-indigo-500/30" : "bg-indigo-100/50 text-indigo-700 ring-1 ring-indigo-300",
    cyan: theme === "dark" ? "bg-cyan-600/20 text-cyan-200 ring-1 ring-cyan-500/30" : "bg-cyan-100/50 text-cyan-700 ring-1 ring-cyan-300",
    rose: theme === "dark" ? "bg-rose-600/20 text-rose-200 ring-1 ring-rose-500/30" : "bg-rose-100/50 text-rose-700 ring-1 ring-rose-300",
    amber: theme === "dark" ? "bg-amber-600/20 text-amber-200 ring-1 ring-amber-500/30" : "bg-amber-100/50 text-amber-700 ring-1 ring-amber-300",
    emerald: theme === "dark" ? "bg-emerald-600/20 text-emerald-200 ring-1 ring-emerald-500/30" : "bg-emerald-100/50 text-emerald-700 ring-1 ring-emerald-300"
  };
  const interactive = typeof props.onClick === 'function';
  return (
    <span
      {...props}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${tones[tone] || tones.slate} ${interactive ? 'cursor-pointer select-none transition hover:scale-[1.02] active:scale-[.98]' : ''} ${className}`}
      role={interactive ? 'button' : undefined}
    >
      {children}
    </span>
  );
});

export default Tag;