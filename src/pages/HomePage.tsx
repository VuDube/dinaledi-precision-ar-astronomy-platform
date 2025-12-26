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
      }, 1000);
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
          className={cn("transition-all duration-1000", mode !== 'skyview' && "scale-105 blur-md opacity-40")}
          animate={{ opacity: mode === 'intro' ? 0.3 : 1 }}
        >
          <StarScene />
        </motion.div>
        {mode === 'intro' && (
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-12 p-12">
              {Array.from({ length: 32 }).map((_, i) => (
                <Triangle key={i} className="text-nebula w-12 h-12 rotate-180" strokeWidth={0.5} />
              ))}
            </div>
          </div>
        )}
        <HUDOverlay />
        <ObservationLog />
        <ObservationForm />
        <AnimatePresence>
          {mode === 'intro' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(30px)' }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-space-black/60 backdrop-blur-sm"
            >
              <div className="max-w-2xl w-full py-8 md:py-12 text-center space-y-12">
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-nebula to-[#D14615] flex items-center justify-center shadow-2xl shadow-nebula/30"
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
                        High-precision AR viewport into the ancestral sky.
                        Professional astronomy meets Southern African lore.
                      </p>
                    </div>
                    <Button
                      onClick={handleStart}
                      className="h-18 px-12 rounded-3xl bg-starlight text-space-black hover:bg-nebula hover:scale-105 transition-all duration-500 text-2xl font-bold group shadow-2xl"
                    >
                      Begin Observation
                      <ArrowRight className="ml-3 w-7 h-7 group-hover:translate-x-2 transition-transform" />
                    </Button>
                    <div className="pt-12 flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-starlight/20 uppercase tracking-[0.4em]">
                        <Globe className="w-3 h-3" />
                        Built with Cloudflare Edge
                      </div>
                      <div className="text-[9px] font-mono text-starlight/10 uppercase tracking-widest">
                        Sesotho Starpoint Visual System v1.4
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12 animate-in fade-in zoom-in duration-1000">
                    <div className="flex flex-col items-center gap-8">
                      <div className="relative">
                        <Loader2 className="w-20 h-20 text-nebula animate-spin" strokeWidth={1} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3 h-3 bg-nebula rounded-full animate-pulse shadow-glow" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h2 className="text-3xl font-bold text-starlight tracking-tight">
                          {isCalibrated ? "Ready for Voyage" : "Precision Calibration"}
                        </h2>
                        <p className="text-starlight/40 font-mono text-xs uppercase tracking-[0.4em]">
                          {isCalibrated ? "Celestial sphere initialized" : "Neutralizing sensor bias • Keep steady"}
                        </p>
                      </div>
                    </div>
                    <div className="max-w-xs mx-auto w-full space-y-3">
                      <Progress value={calibrationProgress} className="h-1 bg-white/5" />
                      <div className="flex justify-between font-mono text-[10px] text-starlight/30 tabular-nums">
                        <span>STABILITY_OFFSET</span>
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