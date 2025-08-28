import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: unknown };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: undefined };
  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: "system-ui" }}>
          <h1>Something went wrong.</h1>
          <pre style={{ whiteSpace: "pre-wrap", color: "#c00", background: "#fff3f3", padding: 12, border: "1px solid #f0caca" }}>
            {String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
