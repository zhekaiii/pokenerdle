import express from "express";
import getPort, { portNumbers } from "get-port";
import i18n from "i18next";
import FsBackend from "i18next-fs-backend";
import i18nMiddleware from "i18next-http-middleware";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import * as zlib from "node:zlib";
import { initReactI18next } from "react-i18next";
import manifest from "./dist/client/.vite/manifest.json" assert { type: "json" };

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;

i18n
  .use(initReactI18next)
  .use(i18nMiddleware.LanguageDetector)
  .use(FsBackend)
  .init({
    preload: ["en", "zh-Hans", "zh-Hant"],
    ns: fs.readdirSync(path.join(import.meta.dirname, "./public/locales")),
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

export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production",
  hmrPort
) {
  const app = express();

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite;
  if (!isProd) {
    vite = await (
      await import("vite")
    ).createServer({
      root,
      logLevel: isTest ? "error" : "info",
      server: {
        middlewareMode: true,
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100,
        },
        hmr: {
          port: hmrPort,
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

  if (isProd) app.use(express.static("./dist/client"));

  app.use(i18nMiddleware.handle(i18n));

  let cssFiles = [];
  if (isProd) {
    cssFiles = manifest["src/entry-client.tsx"].css;
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

      viteHead += cssFiles
        .map((css) => `<link rel="stylesheet" href="${css}" />`)
        .join("");

      const entry = await (async () => {
        if (!isProd) {
          return vite.ssrLoadModule("/src/entry-server.tsx");
        } else {
          return import("./dist/server/entry-server.js");
        }
      })();

      console.info("Rendering: ", url, "...");
      entry.render({ req, res, head: viteHead });
    } catch (e) {
      if (!isProd) vite.ssrFixStacktrace(e);
      console.info(e.stack);
      res.status(500).end(e.stack);
    }
  });

  return { app, vite };
}

if (!isTest) {
  createServer().then(async ({ app }) => {
    const port = await getPort({ port: portNumbers(5173, 5273) });
    return app.listen(port, () => {
      console.info(`Client Server: http://localhost:${port}`);
    });
  });
}
