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
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          setCatalogLoadingProgress(100);
          setCoreReady(true);
          setTimeout(() => setCatalogReady(true), 0);
          reject(new Error('Catalog load timeout'));
        }, 12000); // Slightly longer timeout for 20k baseline
      });
      try {
        const mainPromise = (async () => {
          const count = await getCatalogCount();
          const TARGET_DENSITY = 125000;
          const CORE_THRESHOLD = 20000; // Hardened 20k core threshold for visual impact
          if (count >= TARGET_DENSITY) {
            setCatalogLoadingProgress(100);
            setCoreReady(true);
            setTimeout(() => setCatalogReady(true), 800);
            return;
          }
          setCatalogLoadingProgress(0);
          // Phase 1: High-Priority Star Catalog
          await saveStarChunk(STAR_CATALOG);
          // Phase 2: Hydrate up to 20,000 stars immediately for baseline
          const currentCount = await getCatalogCount();
          const neededForCore = Math.max(0, CORE_THRESHOLD - currentCount);
          if (neededForCore > 0) {
            const chunk: StarRecord[] = [];
            for (let j = 0; j < neededForCore; j++) {
              const id = `core_proc_${j}`;
              const ra = Math.random() * 24;
              const dec = Math.acos(Math.random() * 2 - 1) * (180 / Math.PI) - 90;
              const mag = 1.0 + Math.random() * 5.5; // Bright core stars
              const bv = Math.random() * 2.0 - 0.4;
              chunk.push({ id, ra, dec, mag, bv });
            }
            await saveStarChunk(chunk);
          }
          // Force settling delay for WebGL InstanceMatrix hydration
          await new Promise(r => setTimeout(r, 600));
          setCoreReady(true);
          setCatalogLoadingProgress(25);
          // Phase 3: Background Procedural Expansion to 125k
          const finalCoreTotal = await getCatalogCount();
          const remaining = Math.max(0, TARGET_DENSITY - finalCoreTotal);
          const chunkSize = 5000;
          const totalChunks = Math.ceil(remaining / chunkSize);
          for (let i = 0; i < totalChunks; i++) {
            const starsInThisChunk = i < totalChunks - 1 ? chunkSize : remaining % chunkSize || chunkSize;
            const bgChunk: StarRecord[] = [];
            for (let j = 0; j < starsInThisChunk; j++) {
              const id = `bg_proc_${i}_${j}`;
              const ra = Math.random() * 24;
              const dec = Math.acos(Math.random() * 2 - 1) * (180 / Math.PI) - 90;
              const mag = 6.5 + Math.random() * 5.0; // Dimmer background stars
              const bv = Math.random() * 2.0 - 0.4;
              bgChunk.push({ id, ra, dec, mag, bv });
            }
            await saveStarChunk(bgChunk);
            const progress = 25 + Math.min(75, (i / totalChunks) * 75);
            setCatalogLoadingProgress(progress);
            await new Promise(r => setTimeout(r, 0));
          }
          setCatalogLoadingProgress(100);
          setTimeout(() => setCatalogReady(true), 1200);
        })();
        await Promise.race([mainPromise, timeoutPromise]);
      } catch (error) {
        console.error('CatalogLoader Error:', error);
      }
    }
    initializeCatalog();
  }, [setCatalogReady, setCoreReady, setCatalogLoadingProgress]);
  return null;
}