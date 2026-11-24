import { useCallback, useState } from 'react'

/** useState that persists to localStorage. */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Lazy initializer: runs only on the first render.
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? next(prev) : next
        try {
          localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          /* storage may be unavailable (private mode) */
        }
        return resolved
      })
    },
    [key],
  )

  return [value, set] as const
}
