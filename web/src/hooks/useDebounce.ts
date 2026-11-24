import { useEffect, useState } from 'react'

/** Returns `value` only after it has stopped changing for `delay` ms. */
export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id) // cleanup cancels the pending update
  }, [value, delay])

  return debounced
}
