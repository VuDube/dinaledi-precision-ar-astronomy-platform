import React, { useState, useMemo } from 'react';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { useAppStore } from '@/stores/app-store';
import { STAR_CATALOG } from '@/data/star-catalog';
import { DSO_CATALOG } from '@/data/dso-catalog';
import { Star, Telescope, Sparkles, History } from 'lucide-react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
export function SearchPanel() {
  const isSearchOpen = useAppStore(s => s.isSearchOpen);
  const setSearchOpen = useAppStore(s => s.setSearchOpen);
  const setSelectedStar = useAppStore(s => s.setSelectedStar);
  const setSelectedDSO = useAppStore(s => s.setSelectedDSO);
  const setMode = useAppStore(s => s.setMode);
  const [recents, setRecents] = useState<any[]>([]);
  const culturalEntities = useMemo(() => {
    const stars = STAR_CATALOG.filter(s => s.culture).map(s => ({ ...s, searchType: 'star' }));
    const dsos = DSO_CATALOG.filter(d => d.culture).map(d => ({ ...d, searchType: 'dso' }));
    return [...stars, ...dsos];
  }, []);
  const handleSelect = (type: 'star' | 'dso', item: any) => {
    if (type === 'star') setSelectedStar(item);
    else setSelectedDSO(item);
    // Manage recents (limit to 3)
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
      <DialogDescription className="sr-only">Find stars, nebulae, and cultural constellations. Type to search.</DialogDescription>
      <div className="bg-space-black/98 text-starlight border-nebula/20 backdrop-blur-2xl">
        <CommandInput
          placeholder="Search by name, culture, or tag..."
          className="text-starlight h-14"
        />
        <CommandList className="max-h-[400px] overflow-y-auto">
          <CommandEmpty>No celestial results found.</CommandEmpty>
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
          <CommandGroup heading="Cultural Entities (African Lore)">
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
          <CommandGroup heading="Primary Star Catalog">
            {STAR_CATALOG.filter(s => !s.culture).slice(0, 20).map((star) => (
              <CommandItem
                key={star.id}
                onSelect={() => handleSelect('star', star)}
                className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer rounded-lg m-1"
              >
                <Star className="w-4 h-4 text-starlight/20" />
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{star.name || `HIP ${star.id}`}</span>
                  <span className="text-[10px] text-starlight/40">Magnitude {star.mag}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Deep Sky Observations">
            {DSO_CATALOG.filter(d => !d.culture).map((dso) => (
              <CommandItem
                key={dso.id}
                onSelect={() => handleSelect('dso', dso)}
                className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer rounded-lg m-1"
              >
                <Telescope className="w-4 h-4 text-starlight/20" />
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{dso.name}</span>
                  <span className="text-[10px] text-starlight/40">{dso.type} • {dso.messier || dso.caldwell}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </div>
    </CommandDialog>
  );
}