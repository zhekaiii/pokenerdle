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
import { TFunction } from "i18next";

type SearchParams = {
  v?: string;
};

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
        <link rel="canonical" href="https://pokenerdle.app" />
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
          name="keywords"
          content="Pokemon, Game, Puzzle, PokéNerdle, PokeChain, PokeNerdle"
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
  t: TFunction;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  loader: ({ context: { store } }) => {
    const session = store.get(sessionAtom);
    const user = store.get(userAtom);
    return {
      session,
      user,
    };
  },
  head: ({ match }) => ({
    meta: [
      { title: match.context.t("meta:title.root") },
      { property: "og:title", content: match.context.t("meta:title.root") },
      {
        property: "og:description",
        content:
          match.context.t("meta:description.root"),
      },
      {
        property: "description",
        content:
          match.context.t("meta:description.root"),
      },
    ],
    scripts: [
      ...(import.meta.env.SSR ? match.context.scripts ?? [] : []),
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
    links: import.meta.env.SSR ? match.context.links ?? [] : [],
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
