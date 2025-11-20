import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { Store } from "jotai/vanilla/store";

// Import the generated route tree
import i18n from "./lib/i18n";
import { routeTree } from "./routeTree.gen";

export const createRouter = (store: Store, i18nInstance = i18n) => {
  return createTanstackRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    context: {
      head: "",
      store,
      i18n: i18nInstance,
    },
  });
};

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
