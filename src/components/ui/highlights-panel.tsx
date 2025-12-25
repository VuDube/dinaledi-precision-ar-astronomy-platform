import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useAppStore } from '@/stores/app-store';
import { DSO_CATALOG } from '@/data/dso-catalog';
import { getLunarPhase, getSunPosition } from '@/lib/astronomy-math';
import { Sparkles, Moon, Telescope, ArrowUpRight, Clock } from 'lucide-react';
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
  // Sort DSOs by magnitude (brightness) for better curation
  const visibleDSOs = DSO_CATALOG.filter(d => d.mag < 7.0).sort((a, b) => a.mag - b.mag);
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
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Moon Section */}
              <div className="glass-dark p-4 rounded-2xl border-nebula/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-8 h-8 text-starlight" />
                  <div>
                    <h4 className="text-starlight font-bold">{moonInfo.name}</h4>
                    <p className="text-starlight/40 text-[10px] uppercase tracking-widest">
                      Illumination: {(moonInfo.phase * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-nebula border-nebula/20">
                  {moonInfo.phase > 0.5 ? 'High Light' : 'Low Light'}
                </Badge>
              </div>
              {/* DSOs Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-nebula text-[10px] font-bold uppercase tracking-widest">
                    <Telescope className="w-3 h-3" />
                    Deep Sky Highlights
                  </div>
                  <Badge variant="outline" className="text-[8px] text-starlight/30 uppercase border-starlight/10">
                    Hipparcos Ref
                  </Badge>
                </div>
                <div className="grid gap-4">
                  {visibleDSOs.map(dso => (
                    <div key={dso.id} className="glass-dark p-4 rounded-2xl border-white/5 hover:border-nebula/30 transition-all group">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-[8px] bg-nebula/10 text-nebula border-none h-4">
                              {dso.type}
                            </Badge>
                          </div>
                          <h4 className="text-starlight font-bold text-lg">{dso.name}</h4>
                          <div className="flex items-center gap-3">
                            <p className="text-starlight/40 text-[10px] font-mono">
                              MAG {dso.mag.toFixed(1)} �� {dso.messier || dso.caldwell}
                            </p>
                            <div className="flex items-center gap-1 text-starlight/20 text-[10px]">
                              <Clock className="w-2 h-2" />
                              <span>21:00 Peak</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full bg-white/5 group-hover:bg-nebula group-hover:text-space-black transition-all h-10 w-10"
                          onClick={() => {
                            setSelectedDSO(dso);
                            setMode('skyview');
                          }}
                        >
                          <ArrowUpRight className="w-5 h-5" />
                        </Button>
                      </div>
                      {dso.description && (
                        <p className="text-starlight/40 text-[11px] mt-3 line-clamp-2 leading-relaxed italic">
                          {dso.description}
                        </p>
                      )}
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