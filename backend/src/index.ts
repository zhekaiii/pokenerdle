import dotenv from "dotenv";
import express from "express";
import "./data/cache.js";
import battlesRouter from "./routes/battles.routes.js";
import dataRouter from "./routes/data.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3456;
const router = express.Router();

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(express.json());

// Prefix all routes with /api
router.use(battlesRouter);
router.use(dataRouter);

app.use("/api", router);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
