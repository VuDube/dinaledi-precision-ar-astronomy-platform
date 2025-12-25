import React from 'react';
import { Compass as CompassIcon, Target, Settings as SettingsIcon, Book, Crosshair, AlertTriangle, Layers, PenLine } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
export function HUDOverlay() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const orientation = useAppStore(s => s.orientation);
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const permissionStatus = useAppStore(s => s.permissionStatus);
  const selectedStar = useAppStore(s => s.selectedStar);
  const toggleConstellations = useAppStore(s => s.toggleConstellations);
  const toggleGrid = useAppStore(s => s.toggleGrid);
  const showConstellations = useAppStore(s => s.showConstellations);
  if (mode === 'intro') return null;
  const azimuth = Math.round(orientation.heading);
  const altitude = Math.round(orientation.beta);
  const getCardinal = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-20 overflow-hidden">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="glass px-4 py-3 rounded-xl flex items-center gap-4 animate-fade-in pointer-events-auto">
          <div className={cn("h-2 w-2 rounded-full", isSensorActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-yellow-500 animate-pulse")} />
          <div className="text-xs font-mono">
            <div className="text-starlight/40 uppercase tracking-widest text-[10px]">Bearing</div>
            <div className="text-starlight font-bold text-sm">
              {azimuth}° {getCardinal(azimuth)}
            </div>
          </div>
          <div className="w-px h-8 bg-starlight/10" />
          <div className="text-xs font-mono">
            <div className="text-starlight/40 uppercase tracking-widest text-[10px]">Alt</div>
            <div className="text-starlight font-bold text-sm">
              {altitude > 0 ? '+' : ''}{altitude}°
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 pointer-events-auto items-end">
          <Button
            variant="ghost"
            size="icon"
            className={cn("glass h-10 w-10 text-starlight", !showConstellations && "opacity-50")}
            onClick={toggleConstellations}
          >
            <Layers className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="glass h-10 w-10 text-starlight">
            <SettingsIcon className="h-5 w-5" />
          </Button>
          {permissionStatus === 'denied' && (
            <div className="glass bg-destructive/20 border-destructive/50 px-3 py-2 rounded-lg flex items-center gap-2 text-[10px] text-destructive-foreground font-bold uppercase tracking-tighter">
              <AlertTriangle className="h-3 w-3" />
              Sensor Error
            </div>
          )}
        </div>
      </div>
      {/* Target Info Card */}
      <AnimatePresence>
        {selectedStar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-32 pointer-events-auto"
          >
            <div className="glass-dark border-nebula/30 px-6 py-4 rounded-2xl flex flex-col items-center gap-3 shadow-2xl min-w-[240px]">
              <div className="flex flex-col items-center gap-1">
                <div className="text-nebula text-[10px] font-bold uppercase tracking-[0.2em]">Target Acquired</div>
                <div className="text-starlight text-xl font-bold tracking-tight">{selectedStar.name || "Unknown Star"}</div>
                <div className="flex gap-4 mt-1">
                  <div className="text-center">
                    <div className="text-starlight/40 text-[8px] uppercase">Mag</div>
                    <div className="text-starlight font-mono text-xs">{selectedStar.mag.toFixed(1)}</div>
                  </div>
                  <div className="w-px h-6 bg-starlight/10" />
                  <div className="text-center">
                    <div className="text-starlight/40 text-[8px] uppercase">Dist (LY)</div>
                    <div className="text-starlight font-mono text-xs">{selectedStar.dist || "???"}</div>
                  </div>
                </div>
              </div>
              <Button 
                size="sm"
                variant="ghost" 
                className="w-full bg-nebula/10 text-nebula hover:bg-nebula hover:text-space-black rounded-xl gap-2 font-bold"
                onClick={() => {
                  // Trigger form by keeping selectedStar and showing modal (handled by StarForm in HomePage)
                }}
              >
                <PenLine className="w-3.5 h-3.5" />
                Log Sighting
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Central Crosshair */}
      <div className="flex-1 flex items-center justify-center relative">
        <Crosshair className={cn("w-16 h-16 transition-colors duration-300", selectedStar ? "text-nebula" : "text-starlight/20")} strokeWidth={0.5} />
      </div>
      {/* Navigation Footer */}
      <div className="flex justify-center">
        <div className="glass-dark p-2 rounded-2xl flex items-center gap-2 pointer-events-auto shadow-2xl">
          <Button
            variant="ghost"
            className={cn("rounded-xl gap-2 transition-all", mode === 'skyview' && "bg-nebula/20 text-nebula shadow-[inset_0_0_10px_rgba(234,179,8,0.2)]")}
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
          <Button variant="ghost" className="rounded-xl gap-2 text-starlight/40 hover:text-starlight" onClick={toggleGrid}>
            <Target className="h-4 w-4" />
            Grid
          </Button>
        </div>
      </div>
    </div>
  );
}