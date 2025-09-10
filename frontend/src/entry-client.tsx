import { RouterClient } from "@tanstack/react-router/ssr/client";
import React from "react";
import { hydrateRoot } from "react-dom/client";
import AppProviders from "./AppProviders";
import { store } from "./atoms/store";
import { createSocket } from "./hooks/useSocket";
import "./lib/i18n.ts";
import { createQueryClient } from "./lib/query";
import { createRouter } from "./router";

const router = createRouter(store);
const queryClient = createQueryClient();
const socket = createSocket();

// This resolves the issue where rebuilding produces different hashes for the same file,
// causing the browser to load the old filename (which doesn't exist).
// https://vitejs.dev/guide/build#load-error-handling
window.addEventListener("vite:preloadError", (e) => {
  e.preventDefault();
  window.location.reload();
});

hydrateRoot(
  document,
  <React.StrictMode>
    <AppProviders queryClient={queryClient} socket={socket}>
      <RouterClient router={router} />
    </AppProviders>
  </React.StrictMode>
);
