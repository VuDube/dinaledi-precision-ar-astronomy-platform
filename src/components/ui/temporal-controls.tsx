import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Clock, RotateCcw, Sparkles } from 'lucide-react';

export function TemporalControls() {
  const simulationTime = useAppStore(s => s.simulationTime);
  const setSimulationTime = useAppStore(s => s.setSimulationTime);
  const setTimeSpeed = useAppStore(s => s.setTimeSpeed);
  const mode = useAppStore(s => s.mode);
  const currentYear = new Date().getFullYear();
  const yearsOffset = simulationTime ? simulationTime.getFullYear() - currentYear : 0;
  const handleYearChange = (val: number[]) => {
    const newDate = new Date(new Date().getTime() + val[0] * 31557600000);
    setSimulationTime(newDate);
  };
  const resetTime = () => {
    setSimulationTime(new Date());
    setTimeSpeed(1);
  };
  if (mode !== 'skyview' || !simulationTime) return null;
  const isAlignmentPossible = Math.abs(yearsOffset) < 5;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed left-6 top-24 z-30 flex flex-col gap-3 pointer-events-none w-48"
    >
      <div className="glass-dark border-starlight/5 p-4 rounded-3xl flex flex-col gap-4 pointer-events-auto backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-nebula">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Epoch</span>
          </div>
          {isAlignmentPossible && <Sparkles className="w-3 h-3 text-nebula animate-pulse" />}
        </div>
        <div className="space-y-1">
          <div className="text-starlight text-2xl font-mono font-bold tabular-nums">
            {simulationTime.getFullYear()}
          </div>
          <div className="text-starlight/40 text-[9px] uppercase font-mono tracking-tighter">
            {simulationTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
        </div>
        <div className="pt-1">
          <Slider
            value={[yearsOffset]}
            min={-100}
            max={100}
            step={1}
            onValueChange={handleYearChange}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-[8px] text-starlight/20 mt-2 font-mono">
            <span>{currentYear - 100}</span>
            <span>PRE_J2000</span>
            <span>{currentYear}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 bg-white/5 hover:bg-white/10 text-starlight text-[9px] rounded-xl font-bold uppercase"
          onClick={resetTime}
        >
          <RotateCcw className="w-3 h-3 mr-2" /> Reset
        </Button>
      </div>
    </motion.div>
  );
}