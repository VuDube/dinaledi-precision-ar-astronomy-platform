import React from 'react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
export function NightModeProvider({ children }: { children: React.ReactNode }) {
  const nightMode = useAppStore(s => s.nightMode);
  return (
    <div className={cn("relative min-h-screen transition-all duration-700", nightMode && "night-mode-active")}>
      {children}
      {nightMode && (
        <div
          className="fixed inset-0 z-[100] pointer-events-none mix-blend-multiply bg-[#440000] opacity-50"
          aria-hidden="true"
        />
      )}
      <style>{`
        .night-mode-active {
          filter: contrast(1.15) brightness(0.85);
        }
        .night-mode-active canvas {
          filter: sepia(100%) hue-rotate(-60deg) saturate(500%) brightness(0.5);
        }
        .night-mode-active .glass,
        .night-mode-active .glass-dark {
          background-color: rgba(20, 0, 0, 0.95) !important;
          border-color: rgba(255, 0, 0, 0.25) !important;
          backdrop-filter: blur(24px) !important;
          color: #ff3333 !important;
        }
        .night-mode-active .text-starlight,
        .night-mode-active p,
        .night-mode-active h1,
        .night-mode-active h2,
        .night-mode-active h3,
        .night-mode-active h4,
        .night-mode-active span:not(.text-nebula) {
          color: #ff3333 !important;
        }
        .night-mode-active .text-nebula {
          color: #ff0000 !important;
          text-shadow: 0 0 10px rgba(255, 0, 0, 0.3) !important;
        }
        .night-mode-active svg {
          stroke: #ff3333 !important;
        }
        .night-mode-active .bg-nebula,
        .night-mode-active .bg-starlight {
          background-color: #aa0000 !important;
          color: #ffcccc !important;
          border-color: #ff0000 !important;
        }
        .night-mode-active .border-nebula,
        .night-mode-active .border-starlight {
          border-color: #880000 !important;
        }
        .night-mode-active button:hover {
          background-color: rgba(255, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
}