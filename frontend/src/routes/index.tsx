import LoadingDialog from "@/components/recyclables/LoadingDialog";
import ErrorPage from "@/layout/ErrorPage";
import Layout from "@/layout/Layout";
import DailyChallengePage from "@/pages/DailyChallenge";
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouteObject } from "react-router";
import HowToPlayPage from "../pages/HowToPlay";

const DailyChallengeRules = lazy(
  () => import("@/pages/HowToPlay/DailyChallengeRules")
);
const PathFinder = lazy(() => import("../components/PathFinder"));
const PokeChain = lazy(() => import("../components/PokeChain"));
const PathFinderRules = lazy(
  () => import("../pages/HowToPlay/PathFinderRules")
);
const PokeChainRules = lazy(() => import("../pages/HowToPlay/PokeChainRules"));

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <Navigate to="daily" />,
      },
      {
        path: "daily",
        element: (
          <Suspense fallback={<LoadingDialog open />}>
            <DailyChallengePage />
          </Suspense>
        ),
      },
      {
        path: "pokechain",
        element: (
          <Suspense fallback={<LoadingDialog open />}>
            <PokeChain />
          </Suspense>
        ),
      },
      {
        path: "path-finder",
        element: (
          <Suspense fallback={<LoadingDialog open />}>
            <PathFinder />
          </Suspense>
        ),
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
            element: (
              <Suspense fallback={<LoadingDialog open />}>
                <DailyChallengeRules />
              </Suspense>
            ),
          },
          {
            path: "pokechain",
            element: (
              <Suspense fallback={<LoadingDialog open />}>
                <PokeChainRules />
              </Suspense>
            ),
          },
          {
            path: "path-finder",
            element: (
              <Suspense fallback={<LoadingDialog open />}>
                <PathFinderRules />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
