import ErrorPage from "@/layout/ErrorPage";
import Layout from "@/layout/Layout";
import { createBrowserRouter, Navigate, RouteObject } from "react-router";
import HowToPlayPage from "../pages/HowToPlay";

export type RouteHandle = {
  shouldShowRuleButton?: boolean;
};

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: (
          <Navigate
            to={{
              pathname: "daily",
              hash: location.hash,
              search: location.search,
            }}
            replace
          />
        ),
      },
      {
        path: "daily",
        lazy: () => import("@/pages/DailyChallenge"),
        handle: {
          shouldShowRuleButton: true,
        },
      },
      {
        path: "pokechain",
        lazy: () => import("@/components/PokeChain"),
        handle: {
          shouldShowRuleButton: true,
        },
      },
      {
        path: "path-finder",
        lazy: () => import("@/components/PathFinder"),
        handle: {
          shouldShowRuleButton: true,
        },
      },
      {
        path: "settings",
        lazy: () => import("@/pages/Settings"),
      },
      {
        path: "how-to-play",
        element: <HowToPlayPage />,
        handle: {
          shouldShowRuleButton: true,
        },
        children: [
          {
            path: "",
            element: <Navigate to="daily" replace />,
          },
          {
            path: "daily",
            lazy: () => import("@/pages/HowToPlay/DailyChallengeRules"),
          },
          {
            path: "pokechain",
            lazy: () => import("@/pages/HowToPlay/PokeChainRules"),
          },
          {
            path: "path-finder",
            lazy: () => import("@/pages/HowToPlay/PathFinderRules"),
          },
        ],
      },
      {
        path: "/how-to-play/*",
        element: <Navigate to="/how-to-play/daily" replace />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
