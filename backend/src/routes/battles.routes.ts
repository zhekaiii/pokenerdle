import { Router } from "express";
import { createBattleRoom } from "../controllers/battles.controllers.js";
import { RouteNames } from "../data/const.js";

const router = Router();

router.post("/room", createBattleRoom);

export default Router().use(RouteNames.BATTLES, router);
