import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Clock, Rewind, FastForward, RotateCcw } from 'lucide-react';
import { format, addYears, startOfToday } from 'date-fns';
export function TemporalControls() {
  const simulationTime = useAppStore(s => s.simulationTime);
  const setSimulationTime = useAppStore(s => s.setSimulationTime);
  const timeSpeed = useAppStore(s => s.timeSpeed);
  const setTimeSpeed = useAppStore(s => s.setTimeSpeed);
  const mode = useAppStore(s => s.mode);
  const yearsOffset = simulationTime.getFullYear() - new Date().getFullYear();
  const handleYearChange = (val: number[]) => {
    const newDate = addYears(new Date(), val[0]);
    setSimulationTime(newDate);
  };
  const resetTime = () => {
    setSimulationTime(new Date());
    setTimeSpeed(1);
  };
  if (mode === 'intro') return null;
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed left-6 top-32 z-30 flex flex-col gap-4 pointer-events-none"
    >
      <div className="glass p-4 rounded-2xl flex flex-col gap-4 pointer-events-auto min-w-[200px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-nebula">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Epoch</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-starlight/40" onClick={resetTime}>
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
        <div className="space-y-1">
          <div className="text-starlight text-xl font-mono font-bold">
            {format(simulationTime, 'yyyy')}
          </div>
          <div className="text-starlight/40 text-[10px] uppercase font-mono">
            {format(simulationTime, 'MMM dd, HH:mm')}
          </div>
        </div>
        <div className="pt-2">
          <Slider 
            value={[yearsOffset]} 
            min={-100} 
            max={100} 
            step={1} 
            onValueChange={handleYearChange}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-[8px] text-starlight/20 mt-2 font-mono">
            <span>-100Y</span>
            <span>J2000_REF</span>
            <span>+100Y</span>
          </div>
        </div>
        <div className="flex gap-2 border-t border-starlight/5 pt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 h-8 bg-starlight/5 hover:bg-starlight/10 text-starlight text-[10px]"
            onClick={() => setSimulationTime(startOfToday())}
          >
            Midnight
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 h-8 bg-starlight/5 hover:bg-starlight/10 text-starlight text-[10px]"
            onClick={() => setSimulationTime(new Date())}
          >
            Present
          </Button>
        </div>
      </div>
    </motion.div>
  );
}