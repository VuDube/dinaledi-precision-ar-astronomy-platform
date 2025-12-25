import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/stores/app-store';
import { useObservationStore } from '@/stores/observation-store';
import { Star, Save, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
export function ObservationForm() {
  const selectedStar = useAppStore(s => s.selectedStar);
  const selectedDSO = useAppStore(s => s.selectedDSO);
  const setSelectedStar = useAppStore(s => s.setSelectedStar);
  const setSelectedDSO = useAppStore(s => s.setSelectedDSO);
  const isObserving = useAppStore(s => s.isObserving);
  const setObserving = useAppStore(s => s.setObserving);
  const addObservation = useObservationStore(s => s.addObservation);
  const [notes, setNotes] = useState('');
  const [seeing, setSeeing] = useState(3);
  const [isSaving, setIsSaving] = useState(false);
  const activeTarget = selectedStar || selectedDSO;
  const handleClose = () => {
    setObserving(false);
    setSelectedStar(null);
    setSelectedDSO(null);
    setNotes('');
  };
  const handleSave = async () => {
    if (!activeTarget) return;
    setIsSaving(true);
    try {
      const location = { lat: -26.20, lng: 28.04 };
      await addObservation({
        id: crypto.randomUUID(),
        starId: activeTarget.id,
        starName: activeTarget.name || 'Unknown Object',
        timestamp: new Date().toISOString(),
        notes,
        seeing,
        location,
        syncStatus: 'local',
      });
      handleClose();
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Dialog open={isObserving} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px] bg-space-black/95 border-nebula/20 text-starlight">
        <DialogHeader>
          <div className="flex items-center gap-2 text-nebula text-[10px] font-bold uppercase tracking-widest mb-1">
            <Info className="w-3 h-3" />
            New Observation
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-starlight">
            {activeTarget?.name || 'Celestial Object'}
          </DialogTitle>
          <DialogDescription className='text-sm font-medium text-starlight/60 mb-6'>
            Log your observation details for {activeTarget?.name || 'celestial object'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-starlight/40 uppercase tracking-tighter">Seeing Conditions</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => setSeeing(i)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all border",
                    seeing >= i
                      ? "bg-nebula text-space-black border-nebula shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                      : "bg-white/5 text-starlight/20 border-white/10"
                  )}
                >
                  <Star className={cn("w-5 h-5", seeing >= i && "fill-current")} />
                </button>
              ))}
            </div>
            <p className="text-[10px] text-starlight/20 italic">1: Poor (Turbulent) • 5: Perfect (Steady)</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-starlight/40 uppercase tracking-tighter">Notes</label>
            <Textarea
              placeholder="What do you see through the lens? Describe the magnitude, color index, or surrounding context..."
              className="bg-white/5 border-white/10 text-starlight placeholder:text-starlight/20 min-h-[120px] rounded-xl focus:ring-nebula focus:border-nebula"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleClose} className="flex-1 text-starlight/60 hover:text-starlight rounded-xl">
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !notes.trim()}
            className="flex-1 bg-nebula text-space-black hover:bg-nebula/80 font-bold rounded-xl shadow-lg"
          >
            {isSaving ? 'Syncing...' : <><Save className="w-4 h-4 mr-2" /> Log Sighting</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}