import React, { useEffect } from 'react';
import { Compass as CompassIcon, Target, Settings as SettingsIcon, Book, Crosshair, Search, Layers, PenLine, Sparkles, Moon, Wifi, Smartphone } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { SettingsPanel } from '@/components/ui/settings-panel';
import { HighlightsPanel } from '@/components/ui/highlights-panel';
import { TemporalControls } from '@/components/ui/temporal-controls';
import { SearchPanel } from '@/components/ui/search-panel';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getLunarPhase, getSunPosition } from '@/lib/astronomy-math';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export function HUDOverlay() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const orientation = useAppStore(s => s.orientation);
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const gpsStatus = useAppStore(s => s.gpsStatus);
  const isInstallable = useAppStore(s => s.isInstallable);
  const selectedStar = useAppStore(s => s.selectedStar);
  const selectedDSO = useAppStore(s => s.selectedDSO);
  const showConstellations = useAppStore(s => s.showConstellations);
  const simulationTime = useAppStore(s => s.simulationTime);
  const lat = useAppStore(s => s.latitude);
  const lon = useAppStore(s => s.longitude);
  const toggleConstellations = useAppStore(s => s.toggleConstellations);
  const toggleGrid = useAppStore(s => s.toggleGrid);
  const setSearchOpen = useAppStore(s => s.setSearchOpen);
  const setObserving = useAppStore(s => s.setObserving);
  const setInstallable = useAppStore(s => s.setInstallable);
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [setInstallable]);
  if (mode === 'intro') return null;
  const moon = getLunarPhase(simulationTime);
  const activeTarget = selectedStar || selectedDSO;
  const azimuth = Math.round(orientation.heading);
  const altitude = Math.round(orientation.beta);
  const getCardinal = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };
  return (
    <TooltipProvider>
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-20 overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="glass px-4 py-3 rounded-xl flex items-center gap-4 animate-fade-in pointer-events-auto">
              <div className={cn("h-2 w-2 rounded-full", isSensorActive ? "bg-green-500 shadow-glow" : "bg-yellow-500 animate-pulse")} />
              <div className="text-xs font-mono">
                <div className="text-starlight/40 uppercase tracking-widest text-[10px]">Bearing</div>
                <div className="text-starlight font-bold text-sm">{azimuth}° {getCardinal(azimuth)}</div>
              </div>
              <div className="w-px h-8 bg-starlight/10" />
              <div className="text-xs font-mono">
                <div className="text-starlight/40 uppercase tracking-widest text-[10px]">Alt</div>
                <div className="text-starlight font-bold text-sm">{altitude > 0 ? '+' : ''}{altitude}°</div>
              </div>
            </div>
            <div className="flex gap-2 pointer-events-auto">
              <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Wifi className={cn("w-3 h-3", gpsStatus === 'tracking' ? "text-green-500 shadow-glow" : gpsStatus === 'denied' ? "text-yellow-400 animate-pulse" : "text-starlight/20")} />
                <span className="text-[9px] font-mono text-starlight/60 uppercase">GPS</span>
              </div>
              {isInstallable && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="glass px-3 py-1.5 rounded-lg h-auto text-[9px] font-mono text-nebula gap-2"
                  onClick={() => (window as any).deferredPrompt?.prompt()}
                >
                  <Smartphone className="w-3 h-3" />
                  INSTALL PWA
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 pointer-events-auto items-end">
            <Button variant="ghost" size="icon" className="glass h-10 w-10 text-nebula" onClick={() => setMode('highlights')}>
              <Sparkles className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="glass h-10 w-10 text-starlight" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className={cn("glass h-10 w-10 text-starlight", !showConstellations && "opacity-50")} onClick={toggleConstellations}>
              <Layers className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="glass h-10 w-10 text-starlight" onClick={() => setMode('settings')}>
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <AnimatePresence>
          {activeTarget && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-1/2 -translate-x-1/2 bottom-32 pointer-events-auto">
              <div className="glass-dark border-nebula/30 px-6 py-4 rounded-2xl flex flex-col items-center gap-3 shadow-glass min-w-[240px]">
                <div className="text-center">
                  <div className="text-nebula text-[10px] font-bold uppercase tracking-widest">{('type' in activeTarget) ? activeTarget.type : 'Star'}</div>
                  <div className="text-starlight text-xl font-bold">{activeTarget.name || "Unknown"}</div>
                  <div className="text-starlight/40 font-mono text-xs mt-1">Magnitude {activeTarget.mag.toFixed(1)}</div>
                </div>
                <Button size="sm" variant="ghost" className="w-full bg-nebula/10 text-nebula hover:bg-nebula hover:text-space-black rounded-xl gap-2 font-bold" onClick={() => setObserving(true)}>
                  <PenLine className="w-3.5 h-3.5" /> Log Observation
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex-1 flex items-center justify-center">
          <Crosshair className={cn("w-16 h-16 transition-all duration-500", activeTarget ? "text-nebula scale-110" : "text-starlight/20")} strokeWidth={0.5} />
        </div>
        <div className="flex justify-center">
          <div className="glass-dark p-2 rounded-2xl flex items-center gap-2 pointer-events-auto shadow-2xl">
            <Button variant="ghost" className={cn("rounded-xl gap-2", mode === 'skyview' && "bg-nebula/20 text-nebula")} onClick={() => setMode('skyview')}>
              <CompassIcon className="h-4 w-4" /> Sky View
            </Button>
            <Button variant="ghost" className={cn("rounded-xl gap-2", mode === 'log' && "bg-nebula/20 text-nebula")} onClick={() => setMode('log')}>
              <Book className="h-4 w-4" /> Journal
            </Button>
            <div className="w-px h-4 bg-starlight/10 mx-1" />
            <Button variant="ghost" className="rounded-xl gap-2 text-starlight/40 hover:text-starlight" onClick={toggleGrid}>
              <Target className="h-4 w-4" /> Grid
            </Button>
          </div>
        </div>
      </div>
      <SettingsPanel />
      <HighlightsPanel />
      <TemporalControls />
      <SearchPanel />
    </TooltipProvider>
  );
}
declare global {
  interface Window {
    deferredPrompt: any;
  }
}