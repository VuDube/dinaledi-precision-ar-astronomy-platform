import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { useAppStore } from '@/stores/app-store';
import { STAR_CATALOG } from '@/data/star-catalog';
import { DSO_CATALOG } from '@/data/dso-catalog';
import { Star, Telescope, Sparkles, History, Mic, AlertCircle } from 'lucide-react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
export function SearchPanel() {
  const isSearchOpen = useAppStore(s => s.isSearchOpen);
  const setSearchOpen = useAppStore(s => s.setSearchOpen);
  const setSelectedStar = useAppStore(s => s.setSelectedStar);
  const setSelectedDSO = useAppStore(s => s.setSelectedDSO);
  const setMode = useAppStore(s => s.setMode);
  const isVoiceTriggered = useAppStore(s => s.isVoiceTriggered);
  const [recents, setRecents] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const input = document.querySelector('[cmdk-input]') as HTMLInputElement;
        if (input) {
          input.value = transcript;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        setIsListening(false);
        toast.success(`Voice captured: "${transcript}"`);
      };
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied');
        }
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);
  useEffect(() => {
    if (isSearchOpen && isVoiceTriggered) {
      handleToggleVoice();
    }
  }, [isSearchOpen, isVoiceTriggered]);
  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      toast.error('Speech Recognition not supported in this browser');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Recognition start failed:', e);
      }
    }
  };
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
    <CommandDialog open={isSearchOpen} onOpenChange={(open) => setSearchOpen(open)}>
      <DialogTitle className="sr-only">Search Celestial Catalog</DialogTitle>
      <DialogDescription className="sr-only">Search by name or use voice command.</DialogDescription>
      <div className={cn(
        "bg-space-black/98 text-starlight border-nebula/20 backdrop-blur-2xl transition-all duration-500 overflow-hidden",
        isListening && "ring-2 ring-red-500/50"
      )}>
        <div className="relative border-b border-white/5">
          <CommandInput
            placeholder={isListening ? "Listening for stars..." : "Find a star or galaxy..."}
            className={cn("text-starlight h-16 bg-transparent border-none focus:ring-0", isListening && "placeholder:text-red-500/50")}
          />
          <button
            onClick={handleToggleVoice}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all duration-300",
              isListening ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]" : "text-starlight/20 hover:text-nebula hover:bg-white/5"
            )}
          >
            <Mic className={cn("w-5 h-5", isListening && "animate-pulse")} />
          </button>
        </div>
        <CommandList className="max-h-[450px] overflow-y-auto no-scrollbar">
          <CommandEmpty className="p-12 text-center">
            <AlertCircle className="w-8 h-8 text-starlight/10 mx-auto mb-3" />
            <p className="text-starlight/40 text-sm">No celestial objects match your query.</p>
          </CommandEmpty>
          {isListening && (
            <div className="p-12 text-center space-y-6">
              <div className="flex justify-center items-center gap-2">
                {[1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: [8, 24, 8] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-1 bg-red-500 rounded-full"
                  />
                ))}
              </div>
              <p className="text-red-500 text-[10px] font-mono uppercase tracking-[0.4em] animate-pulse">Neural Audio Processing</p>
            </div>
          )}
          {!isListening && (
            <>
              {recents.length > 0 && (
                <CommandGroup heading="Recent Discoveries">
                  {recents.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleSelect(item.searchType, item)}
                      className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer rounded-xl m-2 transition-colors"
                    >
                      <History className="w-4 h-4 text-starlight/20" />
                      <div className="flex flex-col">
                        <span className="font-bold text-starlight">{item.localName || item.name}</span>
                        <span className="text-[9px] text-starlight/30 uppercase tracking-widest">Logged Observation</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandGroup heading="Ancestral Lore & Major Entities">
                {culturalEntities.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item.searchType as any, item)}
                    className="flex items-center gap-4 p-4 hover:bg-nebula/10 cursor-pointer rounded-xl m-2 border border-transparent hover:border-nebula/20 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-nebula/20 flex items-center justify-center text-nebula">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-nebula">{item.localName}</span>
                      <span className="text-[9px] text-starlight/40 uppercase tracking-wider">{item.culture} • {item.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Scientific Catalog (M/C/HIP)">
                {DSO_CATALOG.filter(d => !d.culture).map(dso => (
                  <CommandItem
                    key={dso.id}
                    onSelect={() => handleSelect('dso', dso)}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer rounded-xl m-2"
                  >
                    <Telescope className="w-4 h-4 text-starlight/20" />
                    <div className="flex flex-col">
                      <span className="font-bold text-starlight">{dso.name}</span>
                      <span className="text-[9px] text-starlight/40 uppercase tracking-widest">{dso.type} • {dso.messier || dso.caldwell || 'DSO'}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
        <div className="p-3 bg-white/5 border-t border-white/5 text-center">
            <p className="text-[8px] font-mono text-starlight/20 uppercase tracking-[0.3em]">Edge Intelligence Engine v2.4</p>
        </div>
      </div>
    </CommandDialog>
  );
}