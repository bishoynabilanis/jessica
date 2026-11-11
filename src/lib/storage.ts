export interface StorageInfo {
  usage: number
  quota: number
  persisted: boolean
  supported: boolean
}

export async function getStorageInfo(): Promise<StorageInfo> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
    return { usage: 0, quota: 0, persisted: false, supported: false }
  }
  try {
    const [estimate, persisted] = await Promise.all([
      navigator.storage.estimate(),
      navigator.storage.persisted?.().catch(() => false) ?? Promise.resolve(false),
    ])
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      persisted: !!persisted,
      supported: true,
    }
  } catch {
    return { usage: 0, quota: 0, persisted: false, supported: false }
  }
}

export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return false
  try {
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

export function formatBytes(bytes: number, lang: 'en' | 'ar' = 'en') {
  if (!bytes) return lang === 'ar' ? '٠ ميجا' : '0 MB'
  const mb = bytes / (1024 * 1024)
  const value = mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
  return value
}
