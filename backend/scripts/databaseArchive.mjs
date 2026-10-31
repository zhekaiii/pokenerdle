import { createReadStream, createWriteStream } from "node:fs";
import { rename, rm } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { createGunzip, createGzip } from "node:zlib";

const database = new URL("../prisma-sqlite/db.sqlite3", import.meta.url);
const archive = new URL("../prisma-sqlite/db.sqlite3.gz", import.meta.url);
const mode = process.argv[2];

if (mode !== "pack" && mode !== "unpack") {
  throw new Error("Usage: node scripts/databaseArchive.mjs <pack|unpack>");
}

const source = mode === "pack" ? database : archive;
const destination = mode === "pack" ? archive : database;
const temporary = new URL(`${destination.href}.${process.pid}.tmp`);

// Replace the destination only after the entire stream succeeds.
try {
  await pipeline(
    createReadStream(source),
    mode === "pack" ? createGzip() : createGunzip(),
    createWriteStream(temporary, { flags: "wx" }),
  );
  await rename(temporary, destination);
  console.log(`[database] ${mode === "pack" ? "Packed" : "Unpacked"} db.sqlite3`);
} finally {
  await rm(temporary, { force: true });
}
