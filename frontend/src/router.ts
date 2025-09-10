import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { Store } from "jotai/vanilla/store";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

export const createRouter = (store: Store) => {
  return createTanstackRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    context: {
      head: "",
      store,
    },
  });
};

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
