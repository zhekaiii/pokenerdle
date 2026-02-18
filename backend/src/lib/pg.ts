import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma-pg/client.js";

declare global {
  var pgClient: PrismaClient | undefined;
}

const connectionString = `${process.env.DIRECT_URL}`;
const adapter = new PrismaPg({ connectionString });
export const pgClient = globalThis.pgClient || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.pgClient = pgClient;
}
