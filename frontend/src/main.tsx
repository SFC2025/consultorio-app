import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

type EBProps = { children: React.ReactNode };
type EBState = { hasError: boolean; err?: any };

class ErrorBoundary extends React.Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(err: any): EBState {
    return { hasError: true, err };
  }
  componentDidCatch(err: any, info: any) {
    console.error("ErrorBoundary:", err, info);
  }
  render(): React.ReactNode {
    if (this.state.hasError) {
      return <div style={{ padding: 16 }}>Se rompió el render. Mirá la consola (ErrorBoundary).</div>;
    }
    return this.props.children; 
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
