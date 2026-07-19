import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { getItem, setItem, removeItem } from '@/services/mmkvStorage';

/**
 * Wraps MMKV in the sync Storage interface TanStack Query expects, so the
 * entire query cache (events list, attendance status, map events, etc.)
 * gets written to disk and can be restored instantly on app start —
 * including while offline.
 */
export const mmkvQueryPersister = createSyncStoragePersister({
  storage: {
    getItem,
    setItem,
    removeItem,
  },
});
