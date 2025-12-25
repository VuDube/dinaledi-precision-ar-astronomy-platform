import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useAppStore } from '@/stores/app-store';
import { DSO_CATALOG } from '@/data/dso-catalog';
import { getLunarPhase } from '@/lib/astronomy-math';
import { Sparkles, Moon, Telescope, ArrowUpRight, Compass } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
export function HighlightsPanel() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const simulationTime = useAppStore(s => s.simulationTime);
  const setSelectedDSO = useAppStore(s => s.setSelectedDSO);
  const moonInfo = getLunarPhase(simulationTime);
  const isOpen = mode === 'highlights';
  // Mock visibility filtering (In reality would use Alt-Az calculation)
  const visibleDSOs = DSO_CATALOG.filter(d => d.mag < 6.5);
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && setMode('skyview')}>
      <SheetContent side="left" className="w-full sm:max-w-md bg-space-black/95 border-starlight/10 text-starlight p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-starlight/10 bg-space-black">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-nebula/20 text-nebula">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <SheetTitle className="text-starlight text-xl">Tonight's Best</SheetTitle>
                <SheetDescription className="text-starlight/40 text-xs">Curated targets for optimal viewing.</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Moon Section */}
              <div className="glass-dark p-4 rounded-2xl border-nebula/20">
                <div className="flex items-center gap-3">
                  <Moon className="w-8 h-8 text-starlight" />
                  <div>
                    <h4 className="text-starlight font-bold">{moonInfo.name}</h4>
                    <p className="text-starlight/40 text-[10px] uppercase tracking-widest">
                      Illumination: {(moonInfo.phase * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              {/* DSOs Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-nebula text-[10px] font-bold uppercase tracking-widest">
                  <Telescope className="w-3 h-3" />
                  Deep Sky Highlights
                </div>
                <div className="grid gap-3">
                  {visibleDSOs.map(dso => (
                    <div key={dso.id} className="glass-dark p-4 rounded-2xl border-white/5 hover:border-nebula/30 transition-all group">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="outline" className="text-[8px] bg-nebula/10 text-nebula border-none mb-2">
                            {dso.type}
                          </Badge>
                          <h4 className="text-starlight font-bold">{dso.name}</h4>
                          <p className="text-starlight/40 text-[10px] font-mono mt-1">
                            MAG {dso.mag.toFixed(1)} • {dso.messier || dso.caldwell}
                          </p>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="rounded-full bg-white/5 group-hover:bg-nebula group-hover:text-space-black transition-all"
                          onClick={() => {
                            setSelectedDSO(dso);
                            setMode('skyview');
                          }}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}