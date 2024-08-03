import { Router } from "express";
import { RouteNames } from "../data/const.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("Battles route");
});

export default Router().use(RouteNames.BATTLES, router);
