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
          className="fixed inset-0 z-[100] pointer-events-none mix-blend-multiply transition-opacity duration-700 bg-[#330000] opacity-60"
          aria-hidden="true"
        />
      )}
      <style>{`
        .night-mode-active {
          filter: contrast(1.1) brightness(0.9);
        }
        .night-mode-active canvas {
          filter: sepia(100%) hue-rotate(-50deg) saturate(400%) brightness(0.6);
        }
        .night-mode-active .glass,
        .night-mode-active .glass-dark {
          background-color: rgba(15, 0, 0, 0.9) !important;
          border-color: rgba(255, 0, 0, 0.2) !important;
          backdrop-filter: blur(16px) !important;
        }
        .night-mode-active h1, 
        .night-mode-active h2, 
        .night-mode-active h3, 
        .night-mode-active h4, 
        .night-mode-active p, 
        .night-mode-active span,
        .night-mode-active div:not(.bg-nebula):not(.bg-starlight) {
          color: #ff4444 !important;
        }
        .night-mode-active .text-nebula {
          color: #ff0000 !important;
        }
        .night-mode-active svg {
          stroke: #ff4444 !important;
        }
        .night-mode-active .bg-nebula,
        .night-mode-active .bg-starlight {
          background-color: #880000 !important;
          color: #ffcccc !important;
        }
        .night-mode-active .border-nebula,
        .night-mode-active .border-starlight {
          border-color: #660000 !important;
        }
      `}</style>
    </div>
  );
}