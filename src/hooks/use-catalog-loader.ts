import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getCatalogCount, saveStarChunk } from '@/lib/db';
import { STAR_CATALOG, StarRecord } from '@/data/star-catalog';
export function useCatalogLoader() {
  const setCatalogReady = useAppStore(s => s.setCatalogReady);
  const setCoreReady = useAppStore(s => s.setCoreReady);
  const setCatalogLoadingProgress = useAppStore(s => s.setCatalogLoadingProgress);
  const isInitialized = useRef(false);
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    async function initializeCatalog() {
      try {
        const count = await getCatalogCount();
        const TARGET_DENSITY = 125000;
        const CORE_THRESHOLD = 10000;
        if (count >= TARGET_DENSITY) {
          setCatalogLoadingProgress(100);
          setCoreReady(true);
          setTimeout(() => setCatalogReady(true), 800);
          return;
        }
        setCatalogLoadingProgress(0);
        // Phase 1: Core Stars (High-brightness + Subset)
        await saveStarChunk(STAR_CATALOG);
        // Phase 2: Procedural Core Hydration to reach 10k stars (Quick unlock)
        const chunk: StarRecord[] = [];
        for (let j = 0; j < CORE_THRESHOLD; j++) {
          const id = `core_proc_${j}`;
          const ra = Math.random() * 24;
          const dec = Math.acos(Math.random() * 2 - 1) * (180 / Math.PI) - 90;
          const mag = 2.0 + Math.random() * 4.5;
          const bv = Math.random() * 2.0 - 0.4;
          chunk.push({ id, ra, dec, mag, bv });
        }
        await saveStarChunk(chunk);
        // Unlock SkyView as 10k stars are now ready
        setCoreReady(true);
        setCatalogLoadingProgress(15);
        // Phase 3: Background Procedural Hydration to reach 125k stars
        const remaining = TARGET_DENSITY - (count + CORE_THRESHOLD);
        const chunkSize = 5000;
        const totalChunks = Math.ceil(remaining / chunkSize);
        for (let i = 0; i < totalChunks; i++) {
          const bgChunk: StarRecord[] = [];
          for (let j = 0; j < chunkSize; j++) {
            const id = `bg_proc_${i}_${j}`;
            const ra = Math.random() * 24;
            const dec = Math.acos(Math.random() * 2 - 1) * (180 / Math.PI) - 90;
            const mag = 6.5 + Math.random() * 4.5;
            const bv = Math.random() * 2.0 - 0.4;
            bgChunk.push({ id, ra, dec, mag, bv });
          }
          await saveStarChunk(bgChunk);
          const progress = 15 + Math.min(85, (i / totalChunks) * 85);
          setCatalogLoadingProgress(progress);
          // Yield to UI loop
          await new Promise(r => setTimeout(r, 0));
        }
        setCatalogLoadingProgress(100);
        setTimeout(() => setCatalogReady(true), 1200);
      } catch (error) {
        console.error('PWA: Failed to initialize celestial catalog:', error);
      }
    }
    initializeCatalog();
  }, [setCatalogLoadingProgress, setCatalogReady, setCoreReady]);
  return null;
}