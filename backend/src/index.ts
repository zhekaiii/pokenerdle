import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeBattleWsRoutes } from "./handlers/index.js";
import "./lib/prisma.js";
import "./routes/battles.routes.js";
import battlesRouter from "./routes/battles.routes.js";
import dataRouter from "./routes/data.routes.js";
import { PokeNerdleServer } from "./utils/types.js";

dotenv.config();

const app = express();
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

initializeBattleWsRoutes(io);
router.use(dataRouter);
router.use(battlesRouter);

app.use("/api", router);

httpServer.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
