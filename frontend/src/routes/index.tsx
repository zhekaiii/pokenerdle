import { createBrowserRouter, RouteObject } from "react-router-dom";
import PokeChain from "../components/PokeChain";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <PokeChain />,
  },
];

export const router = createBrowserRouter(routes);
