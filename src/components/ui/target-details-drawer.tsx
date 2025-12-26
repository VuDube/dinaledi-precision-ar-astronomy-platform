import React from 'react';
import { Drawer } from 'vaul';
import { useAppStore } from '@/stores/app-store';
import { DiamondGrid } from './sesotho-patterns';
import { motion } from 'framer-motion';
import { Telescope, MapPin, Globe, Sparkles, X, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
export function TargetDetailsDrawer() {
  const isDetailOpen = useAppStore(s => s.isDetailOpen);
  const setDetailOpen = useAppStore(s => s.setDetailOpen);
  const selectedStar = useAppStore(s => s.selectedStar);
  const selectedDSO = useAppStore(s => s.selectedDSO);
  const preferredLore = useAppStore(s => s.preferredLore);
  const setObserving = useAppStore(s => s.setObserving);
  const target = selectedStar || selectedDSO;
  if (!target) return null;
  const isDSO = 'type' in target;
  const culture = target.culture || "IAU Standard";
  const displayName = (preferredLore === 'western' ? target.name : target.localName) || target.name || target.id;
  return (
    <Drawer.Root open={isDetailOpen} onOpenChange={setDetailOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
        <Drawer.Content className="bg-space-black flex flex-col rounded-t-[32px] h-[85vh] fixed bottom-0 left-0 right-0 z-[101] border-t border-nebula/20 focus:outline-none overflow-hidden">
          <DiamondGrid opacity={0.03} />
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-starlight/10 my-4" />
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto no-scrollbar relative z-10">
            <header className="space-y-4 mb-8">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="bg-nebula/10 text-nebula border-none px-3 h-6 uppercase tracking-widest text-[10px] font-black">
                  {isDSO ? target.type : 'Celestial Star'}
                </Badge>
                <button onClick={() => setDetailOpen(false)} className="p-2 rounded-full bg-white/5 text-starlight/40">
                   <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-1">
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-4xl sm:text-5xl font-display font-black text-starlight tracking-tight leading-none"
                >
                  {displayName}
                </motion.h2>
                {target.localName && target.name !== target.localName && (
                  <p className="text-nebula/60 font-mono text-sm uppercase tracking-widest">
                    AKA {target.name}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-starlight/40 text-xs">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{culture} Lore</span>
                </div>
                {target.dist && (
                  <div className="flex items-center gap-2 text-starlight/40 text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{target.dist} Light Years</span>
                  </div>
                )}
              </div>
            </header>
            <section className="space-y-8">
              {target.lore && (
                <div className="glass-dark p-6 rounded-3xl border-nebula/10 relative overflow-hidden">
                  <Info className="absolute -top-4 -right-4 w-24 h-24 text-nebula/5 opacity-20" />
                  <h3 className="text-nebula text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Cultural Significance</h3>
                  <p className="text-starlight/80 text-lg leading-relaxed italic">
                    "{target.lore}"
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-dark p-5 rounded-2xl border-white/5 space-y-1">
                  <span className="text-[9px] font-mono text-starlight/30 uppercase tracking-widest">Magnitude</span>
                  <div className="text-starlight text-xl font-bold">{target.mag.toFixed(2)}</div>
                </div>
                <div className="glass-dark p-5 rounded-2xl border-white/5 space-y-1">
                  <span className="text-[9px] font-mono text-starlight/30 uppercase tracking-widest">Coordinates</span>
                  <div className="text-starlight text-sm font-mono">{target.ra.toFixed(2)}h / {target.dec.toFixed(2)}°</div>
                </div>
              </div>
              {isDSO && target.description && (
                <div className="space-y-3">
                  <h3 className="text-starlight/40 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Telescope className="w-3.5 h-3.5 text-nebula" />
                    Scientific Context
                  </h3>
                  <p className="text-starlight/60 text-sm leading-relaxed">
                    {target.description}
                  </p>
                </div>
              )}
            </section>
          </div>
          <footer className="p-6 sm:p-8 bg-space-black/80 backdrop-blur-xl border-t border-white/5">
            <Button 
              className="w-full h-16 rounded-2xl bg-nebula text-space-black hover:bg-nebula/90 font-black text-lg shadow-2xl transition-transform active:scale-95 flex items-center justify-center gap-3"
              onClick={() => {
                setDetailOpen(false);
                setObserving(true);
              }}
            >
              <MapPin className="w-6 h-6" />
              RECORD SIGHTING
            </Button>
          </footer>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}