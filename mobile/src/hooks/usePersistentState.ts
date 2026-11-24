import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

/** useState persisted to device storage (AsyncStorage) — like localStorage on the web. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (!cancelled && raw !== null) setValue(JSON.parse(raw) as T)
      })
      .finally(() => !cancelled && setLoaded(true))
    return () => {
      cancelled = true
    }
  }, [key])

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {})
  }, [key, value, loaded])

  return [value, setValue, loaded] as const
}
