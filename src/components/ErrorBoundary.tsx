import { Component, type ReactNode } from 'react'

interface State {
  error: Error | null
}

/**
 * Last line of defense: unexpected render errors show a recoverable screen
 * instead of a blank page. Data in localStorage is untouched.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="crash-screen" role="alert">
          <h1>Something went wrong</h1>
          <p>
            The app hit an unexpected error while rendering. Your data is safe in this browser's
            storage.
          </p>
          <pre className="crash-detail">{this.state.error.message}</pre>
          <button type="button" className="btn btn-primary" onClick={() => location.reload()}>
            Reload app
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
