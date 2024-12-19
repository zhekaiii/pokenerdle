import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

/* eslint no-var: off */
declare global {
  // Usage of var attributed to SO thread:
  // https://stackoverflow.com/questions/68481686/type-typeof-globalthis-has-no-index-signature
  var prisma: PrismaClient;
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
