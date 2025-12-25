import React, { useState } from 'react';
import { StarScene } from '@/components/star-map/StarScene';
import { HUDOverlay } from '@/components/ui/hud-overlay';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrientation } from '@/hooks/use-orientation';
export function HomePage() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const setCalibrated = useAppStore(s => s.setCalibrated);
  const { requestPermission } = useOrientation();
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState(0);
  const handleStart = async () => {
    setIsInitializing(true);
    // 1. Request Sensors
    const granted = await requestPermission();
    // 2. Calibration Simulation
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
      <StarScene />
      <AnimatePresence>
        {mode === 'intro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-space-black/60 backdrop-blur-[4px]"
          >
            <div className="max-w-2xl w-full space-y-12 text-center">
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-nebula to-[#D14615] flex items-center justify-center shadow-2xl"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
              </div>
              {!isInitializing ? (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <motion.h1 className="text-7xl font-display font-bold text-starlight tracking-tight">
                      DIN<span className="text-nebula">A</span>LEDI
                    </motion.h1>
                    <p className="text-xl text-starlight/60 font-light max-w-lg mx-auto">
                      Precise AR astronomy for the southern hemisphere. 
                      Calibrating to your local horizon.
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
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-nebula animate-spin" />
                    <h2 className="text-2xl font-bold text-starlight">Aligning Sensors</h2>
                    <p className="text-starlight/40 font-mono text-sm uppercase tracking-widest">
                      Zeroing Gyroscope & Accelerometer
                    </p>
                  </div>
                  <div className="max-w-xs mx-auto w-full">
                    <Progress value={progress} className="h-2 bg-white/10" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <HUDOverlay />
    </div>
  );
}