import ErrorPage from "@/layout/ErrorPage";
import Layout from "@/layout/Layout";
import { createBrowserRouter, Navigate, RouteObject } from "react-router";
import HowToPlayPage from "../pages/HowToPlay";

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
      },
      {
        path: "pokechain",
        lazy: () => import("@/components/PokeChain"),
      },
      {
        path: "path-finder",
        lazy: () => import("@/components/PathFinder"),
      },
      {
        path: "how-to-play",
        element: <HowToPlayPage />,
        children: [
          {
            path: "",
            // element: <Navigate to="daily" replace />,
            element: <Navigate to="pokechain" replace />,
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
    ],
  },
];

export const router = createBrowserRouter(routes);
