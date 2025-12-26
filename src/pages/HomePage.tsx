import React, { useState, useEffect } from 'react';
import { StarScene } from '@/components/star-map/StarScene';
import { HUDOverlay } from '@/components/ui/hud-overlay';
import { ObservationLog } from '@/components/ui/observation-log';
import { ObservationForm } from '@/components/ui/observation-form';
import { NightModeProvider } from '@/components/ui/night-mode-provider';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowRight, Loader2, Triangle, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrientation } from '@/hooks/use-orientation';
import { cn } from '@/lib/utils';
import { DiamondGrid } from '@/components/ui/sesotho-patterns';
export function HomePage() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const isCalibrated = useAppStore(s => s.isCalibrated);
  const calibrationProgress = useAppStore(s => s.calibrationProgress);
  const { requestPermission } = useOrientation();
  const [isInitializing, setIsInitializing] = useState(false);
  useEffect(() => {
    if (isCalibrated && mode === 'intro') {
      const timer = setTimeout(() => {
        setMode('skyview');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isCalibrated, mode, setMode]);
  const handleStart = async () => {
    setIsInitializing(true);
    await requestPermission();
  };
  return (
    <NightModeProvider>
      <div className="relative h-screen w-screen overflow-hidden bg-space-black">
        <motion.div
          className={cn("transition-all duration-1000", mode !== 'skyview' && "scale-105 blur-lg opacity-30")}
          animate={{ opacity: mode === 'intro' ? 0.2 : 1 }}
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
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(40px)' }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-space-black/70 backdrop-blur-md"
            >
              <DiamondGrid opacity={0.05} />
              <div className="max-w-2xl w-full py-8 md:py-12 text-center space-y-12 relative z-10">
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-nebula to-[#D14615] flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.4)]"
                  >
                    <Sparkles className="w-12 h-12 text-white" />
                  </motion.div>
                </div>
                {!isInitializing ? (
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-7xl md:text-9xl font-display font-bold text-starlight tracking-tight"
                      >
                        DIN<span className="text-nebula">A</span>LEDI
                      </motion.h1>
                      <p className="text-xl md:text-2xl text-starlight/60 font-light max-w-lg mx-auto leading-relaxed text-pretty">
                        A high-precision viewport into the ancestral sky.
                        Professional astronomy meets South African lore.
                      </p>
                    </div>
                    <Button
                      onClick={handleStart}
                      className="h-20 px-14 rounded-4xl bg-starlight text-space-black hover:bg-nebula hover:scale-105 transition-all duration-500 text-2xl font-bold group shadow-3xl animate-pulse"
                    >
                      Begin Observation
                      <ArrowRight className="ml-3 w-8 h-8 group-hover:translate-x-2 transition-transform" />
                    </Button>
                    <div className="pt-16 flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-starlight/20 uppercase tracking-[0.5em]">
                        <Globe className="w-3.5 h-3.5" />
                        Authenticated with Cloudflare Edge
                      </div>
                      <div className="text-[10px] font-mono text-starlight/10 uppercase tracking-widest">
                        Sesotho Starpoint Visual System v1.5 • Final Release
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12 animate-in fade-in zoom-in duration-1000">
                    <div className="flex flex-col items-center gap-8">
                      <div className="relative">
                        <Loader2 className="w-24 h-24 text-nebula animate-spin" strokeWidth={1} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 bg-nebula rounded-full animate-pulse shadow-[0_0_20px_rgba(234,179,8,1)]" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h2 className="text-4xl font-bold text-starlight tracking-tight">
                          {isCalibrated ? "Ready for Voyage" : "Precision Calibration"}
                        </h2>
                        <p className="text-starlight/40 font-mono text-sm uppercase tracking-[0.4em]">
                          {isCalibrated ? "Celestial sphere initialized" : "Neutralizing sensor bias • Keep steady"}
                        </p>
                      </div>
                    </div>
                    <div className="max-w-xs mx-auto w-full space-y-4">
                      <Progress value={calibrationProgress} className="h-1.5 bg-white/5" />
                      <div className="flex justify-between font-mono text-[11px] text-starlight/30 tabular-nums">
                        <span>SENSOR_STABILITY</span>
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