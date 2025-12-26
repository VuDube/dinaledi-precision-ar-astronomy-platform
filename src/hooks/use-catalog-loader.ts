import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getCatalogCount, saveStarChunk } from '@/lib/db';
import { STAR_CATALOG, StarRecord } from '@/data/star-catalog';
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
        // If we have some stars, consider it ready (simplified for Phase 10)
        // In a real prod env, we'd check if count >= 120000
        if (count > 1000) {
          setCatalogLoadingProgress(100);
          setCatalogReady(true);
          return;
        }
        // Simulation of chunked loading for the 120k star dataset
        // In Phase 10, we seed the DB with our initial high-quality subset
        // and simulate the expansion background process
        setCatalogLoadingProgress(10);
        // Save initial bright catalog
        await saveStarChunk(STAR_CATALOG);
        // Simulate background loading of larger HYG dataset
        let progress = 10;
        const interval = setInterval(() => {
          progress += 15;
          if (progress >= 100) {
            clearInterval(interval);
            setCatalogLoadingProgress(100);
            setCatalogReady(true);
          } else {
            setCatalogLoadingProgress(progress);
          }
        }, 400);
      } catch (error) {
        console.error('Failed to initialize star catalog:', error);
      }
    }
    initializeCatalog();
  }, [setCatalogLoadingProgress, setCatalogReady]);
  return null;
}