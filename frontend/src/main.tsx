// frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

class ErrorBoundary extends React.Component<{}, { hasError: boolean; err?: any }> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(err: any) {
    return { hasError: true, err };
  }
  componentDidCatch(err: any, info: any) {
    console.error("ErrorBoundary:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 16 }}>Se rompió el render. Mirá la consola (ErrorBoundary).</div>;
    }
    return this.props.children as any;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
