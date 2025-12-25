import React from 'react';
import { Compass, Target, Settings as SettingsIcon, Book, Crosshair } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
export function HUDOverlay() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  if (mode === 'intro') return null;
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-20">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 animate-fade-in pointer-events-auto">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <div className="text-xs font-mono">
            <div className="text-starlight/60 uppercase tracking-widest">Azimuth</div>
            <div className="text-starlight font-bold">142° SE</div>
          </div>
          <div className="w-px h-6 bg-starlight/20" />
          <div className="text-xs font-mono">
            <div className="text-starlight/60 uppercase tracking-widest">Altitude</div>
            <div className="text-starlight font-bold">+24.5°</div>
          </div>
        </div>
        <div className="pointer-events-auto">
          <Button variant="ghost" size="icon" className="glass h-10 w-10 text-starlight hover:bg-starlight/20">
            <SettingsIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {/* Central Crosshair */}
      <div className="flex-1 flex items-center justify-center opacity-40">
        <Crosshair className="w-12 h-12 text-nebula" strokeWidth={1} />
      </div>
      {/* Navigation Footer */}
      <div className="flex justify-center">
        <div className="glass-dark p-2 rounded-2xl flex items-center gap-2 pointer-events-auto">
          <Button 
            variant="ghost" 
            className={cn("rounded-xl gap-2", mode === 'skyview' && "bg-nebula/20 text-nebula")}
            onClick={() => setMode('skyview')}
          >
            <Compass className="h-4 w-4" />
            Sky View
          </Button>
          <Button 
            variant="ghost" 
            className={cn("rounded-xl gap-2", mode === 'log' && "bg-nebula/20 text-nebula")}
            onClick={() => setMode('log')}
          >
            <Book className="h-4 w-4" />
            Journal
          </Button>
          <div className="w-px h-4 bg-starlight/10 mx-1" />
          <Button variant="ghost" className="rounded-xl gap-2 text-starlight/70">
            <Target className="h-4 w-4" />
            Explore
          </Button>
        </div>
      </div>
    </div>
  );
}