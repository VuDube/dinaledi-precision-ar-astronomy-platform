import React, { useEffect } from 'react';
import { Wifi, Crosshair, Triangle, Loader2, Diamond } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { BottomNav } from '@/components/ui/bottom-nav';
import { SettingsPanel } from '@/components/ui/settings-panel';
import { HighlightsPanel } from '@/components/ui/highlights-panel';
import { TemporalControls } from '@/components/ui/temporal-controls';
import { SearchPanel } from '@/components/ui/search-panel';
import { TargetNavigator } from '@/components/ui/target-navigator';
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
  const isSlewing = useAppStore(s => s.isSlewing);
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
            <div className="glass px-4 py-2 rounded-full flex items-center gap-4 border-white/5 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none flex justify-center items-center">
                <Triangle className="w-12 h-12 text-nebula rotate-180" strokeWidth={0.5} />
              </div>
              <div className={cn("h-1.5 w-1.5 rounded-full", isSensorActive ? "bg-green-500 shadow-glow" : "bg-yellow-500")} />
              <div className="flex gap-4 font-mono text-[10px] uppercase tracking-tighter font-bold tabular-nums">
                <span className="text-starlight/40">HDG <span className="text-starlight">{azimuth.toString().padStart(3, '0')}°</span></span>
                <span className="text-starlight/40">ALT <span className="text-starlight">{altitude.toString().padStart(3, '0')}°</span></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2 border-white/5 bg-black/20">
              <Wifi className={cn("w-3 h-3", gpsStatus === 'tracking' ? "text-green-500" : "text-starlight/20")} />
              <span className="text-[9px] font-mono text-starlight/60 uppercase tracking-widest">GPS_LOCK</span>
            </div>
          </div>
        </div>
        {/* Slewing Indicator */}
        <AnimatePresence>
          {isSlewing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-24 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full border-nebula/30 flex items-center gap-2"
            >
              <Loader2 className="w-3 h-3 text-nebula animate-spin" />
              <span className="text-[10px] font-mono font-bold text-nebula uppercase tracking-widest">Slewing</span>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Target Navigator Overlay */}
        <TargetNavigator />
        {/* Targeting Info Card */}
        <AnimatePresence>
          {activeTarget && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-32 pointer-events-auto"
            >
              <div className="glass-dark border-nebula/30 px-6 py-4 rounded-3xl flex flex-col items-center gap-3 shadow-2xl min-w-[280px] backdrop-blur-3xl relative overflow-hidden">
                <div className="absolute -top-4 -right-4 opacity-10">
                   <Diamond className="w-16 h-16 text-nebula" strokeWidth={1} />
                </div>
                <div className="absolute -bottom-2 -left-2 opacity-5">
                   <Triangle className="w-12 h-12 text-nebula rotate-45" strokeWidth={0.5} />
                </div>
                <div className="text-center">
                  <div className="text-nebula text-[9px] font-bold uppercase tracking-widest mb-1">
                    {('type' in activeTarget) ? activeTarget.type : 'Celestial Body'}
                  </div>
                  <div className="text-starlight text-xl font-display font-bold tracking-tight">
                    {getDisplayName(activeTarget)}
                  </div>
                  {activeTarget.mag !== undefined && (
                    <div className="text-starlight/30 text-[9px] font-mono uppercase mt-1">
                      Mag: {activeTarget.mag.toFixed(2)} • HIP_{activeTarget.id.padStart(4, '0')}
                    </div>
                  )}
                </div>
                <button
                  className="w-full py-2.5 bg-nebula/10 text-nebula rounded-xl text-xs font-bold border border-nebula/20 hover:bg-nebula hover:text-black transition-all"
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
           <div className="relative">
              <Crosshair className={cn("w-14 h-14 transition-all duration-700", activeTarget ? "text-nebula scale-125 rotate-45 opacity-60" : "text-starlight/5")} strokeWidth={0.2} />
              {activeTarget && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-1 h-1 bg-nebula rounded-full shadow-glow" />
                </motion.div>
              )}
           </div>
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