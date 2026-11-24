import { useEffect, useState } from 'react'

type State<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'success'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: Error }

/**
 * Classic effect-based data fetching with race-condition protection.
 * `fetcher` receives an AbortSignal so stale requests are cancelled.
 */
export function useFetch<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<State<T>>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    // oxlint-disable-next-line react/set-state-in-effect -- reset to loading when inputs change
    setState({ status: 'loading' })
    fetcher(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((error: Error) => {
        if (!controller.signal.aborted) setState({ status: 'error', error })
      })
    return () => controller.abort()
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- deps are supplied by the caller
  }, deps)

  return state
}
