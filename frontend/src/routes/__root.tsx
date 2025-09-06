import breakpoints from "@/utils/breakpoints";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  redirect,
  Scripts,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useMedia } from "react-use";
import Header from "../layout/components/Header";
import MobileFooter from "../layout/components/MobileFooter";
import PageContainer from "../layout/PageContainer";

function RootLayout() {
  const isSmallerThanSm = useMedia(`(max-width: ${breakpoints.sm}px)`, false);
  const {
    i18n: { language },
  } = useTranslation();

  return (
    <html lang={language}>
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/png" href="/pokeball.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content"
        />
        <meta name="theme-color" content="#ffffff" />
        <title>PokéNerdle</title>
        <meta
          name="description"
          content="PokéNerdle is a Pokémon-themed web game packed with fun, challenge, and evolving game modes. Play solo or with friends and prove you're a true Pokénerd!"
        />
        <meta
          name="keywords"
          content="Pokemon, Game, Puzzle, PokéNerdle, PokeChain, PokeNerdle"
        />
        <meta property="og:title" content="PokéNerdle" />
        <meta
          property="og:description"
          content="PokéNerdle is a Pokémon-themed web game packed with fun, challenge, and evolving game modes. Play solo or with friends and prove you're a true Pokénerd!"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://pokenerdle.app/pokenerdle.png"
        />
        <HeadContent />
      </head>
      <body>
        <PageContainer>
          <Header />
          <Outlet />
          {isSmallerThanSm && <MobileFooter />}
        </PageContainer>
        <Scripts />
      </body>
    </html>
  );
}

interface RootRouteContext {
  shouldShowRuleButton?: boolean;
  head: string;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  head: () => ({
    scripts: import.meta.env.PROD
      ? [
          {
            type: "module",
            src: "/static/entry-client.js",
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
});
