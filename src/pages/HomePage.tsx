import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StarScene } from '@/components/star-map/StarScene';
import { HUDOverlay } from '@/components/ui/hud-overlay';
import { ObservationLog } from '@/components/ui/observation-log';
import { ObservationForm } from '@/components/ui/observation-form';
import { NightModeProvider } from '@/components/ui/night-mode-provider';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrientation } from '@/hooks/use-orientation';
import { usePWA } from '@/hooks/use-pwa';
import { DiamondGrid, StarPoint, CalibrationMotion } from '@/components/ui/sesotho-patterns';
import { toast } from 'sonner';
export function HomePage() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const isCalibrated = useAppStore(s => s.isCalibrated);
  const isCoreReady = useAppStore(s => s.isCoreReady);
  const calibrationProgress = useAppStore(s => s.calibrationProgress);
  const isCatalogReady = useAppStore(s => s.isCatalogReady);
  const { requestPermission } = useOrientation();
  const { isStandalone } = usePWA();
  const [isInitializing, setIsInitializing] = useState(false);
  const handleStart = useCallback(async () => {
    setIsInitializing(true);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    await requestPermission();
  }, [requestPermission]);
  useEffect(() => {
    // Only transition if both sensor alignment AND core catalog are locked
    if (isCalibrated && isCoreReady && mode === 'intro') {
      if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
      const timer = setTimeout(() => {
        setMode('skyview');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isCalibrated, isCoreReady, mode, setMode]);
  const hasShownCatalogToast = useRef(false);
  useEffect(() => {
    if (isCatalogReady && !hasShownCatalogToast.current) {
      toast.success('High-density catalog synced – 125k stars locked');
      hasShownCatalogToast.current = true;
    }
  }, [isCatalogReady]);
  const showCalibrationHint = calibrationProgress > 20 && calibrationProgress < 85;
  return (
    <NightModeProvider>
      <div className="relative h-screen w-screen overflow-hidden bg-space-black">
        <motion.div
          className="absolute inset-0 z-0"
          animate={{
            opacity: mode === 'intro' ? 0.2 : 1,
            scale: mode === 'intro' ? 1.02 : 1,
            filter: mode === 'intro' ? 'blur(8px)' : 'blur(0px)'
          }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
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
              exit={{ 
                opacity: 0, 
                scale: 1.1, 
                filter: 'blur(40px)',
                transition: { duration: 1.5, ease: [0.4, 0, 0.2, 1] } 
              }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-space-black/90 backdrop-blur-xl"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 pointer-events-none"
              >
                <DiamondGrid opacity={0.03} />
              </motion.div>
              <div className="max-w-2xl w-full py-12 text-center space-y-12 relative z-10">
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2.5rem] bg-gradient-to-br from-nebula to-[#D14615] flex items-center justify-center shadow-[0_0_100px_rgba(234,179,8,0.4)]"
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
                      <p className="text-lg sm:text-xl text-starlight/60 font-light max-w-lg mx-auto leading-relaxed text-pretty px-4">
                        Precision-calibrated viewport into ancestral and scientific skies.
                        Designed for production stability and visual accuracy.
                      </p>
                    </div>
                    <Button
                      onClick={handleStart}
                      className="h-20 px-12 sm:px-16 rounded-[2rem] bg-starlight text-space-black hover:bg-nebula hover:scale-105 transition-all duration-500 text-xl font-black group shadow-primary active:scale-95"
                    >
                      {isStandalone ? 'RESUME VOYAGE' : 'BEGIN OBSERVATION'}
                      <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-12">
                    <div className="flex flex-col items-center gap-8 min-h-[250px] justify-center">
                      <AnimatePresence mode="wait">
                        {showCalibrationHint ? (
                          <motion.div
                            key="hint"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center gap-6"
                          >
                            <CalibrationMotion opacity={1} />
                            <div className="text-nebula text-xs font-mono font-bold uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
                              Move phone in Figure-8 for compass bias correction
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative flex items-center justify-center"
                          >
                            <Loader2 className="w-32 h-32 text-nebula/20 animate-spin" strokeWidth={0.5} />
                            <div className="absolute inset-0 flex items-center justify-center">
                               <StarPoint className="w-24 h-24 animate-pulse opacity-100" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="space-y-3">
                        <h2 className="text-3xl sm:text-4xl font-black text-starlight tracking-tight">
                          {(isCalibrated && isCoreReady) ? "ALIGNMENT_COMPLETE" : "NEUTRALIZING_BIAS"}
                        </h2>
                        <p className="text-starlight/40 font-mono text-[10px] uppercase tracking-[0.4em]">
                          {(isCalibrated && isCoreReady) ? "Celestial sphere locked" : "Sampling Gravity ��� Hydrating Catalog"}
                        </p>
                      </div>
                    </div>
                    <div className="max-w-xs mx-auto w-full space-y-4">
                      <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-nebula shadow-[0_0_15px_rgba(234,179,8,1)]"
                          animate={{ width: `${Math.max(calibrationProgress, (isCoreReady ? 100 : 0))}%` }}
                        />
                      </div>
                      <div className="flex justify-between font-mono text-[9px] text-starlight/20 tabular-nums uppercase tracking-widest">
                        <span>Calibration_Sync</span>
                        <span>{Math.round(Math.max(calibrationProgress, (isCoreReady ? 100 : 0)))}%</span>
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