import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getCatalogCount, saveStarChunk } from '@/lib/db';
import { STAR_CATALOG, StarRecord } from '@/data/star-catalog';
export function useCatalogLoader() {
  const setCatalogReady = useAppStore(s => s.setCatalogReady);
  const setCoreReady = useAppStore(s => s.setCoreReady);
  const setCatalogLoadingProgress = useAppStore(s => s.setCatalogLoadingProgress);
  const isInitialized = useRef(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    async function initializeCatalog() {
      console.log('CatalogLoader: starting init');
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log('CatalogLoader: 10s timeout triggered');
          setCatalogLoadingProgress(100);
          setCoreReady(true);
          setTimeout(() => setCatalogReady(true), 0);
          reject(new Error('Catalog load timeout'));
        }, 10000);
      });

      try {
        const mainPromise = (async () => {
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
          console.log('CatalogLoader: Phase 1 complete');
          
          // Phase 2: Check actual count and generate only what's needed to reach 10k
          const afterCoreCount = await getCatalogCount();
          const neededForCore = Math.max(0, CORE_THRESHOLD - afterCoreCount);
          console.log(`CatalogLoader: Phase 1 loaded ${afterCoreCount}, need ${neededForCore} more for core threshold`);
          
          if (neededForCore > 0) {
            const chunk: StarRecord[] = [];
            for (let j = 0; j < neededForCore; j++) {
              const id = `core_proc_${j}`;
              const ra = Math.random() * 24;
              const dec = Math.acos(Math.random() * 2 - 1) * (180 / Math.PI) - 90;
              const mag = 2.0 + Math.random() * 4.5;
              const bv = Math.random() * 2.0 - 0.4;
              chunk.push({ id, ra, dec, mag, bv });
            }
            await saveStarChunk(chunk);
            console.log(`CatalogLoader: Phase 2 added ${neededForCore} procedural stars`);
          }
          
          // Unlock SkyView as 10k stars are now ready
          setCoreReady(true);
          setCatalogLoadingProgress(15);
          // Phase 3: Background Procedural Hydration to reach 125k stars
          const afterCoreTotal = await getCatalogCount();
          const remaining = Math.max(0, TARGET_DENSITY - afterCoreTotal);
          const chunkSize = 5000;
          const totalChunks = Math.ceil(remaining / chunkSize);
          for (let i = 0; i < totalChunks; i++) {
            const starsInThisChunk = i < totalChunks - 1 ? chunkSize : remaining % chunkSize || chunkSize;
            const actualStarsInChunk = Math.min(starsInThisChunk, chunkSize);
            const bgChunk: StarRecord[] = [];
            for (let j = 0; j < starsInThisChunk; j++) {
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
            console.log('CatalogLoader: Phase 3 chunk', i+1, 'complete, progress', progress);
            // Yield to UI loop
            await new Promise(r => setTimeout(r, 0));
          }
          setCatalogLoadingProgress(100);
          setTimeout(() => setCatalogReady(true), 1200);
          console.log('CatalogLoader: All phases complete, progress 100');
        })();
        await Promise.race([mainPromise, timeoutPromise]);
      } catch (error) {
        console.error('CatalogLoader: Fallback triggered - Error/Timeout:', error);
      }
    }
    initializeCatalog();
  }, [setCatalogReady, setCoreReady, setCatalogLoadingProgress]);
  return null;
}