import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getCatalogCount, saveStarChunk } from '@/lib/db';
import { STAR_CATALOG } from '@/data/star-catalog';
export function useCatalogLoader() {
  const setCatalogReady = useAppStore(s => s.setCatalogReady);
  const setCatalogLoadingProgress = useAppStore(s => s.setCatalogLoadingProgress);
  const isInitialized = useRef(false);
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    async function initializeCatalog() {
      try {
        const count = await getCatalogCount();
        // If already seeded, fast-track
        if (count > 50) {
          setCatalogLoadingProgress(100);
          // Small delay to allow Three.js InstancedMesh to warm up before showing
          setTimeout(() => setCatalogReady(true), 800);
          return;
        }
        setCatalogLoadingProgress(0);
        // Phase 1: Save core bright subset
        await saveStarChunk(STAR_CATALOG);
        setCatalogLoadingProgress(40);
        // Phase 2: Simulate massive deep-sky catalog hydration
        const totalSteps = 10;
        let currentStep = 4;
        const loadSimulation = () => {
          if (currentStep >= totalSteps) {
            setCatalogLoadingProgress(100);
            // Allow meshes to settle
            setTimeout(() => setCatalogReady(true), 1200);
            return;
          }
          const idleCallback = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 50));
          idleCallback(() => {
            currentStep++;
            const progress = Math.min(100, (currentStep / totalSteps) * 100);
            setCatalogLoadingProgress(progress);
            setTimeout(loadSimulation, 250);
          });
        };
        loadSimulation();
      } catch (error) {
        console.error('PWA: Failed to initialize star catalog engine:', error);
      }
    }
    initializeCatalog();
  }, [setCatalogLoadingProgress, setCatalogReady]);
  return null;
}