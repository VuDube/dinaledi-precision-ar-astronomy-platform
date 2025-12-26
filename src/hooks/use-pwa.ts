import { useEffect, useCallback, useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
export function usePWA() {
  const setDeferredPrompt = useAppStore(s => s.setDeferredPrompt);
  const setIsOnline = useAppStore(s => s.setIsOnline);
  const deferredPrompt = useAppStore(s => s.deferredPrompt);
  const [isStandalone, setIsStandalone] = useState(false);
  useEffect(() => {
    // Check if app is running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
        || (window.navigator as any).standalone 
        || document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('PWA: Install prompt deferred');
    };
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      toast.success('Dinaledi is now in your Starport!', {
        description: 'Launch from your home screen for the full experience.',
        duration: 5000,
      });
    };
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setDeferredPrompt, setIsOnline]);
  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      toast.info('Installation Ready', {
        description: 'Use your browser menu to "Add to Home Screen" if the prompt does not appear.',
      });
      return;
    }
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA: User response to install prompt: ${outcome}`);
      setDeferredPrompt(null);
    } catch (err) {
      console.error('PWA: Installation failed', err);
    }
  }, [deferredPrompt, setDeferredPrompt]);
  return { installApp, isStandalone };
}