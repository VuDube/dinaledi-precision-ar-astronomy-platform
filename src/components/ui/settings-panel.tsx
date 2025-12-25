import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useAppStore } from '@/stores/app-store';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings2, Eye, Compass, RotateCcw, MapPin, Sliders } from 'lucide-react';
import { useGPS } from '@/hooks/use-gps';
export function SettingsPanel() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const bortleScale = useAppStore(s => s.bortleScale);
  const autoBortle = useAppStore(s => s.autoBortle);
  const setBortleScale = useAppStore(s => s.setBortleScale);
  const setAutoBortle = useAppStore(s => s.setAutoBortle);
  const showConstellations = useAppStore(s => s.showConstellations);
  const toggleConstellations = useAppStore(s => s.toggleConstellations);
  const showGrid = useAppStore(s => s.showGrid);
  const toggleGrid = useAppStore(s => s.toggleGrid);
  const lat = useAppStore(s => s.latitude);
  const lon = useAppStore(s => s.longitude);
  const setCalibrated = useAppStore(s => s.setCalibrated);
  const gpsEnabled = useAppStore(s => s.gpsEnabled);
  const setGPSEnabled = useAppStore(s => s.setGPSEnabled);
  useGPS(); // Activate GPS tracking if needed
  const isOpen = mode === 'settings';
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && setMode('skyview')}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-space-black/95 border-starlight/10 text-starlight p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-starlight/10 bg-space-black">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-nebula/20 text-nebula"><Settings2 className="w-5 h-5" /></div>
              <div>
                <SheetTitle className="text-starlight text-xl">System Settings</SheetTitle>
                <SheetDescription className="text-starlight/40 text-xs">PWA Engine Configuration</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="flex-1 p-6 space-y-8 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-nebula text-[10px] font-bold uppercase tracking-widest"><MapPin className="w-3 h-3" /> Location & Environment</div>
              <div className="glass-dark p-4 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-starlight/80">GPS Tracking</Label>
                  <Switch checked={gpsEnabled} onCheckedChange={setGPSEnabled} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-starlight/80">Auto-Bortle Detection</Label>
                  <Switch checked={autoBortle} onCheckedChange={setAutoBortle} />
                </div>
                {!autoBortle && (
                  <div className="space-y-2">
                    <Label className="text-xs text-starlight/40">Manual Bortle: {bortleScale}</Label>
                    <Slider value={[bortleScale]} min={1} max={9} step={1} onValueChange={(v) => setBortleScale(v[0])} />
                  </div>
                )}
                <div className="pt-2 border-t border-white/5 font-mono text-[10px] text-starlight/30">
                  COORDS: {lat.toFixed(4)}, {lon.toFixed(4)}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-nebula text-[10px] font-bold uppercase tracking-widest"><Eye className="w-3 h-3" /> Visualization</div>
              <div className="glass-dark p-4 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-starlight/80">Constellations</Label>
                  <Switch checked={showConstellations} onCheckedChange={toggleConstellations} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-starlight/80">Equatorial Grid</Label>
                  <Switch checked={showGrid} onCheckedChange={toggleGrid} />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-nebula text-[10px] font-bold uppercase tracking-widest"><Compass className="w-3 h-3" /> Maintenance</div>
              <Button variant="outline" className="w-full bg-white/5 border-white/10 text-starlight rounded-xl h-12" onClick={() => { setCalibrated(false); setMode('intro'); }}>
                <RotateCcw className="w-4 h-4 mr-2" /> Restart Calibration Flow
              </Button>
            </div>
          </div>
          <div className="p-6 border-t border-starlight/10 text-center text-[10px] text-starlight/20 font-mono">DINALEDI PWA • PHASE 9 CORE</div>
        </div>
      </SheetContent>
    </Sheet>
  );
}