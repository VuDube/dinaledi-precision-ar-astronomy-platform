import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Download, CheckCircle2, WifiOff, Zap } from 'lucide-react';
import { DiamondGrid, StarPoint } from './sesotho-patterns';
import { motion } from 'framer-motion';
interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
}
export function PWAInstallModal({ isOpen, onClose, onInstall }: PWAInstallModalProps) {
  const features = [
    { icon: WifiOff, label: 'Offline Access', desc: 'Star charts and logs available without signal.' },
    { icon: Zap, label: 'High Performance', desc: 'Native-like fluidity with hardware acceleration.' },
    { icon: CheckCircle2, label: 'No Store Needed', desc: 'Installs directly from the browser.' }
  ];
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-space-black/98 border-nebula/20 text-starlight backdrop-blur-3xl overflow-hidden">
        <DiamondGrid opacity={0.04} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
          <StarPoint className="w-64 h-64 rotate-45" />
        </div>
        <DialogHeader className="relative z-10 pt-6">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-nebula to-[#D14615] flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.3)] mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <DialogTitle className="text-3xl font-black text-center tracking-tight">
            DIN<span className="text-nebula">A</span>LEDI PWA
          </DialogTitle>
          <DialogDescription className="text-center text-starlight/60 text-base px-2">
            Add Dinaledi to your home screen for the full celestial experience.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-8 relative z-10">
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5"
            >
              <div className="p-2 rounded-lg bg-nebula/10 text-nebula">
                <feature.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-starlight">{feature.label}</h4>
                <p className="text-xs text-starlight/40">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <DialogFooter className="relative z-10 sm:justify-center flex-col gap-3">
          <Button
            onClick={onInstall}
            className="w-full h-14 bg-nebula text-space-black hover:bg-nebula/90 font-black text-lg rounded-2xl shadow-glow active:scale-95 transition-all"
          >
            <Download className="w-5 h-5 mr-2" />
            INSTALL NOW
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full h-10 text-starlight/40 hover:text-starlight text-xs uppercase font-bold tracking-widest"
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}