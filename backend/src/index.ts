import dotenv from "dotenv";
import express from "express";
import { RouteNames } from "./data/const.js";
import dataRouter from "./routes/data.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3456;

app.use(RouteNames.DATA, dataRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
