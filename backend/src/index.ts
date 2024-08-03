import dotenv from "dotenv";
import express from "express";
import "./data/cache.js";
import { RouteNames } from "./data/const.js";
import battlesRouter from "./routes/battles.routes.js";
import dataRouter from "./routes/data.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3456;

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(RouteNames.BATTLES, battlesRouter);
app.use(RouteNames.DATA, dataRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
