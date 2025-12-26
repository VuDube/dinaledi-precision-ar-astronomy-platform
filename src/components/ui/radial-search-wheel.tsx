import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/app-store';
import { Search, Sparkles, Book, Target, X } from 'lucide-react';
import { DiamondGrid } from '@/components/ui/sesotho-patterns';
import { cn } from '@/lib/utils';
interface RadialButton {
  id: string;
  icon: React.ElementType;
  label: string;
  action: () => void;
}
export function RadialSearchWheel() {
  const isRadialOpen = useAppStore(s => s.isRadialOpen);
  const setRadialOpen = useAppStore(s => s.setRadialOpen);
  const setSearchOpen = useAppStore(s => s.setSearchOpen);
  const setMode = useAppStore(s => s.setMode);
  const selectedStar = useAppStore(s => s.selectedStar);
  const selectedDSO = useAppStore(s => s.selectedDSO);
  const buttons: RadialButton[] = [
    { 
      id: 'search', 
      icon: Search, 
      label: 'Search', 
      action: () => { setSearchOpen(true); setRadialOpen(false); } 
    },
    { 
      id: 'highlights', 
      icon: Sparkles, 
      label: 'Best Tonight', 
      action: () => { setMode('highlights'); setRadialOpen(false); } 
    },
    { 
      id: 'log', 
      icon: Book, 
      label: 'Manual Log', 
      action: () => { setMode('log'); setRadialOpen(false); } 
    },
    { 
      id: 'target', 
      icon: Target, 
      label: 'Target Info', 
      action: () => { setRadialOpen(false); } 
    },
  ];
  const radius = 90;
  return (
    <AnimatePresence>
      {isRadialOpen && (
        <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-space-black/60 backdrop-blur-sm"
            onClick={() => setRadialOpen(false)}
          />
          <div className="relative w-64 h-64 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="absolute inset-0 rounded-full border border-nebula/20 flex items-center justify-center bg-black/40 shadow-[0_0_50px_rgba(234,179,8,0.1)]"
            >
              <DiamondGrid opacity={0.1} />
            </motion.div>
            {buttons.map((btn, i) => {
              const angle = (i * (360 / buttons.length) - 90) * (Math.PI / 180);
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              return (
                <motion.button
                  key={btn.id}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{ opacity: 1, x, y }}
                  exit={{ opacity: 0, x: 0, y: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={btn.action}
                  className="absolute w-14 h-14 glass-dark border-nebula/30 rounded-full flex flex-col items-center justify-center shadow-xl group"
                >
                  <btn.icon className="w-5 h-5 text-nebula" />
                  <span className="text-[7px] font-bold uppercase tracking-widest text-starlight mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {btn.label}
                  </span>
                </motion.button>
              );
            })}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setRadialOpen(false)}
              className="relative z-10 w-12 h-12 bg-nebula text-space-black rounded-full flex items-center justify-center shadow-2xl active:scale-90"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}