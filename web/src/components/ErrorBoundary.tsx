import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Render prop that receives the error and a reset function. */
  fallback?: (error: Error, reset: () => void) => ReactNode
  /** Changing any of these keys resets the boundary. */
  resetKeys?: unknown[]
}

interface State {
  error: Error | null
}

/**
 * Error boundaries are still class components: they catch render errors in
 * their subtree and show a fallback instead of unmounting the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Send to your logging service here.
    console.warn('ErrorBoundary caught:', error.message, info.componentStack)
  }

  componentDidUpdate(prev: Props) {
    const changed = this.props.resetKeys?.some((k, i) => !Object.is(k, prev.resetKeys?.[i]))
    if (this.state.error && changed) this.reset()
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (error) {
      return this.props.fallback ? (
        this.props.fallback(error, this.reset)
      ) : (
        <div className="alert error" role="alert">
          <strong>Something went wrong:</strong> {error.message}
          <button onClick={this.reset}>Try again</button>
        </div>
      )
    }
    return this.props.children
  }
}
