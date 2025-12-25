import React, { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useObservationStore } from '@/stores/observation-store';
import { useAppStore } from '@/stores/app-store';
import { Calendar, MapPin, CloudSync, CheckCircle2, History } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
export function ObservationLog() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const observations = useObservationStore(s => s.observations);
  const loadObservations = useObservationStore(s => s.loadObservations);
  const syncPending = useObservationStore(s => s.syncPending);
  useEffect(() => {
    loadObservations();
    const interval = setInterval(syncPending, 30000);
    return () => clearInterval(interval);
  }, [loadObservations, syncPending]);
  const isOpen = mode === 'log';
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && setMode('skyview')}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-space-black/95 border-starlight/10 text-starlight p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-starlight/10 bg-space-black">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-nebula/20 text-nebula">
                <History className="w-5 h-5" />
              </div>
              <div>
                <SheetTitle className="text-starlight text-xl">Observation Journal</SheetTitle>
                <SheetDescription className="text-starlight/40 text-xs">
                  Your celestial journey, synced across the edge.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {observations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-starlight/5 flex items-center justify-center">
                    <History className="w-8 h-8 text-starlight/20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-starlight/60 font-medium">No observations yet</p>
                    <p className="text-starlight/30 text-xs">Start exploring the stars to fill your log.</p>
                  </div>
                </div>
              ) : (
                observations.map((obs) => (
                  <div key={obs.id} className="glass-dark border-starlight/5 p-4 rounded-2xl space-y-3 hover:border-nebula/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-nebula font-bold text-sm uppercase tracking-wider">{obs.starName}</h4>
                        <div className="flex items-center gap-2 text-starlight/40 text-[10px] mt-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(obs.timestamp), 'PPP p')}
                        </div>
                      </div>
                      {obs.syncStatus === 'synced' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500/50" />
                      ) : (
                        <CloudSync className="w-4 h-4 text-nebula/50 animate-pulse" />
                      )}
                    </div>
                    <p className="text-starlight/80 text-sm leading-relaxed line-clamp-3 italic">
                      "{obs.notes}"
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant="outline" className="bg-starlight/5 border-none text-[10px] text-starlight/60 h-5">
                        Seeing: {obs.seeing}/5
                      </Badge>
                      <Badge variant="outline" className="bg-starlight/5 border-none text-[10px] text-starlight/60 h-5 gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        {obs.location.lat.toFixed(2)}, {obs.location.lng.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}