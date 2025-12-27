import React from 'react';
import { Wifi, CloudOff, CloudUpload, RefreshCw, Loader2, Crosshair } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useObservationStore } from '@/stores/observation-store';
import { BottomNav } from '@/components/ui/bottom-nav';
import { HighlightsCarousel } from '@/components/ui/highlights-carousel';
import { TemporalControls } from '@/components/ui/temporal-controls';
import { SearchPanel } from '@/components/ui/search-panel';
import { TargetNavigator } from '@/components/ui/target-navigator';
import { RadialSearchWheel } from '@/components/ui/radial-search-wheel';
import { TargetDetailsDrawer } from '@/components/ui/target-details-drawer';
import { PWAInstallModal } from '@/components/ui/pwa-install-modal';
import { Progress } from '@/components/ui/progress';
import { StarPoint } from '@/components/ui/sesotho-patterns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';
import { usePWA } from '@/hooks/use-pwa';
export function HUDOverlay() {
  const mode = useAppStore(s => s.mode);
  const heading = useAppStore(s => s.orientation.heading);
  const beta = useAppStore(s => s.orientation.beta);
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const selectedStar = useAppStore(s => s.selectedStar);
  const selectedDSO = useAppStore(s => s.selectedDSO);
  const isCatalogReady = useAppStore(s => s.isCatalogReady);
  const catalogLoadingProgress = useAppStore(s => s.catalogLoadingProgress);
  const isSlewing = useAppStore(s => s.isSlewing);
  const isOnline = useAppStore(s => s.isOnline);
  const isRadialOpen = useAppStore(s => s.isRadialOpen);
  const setRadialOpen = useAppStore(s => s.setRadialOpen);
  const setDetailOpen = useAppStore(s => s.setDetailOpen);
  const isSyncing = useObservationStore(s => s.isSyncing);
  const pendingCount = useObservationStore(s => s.pendingCount);
  const { isInstallModalOpen, setIsInstallModalOpen, triggerInstallPrompt } = usePWA();
  if (mode === 'intro') return null;
  const activeTarget = selectedStar || selectedDSO;
  const azimuthValue = Math.round(heading);
  const altitudeValue = Math.round(beta);
  return (
    <TooltipProvider>
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 pb-[env(safe-area-inset-bottom,24px)] pt-[env(safe-area-inset-top,16px)] z-20 overflow-hidden">
        {/* Top Telemetry Bar */}
        <div className="flex justify-between items-start relative z-10 w-full max-w-[calc(100vw-32px)] mx-auto">
          <motion.div layout className="flex flex-col gap-2 min-w-0">
            <AnimatePresence>
              {!isCatalogReady && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass px-3 py-2 rounded-lg w-36 sm:w-48 overflow-hidden shrink-0 backdrop-filter-none"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[7px] font-mono text-starlight/40 uppercase tracking-widest">CAT_SYNC</span>
                    <span className="text-[7px] font-mono text-nebula uppercase">{Math.round(catalogLoadingProgress)}%</span>
                  </div>
                  <Progress value={catalogLoadingProgress} className="h-0.5 bg-starlight/10" />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2 border-white/5 backdrop-blur-3xl shrink-0 backdrop-filter-none">
              <div className={cn("h-1.5 w-1.5 rounded-full", isSensorActive ? "bg-green-500" : "bg-yellow-500")} />
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[9px] uppercase tracking-wider font-bold tabular-nums text-starlight">
                <span>HDG {azimuthValue.toString().padStart(3, '0')}°</span>
                <span>ALT {altitudeValue.toString().padStart(3, '0')}°</span>
              </div>
            </div>
          </motion.div>
          <div className="flex items-center gap-2 pointer-events-auto ml-2 shrink-0">
             <AnimatePresence mode="wait">
              {isSyncing ? (
                <motion.div key="syncing" className="glass px-2 py-1 rounded-full border-nebula/20 backdrop-filter-none">
                  <RefreshCw className="w-3 h-3 text-nebula animate-spin" />
                </motion.div>
              ) : pendingCount > 0 ? (
                <motion.div key="pending" className="glass px-2 py-1 rounded-full flex items-center gap-2 border-yellow-500/20 bg-yellow-500/10 backdrop-filter-none">
                  <CloudUpload className="w-3 h-3 text-yellow-500" />
                  <span className="hidden xs:inline text-[8px] font-mono text-yellow-500">{pendingCount} PND</span>
                </motion.div>
              ) : (
                <motion.div key="status" className="glass px-2 py-1 rounded-full flex items-center gap-1.5 border-white/5 backdrop-filter-none">
                  {isOnline ? <Wifi className="w-3 h-3 text-green-500" /> : <CloudOff className="w-3 h-3 text-red-500" />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* Slewing Indicator */}
        <AnimatePresence>
          {isSlewing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-24 left-1/2 -translate-x-1/2 glass px-4 py-1.5 rounded-full border-nebula/30 flex items-center gap-2 shadow-2xl z-20 backdrop-filter-none"
            >
              <Loader2 className="w-3 h-3 text-nebula animate-spin" />
              <span className="text-[10px] font-mono font-bold text-nebula uppercase tracking-widest">Slewing</span>
            </motion.div>
          )}
        </AnimatePresence>
        {!isRadialOpen && <TargetNavigator />}
        <HighlightsCarousel />
        {/* Central Reticle */}
        <div className="flex-1 flex items-center justify-center relative">
           <StarPoint className="w-64 h-64 scale-150" opacity={0.015} />
           <div 
             className="relative pointer-events-auto p-16 rounded-full"
             onClick={() => {
               if (activeTarget) setDetailOpen(true);
               else setRadialOpen(!isRadialOpen);
             }}
           >
              <Crosshair className={cn("w-14 h-14 transition-all cursor-pointer", activeTarget ? "text-nebula opacity-60" : "text-starlight/10")} strokeWidth={0.2} />
           </div>
           <RadialSearchWheel />
        </div>
        <BottomNav />
      </div>
      <TargetDetailsDrawer />
      <SearchPanel />
      <TemporalControls />
      <PWAInstallModal 
        isOpen={isInstallModalOpen} 
        onClose={() => setIsInstallModalOpen(false)} 
        onInstall={triggerInstallPrompt} 
      />
    </TooltipProvider>
  );
}