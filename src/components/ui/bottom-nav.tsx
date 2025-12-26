import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Book, Sparkles, Search, Settings } from 'lucide-react';
import { useAppStore, AppMode } from '@/stores/app-store';
import { cn } from '@/lib/utils';
interface NavItem {
  id: AppMode;
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
  const handleNav = (id: AppMode) => {
    if (id === 'search') {
      setSearchOpen(true);
      return;
    }
    setMode(id);
  };
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md pointer-events-auto">
      <div className="glass-dark border-starlight/10 rounded-3xl p-2 flex items-center justify-between shadow-2xl backdrop-blur-3xl overflow-hidden">
        {ITEMS.map((item) => {
          const isActive = mode === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 flex-1 py-2 rounded-2xl transition-all duration-300",
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
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}