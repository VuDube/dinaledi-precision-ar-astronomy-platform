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
          className="fixed inset-0 z-[100] pointer-events-none mix-blend-multiply bg-[#330000] opacity-40 transition-opacity duration-1000" 
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
        .night-mode-active .glass-dark {
          background-color: rgba(15, 0, 0, 0.98) !important;
          border-color: rgba(255, 0, 0, 0.2) !important;
          backdrop-filter: blur(32px) !important;
          color: #ee2222 !important;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.05) !important;
        }
        .night-mode-active .text-starlight,
        .night-mode-active p,
        .night-mode-active h1,
        .night-mode-active h2,
        .night-mode-active h3,
        .night-mode-active h4,
        .night-mode-active span:not(.text-nebula) {
          color: #ee2222 !important;
        }
        .night-mode-active .text-nebula {
          color: #ff0000 !important;
          text-shadow: 0 0 12px rgba(255, 0, 0, 0.4) !important;
        }
        .night-mode-active svg {
          stroke: #ee2222 !important;
          fill: none !important;
        }
        .night-mode-active svg.fill-current {
          fill: #ee2222 !important;
        }
        .night-mode-active .bg-nebula,
        .night-mode-active .bg-starlight {
          background-color: #880000 !important;
          color: #ffaaaa !important;
          border-color: #aa0000 !important;
        }
        .night-mode-active .border-nebula,
        .night-mode-active .border-starlight {
          border-color: #660000 !important;
        }
        .night-mode-active .bg-green-500,
        .night-mode-active .bg-yellow-500 {
          background-color: #ff0000 !important;
          box-shadow: 0 0 8px rgba(255, 0, 0, 0.6) !important;
        }
        .night-mode-active button:hover {
          background-color: rgba(255, 0, 0, 0.15) !important;
        }
        .night-mode-active .badge {
          background-color: rgba(100, 0, 0, 0.2) !important;
          border-color: #440000 !important;
        }
      `}</style>
    </div>
  );
}