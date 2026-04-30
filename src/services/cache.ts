type CacheEntry<T> = {
    data: T;
    expiresAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 Minutes

export function cacheGet<T>(key: string): T | null {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (!entry || Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
    }
    return entry.data;
}

export function cacheSet<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
    store.set(key, {data, expiresAt: Date.now() + ttlMs});
}

export function cacheInvalidate(key: string): void {
    store.delete(key);
}
