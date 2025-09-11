import { sessionAtom, userAtom } from "@/atoms/auth";
import { themeAtom } from "@/atoms/theme";
import { ErrorPage } from "@/layout/ErrorPage";
import {
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
import themeListenerScript from "../utils/themeListener?worker&url";

function RootLayout() {
  const { session, user } = Route.useLoaderData();
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
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content"
        />
        <meta name="theme-color" content="#ffffff" />
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
        <meta
          property="og:image"
          content="https://pokenerdle.app/ogimage.png"
        />
        <HeadContent />
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
  store: Store;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  head: () => ({
    meta: [
      { title: "PokéNerdle" },
      { property: "og:title", content: "PokéNerdle" },
    ],
    scripts: [
      {
        type: "module",
        src: themeListenerScript,
      },
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
  loader: ({ context: { store } }) => {
    const session = store.get(sessionAtom);
    const user = store.get(userAtom);
    return {
      session,
      user,
    };
  },
});
