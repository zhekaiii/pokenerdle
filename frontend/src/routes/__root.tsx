import { userAtom } from "@/atoms/auth";
import { themeAtom } from "@/atoms/theme";
import { ErrorPage } from "@/layout/ErrorPage";
import {
  AnyRouteMatch,
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import { i18n } from "i18next";
import { useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { Store } from "jotai/vanilla/store";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "../layout/components/Header";
import MobileFooter from "../layout/components/MobileFooter";
import SiteFooter from "../layout/components/SiteFooter";
import PageContainer from "../layout/PageContainer";

interface SearchParams {
  v?: string;
}

function RootLayout() {
  const { user } = Route.useLoaderData();
  const { v } = Route.useSearch() as SearchParams;
  const location = useLocation();
  const router = useRouter();

  useHydrateAtoms([[userAtom, user]]);
  const theme = useAtomValue(themeAtom);
  const { i18n } = useTranslation();

  useEffect(() => {
    const handler = () => {
      router.invalidate();
    };
    i18n.on("languageChanged", handler);
    return () => {
      i18n.off("languageChanged", handler);
    };
  }, [i18n, router]);

  return (
    <html
      lang={i18n.language}
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
        <meta content="PokéNerdle" name="apple-mobile-web-app-title"></meta>
        <link sizes="180x180" rel="apple-touch-icon" href="/180x180.png" />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)"
          href="splash_screens/iPhone_17_Pro_Max__iPhone_16_Pro_Max_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3)"
          href="splash_screens/iPhone_17_Pro__iPhone_17__iPhone_16_Pro_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
          href="splash_screens/iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 420px) and (device-height: 912px) and (-webkit-device-pixel-ratio: 3)"
          href="splash_screens/iPhone_Air_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
          href="splash_screens/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
          href="splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
          href="splash_screens/iPhone_17e__iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
          href="splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
          href="splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
          href="splash_screens/iPhone_11__iPhone_XR_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)"
          href="splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
          href="splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
          href="splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2)"
          href="splash_screens/13__iPad_Pro_M4_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
          href="splash_screens/12.9__iPad_Pro_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2)"
          href="splash_screens/11__iPad_Pro_M4_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
          href="splash_screens/11__iPad_Pro__10.5__iPad_Pro_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2)"
          href="splash_screens/10.9__iPad_Air_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)"
          href="splash_screens/10.5__iPad_Air_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2)"
          href="splash_screens/10.2__iPad_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
          href="splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2)"
          href="splash_screens/8.3__iPad_Mini_portrait.png"
        />
        <link
          rel="canonical"
          href={`https://pokenerdle.app${location.pathname}`}
        />
        <link
          rel="alternate"
          hrefLang="en"
          href={`https://pokenerdle.app${location.pathname}?lang=en`}
        />
        <link
          rel="alternate"
          hrefLang="zh-Hans"
          href={`https://pokenerdle.app${location.pathname}?lang=zh-Hans`}
        />
        <link
          rel="alternate"
          hrefLang="zh-Hant"
          href={`https://pokenerdle.app${location.pathname}?lang=zh-Hant`}
        />
        <meta
          property="og:url"
          content={`https://pokenerdle.app${location.pathname}?lang=${i18n.language}`}
        />
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
          <SiteFooter />
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
  i18n: i18n;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  loader: ({ context: { store } }) => {
    const user = store.get(userAtom);
    return {
      user,
    };
  },
  head: async ({ match }) => {
    await match.context.i18n.loadNamespaces("metadata");
    return {
      meta: [
        { title: match.context.i18n.t("metadata:title.root") },
        {
          property: "og:title",
          content: match.context.i18n.t("metadata:title.root"),
        },
        {
          property: "og:description",
          content: match.context.i18n.t("metadata:description.root"),
        },
        {
          name: "description",
          content: match.context.i18n.t("metadata:description.root"),
        },
      ],
      scripts: [
        ...(import.meta.env.SSR ? (match.context.scripts ?? []) : []),
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
      links: import.meta.env.SSR ? (match.context.links ?? []) : [],
    };
  },
  component: RootLayout,
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
