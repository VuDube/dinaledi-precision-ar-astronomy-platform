import React from 'react';
import { Compass as CompassIcon, Target, Settings as SettingsIcon, Book, Crosshair, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
export function HUDOverlay() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const orientation = useAppStore(s => s.orientation);
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const permissionStatus = useAppStore(s => s.permissionStatus);
  if (mode === 'intro') return null;
  const azimuth = Math.round(orientation.heading);
  const altitude = Math.round(orientation.beta);
  const getCardinal = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-20">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="glass px-4 py-3 rounded-xl flex items-center gap-4 animate-fade-in pointer-events-auto">
          <div className={cn("h-2 w-2 rounded-full animate-pulse", isSensorActive ? "bg-green-500" : "bg-yellow-500")} />
          <div className="text-xs font-mono">
            <div className="text-starlight/40 uppercase tracking-widest text-[10px]">Azimuth</div>
            <div className="text-starlight font-bold text-sm">
              {azimuth}° {getCardinal(azimuth)}
            </div>
          </div>
          <div className="w-px h-8 bg-starlight/10" />
          <div className="text-xs font-mono">
            <div className="text-starlight/40 uppercase tracking-widest text-[10px]">Altitude</div>
            <div className="text-starlight font-bold text-sm">
              {altitude > 0 ? '+' : ''}{altitude}°
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 pointer-events-auto items-end">
          <Button variant="ghost" size="icon" className="glass h-10 w-10 text-starlight">
            <SettingsIcon className="h-5 w-5" />
          </Button>
          {permissionStatus === 'denied' && (
            <div className="glass bg-destructive/20 border-destructive/50 px-3 py-2 rounded-lg flex items-center gap-2 text-[10px] text-destructive-foreground font-bold uppercase tracking-tighter">
              <AlertTriangle className="h-3 w-3" />
              Sensor Denied
            </div>
          )}
        </div>
      </div>
      {/* Central Crosshair with Compass Ring */}
      <div className="flex-1 flex items-center justify-center relative">
        <div 
          className="absolute w-48 h-48 border border-starlight/10 rounded-full transition-transform duration-300"
          style={{ transform: `rotate(${-orientation.alpha}deg)` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-nebula">N</div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-[10px] font-bold text-starlight/40">S</div>
        </div>
        <Crosshair className="w-14 h-14 text-nebula/60" strokeWidth={0.5} />
      </div>
      {/* Navigation Footer */}
      <div className="flex justify-center">
        <div className="glass-dark p-2 rounded-2xl flex items-center gap-2 pointer-events-auto shadow-2xl">
          <Button
            variant="ghost"
            className={cn("rounded-xl gap-2 transition-all", mode === 'skyview' && "bg-nebula/20 text-nebula")}
            onClick={() => setMode('skyview')}
          >
            <CompassIcon className="h-4 w-4" />
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
          <Button variant="ghost" className="rounded-xl gap-2 text-starlight/40 hover:text-starlight">
            <Target className="h-4 w-4" />
            Explore
          </Button>
        </div>
      </div>
    </div>
  );
}