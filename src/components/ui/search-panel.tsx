import React from 'react';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { useAppStore } from '@/stores/app-store';
import { STAR_CATALOG } from '@/data/star-catalog';
import { DSO_CATALOG } from '@/data/dso-catalog';
import { Star, Telescope, Search, Compass } from 'lucide-react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
export function SearchPanel() {
  const isSearchOpen = useAppStore(s => s.isSearchOpen);
  const setSearchOpen = useAppStore(s => s.setSearchOpen);
  const setSelectedStar = useAppStore(s => s.setSelectedStar);
  const setSelectedDSO = useAppStore(s => s.setSelectedDSO);
  const setMode = useAppStore(s => s.setMode);
  const handleSelect = (type: 'star' | 'dso', item: any) => {
    if (type === 'star') setSelectedStar(item);
    else setSelectedDSO(item);
    setSearchOpen(false);
    setMode('skyview');
  };
  return (
    <CommandDialog open={isSearchOpen} onOpenChange={setSearchOpen}>
      <DialogTitle className="sr-only">Search the night sky</DialogTitle>
      <DialogDescription className="sr-only">Type to find stars, nebulae, galaxies, and more. Use arrows to navigate.</DialogDescription>
      <div className="bg-space-black/95 text-starlight border-nebula/20">
        <CommandInput
          placeholder="Search stars, nebulae, galaxies..."
          className="text-starlight"
        />
        <CommandList className="max-h-[300px] overflow-y-auto">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Bright Stars">
            {STAR_CATALOG.slice(0, 15).map((star) => (
              <CommandItem
                key={star.id}
                onSelect={() => handleSelect('star', star)}
                className="flex items-center gap-3 p-3 hover:bg-nebula/10 cursor-pointer"
              >
                <Star className="w-4 h-4 text-nebula" />
                <div className="flex flex-col">
                  <span className="font-bold">{star.name || `HIP ${star.id}`}</span>
                  <span className="text-[10px] text-starlight/40">Magnitude {star.mag}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Deep Sky Objects">
            {DSO_CATALOG.map((dso) => (
              <CommandItem
                key={dso.id}
                onSelect={() => handleSelect('dso', dso)}
                className="flex items-center gap-3 p-3 hover:bg-nebula/10 cursor-pointer"
              >
                <Telescope className="w-4 h-4 text-nebula" />
                <div className="flex flex-col">
                  <span className="font-bold">{dso.name}</span>
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