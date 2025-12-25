import React from 'react';
import { StarScene } from '@/components/star-map/StarScene';
import { HUDOverlay } from '@/components/ui/hud-overlay';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export function HomePage() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-space-black">
      {/* Background Star Scene (Always active) */}
      <StarScene />
      {/* UI Overlay Layer */}
      <AnimatePresence>
        {mode === 'intro' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-space-black/40 backdrop-blur-[2px]"
          >
            <div className="max-w-2xl w-full space-y-12 text-center">
              <div className="flex justify-center">
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-nebula to-[#D14615] flex items-center justify-center shadow-2xl"
                >
                  <Sparkles className="w-10 h-10 text-white animate-pulse" />
                </motion.div>
              </div>
              <div className="space-y-4">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-7xl font-display font-bold text-starlight tracking-tight"
                >
                  DIN<span className="text-nebula">A</span>LEDI
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-starlight/60 font-light tracking-wide max-w-lg mx-auto leading-relaxed"
                >
                  Navigate the southern skies through the lens of precision AR astronomy. 
                  Synchronized with the cosmos.
                </motion.p>
              </div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-6"
              >
                <Button 
                  onClick={() => setMode('skyview')}
                  className="h-14 px-8 rounded-2xl bg-starlight text-space-black hover:bg-nebula hover:scale-105 transition-all duration-300 text-lg font-bold group"
                >
                  Begin Observation
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <div className="flex items-center gap-4 text-xs font-mono text-starlight/40 uppercase tracking-[0.2em]">
                  <span>V1.0 Stable</span>
                  <span className="w-1 h-1 rounded-full bg-starlight/20" />
                  <span>Hipparcos Engine Ready</span>
                </div>
              </motion.div>
            </div>
            <footer className="absolute bottom-10 text-starlight/30 text-[10px] uppercase tracking-[0.3em]">
              Precision Crafted for South African Skies
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main App UI */}
      <HUDOverlay />
    </div>
  );
}