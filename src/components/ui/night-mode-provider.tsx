import React from 'react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
export function NightModeProvider({ children }: { children: React.ReactNode }) {
  const nightMode = useAppStore(s => s.nightMode);
  return (
    <div className={cn("relative min-h-screen transition-all duration-1000", nightMode && "night-mode-active")}>
      {children}
      {nightMode && (
        <div
          className="fixed inset-0 z-[100] pointer-events-none mix-blend-multiply bg-[#220000] opacity-50 transition-opacity duration-1000"
          aria-hidden="true"
        />
      )}
      <style>{`
        .night-mode-active {
          filter: contrast(1.1) brightness(0.8);
        }
        .night-mode-active canvas {
          filter: sepia(100%) hue-rotate(-60deg) saturate(600%) brightness(0.45);
        }
        .night-mode-active .glass,
        .night-mode-active .glass-dark,
        .night-mode-active [role="dialog"],
        .night-mode-active [data-state="open"],
        .night-mode-active .bg-card,
        .night-mode-active .bg-popover {
          background-color: rgba(15, 0, 0, 0.98) !important;
          border-color: rgba(255, 0, 0, 0.3) !important;
          backdrop-filter: blur(32px) !important;
          color: #ee2222 !important;
        }
        .night-mode-active .text-starlight,
        .night-mode-active p,
        .night-mode-active h1,
        .night-mode-active h2,
        .night-mode-active h3,
        .night-mode-active h4,
        .night-mode-active label,
        .night-mode-active span:not(.text-nebula) {
          color: #ee2222 !important;
        }
        .night-mode-active .text-nebula {
          color: #ff0000 !important;
          text-shadow: 0 0 12px rgba(255, 0, 0, 0.6) !important;
        }
        .night-mode-active svg,
        .night-mode-active lucide {
          stroke: #ee2222 !important;
          filter: grayscale(1) sepia(1) hue-rotate(-60deg) saturate(1000%);
        }
        .night-mode-active .bg-nebula,
        .night-mode-active .bg-starlight,
        .night-mode-active .bg-primary {
          background-color: #990000 !important;
          color: #ffaaaa !important;
          border-color: #aa0000 !important;
        }
        .night-mode-active .btn, .night-mode-active button:not(.bg-nebula) {
          border-color: rgba(255, 0, 0, 0.2) !important;
        }
        .night-mode-active .bg-accent, .night-mode-active [aria-selected="true"] {
          background-color: rgba(255, 0, 0, 0.2) !important;
        }
        .night-mode-active input,
        .night-mode-active textarea {
          background-color: rgba(30, 0, 0, 0.5) !important;
          border-color: #660000 !important;
          color: #ff4444 !important;
        }
        .night-mode-active .badge {
          background-color: rgba(255, 0, 0, 0.1) !important;
          color: #ff3333 !important;
          border: 1px solid rgba(255, 0, 0, 0.3) !important;
        }
        .night-mode-active [data-vaul-drawer] {
          background-color: #0a0000 !important;
          border-top-color: #550000 !important;
        }
      `}</style>
    </div>
  );
}