import { Router } from "express";
import { getNoticeController } from "../controllers/notices.controllers.js";
import { RouteNames } from "../data/const.js";
import { optionalAuthenticateUser } from "../middlewares/auth.js";

const router = Router();

router.get("/:placement", optionalAuthenticateUser, getNoticeController);

export default Router().use(RouteNames.NOTICES_API, router);
