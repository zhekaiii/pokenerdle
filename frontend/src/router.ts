import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { Store } from "jotai/vanilla/store";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { TFunction } from "i18next";
import i18n from "./lib/i18n";

export const createRouter = (store: Store, i18nInstance = i18n) => {
  return createTanstackRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    context: {
      head: "",
      store,
      i18n
    },
  });
};

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
