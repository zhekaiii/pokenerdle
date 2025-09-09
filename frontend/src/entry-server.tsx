import { Session } from "@supabase/supabase-js";
import {
  RouterServer,
  createRequestHandler,
  renderRouterToString,
} from "@tanstack/react-router/ssr/server";
import type express from "express";
import type { i18n } from "i18next";
import { createStore } from "jotai";
import AppProvider from "./AppProviders";
import { sessionAtom, userAtom } from "./atoms/auth";
import { themeAtom } from "./atoms/theme";
import "./fetch-polyfill";
import { initializeSSRData } from "./lib/ssr-data";
import { createRouter } from "./router";
import { getThemeFromCookies } from "./utils/theme";

const ssrDataInitializePromise = initializeSSRData();

export async function render({
  req,
  res,
  head,
}: {
  head: string;
  req: express.Request & { i18n: i18n; session: Session | null };
  res: express.Response;
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

  // Let's use the default stream handler to create the response
  const response = await handler(({ responseHeaders, router }) =>
    renderRouterToString({
      responseHeaders,
      router,
      children: (
        <AppProvider i18nInstance={req.i18n} store={store}>
          <RouterServer router={router} />
        </AppProvider>
      ),
    })
  );

  // Convert the fetch response back to an express response
  res.statusMessage = response.statusText;
  res.status(response.status);

  response.headers.forEach((value, name) => {
    res.setHeader(name, value);
  });
  let html = await response.text();

  html = html.replace(/<\/head>/, `${head}</head>`);

  res.send(html);
}
