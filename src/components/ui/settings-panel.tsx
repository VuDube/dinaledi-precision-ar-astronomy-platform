import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useAppStore } from '@/stores/app-store';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings2, Sliders, Eye, Compass, RotateCcw } from 'lucide-react';
export function SettingsPanel() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const bortleScale = useAppStore(s => s.bortleScale);
  const setBortleScale = useAppStore(s => s.setBortleScale);
  const showConstellations = useAppStore(s => s.showConstellations);
  const toggleConstellations = useAppStore(s => s.toggleConstellations);
  const showConstellationLabels = useAppStore(s => s.showConstellationLabels);
  const toggleConstellationLabels = useAppStore(s => s.toggleConstellationLabels);
  const showGrid = useAppStore(s => s.showGrid);
  const toggleGrid = useAppStore(s => s.toggleGrid);
  const setCalibrated = useAppStore(s => s.setCalibrated);
  const getBortleDescription = (scale: number) => {
    if (scale <= 2) return "Excellent Dark Sky";
    if (scale <= 4) return "Rural/Suburban Transition";
    if (scale <= 6) return "Suburban/Bright Sky";
    return "Inner City (Extreme Pollution)";
  };
  const isOpen = mode === 'settings';
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && setMode('skyview')}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-space-black/95 border-starlight/10 text-starlight p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-starlight/10 bg-space-black">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-nebula/20 text-nebula">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <SheetTitle className="text-starlight text-xl">System Settings</SheetTitle>
                <SheetDescription className="text-starlight/40 text-xs">
                  Configure your celestial viewport.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="flex-1 p-6 space-y-8 overflow-y-auto">
            {/* View Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-nebula text-[10px] font-bold uppercase tracking-widest">
                <Eye className="w-3 h-3" />
                Visualization
              </div>
              <div className="space-y-4 glass-dark p-4 rounded-2xl border-white/5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="constellations" className="text-starlight/80">Show Constellations</Label>
                  <Switch id="constellations" checked={showConstellations} onCheckedChange={toggleConstellations} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="labels" className="text-starlight/80">Culture Labels</Label>
                  <Switch id="labels" checked={showConstellationLabels} onCheckedChange={toggleConstellationLabels} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="grid" className="text-starlight/80">Celestial Grid</Label>
                  <Switch id="grid" checked={showGrid} onCheckedChange={toggleGrid} />
                </div>
              </div>
            </div>
            {/* Bortle Scale */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-nebula text-[10px] font-bold uppercase tracking-widest">
                <Sliders className="w-3 h-3" />
                Light Pollution (Bortle Scale)
              </div>
              <div className="glass-dark p-4 rounded-2xl border-white/5 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-starlight/40">Class {bortleScale}</span>
                    <span className="text-nebula">{getBortleDescription(bortleScale)}</span>
                  </div>
                  <Slider
                    value={[bortleScale]}
                    min={1}
                    max={9}
                    step={1}
                    onValueChange={(val) => setBortleScale(val[0])}
                    className="py-4"
                  />
                  <p className="text-[10px] text-starlight/20 italic">
                    Adjusts the visible star magnitude limit based on your local sky quality.
                  </p>
                </div>
              </div>
            </div>
            {/* Sensors */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-nebula text-[10px] font-bold uppercase tracking-widest">
                <Compass className="w-3 h-3" />
                Sensor Calibration
              </div>
              <div className="glass-dark p-4 rounded-2xl border-white/5">
                <Button 
                  variant="outline" 
                  className="w-full bg-white/5 border-white/10 text-starlight hover:bg-white/10 hover:text-nebula rounded-xl gap-2 h-12"
                  onClick={() => {
                    setCalibrated(false);
                    setMode('intro');
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart Calibration Flow
                </Button>
                <p className="text-[10px] text-starlight/20 mt-3 text-center">
                  Use this if your compass heading or pitch feels inaccurate.
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-starlight/10 bg-space-black/50">
            <div className="text-[10px] text-center text-starlight/20 font-mono">
              DINALEDI PWA v1.0.4 • PRECISION AR ENGINE
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}