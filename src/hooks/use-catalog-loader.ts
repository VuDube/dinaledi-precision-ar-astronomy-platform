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
        const TARGET_DENSITY = 125000;
        // If already seeded at high density, fast-track
        if (count >= TARGET_DENSITY) {
          setCatalogLoadingProgress(100);
          setTimeout(() => setCatalogReady(true), 800);
          return;
        }
        setCatalogLoadingProgress(0);
        // Phase 1: Save core bright subset
        await saveStarChunk(STAR_CATALOG);
        setCatalogLoadingProgress(10);
        // Phase 2: Procedural Hydration to reach 125k stars
        const remaining = TARGET_DENSITY - count;
        const chunkSize = 5000;
        const totalChunks = Math.ceil(remaining / chunkSize);
        for (let i = 0; i < totalChunks; i++) {
          const chunk: StarRecord[] = [];
          for (let j = 0; j < chunkSize; j++) {
            const id = `proc_${i}_${j}`;
            // Distribute across the sky
            const ra = Math.random() * 24;
            const dec = Math.acos(Math.random() * 2 - 1) * (180 / Math.PI) - 90;
            // Mag 6.5 to 11.0 (fainter stars)
            const mag = 6.5 + Math.random() * 4.5;
            const bv = Math.random() * 2.0 - 0.4;
            chunk.push({ id, ra, dec, mag, bv });
          }
          await saveStarChunk(chunk);
          const progress = 10 + Math.min(90, (i / totalChunks) * 90);
          setCatalogLoadingProgress(progress);
          // Yield to UI
          await new Promise(r => setTimeout(r, 0));
        }
        setCatalogLoadingProgress(100);
        setTimeout(() => setCatalogReady(true), 1200);
      } catch (error) {
        console.error('PWA: Failed to initialize high-density star catalog:', error);
      }
    }
    initializeCatalog();
  }, [setCatalogLoadingProgress, setCatalogReady]);
  return null;
}