import { createBrowserRouter, RouteObject } from "react-router";
import LinkBattle from "../components/LinkBattle";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <LinkBattle />,
  },
];

export const router = createBrowserRouter(routes);
