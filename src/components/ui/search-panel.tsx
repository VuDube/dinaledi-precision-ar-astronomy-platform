import React, { useState, useMemo, useEffect } from 'react';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { useAppStore } from '@/stores/app-store';
import { STAR_CATALOG } from '@/data/star-catalog';
import { DSO_CATALOG } from '@/data/dso-catalog';
import { Star, Telescope, Sparkles, History, Mic } from 'lucide-react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
export function SearchPanel() {
  const isSearchOpen = useAppStore(s => s.isSearchOpen);
  const setSearchOpen = useAppStore(s => s.setSearchOpen);
  const setSelectedStar = useAppStore(s => s.setSelectedStar);
  const setSelectedDSO = useAppStore(s => s.setSelectedDSO);
  const setMode = useAppStore(s => s.setMode);
  const [recents, setRecents] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  useEffect(() => {
    if (isSearchOpen && !isListening) {
      // Small simulation of voice triggering
      // In production, this would use the Speech Recognition API
    }
  }, [isSearchOpen, isListening]);
  const culturalEntities = useMemo(() => {
    const stars = STAR_CATALOG.filter(s => s.culture).map(s => ({ ...s, searchType: 'star' }));
    const dsos = DSO_CATALOG.filter(d => d.culture).map(d => ({ ...d, searchType: 'dso' }));
    return [...stars, ...dsos];
  }, []);
  const handleSelect = (type: 'star' | 'dso', item: any) => {
    if (type === 'star') setSelectedStar(item);
    else setSelectedDSO(item);
    setRecents(prev => {
        const filtered = prev.filter(p => p.id !== item.id);
        return [{ ...item, searchType: type }, ...filtered].slice(0, 3);
    });
    setSearchOpen(false);
    setMode('skyview');
  };
  return (
    <CommandDialog open={isSearchOpen} onOpenChange={setSearchOpen}>
      <DialogTitle className="sr-only">Search the night sky</DialogTitle>
      <DialogDescription className="sr-only">Find stars and nebulae. Type or use voice command.</DialogDescription>
      <div className={cn(
        "bg-space-black/98 text-starlight border-nebula/20 backdrop-blur-2xl transition-colors duration-500",
        isListening && "border-red-500/50"
      )}>
        <div className="relative">
          <CommandInput
            placeholder={isListening ? "Listening for celestial objects..." : "Search by name, culture, or tag..."}
            className={cn("text-starlight h-14", isListening && "placeholder:text-red-500/50")}
          />
          <button 
            onClick={() => setIsListening(!isListening)}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-300",
              isListening ? "bg-red-500 text-white animate-pulse" : "text-starlight/20 hover:text-nebula"
            )}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
        <CommandList className="max-h-[400px] overflow-y-auto">
          <CommandEmpty>No celestial results found.</CommandEmpty>
          {isListening && (
            <div className="p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center animate-ping">
                  <Mic className="w-6 h-6 text-red-500" />
                </div>
              </div>
              <p className="text-red-500 text-xs font-mono uppercase tracking-widest animate-pulse">Awaiting Voice Input...</p>
            </div>
          )}
          {!isListening && (
            <>
              {recents.length > 0 && (
                <CommandGroup heading="Recent Discovery">
                  {recents.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleSelect(item.searchType, item)}
                      className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer rounded-lg m-1"
                    >
                      <History className="w-4 h-4 text-starlight/40" />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{item.localName || item.name}</span>
                        <span className="text-[10px] text-starlight/30 uppercase tracking-tighter">Last Viewed</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandGroup heading="Cultural Lore & Ancestral Entities">
                {culturalEntities.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item.searchType as any, item)}
                    className="flex items-center gap-3 p-3 hover:bg-nebula/10 cursor-pointer rounded-lg m-1 border border-transparent hover:border-nebula/20"
                  >
                    <Sparkles className="w-4 h-4 text-nebula" />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-nebula">{item.localName}</span>
                      <span className="text-[10px] text-starlight/40 uppercase tracking-wider">{item.culture} • {item.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </div>
    </CommandDialog>
  );
}