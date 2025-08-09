import ErrorBoundary from "@/layout/ErrorBoundary";
import Layout from "@/layout/Layout";
import DailyChallengePage from "@/pages/DailyChallenge";
import DailyChallengeRules from "@/pages/HowToPlay/DailyChallengeRules";
import { createBrowserRouter, Navigate, RouteObject } from "react-router";
import PathFinder from "../components/PathFinder";
import PokeChain from "../components/PokeChain";
import HowToPlayPage from "../pages/HowToPlay";
import PathFinderRules from "../pages/HowToPlay/PathFinderRules";
import PokeChainRules from "../pages/HowToPlay/PokeChainRules";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "",
        // element: <Navigate to="daily" />,
        element: <Navigate to="pokechain" />,
      },
      {
        path: "daily",
        element: <DailyChallengePage />,
      },
      {
        path: "pokechain",
        element: <PokeChain />,
      },
      {
        path: "path-finder",
        element: <PathFinder />,
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
            element: <DailyChallengeRules />,
          },
          {
            path: "pokechain",
            element: <PokeChainRules />,
          },
          {
            path: "path-finder",
            element: <PathFinderRules />,
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
