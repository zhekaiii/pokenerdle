import dotenv from "dotenv";
import express, { ErrorRequestHandler } from "express";
import { createServer } from "http";
import path, { dirname } from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { initializeBattleWsRoutes } from "./handlers/index.js";
import "./lib/prisma.js";
import {
  porygonMiddleware,
  staticPorygonMiddleware,
} from "./middlewares/porygon.js";
import "./routes/battles.routes.js";
import battlesRouter from "./routes/battles.routes.js";
import dailyRouter from "./routes/daily.routes.js";
import dataRouter from "./routes/data.routes.js";
import pathfinderRouter from "./routes/pathfinder.routes.js";
import { PokeNerdleServer } from "./utils/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

const app = express();
app.set("trust proxy", true);
const httpServer = createServer(app);
export const io: PokeNerdleServer = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
io.on("connection", (socket) => {
  console.log("a user connected, id: ", socket.id);
});

const port = process.env.PORT || 3456;
const router = express.Router();

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.trace(err);
  res.status(500);
  res.json({ error: err.toString() });
};

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, If-Modified-Since"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
});
app.use(express.json());

initializeBattleWsRoutes(io);
router.use(dataRouter);
router.use(battlesRouter);
router.use(pathfinderRouter);
router.use(dailyRouter);

app.use("/porygon", porygonMiddleware);
app.use("/porygon/static", staticPorygonMiddleware);
app.use("/api", router);
app.use(errorHandler);

// Static files
app.use(express.static(path.join(__dirname, "..", "..", "frontend", "dist")));

// Fallback route for SPA
app.get(/(.*)/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "frontend", "dist", "index.html")
  );
});

httpServer.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
