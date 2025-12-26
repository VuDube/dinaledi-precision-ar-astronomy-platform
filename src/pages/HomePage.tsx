import React, { useState, useEffect, useCallback } from 'react';
import { StarScene } from '@/components/star-map/StarScene';
import { HUDOverlay } from '@/components/ui/hud-overlay';
import { ObservationLog } from '@/components/ui/observation-log';
import { ObservationForm } from '@/components/ui/observation-form';
import { NightModeProvider } from '@/components/ui/night-mode-provider';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowRight, Loader2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrientation } from '@/hooks/use-orientation';
import { usePWA } from '@/hooks/use-pwa';
import { DiamondGrid, StarPoint } from '@/components/ui/sesotho-patterns';
import { toast } from 'sonner';
export function HomePage() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const isCalibrated = useAppStore(s => s.isCalibrated);
  const calibrationProgress = useAppStore(s => s.calibrationProgress);
  const { requestPermission } = useOrientation();
  const { isStandalone } = usePWA();
  const isCatalogReady = useAppStore(s => s.isCatalogReady);
  const [isInitializing, setIsInitializing] = useState(false);
  const handleStart = useCallback(async () => {
    setIsInitializing(true);
    await requestPermission();
  }, [requestPermission]);
  useEffect(() => {
    if (isCalibrated && mode === 'intro') {
      const timer = setTimeout(() => {
        setMode('skyview');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isCalibrated, mode, setMode]);
  useEffect(() => {
    if (isStandalone && !isInitializing && mode === 'intro') {
      const timer = setTimeout(() => {
        handleStart();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isStandalone, isInitializing, mode, handleStart]);

  // Catalog loaded notification
  const hasShownCatalogToast = React.useRef(false);
  useEffect(() => {
    if (isCatalogReady && !hasShownCatalogToast.current) {
      toast.success('Celestial catalog loaded – commence observation');
      hasShownCatalogToast.current = true;
    }
  }, [isCatalogReady]);
  return (
    <NightModeProvider>
      <div className="relative h-screen w-screen overflow-hidden bg-space-black">
        <motion.div
          className="absolute inset-0 z-0"
          animate={{
            opacity: mode === 'intro' ? 0.3 : 1,
            scale: mode === 'intro' ? 1.05 : 1,
            filter: mode === 'intro' ? 'blur(4px)' : 'blur(0px)'
          }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          <StarScene />
        </motion.div>
        <HUDOverlay />
        <ObservationLog />
        <ObservationForm />
        <AnimatePresence>
          {mode === 'intro' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.2, filter: 'blur(60px)' }}
              transition={{ duration: 1.2, ease: "circIn" }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-space-black/80 backdrop-blur-md"
            >
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 pointer-events-none"
              >
                <DiamondGrid opacity={0.04} />
              </motion.div>
              <div className="max-w-2xl w-full py-12 text-center space-y-12 relative z-10">
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2.5rem] sm:rounded-[3rem] bg-gradient-to-br from-nebula to-[#D14615] flex items-center justify-center shadow-[0_0_80px_rgba(234,179,8,0.4)]"
                  >
                    <Sparkles className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                  </motion.div>
                </div>
                {!isInitializing ? (
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-6xl sm:text-7xl md:text-9xl font-display font-black text-starlight tracking-tighter"
                      >
                        DIN<span className="text-nebula">A</span>LEDI
                      </motion.h1>
                      <p className="text-lg sm:text-xl md:text-2xl text-starlight/60 font-light max-w-lg mx-auto leading-relaxed text-pretty px-4">
                        A precision-calibrated viewport into ancestral skies.
                        Professional data meets South African celestial lore.
                      </p>
                    </div>
                    <Button
                      onClick={handleStart}
                      className="h-20 px-12 sm:px-16 rounded-[2rem] bg-starlight text-space-black hover:bg-nebula hover:scale-105 transition-all duration-500 text-xl sm:text-2xl font-black group shadow-[0_0_50px_rgba(255,255,255,0.2)] active:scale-95"
                    >
                      {isStandalone ? 'RESUME VOYAGE' : 'BEGIN OBSERVATION'}
                      <ArrowRight className="ml-3 w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-2 transition-transform" />
                    </Button>
                    <div className="pt-20 flex flex-col items-center gap-4 opacity-30">
                      <div className="flex items-center gap-3 text-[9px] font-mono text-starlight uppercase tracking-[0.5em]">
                        <Globe className="w-3 h-3" />
                        {isStandalone ? 'NATIVE_APP_ACTIVE' : 'VALIDATED_VIA_EDGE'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12">
                    <div className="flex flex-col items-center gap-8">
                      <div className="relative flex items-center justify-center">
                        <Loader2 className="w-32 h-32 text-nebula/20 animate-spin" strokeWidth={0.5} />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <StarPoint className="w-24 h-24 animate-pulse opacity-100" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h2 className="text-3xl sm:text-4xl font-black text-starlight tracking-tight">
                          {isCalibrated ? "ALIGNMENT_COMPLETE" : "NEUTRALIZING_BIAS"}
                        </h2>
                        <p className="text-starlight/40 font-mono text-[10px] uppercase tracking-[0.4em]">
                          {isCalibrated ? "Celestial sphere locked" : "Hold device steady • Sampling gravity"}
                        </p>
                      </div>
                    </div>
                    <div className="max-w-xs mx-auto w-full space-y-4">
                      <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="absolute inset-y-0 left-0 bg-nebula shadow-[0_0_15px_rgba(234,179,8,1)]"
                          animate={{ width: `${calibrationProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between font-mono text-[9px] text-starlight/20 tabular-nums uppercase tracking-widest">
                        <span>Calibration_Sync</span>
                        <span>{Math.round(calibrationProgress)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NightModeProvider>
  );
}