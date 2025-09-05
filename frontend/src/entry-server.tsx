import { renderToString } from "react-dom/server";
import App from "./App";
import "./index.css";

interface SSRContext {
  nonce?: string;
  [key: string]: unknown;
}

export function render(url: string, context: SSRContext = {}) {
  // For initial SSR setup, we'll render the basic App structure
  // Router will be handled client-side for now
  const html = renderToString(<App />);

  return { html };
}
