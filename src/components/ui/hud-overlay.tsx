import React from 'react';
import { Wifi, Crosshair, Loader2, CloudOff, CloudUpload, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useObservationStore } from '@/stores/observation-store';
import { BottomNav } from '@/components/ui/bottom-nav';
import { SettingsPanel } from '@/components/ui/settings-panel';
import { HighlightsPanel } from '@/components/ui/highlights-panel';
import { HighlightsCarousel } from '@/components/ui/highlights-carousel';
import { TemporalControls } from '@/components/ui/temporal-controls';
import { SearchPanel } from '@/components/ui/search-panel';
import { TargetNavigator } from '@/components/ui/target-navigator';
import { RadialSearchWheel } from '@/components/ui/radial-search-wheel';
import { TargetDetailsDrawer } from '@/components/ui/target-details-drawer';
import { PWAInstallModal } from '@/components/ui/pwa-install-modal';
import { Progress } from '@/components/ui/progress';
import { DiamondGrid, StarPoint } from '@/components/ui/sesotho-patterns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';
import { usePWA } from '@/hooks/use-pwa';
export function HUDOverlay() {
  const mode = useAppStore(s => s.mode);
  const orientation = useAppStore(s => s.orientation);
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const selectedStar = useAppStore(s => s.selectedStar);
  const selectedDSO = useAppStore(s => s.selectedDSO);
  const isCatalogReady = useAppStore(s => s.isCatalogReady);
  const catalogLoadingProgress = useAppStore(s => s.catalogLoadingProgress);
  const isSlewing = useAppStore(s => s.isSlewing);
  const isOnline = useAppStore(s => s.isOnline);
  const setRadialOpen = useAppStore(s => s.setRadialOpen);
  const isRadialOpen = useAppStore(s => s.isRadialOpen);
  const setDetailOpen = useAppStore(s => s.setDetailOpen);
  const isSyncing = useObservationStore(s => s.isSyncing);
  const pendingCount = useObservationStore(s => s.pendingCount);
  const { isInstallModalOpen, setIsInstallModalOpen, triggerInstallPrompt } = usePWA();
  if (mode === 'intro') return null;
  const activeTarget = selectedStar || selectedDSO;
  const azimuth = Math.round(orientation.heading);
  const altitude = Math.round(orientation.beta);
  return (
    <TooltipProvider>
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-20 overflow-hidden">
        {/* Top Telemetry Bar */}
        <div className="flex justify-between items-start relative z-10">
          <div className="flex flex-col gap-2">
            {!isCatalogReady && (
              <div className="glass px-3 py-2 rounded-lg w-40 sm:w-48 mb-2 relative overflow-hidden">
                <DiamondGrid opacity={0.03} />
                <Progress value={catalogLoadingProgress} className="h-0.5 bg-starlight/10" />
              </div>
            )}
            <div className="glass px-4 py-2 rounded-full flex items-center gap-4 border-white/5 backdrop-blur-2xl relative overflow-hidden">
              <DiamondGrid opacity={0.05} />
              <div className={cn("h-1.5 w-1.5 rounded-full", isSensorActive ? "bg-green-500 shadow-glow" : "bg-yellow-500")} />
              <div className="flex gap-4 font-mono text-[10px] uppercase tracking-widest font-bold tabular-nums text-starlight">
                <span className="opacity-40">HDG <span className="opacity-100">{azimuth.toString().padStart(3, '0')}°</span></span>
                <span className="opacity-40">ALT <span className="opacity-100">{altitude.toString().padStart(3, '0')}°</span></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
             <AnimatePresence mode="wait">
              {isSyncing ? (
                <motion.div key="syncing" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="glass px-2.5 py-1.5 rounded-full flex items-center gap-2 border-nebula/20 bg-nebula/10">
                  <RefreshCw className="w-3 h-3 text-nebula animate-spin" />
                  <span className="text-[9px] font-mono text-nebula uppercase tracking-widest">Sync_Edge</span>
                </motion.div>
              ) : pendingCount > 0 ? (
                <motion.div key="pending" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="glass px-2.5 py-1.5 rounded-full flex items-center gap-2 border-yellow-500/20 bg-yellow-500/10">
                  <CloudUpload className="w-3 h-3 text-yellow-500" />
                  <span className="text-[9px] font-mono text-yellow-500 uppercase tracking-widest">{pendingCount} PND</span>
                </motion.div>
              ) : isOnline ? (
                <motion.div key="synced" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="glass px-2.5 py-1.5 rounded-full flex items-center gap-2 border-green-500/20 bg-green-500/10">
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-[9px] font-mono text-green-500 uppercase tracking-widest text-starlight">Linked</span>
                </motion.div>
              ) : (
                <motion.div key="offline" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="glass px-2.5 py-1.5 rounded-full flex items-center gap-2 border-red-500/20 bg-red-500/10">
                  <CloudOff className="w-3 h-3 text-red-500" />
                  <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest">Offline</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* Slewing Indicator */}
        <AnimatePresence>
          {isSlewing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-28 left-1/2 -translate-x-1/2 glass px-6 py-2 rounded-full border-nebula/30 flex items-center gap-2 overflow-hidden shadow-2xl"
            >
              <DiamondGrid opacity={0.1} />
              <Loader2 className="w-4 h-4 text-nebula animate-spin" />
              <span className="text-[11px] font-mono font-bold text-nebula uppercase tracking-[0.2em]">Slewing Target</span>
            </motion.div>
          )}
        </AnimatePresence>
        <TargetNavigator />
        <HighlightsCarousel />
        {/* Reticle Area */}
        <div className="flex-1 flex items-center justify-center relative">
           <StarPoint className="w-72 h-72 scale-150" opacity={0.015} />
           <div
             className="relative pointer-events-auto"
             onClick={() => {
               if (activeTarget) setDetailOpen(true);
               else setRadialOpen(!isRadialOpen);
             }}
           >
              <Crosshair className={cn("w-16 h-16 transition-all duration-700 cursor-pointer active:scale-90", activeTarget ? "text-nebula scale-110 rotate-45 opacity-60" : "text-starlight/20")} strokeWidth={0.2} />
              {activeTarget && (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-nebula rounded-full shadow-[0_0_15px_rgba(234,179,8,1)]" />
                </motion.div>
              )}
           </div>
           <RadialSearchWheel />
        </div>
        <BottomNav />
      </div>
      <TargetDetailsDrawer />
      <SettingsPanel />
      <HighlightsPanel />
      <TemporalControls />
      <SearchPanel />
      <PWAInstallModal 
        isOpen={isInstallModalOpen} 
        onClose={() => setIsInstallModalOpen(false)} 
        onInstall={triggerInstallPrompt} 
      />
    </div>
  );
}