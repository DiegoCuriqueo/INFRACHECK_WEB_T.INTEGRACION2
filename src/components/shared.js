import React from 'react';

export const Badge = ({ children }) => (
  <span className="px-3 py-1 rounded-lg bg-indigo-600/70 text-white text-sm">{children}</span>
);

export const Card = ({ children, className = "" }) => (
  <div className={`bg-[#161925] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,.35)] p-6 ${className}`}>
    {children}
  </div>
);

export const ToggleSwitch = ({ enabled, onToggle, label }) => (
  <div className="flex items-center justify-between">
    <span className="text-white/90">{label}</span>
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-indigo-600' : 'bg-gray-600'
      }`}
    >
      <div
        className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  </div>
);