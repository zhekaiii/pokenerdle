import { sessionAtom, userAtom } from "@/atoms/auth";
import { themeAtom } from "@/atoms/theme";
import { ErrorPage } from "@/layout/ErrorPage";
import {
  AnyRouteMatch,
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  redirect,
  Scripts,
} from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { Store } from "jotai/vanilla/store";
import { useTranslation } from "react-i18next";
import Header from "../layout/components/Header";
import MobileFooter from "../layout/components/MobileFooter";
import PageContainer from "../layout/PageContainer";

type SearchParams = {
  v?: string;
}

function RootLayout() {
  const { session, user } = Route.useLoaderData();
  const { v } = Route.useSearch() as SearchParams;

  useHydrateAtoms([
    [sessionAtom, session],
    [userAtom, user],
  ]);
  const theme = useAtomValue(themeAtom);
  const {
    i18n: { language },
  } = useTranslation();

  return (
    <html
      lang={language}
      className={
        theme === "dark"
          ? "tw:dark"
          : theme === "light"
          ? "tw:light"
          : undefined
      }
    >
      <head>
        <meta charSet="UTF-8" />
        <HeadContent />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content"
        />
        {theme === "light" ? (
          <meta name="theme-color" content="#ffffff" />
        ) : theme === "dark" ? (
          <meta name="theme-color" content="#171717" />
        ) : (
          <>
            <meta
              name="theme-color"
              content="#ffffff"
              media="(prefers-color-scheme: light)"
            />
            <meta
              name="theme-color"
              content="#171717"
              media="(prefers-color-scheme: dark)"
            />
          </>
        )}

        <meta
          name="description"
          content="PokéNerdle is a Pokémon-themed web game packed with fun, challenge, and evolving game modes. Play solo or with friends and prove you're a true Pokénerd!"
        />
        <meta
          name="keywords"
          content="Pokemon, Game, Puzzle, PokéNerdle, PokeChain, PokeNerdle"
        />
        <meta
          property="og:description"
          content="PokéNerdle is a Pokémon-themed web game packed with fun, challenge, and evolving game modes. Play solo or with friends and prove you're a true Pokénerd!"
        />
        <meta property="og:type" content="website" />
        {v !== "24678" && (
          <meta
            property="og:image"
            content="https://pokenerdle.app/ogimage.png"
          />
        )}
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body>
        <PageContainer>
          <Header />
          <Outlet />
          <MobileFooter />
        </PageContainer>
        <Scripts />
      </body>
    </html>
  );
}

interface RootRouteContext {
  shouldShowRuleButton?: boolean;
  head: string;
  scripts?: AnyRouteMatch["headScripts"];
  links?: AnyRouteMatch["links"];
  store: Store;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  loader: ({ context: { scripts = [], links = [], store } }) => {
    const session = store.get(sessionAtom);
    const user = store.get(userAtom);
    return {
      session,
      user,
      scripts,
      links,
    };
  },
  head: ({ loaderData: { scripts = [], links = [] } = {} }) => ({
    meta: [
      { title: "PokéNerdle" },
      { property: "og:title", content: "PokéNerdle" },
    ],
    scripts: [
      ...(import.meta.env.SSR ? scripts : []),
      ...(import.meta.env.PROD
        ? [
            {
              type: "module",
              src: "/assets/entry-client.js",
            },
          ]
        : [
            {
              type: "module",
              children: `import RefreshRuntime from "/@react-refresh"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true`,
            },
            {
              type: "module",
              src: "/src/entry-client.tsx",
            },
          ]),
    ],
    links: import.meta.env.SSR ? links : [],
  }),
  component: RootLayout,
  beforeLoad: ({ location }) => {
    if (location.pathname === "/") {
      throw redirect({
        to: "/daily",
        search: location.search,
        hash: location.hash,
        replace: true,
      });
    }
  },
  errorComponent: ErrorPage,
  validateSearch: ({ v }): SearchParams => {
    if (v) {
      return {
        v: String(v),
      };
    }
    return {};
  },
});
