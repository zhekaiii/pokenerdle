import { NoticePlacementSchema, NoticeResponse } from "@pokenerdle/shared/notices";
import { Response } from "express";
import { StatusCode } from "../data/const.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { getNoticeService } from "../services/notices.service.js";

export const getNoticeController = async (req: AuthenticatedRequest, res: Response) => {
  const placement = NoticePlacementSchema.safeParse(req.params.placement);
  if (!placement.success) {
    res.status(StatusCode.NOT_FOUND).json({ error: "unknown_placement" });
    return;
  }
  const body: NoticeResponse = {
    notice: await getNoticeService(placement.data, Boolean(req.user)),
  };
  // Depends on auth, so never share it between users.
  res.set("Cache-Control", "private, no-store");
  res.json(body);
};
