import React, { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useObservationStore } from '@/stores/observation-store';
import { useAppStore } from '@/stores/app-store';
import { Calendar, MapPin, Cloud, RefreshCcw, History, CloudUpload } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
export function ObservationLog() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const observations = useObservationStore(s => s.observations);
  const loadObservations = useObservationStore(s => s.loadObservations);
  const syncPending = useObservationStore(s => s.syncPending);
  const isSyncing = useObservationStore(s => s.isSyncing);
  const pendingCount = useObservationStore(s => s.pendingCount);
  useEffect(() => {
    loadObservations();
    const interval = setInterval(syncPending, 30000);
    return () => clearInterval(interval);
  }, []);
  const isOpen = mode === 'log';
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && setMode('skyview')}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-space-black/95 border-starlight/10 text-starlight p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-starlight/10 bg-space-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-nebula/20 text-nebula">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <SheetTitle className="text-starlight text-xl">Journal</SheetTitle>
                  <SheetDescription className="text-starlight/40 text-[10px] uppercase tracking-widest font-mono">
                    {pendingCount > 0 ? `${pendingCount} Local Observations` : 'Encrypted & Synced'}
                  </SheetDescription>
                </div>
              </div>
              {pendingCount > 0 && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => syncPending()} 
                  disabled={isSyncing}
                  className="bg-nebula/10 border-nebula/20 text-nebula h-8 text-[10px] font-bold"
                >
                  <CloudUpload className={cn("w-3 h-3 mr-2", isSyncing && "animate-bounce")} />
                  SYNC NOW
                </Button>
              )}
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
                    <p className="text-starlight/60 font-medium text-sm">No observations yet</p>
                    <p className="text-starlight/30 text-[10px] uppercase tracking-widest">Start exploring the stars</p>
                  </div>
                </div>
              ) : (
                observations.map((obs) => (
                  <div key={obs.id} className="glass-dark border-starlight/5 p-4 rounded-2xl space-y-3 hover:border-nebula/30 transition-all hover:scale-[1.01] duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-nebula font-bold text-sm uppercase tracking-wider">{obs.starName}</h4>
                        <div className="flex items-center gap-2 text-starlight/40 text-[10px] mt-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {new Date(obs.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                      </div>
                      {obs.syncStatus === 'synced' ? (
                        <Cloud className="w-4 h-4 text-green-500/50" />
                      ) : (
                        <RefreshCcw className="w-4 h-4 text-nebula/50 animate-spin" />
                      )}
                    </div>
                    <p className="text-starlight/80 text-sm leading-relaxed line-clamp-3 italic font-serif">
                      "{obs.notes}"
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant="outline" className="bg-starlight/5 border-none text-[10px] text-starlight/60 h-5">
                        SEEING {obs.seeing}/5
                      </Badge>
                      <Badge variant="outline" className="bg-starlight/5 border-none text-[10px] text-starlight/60 h-5 gap-1 font-mono">
                        <MapPin className="w-2.5 h-2.5" />
                        {obs.location.lat.toFixed(1)}° {obs.location.lng.toFixed(1)}°
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