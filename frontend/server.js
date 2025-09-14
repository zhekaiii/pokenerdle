import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import dotenv from "dotenv";
import express from "express";
import i18n from "i18next";
import FsBackend from "i18next-fs-backend";
import i18nMiddleware from "i18next-http-middleware";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import * as zlib from "node:zlib";
import { initReactI18next } from "react-i18next";

dotenv.config({
  path: path.join(import.meta.dirname, ".env"),
});

const isProd = process.env.NODE_ENV === "production";

i18n
  .use(initReactI18next)
  .use(i18nMiddleware.LanguageDetector)
  .use(FsBackend)
  .init({
    preload: ["en", "zh-Hans", "zh-Hant"],
    ns: fs.readdirSync(path.join(import.meta.dirname, "./public/locales")),
    defaultNS: "common",
    fallbackNS: "common",
    backend: {
      loadPath: path.join(
        import.meta.dirname,
        "./public/locales/{{ns}}/{{lng}}.json"
      ),
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["cookie", "header"],
      caches: ["cookie"],
      cookieMinutes: 60 * 24 * 365 * 10, // 10 years,
      convertDetectedLanguage: (code) => {
        if (["zh-TW", "zh-HK", "zh-MO", "zh-Hant"].includes(code)) {
          return "zh-Hant";
        }
        if (code.startsWith("zh")) {
          return "zh-Hans";
        }
        return "en";
      },
    },
  });

/**
 * @type {import('express').RequestHandler}
 */
const authCallback = async (req, res) => {
  const code = req.query.code;
  const next = req.query.next ?? "/";
  if (code) {
    await req.supabase.auth.exchangeCodeForSession(code);
  }
  res.redirect(303, next);
};

/**
 *
 * @param {express.Application} app
 * @returns
 */
export async function createServer(app) {
  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite;
  /**
   * @type {import('@tanstack/react-router').AnyRouteMatch["scripts"]}
   */
  let scripts = [];
  /**
   * @type {import('@tanstack/react-router').AnyRouteMatch["links"]}
   */
  let links = [];
  if (!isProd) {
    vite = await (
      await import("vite")
    ).createServer({
      root: process.cwd(),
      logLevel: "info",
      server: {
        middlewareMode: true,
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100,
        },
        hmr: {
          port: undefined,
        },
      },
      appType: "custom",
    });
    // use vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    app.use(
      (await import("compression")).default({
        brotli: {
          flush: zlib.constants.BROTLI_OPERATION_FLUSH,
        },
        flush: zlib.constants.Z_SYNC_FLUSH,
      })
    );
  }

  if (isProd)
    app.use(express.static(path.join(import.meta.dirname, "./dist/client")));

  app.use(i18nMiddleware.handle(i18n));
  app.use(async (req, res, next) => {
    const supabase = createServerClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(req.headers.cookie ?? "");
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              res.appendHeader(
                "Set-Cookie",
                serializeCookieHeader(name, value, options)
              )
            );
          },
        },
      }
    );
    req.supabase = supabase;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      req.session = session;
    }
    next();
  });

  app.get("/auth/callback", authCallback);

  let cssFile = "";
  let preloadFiles = [];
  if (isProd) {
    const manifest = JSON.parse(
      await fs.promises.readFile(
        path.join(import.meta.dirname, "./dist/client/.vite/manifest.json"),
        "utf-8"
      )
    );
    cssFile = manifest["style.css"].file;
    Object.values(manifest)
      .filter((file) =>
        [
          "vendor-react",
          "vendor-router",
          "vendor-i18n",
          "vendor-posthog",
        ].includes(file.name)
      )
      .forEach((file) =>
        links.push({
          rel: "modulepreload",
          href: file.file,
        })
      );
    links.push({
      rel: "stylesheet",
      href: cssFile,
    });
  }

  app.use(/(.*)/, async (req, res) => {
    try {
      const url = req.originalUrl;

      if (path.extname(url) !== "") {
        console.warn(`${url} is not valid router path`);
        res.status(404);
        res.end(`${url} is not valid router path`);
        return;
      }

      // Best effort extraction of the head from vite's index transformation hook
      let viteHead = !isProd
        ? await vite.transformIndexHtml(
            url,
            `<html><head></head><body></body></html>`
          )
        : "";

      viteHead = viteHead.substring(
        viteHead.indexOf("<head>") + 6,
        viteHead.indexOf("</head>")
      );

      const entry = await (async () => {
        if (!isProd) {
          return vite.ssrLoadModule("/src/entry-server.tsx");
        } else {
          return import(
            path.join(import.meta.dirname, "./dist/server/entry-server.js")
          );
        }
      })();

      console.info("Rendering: ", url, "...");
      entry.render({ req, res, head: viteHead, links, scripts });
    } catch (e) {
      if (!isProd) vite.ssrFixStacktrace(e);
      console.info(e.stack);
      res.status(500).end(e.stack);
    }
  });

  return { app, vite };
}

if (!isProd) {
  createServer(express()).then(async ({ app }) => {
    const port = process.env.PORT || 5173;
    return app.listen(port, () => {
      console.info(`Client Server: http://localhost:${port}`);
    });
  });
}
