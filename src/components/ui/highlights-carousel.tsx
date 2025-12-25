import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/app-store';
import { DSO_CATALOG } from '@/data/dso-catalog';
import { STAR_CATALOG } from '@/data/star-catalog';
import { Sparkles, ArrowRight, Telescope, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
export function HighlightsCarousel() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const setSelectedDSO = useAppStore(s => s.setSelectedDSO);
  const setSelectedStar = useAppStore(s => s.setSelectedStar);
  // Combine and sort by magnitude
  const items = React.useMemo(() => {
    const combined = [
      ...DSO_CATALOG.map(d => ({ ...d, typeKey: 'dso' as const })),
      ...STAR_CATALOG.filter(s => s.mag < 2.0).map(s => ({ ...s, typeKey: 'star' as const }))
    ].sort((a, b) => a.mag - b.mag);
    return combined.slice(0, 12);
  }, []);
  if (mode !== 'highlights') return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-[100px] left-0 right-0 z-40 pointer-events-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-nebula">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Tonight's Prime Targets</span>
          </div>
          <button 
            onClick={() => setMode('skyview')}
            className="text-[9px] font-mono text-starlight/40 hover:text-starlight uppercase"
          >
            Close Viewer [ESC]
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
          {items.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.typeKey === 'dso') setSelectedDSO(item as any);
                else setSelectedStar(item as any);
                setMode('skyview');
              }}
              className="flex-shrink-0 w-64 snap-start glass-dark border-nebula/10 p-5 rounded-3xl cursor-pointer hover:border-nebula/40 transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-3">
                <Badge variant="outline" className="bg-nebula/10 text-nebula border-none text-[8px] h-4">
                  {'type' in item ? item.type : 'Star'}
                </Badge>
                <div className="text-[9px] font-mono text-starlight/30 uppercase">MAG {item.mag.toFixed(1)}</div>
              </div>
              <h4 className="text-starlight font-bold text-lg mb-1 group-hover:text-nebula transition-colors truncate">
                {item.localName || item.name}
              </h4>
              <p className="text-starlight/40 text-[10px] uppercase tracking-widest mb-4">
                {item.name || `HIP ${item.id}`}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-starlight/60">
                  <Telescope className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase">View Target</span>
                </div>
                <ArrowRight className="w-4 h-4 text-nebula opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Info className="w-12 h-12" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}