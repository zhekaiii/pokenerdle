import { Session } from "@supabase/supabase-js";
import { AnyRouteMatch } from "@tanstack/react-router";
import {
  RouterServer,
  createRequestHandler,
  renderRouterToStream,
} from "@tanstack/react-router/ssr/server";
import type express from "express";
import type { i18n } from "i18next";
import { createStore } from "jotai";
import { pipeline } from "node:stream/promises";
import AppProviders from "./AppProviders";
import { posthogAtom, sessionAtom, userAtom } from "./atoms/auth";
import { themeAtom } from "./atoms/theme";
import "./fetch-polyfill";
import { createSocket } from "./hooks/useSocket";
import { createQueryClient } from "./lib/query";
import { createRouter } from "./router";
import { initializeSSRData } from "./ssr/loader";
import { getThemeFromCookies } from "./utils/theme";

const ssrDataInitializePromise = initializeSSRData();

export async function render({
  req,
  res,
  head,
  links,
  scripts,
}: {
  head: string;
  req: express.Request & {
    i18n: i18n;
    session: Session | null;
    posthogDistinctId?: string;
  };
  res: express.Response;
  links?: AnyRouteMatch["links"];
  scripts?: AnyRouteMatch["scripts"];
}) {
  await ssrDataInitializePromise;

  const url = new URL(req.originalUrl || req.url, "https://localhost:5173")
    .href;

  const request = new Request(url, {
    method: req.method,
    headers: (() => {
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        headers.set(key, value as string);
      }
      return headers;
    })(),
  });

  // Create a request handler
  const handler = createRequestHandler({
    request,
    createRouter: () => {
      const router = createRouter(store);

      // Update each router instance with the head info from vite
      router.update({
        context: {
          ...router.options.context,
          head,
          store,
          links,
          scripts,
        },
      });
      return router;
    },
  });

  const theme = getThemeFromCookies(req.headers.cookie);
  const store = createStore();
  store.set(themeAtom, theme);
  store.set(sessionAtom, req.session);
  store.set(userAtom, req.session?.user ?? null);
  store.set(posthogAtom, { distinct_id: req.posthogDistinctId ?? null });

  // Let's use the default stream handler to create the response
  const response = await handler(({ responseHeaders, router }) =>
    renderRouterToStream({
      request,
      responseHeaders,
      router,
      children: (
        <AppProviders
          i18nInstance={req.i18n}
          store={store}
          queryClient={createQueryClient()}
          socket={createSocket()}
        >
          <RouterServer router={router} />
        </AppProviders>
      ),
    })
  );

  // Convert the fetch response back to an express response
  res.statusMessage = response.statusText;
  res.status(response.status);

  response.headers.forEach((value, name) => {
    res.setHeader(name, value);
  });

  // @ts-expect-error response.body is not null
  return pipeline(response.body, res);
}
