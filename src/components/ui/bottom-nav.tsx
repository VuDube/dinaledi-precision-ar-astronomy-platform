import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Book, Sparkles, Search, Settings, Eye, EyeOff } from 'lucide-react';
import { useAppStore, AppMode } from '@/stores/app-store';
import { cn } from '@/lib/utils';
interface NavItem {
  id: AppMode | 'night';
  label: string;
  icon: React.ElementType;
}
const ITEMS: NavItem[] = [
  { id: 'skyview', label: 'Sky', icon: Compass },
  { id: 'log', label: 'Journal', icon: Book },
  { id: 'highlights', label: 'Best', icon: Sparkles },
  { id: 'search', label: 'Find', icon: Search },
  { id: 'settings', label: 'Config', icon: Settings },
];
export function BottomNav() {
  const mode = useAppStore(s => s.mode);
  const setMode = useAppStore(s => s.setMode);
  const setSearchOpen = useAppStore(s => s.setSearchOpen);
  const nightMode = useAppStore(s => s.nightMode);
  const toggleNightMode = useAppStore(s => s.toggleNightMode);
  const handleNav = (id: AppMode | 'night') => {
    if (id === 'night') {
      toggleNightMode();
      return;
    }
    if (id === 'search') {
      setSearchOpen(true);
      return;
    }
    setMode(id);
  };
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg pointer-events-auto">
      <div className="flex gap-2 items-center">
        <button
          onClick={() => handleNav('night')}
          className={cn(
            "h-14 w-14 glass-dark border-starlight/10 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-2xl",
            nightMode ? "text-[#ff3333] border-[#ff3333]/30" : "text-starlight/40"
          )}
        >
          {nightMode ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
        </button>
        <div className="flex-1 glass-dark border-starlight/10 rounded-3xl p-1.5 flex items-center justify-between shadow-2xl backdrop-blur-3xl overflow-hidden">
          {ITEMS.map((item) => {
            const isActive = mode === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id as AppMode)}
                className={cn(
                  "relative flex flex-col items-center gap-1 flex-1 py-2.5 rounded-2xl transition-all duration-300 active:scale-95",
                  isActive ? "text-nebula" : "text-starlight/40 hover:text-starlight/60"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-nebula/10 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={cn("w-5 h-5", isActive && "animate-pulse")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-bold uppercase tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}