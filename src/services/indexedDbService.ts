import { TrendingProduct } from '../types';

export interface SavedProductRecord extends TrendingProduct {
  savedAt: number;
  offlineAvailable: boolean;
}

export interface TrendHistoryRecord extends TrendingProduct {
  cachedAt: number;
  source: 'scan' | 'curated' | 'user';
}

export interface ScanHistoryRecord {
  id: string;
  timestamp: number;
  dateFormatted: string;
  query?: string;
  niche?: string;
  originCountry?: string;
  count: number;
  sampleNames: string[];
}

export interface DatabaseStats {
  isSupported: boolean;
  savedCount: number;
  trendHistoryCount: number;
  scanHistoryCount: number;
  lastSync: number | null;
  storageEstimateMb?: number;
  lastCleanup?: number | null;
  cleanedCountTotal?: number;
}

export interface CacheCleanupResult {
  removedCount: number;
  remainingCount: number;
  cutoffTimestamp: number;
  daysThreshold: number;
  cleanedAt: number;
}

const DB_NAME = 'TIKBLOX_RADAR_DB';
const DB_VERSION = 1;
export const DEFAULT_CACHE_MAX_AGE_DAYS = 30;

// Object Store Names
export const STORES = {
  SAVED_PRODUCTS: 'saved_products',
  TREND_HISTORY: 'trend_history',
  SCAN_HISTORY: 'scan_history',
  META: 'meta',
} as const;

let dbInstance: IDBDatabase | null = null;
let isIndexedDBSupported = true;

/**
 * Initializes and opens the IndexedDB database.
 * Gracefully handles unsupported environments or private browsing mode.
 */
export async function getDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    isIndexedDBSupported = false;
    return null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve) => {
    let resolved = false;
    const safeResolve = (val: IDBDatabase | null) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(val);
      }
    };

    // Safety timeout: Never allow IndexedDB opening to block app initialization
    const timer = setTimeout(() => {
      console.warn('TIKBLOX IndexedDB open timed out after 1200ms. Continuing with memory/localStorage fallback.');
      safeResolve(null);
    }, 1200);

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Saved Products Store
        if (!db.objectStoreNames.contains(STORES.SAVED_PRODUCTS)) {
          const savedStore = db.createObjectStore(STORES.SAVED_PRODUCTS, { keyPath: 'id' });
          savedStore.createIndex('by_savedAt', 'savedAt', { unique: false });
          savedStore.createIndex('by_niche', 'niche', { unique: false });
          savedStore.createIndex('by_originCountry', 'originCountry', { unique: false });
        }

        // 2. Trend History Store (Full archive of analyzed products)
        if (!db.objectStoreNames.contains(STORES.TREND_HISTORY)) {
          const trendStore = db.createObjectStore(STORES.TREND_HISTORY, { keyPath: 'id' });
          trendStore.createIndex('by_cachedAt', 'cachedAt', { unique: false });
          trendStore.createIndex('by_niche', 'niche', { unique: false });
          trendStore.createIndex('by_viralityScore', 'viralityScore', { unique: false });
        }

        // 3. Scan History Store (Historical scans performed)
        if (!db.objectStoreNames.contains(STORES.SCAN_HISTORY)) {
          const scanStore = db.createObjectStore(STORES.SCAN_HISTORY, { keyPath: 'id' });
          scanStore.createIndex('by_timestamp', 'timestamp', { unique: false });
        }

        // 4. Meta Key-Value Store
        if (!db.objectStoreNames.contains(STORES.META)) {
          db.createObjectStore(STORES.META, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;

        // Handle connection closure
        dbInstance.onclose = () => {
          dbInstance = null;
        };

        safeResolve(dbInstance);
      };

      request.onerror = (error) => {
        console.warn('TIKBLOX IndexedDB failed to open, falling back to local storage:', error);
        isIndexedDBSupported = false;
        safeResolve(null);
      };

      request.onblocked = () => {
        console.warn('TIKBLOX IndexedDB blocked by another open tab.');
        safeResolve(null);
      };
    } catch (e) {
      console.warn('Error opening IndexedDB:', e);
      isIndexedDBSupported = false;
      safeResolve(null);
    }
  });
}

// ==========================================
// 1. SAVED PRODUCTS CRUD (IndexedDB)
// ==========================================

/**
 * Saves or updates a product in the offline IndexedDB `saved_products` store.
 */
