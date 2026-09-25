export interface RecentSearchItem {
  query: string;
  count: number;
  lastSearchedAt: number;
}

const STORAGE_KEY = 'tikblox_recent_searches_v1';
const MAX_ITEMS = 20;

export const DEFAULT_SUGGESTED_SEARCHES = [
  'Cílios Magnéticos',
  'Delineador Carimbo',
  'Borrifador de Azeite',
  'Massageador Cervical',
  'Escova Secadora',
  'Roda Abdominal',
  'Depilador Laser IPL',
  'Organizador Giratório',
];

export const SEED_SEARCH_QUERIES: RecentSearchItem[] = [
  { query: 'Mini Projetor 4K', count: 78, lastSearchedAt: Date.now() - 1000 * 60 * 12 },
  { query: 'Escova Secadora', count: 96, lastSearchedAt: Date.now() - 1000 * 60 * 25 },
  { query: 'Borrifador de Azeite', count: 84, lastSearchedAt: Date.now() - 1000 * 60 * 6 },
  { query: 'Smart Ring Anel Inteligente', count: 72, lastSearchedAt: Date.now() - 1000 * 60 * 18 },
  { query: 'Massageador Cervical', count: 48, lastSearchedAt: Date.now() - 1000 * 60 * 42 },
  { query: 'Copo Térmico com Display', count: 65, lastSearchedAt: Date.now() - 1000 * 60 * 30 },
  { query: 'Fita LED COB', count: 54, lastSearchedAt: Date.now() - 1000 * 60 * 22 },
  { query: 'Cílios Magnéticos', count: 52, lastSearchedAt: Date.now() - 1000 * 60 * 55 },
  { query: 'Dispenser Automático Sabão', count: 44, lastSearchedAt: Date.now() - 1000 * 60 * 35 },
  { query: 'Suporte Celular Magnético Carro', count: 39, lastSearchedAt: Date.now() - 1000 * 60 * 70 },
  { query: 'Depilador Laser IPL', count: 37, lastSearchedAt: Date.now() - 1000 * 60 * 85 },
  { query: 'Delineador Carimbo', count: 32, lastSearchedAt: Date.now() - 1000 * 60 * 65 },
  { query: 'Organizador Giratório', count: 28, lastSearchedAt: Date.now() - 1000 * 60 * 120 },
  { query: 'Roda Abdominal Automática', count: 25, lastSearchedAt: Date.now() - 1000 * 60 * 140 },
  { query: 'Luminária Lua Flutuante', count: 22, lastSearchedAt: Date.now() - 1000 * 60 * 210 },
];

export const RECENT_SEARCHES_EVENT = 'tikblox:recent_searches_updated';

/**
 * Retrieves saved searches from localStorage with error handling.
 * Seeds with initial miner query telemetry if no search history exists.
 */
export function getRecentSearches(): RecentSearchItem[] {
  if (typeof window === 'undefined') return SEED_SEARCH_QUERIES;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed initial queries for immediate rich telemetry in database
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SEARCH_QUERIES));
      return SEED_SEARCH_QUERIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter(
        (item): item is RecentSearchItem =>
          item &&
          typeof item.query === 'string' &&
          typeof item.count === 'number' &&
          typeof item.lastSearchedAt === 'number'
      );
    }
    // If empty array was stored, populate seed
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SEARCH_QUERIES));
    return SEED_SEARCH_QUERIES;
  } catch (err) {
    console.warn('Could not read recent searches from localStorage:', err);
  }
  return SEED_SEARCH_QUERIES;
}

/**
 * Saves or updates a search query in localStorage.
 * Increments count and updates timestamp if already present.
 */
export function saveRecentSearch(rawQuery: string): RecentSearchItem[] {
  if (typeof window === 'undefined') return [];
  const trimmed = rawQuery.trim();
  if (!trimmed || trimmed.length < 2) return getRecentSearches();

  try {
    const current = getRecentSearches();
    const existingIndex = current.findIndex(
      (item) => item.query.toLowerCase() === trimmed.toLowerCase()
    );

    let updated: RecentSearchItem[];

    if (existingIndex >= 0) {
      const existing = current[existingIndex];
      const updatedItem: RecentSearchItem = {
        query: trimmed, // keep latest casing
        count: (existing.count || 1) + 1,
        lastSearchedAt: Date.now(),
      };
      // Move to top
      updated = [
        updatedItem,
        ...current.slice(0, existingIndex),
        ...current.slice(existingIndex + 1),
      ];
    } else {
      const newItem: RecentSearchItem = {
        query: trimmed,
        count: 1,
        lastSearchedAt: Date.now(),
      };
      updated = [newItem, ...current];
    }

    // Limit array size
    if (updated.length > MAX_ITEMS) {
      updated = updated.slice(0, MAX_ITEMS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(RECENT_SEARCHES_EVENT, { detail: updated }));
    return updated;
  } catch (err) {
    console.warn('Could not save recent search to localStorage:', err);
    return getRecentSearches();
  }
}

/**
 * Removes a specific query from recent searches
 */
export function removeRecentSearch(queryToRemove: string): RecentSearchItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const current = getRecentSearches();
    const updated = current.filter(
      (item) => item.query.toLowerCase() !== queryToRemove.trim().toLowerCase()
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(RECENT_SEARCHES_EVENT, { detail: updated }));
    return updated;
  } catch (err) {
    console.warn('Could not remove recent search from localStorage:', err);
    return getRecentSearches();
  }
}

/**
 * Clears all recent searches from localStorage
 */
export function clearAllRecentSearches(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(RECENT_SEARCHES_EVENT, { detail: [] }));
  } catch (err) {
    console.warn('Could not clear recent searches from localStorage:', err);
  }
}

/**
 * Returns searches sorted by highest frequency of use
 */
export function getTopSearches(searches: RecentSearchItem[], limit = 4): RecentSearchItem[] {
  return [...searches]
    .filter((s) => s.count > 1)
    .sort((a, b) => b.count - a.count || b.lastSearchedAt - a.lastSearchedAt)
    .slice(0, limit);
}
