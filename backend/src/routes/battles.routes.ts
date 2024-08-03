import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Battles route");
});

export default router;
