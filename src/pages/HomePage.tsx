import React, { useState, useEffect } from 'react';
import { StarScene } from '@/components/star-map/StarScene';
import { HUDOverlay } from '@/components/ui/hud-overlay';
import { ObservationLog } from '@/components/ui/observation-log';
import { ObservationForm } from '@/components/ui/observation-form';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowRight, Loader2, Triangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrientation } from '@/hooks/use-orientation';
import { cn } from '@/lib/utils';
export function HomePage() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const setCalibrated = useAppStore(s => s.setCalibrated);
  const { requestPermission } = useOrientation();
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState(0);
  const handleStart = async () => {
    setIsInitializing(true);
    const granted = await requestPermission();
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setCalibrated(true);
        setMode('skyview');
      }
    }, 100);
  };
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-space-black">
      {/* 3D Core - Always renders behind UI */}
      <div className={cn("transition-all duration-1000", mode !== 'skyview' && "scale-105 blur-md opacity-40")}>
        <StarScene />
      </div>
      {/* Decorative Background for Intro */}
      {mode === 'intro' && (
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-12 p-12">
            {Array.from({ length: 32 }).map((_, i) => (
              <Triangle key={i} className="text-nebula w-12 h-12 rotate-180" strokeWidth={0.5} />
            ))}
          </div>
        </div>
      )}
      {/* HUD System Overlay */}
      <HUDOverlay />
      {/* Observation Overlays */}
      <ObservationLog />
      <ObservationForm />
      <AnimatePresence>
        {mode === 'intro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full py-8 md:py-12 text-center space-y-12">
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-nebula to-[#D14615] flex items-center justify-center shadow-2xl shadow-nebula/20"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
              </div>
              {!isInitializing ? (
                <div className="space-y-10">
                  <div className="space-y-4">
                    <motion.h1 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-7xl md:text-8xl font-display font-bold text-starlight tracking-tight"
                    >
                      DIN<span className="text-nebula">A</span>LEDI
                    </motion.h1>
                    <p className="text-xl text-starlight/60 font-light max-w-lg mx-auto leading-relaxed">
                      Precision AR astronomy for the southern hemisphere.
                      A digital viewport into the ancestral sky.
                    </p>
                  </div>
                  <Button
                    onClick={handleStart}
                    className="h-16 px-10 rounded-2xl bg-starlight text-space-black hover:bg-nebula hover:scale-105 transition-all duration-300 text-xl font-bold group shadow-xl"
                  >
                    Begin Observation
                    <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-12 animate-in fade-in zoom-in duration-700">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-nebula animate-spin" strokeWidth={1.5} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-nebula rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-starlight tracking-tight">Zero-Motion Calibration</h2>
                      <p className="text-starlight/40 font-mono text-xs uppercase tracking-[0.3em]">
                        Keep device steady on a flat surface
                      </p>
                    </div>
                  </div>
                  <div className="max-w-xs mx-auto w-full space-y-2">
                    <Progress value={progress} className="h-1 bg-white/10" />
                    <div className="flex justify-between font-mono text-[10px] text-starlight/20">
                      <span>STABILITY_CHECK</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute bottom-12 text-center space-y-2 opacity-30">
              <div className="flex justify-center gap-4">
                <Triangle className="w-4 h-4 text-nebula" strokeWidth={1} />
                <Triangle className="w-4 h-4 text-nebula" strokeWidth={1} />
                <Triangle className="w-4 h-4 text-nebula" strokeWidth={1} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}