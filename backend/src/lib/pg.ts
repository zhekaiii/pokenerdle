import { PrismaClient } from "../generated/prisma-pg/client.js";

declare global {
  var pgClient: PrismaClient | undefined;
}

export const pgClient = globalThis.pgClient || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.pgClient = pgClient;
}
