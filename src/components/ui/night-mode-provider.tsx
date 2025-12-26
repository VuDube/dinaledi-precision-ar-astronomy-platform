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
          className="fixed inset-0 z-[100] pointer-events-none mix-blend-multiply transition-opacity duration-700 bg-[#ff0000] opacity-40" 
          aria-hidden="true"
        />
      )}
      <style>{`
        .night-mode-active {
          filter: contrast(1.2) brightness(0.8);
        }
        .night-mode-active img, 
        .night-mode-active video, 
        .night-mode-active canvas {
          filter: sepia(100%) hue-rotate(-50deg) saturate(300%) brightness(0.7);
        }
        .night-mode-active * {
          color: #ff3333 !important;
          border-color: #aa0000 !important;
          text-shadow: 0 0 2px #ff000033;
        }
        .night-mode-active .bg-nebula,
        .night-mode-active .bg-starlight {
          background-color: #aa0000 !important;
        }
        .night-mode-active .glass,
        .night-mode-active .glass-dark {
          background-color: rgba(20, 0, 0, 0.8) !important;
          backdrop-filter: blur(12px) !important;
        }
      `}</style>
    </div>
  );
}