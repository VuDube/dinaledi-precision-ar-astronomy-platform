import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Book, Sparkles, Search, Settings, Eye, EyeOff, Download } from 'lucide-react';
import { useAppStore, AppMode } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { DiamondGrid } from '@/components/ui/sesotho-patterns';
import { usePWA } from '@/hooks/use-pwa';
interface NavItem {
  id: AppMode | 'night' | 'install';
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
  const isInstallable = useAppStore(s => s.isInstallable);
  const { installApp } = usePWA();
  const handleNav = (id: AppMode | 'night' | 'install') => {
    if (id === 'night') {
      toggleNightMode();
      return;
    }
    if (id === 'install') {
      installApp();
      return;
    }
    if (id === 'search') {
      setSearchOpen(true);
      return;
    }
    setMode(id);
  };
  return (
    <nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-lg pointer-events-auto">
      <div className="flex gap-1.5 sm:gap-2 items-center">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleNav('night')}
          className={cn(
            "h-12 w-12 sm:h-14 sm:w-14 glass-dark border-starlight/10 rounded-2xl flex items-center justify-center transition-all shadow-2xl overflow-hidden relative",
            nightMode ? "text-[#ff3333] border-[#ff3333]/30" : "text-starlight/40"
          )}
        >
          {nightMode ? <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Eye className="w-5 h-5 sm:w-6 sm:h-6" />}
          <DiamondGrid opacity={0.03} />
        </motion.button>
        <div className="flex-1 glass-dark border-starlight/10 rounded-3xl p-1 sm:p-1.5 flex items-center justify-between shadow-2xl backdrop-blur-3xl overflow-hidden relative">
          <DiamondGrid opacity={0.02} />
          {ITEMS.map((item) => {
            const isActive = mode === item.id;
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleNav(item.id as AppMode)}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 sm:gap-1 flex-1 py-2 sm:py-2.5 rounded-2xl transition-all duration-300",
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
                <Icon className={cn("w-4.5 h-4.5 sm:w-5 sm:h-5", isActive && "animate-pulse")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tight">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
        {isInstallable && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleNav('install')}
            className="h-12 w-12 sm:h-14 sm:w-14 glass-dark border-nebula/40 rounded-2xl flex items-center justify-center transition-all shadow-2xl bg-nebula/10 text-nebula overflow-hidden relative"
          >
            <Download className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
            <DiamondGrid opacity={0.05} />
          </motion.button>
        )}
      </div>
    </nav>
  );
}