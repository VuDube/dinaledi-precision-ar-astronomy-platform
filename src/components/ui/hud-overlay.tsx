import React, { useEffect } from 'react';
import { Compass as CompassIcon, Target, Settings as SettingsIcon, Book, Crosshair, Search, Layers, PenLine, Sparkles, Wifi, Triangle } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { SettingsPanel } from '@/components/ui/settings-panel';
import { HighlightsPanel } from '@/components/ui/highlights-panel';
import { TemporalControls } from '@/components/ui/temporal-controls';
import { SearchPanel } from '@/components/ui/search-panel';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';
declare global {
  interface Window {
    deferredPrompt: any;
  }
}
export function HUDOverlay() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const orientation = useAppStore(s => s.orientation);
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const gpsStatus = useAppStore(s => s.gpsStatus);
  const selectedStar = useAppStore(s => s.selectedStar);
  const selectedDSO = useAppStore(s => s.selectedDSO);
  const preferredLore = useAppStore(s => s.preferredLore);
  const isCatalogReady = useAppStore(s => s.isCatalogReady);
  const catalogLoadingProgress = useAppStore(s => s.catalogLoadingProgress);
  const showConstellations = useAppStore(s => s.showConstellations);
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
  const activeTarget = selectedStar || selectedDSO;
  const azimuth = Math.round(orientation.heading);
  const altitude = Math.round(orientation.beta);
  const getDisplayName = (target: any) => {
    if (!target) return "Identifying...";
    if (preferredLore === 'african' || preferredLore === 'both') {
      return target.localName || target.name || "Unknown Object";
    }
    return target.name || "Unknown Object";
  };
  return (
    <TooltipProvider>
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-20 overflow-hidden">
        {/* Geometric Motif Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] overflow-hidden flex flex-wrap gap-12 p-12">
          {Array.from({ length: 48 }).map((_, i) => (
            <Triangle key={i} className="w-8 h-8 text-starlight rotate-180" strokeWidth={0.5} />
          ))}
        </div>
        <div className="flex justify-between items-start relative z-10">
          <div className="flex flex-col gap-2">
            {!isCatalogReady && (
              <div className="glass px-3 py-2 rounded-lg flex flex-col gap-1 w-48 pointer-events-auto mb-2 animate-pulse">
                <div className="flex justify-between text-[8px] font-mono text-starlight/40 uppercase">
                  <span>Syncing Starport</span>
                  <span>{Math.round(catalogLoadingProgress)}%</span>
                </div>
                <Progress value={catalogLoadingProgress} className="h-0.5 bg-starlight/10" />
              </div>
            )}
            <div className="glass px-4 py-3 rounded-xl flex items-center gap-4 animate-fade-in pointer-events-auto shadow-glow/5 border-white/5">
              <div className={cn("h-2 w-2 rounded-full transition-colors", isSensorActive ? "bg-green-500 shadow-glow" : "bg-yellow-500 animate-pulse")} />
              <div className="text-xs font-mono">
                <div className="text-starlight/40 uppercase tracking-widest text-[9px]">Bearing</div>
                <div className="text-starlight font-bold text-sm tabular-nums">{azimuth}°</div>
              </div>
              <div className="w-px h-8 bg-starlight/10" />
              <div className="text-xs font-mono">
                <div className="text-starlight/40 uppercase tracking-widest text-[9px]">Alt</div>
                <div className="text-starlight font-bold text-sm tabular-nums">{altitude > 0 ? '+' : ''}{altitude}°</div>
              </div>
            </div>
            <div className="flex gap-2 pointer-events-auto">
              <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-2 border-white/5 bg-black/20">
                <Wifi className={cn("w-3 h-3 transition-colors", gpsStatus === 'tracking' ? "text-green-500 shadow-glow" : "text-starlight/20")} />
                <span className="text-[9px] font-mono text-starlight/60 uppercase">GPS_SYNC</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 pointer-events-auto items-end">
            <Button variant="ghost" size="icon" className="glass h-10 w-10 text-nebula border-white/5" onClick={() => setMode('highlights')}>
              <Sparkles className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="glass h-10 w-10 text-starlight border-white/5" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className={cn("glass h-10 w-10 text-starlight border-white/5", !showConstellations && "opacity-50")} onClick={toggleConstellations}>
              <Layers className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="glass h-10 w-10 text-starlight border-white/5" onClick={() => setMode('settings')}>
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <AnimatePresence>
          {activeTarget && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-36 pointer-events-auto"
            >
              <div className="glass-dark border-nebula/40 px-6 py-5 rounded-3xl flex flex-col items-center gap-4 shadow-2xl min-w-[300px] backdrop-blur-2xl">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-nebula text-[10px] font-bold uppercase tracking-widest">
                      {('type' in activeTarget) ? activeTarget.type : 'Celestial Body'}
                    </span>
                    {activeTarget?.culture && (
                      <span className="bg-nebula/20 text-nebula px-1.5 rounded text-[8px] font-bold">
                        {activeTarget.culture}
                      </span>
                    )}
                  </div>
                  <div className="text-starlight text-2xl font-display font-bold tracking-tight">
                    {getDisplayName(activeTarget)}
                  </div>
                  {activeTarget?.localName && preferredLore === 'both' && (
                    <div className="text-starlight/40 text-[10px] italic mt-0.5">Scientific: {activeTarget.name}</div>
                  )}
                </div>
                {activeTarget?.lore && (
                  <div className="text-[11px] text-starlight/70 leading-relaxed max-w-[240px] text-center border-t border-white/5 pt-2 italic">
                    {activeTarget.lore}
                  </div>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full bg-nebula/10 text-nebula hover:bg-nebula hover:text-space-black rounded-xl gap-2 font-bold transition-all border border-nebula/20"
                  onClick={() => setObserving(true)}
                >
                  <PenLine className="w-3.5 h-3.5" /> Log Sighting
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-none opacity-20">
             <div className="w-64 h-64 border border-starlight/10 rounded-full" />
             <div className="w-96 h-96 border border-starlight/5 rounded-full" />
          </div>
          <Crosshair className={cn("w-16 h-16 transition-all duration-700", activeTarget ? "text-nebula scale-125 rotate-45" : "text-starlight/10")} strokeWidth={0.3} />
        </div>
        <div className="flex justify-center relative z-10">
          <div className="glass-dark p-2 rounded-2xl flex items-center gap-2 pointer-events-auto shadow-2xl mb-4 border-starlight/10 backdrop-blur-xl">
            <Button variant="ghost" className={cn("rounded-xl gap-2 h-10 transition-colors", mode === 'skyview' && "bg-nebula/20 text-nebula")} onClick={() => setMode('skyview')}>
              <CompassIcon className="h-4 w-4" /> View
            </Button>
            <Button variant="ghost" className={cn("rounded-xl gap-2 h-10 transition-colors", mode === 'log' && "bg-nebula/20 text-nebula")} onClick={() => setMode('log')}>
              <Book className="h-4 w-4" /> Journal
            </Button>
            <div className="w-px h-4 bg-starlight/10 mx-1" />
            <Button variant="ghost" className="rounded-xl gap-2 h-10 text-starlight/40 hover:text-starlight transition-colors" onClick={toggleGrid}>
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