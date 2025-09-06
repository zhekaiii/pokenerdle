import {
  RouterServer,
  createRequestHandler,
  renderRouterToString,
} from "@tanstack/react-router/ssr/server";
import type express from "express";
import { pipeline } from "node:stream/promises";
import "./fetch-polyfill";
import { createRouter } from "./router";

export async function render({
  req,
  res,
  head,
}: {
  head: string;
  req: express.Request;
  res: express.Response;
}) {
  // Convert the express request to a fetch request
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
      const router = createRouter();

      // Update each router instance with the head info from vite
      router.update({
        context: {
          ...router.options.context,
          head,
        },
      });
      return router;
    },
  });

  // Let's use the default stream handler to create the response
  const response = await handler(({ responseHeaders, router }) =>
    renderRouterToString({
      responseHeaders,
      router,
      children: <RouterServer router={router} />,
    })
  );

  // Convert the fetch response back to an express response
  res.statusMessage = response.statusText;
  res.status(response.status);

  response.headers.forEach((value, name) => {
    res.setHeader(name, value);
  });

  // Stream the response body
  // @ts-expect-error response.body is not null
  return pipeline(response.body, res);
}
