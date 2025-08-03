import Layout from "@/layout/Layout";
import { createBrowserRouter, Navigate, RouteObject } from "react-router";
import PokeChain from "../components/PokeChain";
import HowToPlay from "./HowToPlay";
import PathFinder from "../components/PathFinder";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Navigate to="/pokechain" replace />,
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
        element: <HowToPlay />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