export async function saveProductToIndexedDB(product: TrendingProduct): Promise<void> {
  const db = await getDB();
  if (!db) {
    return; // Fallback handled by localStorage in api.ts
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction([STORES.SAVED_PRODUCTS, STORES.META], 'readwrite');
      const store = tx.objectStore(STORES.SAVED_PRODUCTS);
      const metaStore = tx.objectStore(STORES.META);

      const record: SavedProductRecord = {
        ...product,
        savedAt: Date.now(),
        offlineAvailable: true,
      };

      store.put(record);
      metaStore.put({ key: 'last_saved_update', timestamp: Date.now() });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Removes a product from the offline IndexedDB `saved_products` store.
 */
export async function removeProductFromIndexedDB(productId: string): Promise<void> {
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction([STORES.SAVED_PRODUCTS, STORES.META], 'readwrite');
      const store = tx.objectStore(STORES.SAVED_PRODUCTS);
      const metaStore = tx.objectStore(STORES.META);

      store.delete(productId);
      metaStore.put({ key: 'last_saved_update', timestamp: Date.now() });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Retrieves all saved products from IndexedDB, sorted by most recently saved.
 */
export async function getAllSavedProductsFromIndexedDB(): Promise<TrendingProduct[]> {
  const db = await getDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.SAVED_PRODUCTS, 'readonly');
      const store = tx.objectStore(STORES.SAVED_PRODUCTS);
      const request = store.getAll();

      request.onsuccess = () => {
        const records: SavedProductRecord[] = request.result || [];
        // Sort descending by savedAt
        records.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
        resolve(records);
      };

      request.onerror = () => {
        resolve([]);
      };
    } catch {
      resolve([]);
    }
  });
}

/**
 * Checks if a specific product ID is saved in IndexedDB.
 */
export async function isProductSavedInIndexedDB(productId: string): Promise<boolean> {
  const db = await getDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.SAVED_PRODUCTS, 'readonly');
      const store = tx.objectStore(STORES.SAVED_PRODUCTS);
      const request = store.get(productId);

      request.onsuccess = () => {
        resolve(!!request.result);
      };

      request.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

// ==========================================
// 2. TREND HISTORY & RADAR CACHE (IndexedDB)
// ==========================================

/**
 * Caches an array of trending products into IndexedDB's `trend_history` store.
 * Allows browsing the full trend library while completely offline.
 */
export async function cacheTrendProductsToIndexedDB(
  products: TrendingProduct[],
  source: 'scan' | 'curated' | 'user' = 'curated'
): Promise<void> {
  if (!products || products.length === 0) return;

  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORES.TREND_HISTORY, STORES.META], 'readwrite');
      const store = tx.objectStore(STORES.TREND_HISTORY);
      const metaStore = tx.objectStore(STORES.META);

      const now = Date.now();
      for (const product of products) {
        const record: TrendHistoryRecord = {
          ...product,
          cachedAt: now,
          source,
        };
        store.put(record);
      }

      metaStore.put({ key: 'last_trend_cache_sync', timestamp: now });
      metaStore.put({ key: 'total_cached_trends_count', count: products.length });

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve(); // Non-blocking
    } catch {
      resolve();
    }
  });
}

/**
 * Retrieves all cached trend products from IndexedDB.
 */
export async function getAllCachedTrendsFromIndexedDB(): Promise<TrendingProduct[]> {
  const db = await getDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.TREND_HISTORY, 'readonly');
      const store = tx.objectStore(STORES.TREND_HISTORY);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

// ==========================================
// 3. SCAN SNAPSHOTS & HISTORY (IndexedDB)
// ==========================================

/**
 * Saves a snapshot of a scan event into IndexedDB so users can view past scans offline.
 */
