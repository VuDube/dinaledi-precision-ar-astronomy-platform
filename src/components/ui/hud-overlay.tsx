import React, { useEffect } from 'react';
import { Target, Triangle, Wifi, Crosshair, Sparkles } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { BottomNav } from '@/components/ui/bottom-nav';
import { SettingsPanel } from '@/components/ui/settings-panel';
import { HighlightsPanel } from '@/components/ui/highlights-panel';
import { TemporalControls } from '@/components/ui/temporal-controls';
import { SearchPanel } from '@/components/ui/search-panel';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';
export function HUDOverlay() {
  const mode = useAppStore(s => s.mode);
  const orientation = useAppStore(s => s.orientation);
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const gpsStatus = useAppStore(s => s.gpsStatus);
  const selectedStar = useAppStore(s => s.selectedStar);
  const selectedDSO = useAppStore(s => s.selectedDSO);
  const preferredLore = useAppStore(s => s.preferredLore);
  const isCatalogReady = useAppStore(s => s.isCatalogReady);
  const catalogLoadingProgress = useAppStore(s => s.catalogLoadingProgress);
  const setObserving = useAppStore(s => s.setObserving);
  const setInstallable = useAppStore(s => s.setInstallable);
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
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
    return (preferredLore === 'african' || preferredLore === 'both') 
      ? (target.localName || target.name) 
      : target.name;
  };
  return (
    <TooltipProvider>
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-20 overflow-hidden">
        {/* Top Telemetry Bar */}
        <div className="flex justify-between items-start relative z-10">
          <div className="flex flex-col gap-2">
            {!isCatalogReady && (
              <div className="glass px-3 py-2 rounded-lg w-48 mb-2">
                <Progress value={catalogLoadingProgress} className="h-0.5 bg-starlight/10" />
              </div>
            )}
            <div className="glass px-4 py-2 rounded-full flex items-center gap-4 border-white/5 backdrop-blur-xl">
              <div className={cn("h-1.5 w-1.5 rounded-full", isSensorActive ? "bg-green-500 shadow-glow" : "bg-yellow-500")} />
              <div className="flex gap-4 font-mono text-[10px] uppercase tracking-tighter font-bold">
                <span className="text-starlight/40">HDG <span className="text-starlight">{azimuth}°</span></span>
                <span className="text-starlight/40">ALT <span className="text-starlight">{altitude}°</span></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2 border-white/5 bg-black/20">
              <Wifi className={cn("w-3 h-3", gpsStatus === 'tracking' ? "text-green-500" : "text-starlight/20")} />
              <span className="text-[9px] font-mono text-starlight/60 uppercase">GPS</span>
            </div>
          </div>
        </div>
        {/* Targeting Info Card (Floating above BottomNav) */}
        <AnimatePresence>
          {activeTarget && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-32 pointer-events-auto"
            >
              <div className="glass-dark border-nebula/30 px-6 py-4 rounded-3xl flex flex-col items-center gap-3 shadow-2xl min-w-[280px] backdrop-blur-3xl">
                <div className="text-center">
                  <div className="text-nebula text-[9px] font-bold uppercase tracking-widest mb-1">
                    {('type' in activeTarget) ? activeTarget.type : 'Celestial Body'}
                  </div>
                  <div className="text-starlight text-xl font-display font-bold tracking-tight">
                    {getDisplayName(activeTarget)}
                  </div>
                </div>
                <button
                  className="w-full py-2 bg-nebula/10 text-nebula rounded-xl text-xs font-bold border border-nebula/20 hover:bg-nebula hover:text-black transition-all"
                  onClick={() => setObserving(true)}
                >
                  Log Sighting
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Reticle Area */}
        <div className="flex-1 flex items-center justify-center">
           <Crosshair className={cn("w-12 h-12 transition-all duration-500", activeTarget ? "text-nebula scale-110 rotate-45" : "text-starlight/5")} strokeWidth={0.5} />
        </div>
        {/* Mobile Navigation */}
        <BottomNav />
      </div>
      <SettingsPanel />
      <HighlightsPanel />
      <TemporalControls />
      <SearchPanel />
    </TooltipProvider>
  );
}