import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Book, Sparkles, Search, Settings, Eye, EyeOff, Download } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { DiamondGrid } from '@/components/ui/sesotho-patterns';
import { usePWA } from '@/hooks/use-pwa';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
type AppMode = 'intro' | 'skyview' | 'log' | 'settings' | 'highlights' | 'search' | 'pwa-install';
interface NavItem {
  id: AppMode | 'night' | 'install' | 'search';
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
  const isCalibrated = useAppStore(s => s.isCalibrated);
  const { installApp, isStandalone } = usePWA();
  const handleNav = (id: string) => {
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
    setMode(id as any);
  };
  const showInstall = isInstallable && !isStandalone && isCalibrated;
  return (
    <nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-lg pointer-events-auto">
      <div className="flex gap-2 items-center">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleNav('night')}
          className={cn(
            "h-14 w-14 glass-dark border-starlight/10 rounded-2xl flex items-center justify-center transition-all shadow-2xl overflow-hidden relative shrink-0",
            nightMode ? "text-red-500 border-red-500/40" : "text-starlight/40"
          )}
        >
          {nightMode ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
          <DiamondGrid opacity={0.03} />
        </motion.button>
        <div className="flex-1 glass-dark border-starlight/10 rounded-[2rem] p-1.5 flex items-center justify-between shadow-2xl backdrop-blur-3xl overflow-hidden relative">
          <DiamondGrid opacity={0.02} />
          {ITEMS.map((item) => {
            const isActive = mode === item.id;
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleNav(item.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1 flex-1 py-2.5 rounded-2xl transition-all duration-300",
                  isActive ? "text-nebula" : "text-starlight/40 hover:text-starlight/70"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-nebula/10 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <Icon className={cn("w-5 h-5 relative z-10", isActive && "animate-pulse")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-bold uppercase tracking-tight relative z-10">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {showInstall && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  initial={{ width: 0, opacity: 0, scale: 0.8 }}
                  animate={{ width: '3.5rem', opacity: 1, scale: 1 }}
                  exit={{ width: 0, opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNav('install')}
                  className="h-14 glass-dark border-nebula/40 rounded-2xl flex items-center justify-center transition-all shadow-2xl bg-nebula/10 text-nebula overflow-hidden relative shrink-0"
                >
                  <Download className="w-6 h-6 animate-bounce" />
                  <DiamondGrid opacity={0.05} />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-nebula text-space-black font-bold border-none text-[10px] uppercase tracking-widest">
                Offline Star Charts
              </TooltipContent>
            </Tooltip>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}