export async function saveScanSnapshotToIndexedDB(params: {
  query?: string;
  niche?: string;
  originCountry?: string;
  products: TrendingProduct[];
}): Promise<void> {
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.SCAN_HISTORY, 'readwrite');
      const store = tx.objectStore(STORES.SCAN_HISTORY);

      const now = Date.now();
      const record: ScanHistoryRecord = {
        id: `scan_${now}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: now,
        dateFormatted: new Intl.DateTimeFormat('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'medium',
        }).format(new Date(now)),
        query: params.query || undefined,
        niche: params.niche || 'all',
        originCountry: params.originCountry || 'all',
        count: params.products.length,
        sampleNames: params.products.slice(0, 4).map((p) => p.name),
      };

      store.put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Gets historical scan records from IndexedDB, latest first.
 */
export async function getScanHistoryFromIndexedDB(limit: number = 20): Promise<ScanHistoryRecord[]> {
  const db = await getDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.SCAN_HISTORY, 'readonly');
      const store = tx.objectStore(STORES.SCAN_HISTORY);
      const request = store.getAll();

      request.onsuccess = () => {
        const list: ScanHistoryRecord[] = request.result || [];
        list.sort((a, b) => b.timestamp - a.timestamp);
        resolve(list.slice(0, limit));
      };

      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

// ==========================================
// 4. STORAGE STATS & MAINTENANCE
// ==========================================

/**
 * Returns statistics about the offline IndexedDB storage.
 */
export async function getIndexedDBStats(): Promise<DatabaseStats> {
  const db = await getDB();
  if (!db) {
    return {
      isSupported: isIndexedDBSupported,
      savedCount: 0,
      trendHistoryCount: 0,
      scanHistoryCount: 0,
      lastSync: null,
    };
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(
        [STORES.SAVED_PRODUCTS, STORES.TREND_HISTORY, STORES.SCAN_HISTORY, STORES.META],
        'readonly'
      );

      const savedCountReq = tx.objectStore(STORES.SAVED_PRODUCTS).count();
      const trendCountReq = tx.objectStore(STORES.TREND_HISTORY).count();
      const scanCountReq = tx.objectStore(STORES.SCAN_HISTORY).count();
      const lastSyncReq = tx.objectStore(STORES.META).get('last_trend_cache_sync');
      const lastCleanupReq = tx.objectStore(STORES.META).get('last_trend_cache_cleanup');
      const cleanedTotalReq = tx.objectStore(STORES.META).get('total_cleaned_count');

      tx.oncomplete = async () => {
        let storageEstimateMb: number | undefined;
        if (navigator.storage && navigator.storage.estimate) {
          try {
            const estimate = await navigator.storage.estimate();
            if (estimate.usage) {
              storageEstimateMb = +(estimate.usage / (1024 * 1024)).toFixed(2);
            }
          } catch {
            // Ignore
          }
        }

        resolve({
          isSupported: true,
          savedCount: savedCountReq.result || 0,
          trendHistoryCount: trendCountReq.result || 0,
          scanHistoryCount: scanCountReq.result || 0,
          lastSync: lastSyncReq.result?.timestamp || null,
          lastCleanup: lastCleanupReq.result?.timestamp || null,
          cleanedCountTotal: cleanedTotalReq.result?.count || 0,
          storageEstimateMb,
        });
      };

      tx.onerror = () => {
        resolve({
          isSupported: true,
          savedCount: 0,
          trendHistoryCount: 0,
          scanHistoryCount: 0,
          lastSync: null,
        });
      };
    } catch {
      resolve({
        isSupported: true,
        savedCount: 0,
        trendHistoryCount: 0,
        scanHistoryCount: 0,
        lastSync: null,
      });
    }
  });
}

/**
 * Clears cached trend history and scan logs from IndexedDB while preserving user's saved bookmarks.
 */
export async function clearTrendCacheFromIndexedDB(): Promise<void> {
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORES.TREND_HISTORY, STORES.SCAN_HISTORY, STORES.META], 'readwrite');
      tx.objectStore(STORES.TREND_HISTORY).clear();
      tx.objectStore(STORES.SCAN_HISTORY).clear();
      tx.objectStore(STORES.META).delete('last_trend_cache_sync');
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Seeds initial curated trends into IndexedDB if the store is empty,
 * guaranteeing offline readiness from the very first visit.
 */
export async function seedInitialIndexedDB(initialProducts: TrendingProduct[]): Promise<void> {
  const db = await getDB();
  if (!db) return;

  try {
    const stats = await getIndexedDBStats();
    if (stats.trendHistoryCount === 0 && initialProducts.length > 0) {
      await cacheTrendProductsToIndexedDB(initialProducts, 'curated');
    }
  } catch (e) {
    console.warn('Could not seed initial IndexedDB cache:', e);
  }
}

// ==========================================
// 5. CACHE CLEANUP UTILITIES (30-DAY RETENTION)
// ==========================================

/**
 * Removes products from the IndexedDB cache (`trend_history`) that are older than
 * the specified retention period (default: 30 days).
 *
 * NOTE: User bookmarks stored in `saved_products` are NEVER purged by this utility;
 * it solely cleans stale temporary radar scans and cached trend items to keep
 * local storage lean and efficient.
 *
 * @param daysThreshold Maximum age in days before a record is considered stale (default 30).
 * @returns Details on number of removed products, remaining products, and cutoff timestamp.
 */
export async function cleanupOldCachedProductsFromIndexedDB(
  daysThreshold: number = DEFAULT_CACHE_MAX_AGE_DAYS
): Promise<CacheCleanupResult> {
  const db = await getDB();
  const now = Date.now();
  const maxAgeMs = daysThreshold * 24 * 60 * 60 * 1000;
  const cutoffTimestamp = now - maxAgeMs;

  const emptyResult: CacheCleanupResult = {
    removedCount: 0,
    remainingCount: 0,
    cutoffTimestamp,
    daysThreshold,
    cleanedAt: now,
  };

  if (!db) return emptyResult;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORES.TREND_HISTORY, STORES.META], 'readwrite');
      const store = tx.objectStore(STORES.TREND_HISTORY);
      const metaStore = tx.objectStore(STORES.META);

      let removedCount = 0;

      // Use the 'by_cachedAt' index with an upper bound query for efficient range cursor traversal
      let request: IDBRequest;
      if (store.indexNames.contains('by_cachedAt')) {
        const index = store.index('by_cachedAt');
        const range = IDBKeyRange.upperBound(cutoffTimestamp, false);
        request = index.openCursor(range);
      } else {
        request = store.openCursor();
      }

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          const value = cursor.value as TrendHistoryRecord;
          const recordTime = value.cachedAt || 0;

          // If traversing via by_cachedAt index, items are guaranteed <= cutoffTimestamp.
          // If fallback cursor, manually test against cutoff.
          if (recordTime <= cutoffTimestamp) {
            cursor.delete();
            removedCount++;
          }
          cursor.continue();
        }
      };

      tx.oncomplete = () => {
        // Update cleanup metadata in META store
        const updateMetaTx = db.transaction([STORES.TREND_HISTORY, STORES.META], 'readwrite');
        const trendStore = updateMetaTx.objectStore(STORES.TREND_HISTORY);
        const meta = updateMetaTx.objectStore(STORES.META);

        const countReq = trendStore.count();
        const prevTotalReq = meta.get('total_cleaned_count');

        updateMetaTx.oncomplete = () => {
          const remainingCount = countReq.result || 0;
          resolve({
            removedCount,
            remainingCount,
            cutoffTimestamp,
            daysThreshold,
            cleanedAt: now,
          });
        };

        prevTotalReq.onsuccess = () => {
          const prevTotal = prevTotalReq.result?.count || 0;
          meta.put({ key: 'last_trend_cache_cleanup', timestamp: now });
          meta.put({ key: 'last_cleanup_removed_count', count: removedCount });
          meta.put({ key: 'total_cleaned_count', count: prevTotal + removedCount });
        };

        updateMetaTx.onerror = () => {
          resolve({
            removedCount,
            remainingCount: 0,
            cutoffTimestamp,
            daysThreshold,
            cleanedAt: now,
          });
        };
      };

      tx.onerror = (err) => {
        console.warn('Error executing 30-day cache cleanup in IndexedDB:', err);
        resolve(emptyResult);
      };
    } catch (e) {
      console.warn('Error starting cache cleanup transaction:', e);
      resolve(emptyResult);
    }
  });
}

/**
 * Checks how many cached items are currently older than the retention threshold
 * without deleting them, allowing UI preview of recoverable storage.
 */
export async function getStaleCacheEstimate(
  daysThreshold: number = DEFAULT_CACHE_MAX_AGE_DAYS
): Promise<{ staleCount: number; cutoffTimestamp: number; totalCount: number }> {
  const db = await getDB();
  const now = Date.now();
  const cutoffTimestamp = now - (daysThreshold * 24 * 60 * 60 * 1000);

  if (!db) {
    return { staleCount: 0, cutoffTimestamp, totalCount: 0 };
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.TREND_HISTORY, 'readonly');
      const store = tx.objectStore(STORES.TREND_HISTORY);
      const totalReq = store.count();

      let staleCount = 0;

      if (store.indexNames.contains('by_cachedAt')) {
        const index = store.index('by_cachedAt');
        const range = IDBKeyRange.upperBound(cutoffTimestamp, false);
        const countReq = index.count(range);
        countReq.onsuccess = () => {
          staleCount = countReq.result;
        };
      } else {
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result || []) as TrendHistoryRecord[];
          staleCount = list.filter((item) => (item.cachedAt || 0) <= cutoffTimestamp).length;
        };
      }

      tx.oncomplete = () => {
        resolve({
          staleCount,
          cutoffTimestamp,
          totalCount: totalReq.result || 0,
        });
      };

      tx.onerror = () => {
        resolve({ staleCount: 0, cutoffTimestamp, totalCount: 0 });
      };
    } catch {
      resolve({ staleCount: 0, cutoffTimestamp, totalCount: 0 });
    }
  });
}

/**
 * Automated maintenance runner: runs once every 24 hours (or on startup)
 * to automatically purge items in the cache older than 30 days.
 */
export async function autoCleanupTrendCacheIfDue(
  daysThreshold: number = DEFAULT_CACHE_MAX_AGE_DAYS
): Promise<CacheCleanupResult | null> {
  const db = await getDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORES.META, 'readonly');
      const meta = tx.objectStore(STORES.META);
      const req = meta.get('last_trend_cache_cleanup');

      req.onsuccess = async () => {
        const lastCleanupTimestamp = req.result?.timestamp;
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const isDue = !lastCleanupTimestamp || (Date.now() - lastCleanupTimestamp > ONE_DAY_MS);

        if (isDue) {
          const result = await cleanupOldCachedProductsFromIndexedDB(daysThreshold);
          resolve(result);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}
