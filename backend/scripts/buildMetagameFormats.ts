#!/usr/bin/env bun
// @ts-nocheck — Bun `bun:sqlite`; this file is executed by Bun at build-db time, not the Node tsc build.
// Runs at build-db time. Reads each JSON in backend/data/metagame-formats/,
// creates the metagame_format and metagame_format_pokemon tables, validates
// every pokemonId exists in pokemon_v2_pokemon, and inserts the data.
//
// Idempotent: safe to re-run. Aborts the build (exit 1) if any pokemonId
// references a Pokémon that does not exist in the SQLite DB.

import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DB_PATH = "./prisma-sqlite/db.sqlite3";
const DATA_DIR = "./data/metagame-formats";

type FormatFile = {
  id: string;
  displayName: string;
  pokemonIds: number[];
};

const isFormatFile = (v: unknown): v is FormatFile =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as FormatFile).id === "string" &&
  typeof (v as FormatFile).displayName === "string" &&
  Array.isArray((v as FormatFile).pokemonIds) &&
  (v as FormatFile).pokemonIds.every((n) => Number.isInteger(n));

const main = () => {
  const db = new Database(DB_PATH);
  db.exec("PRAGMA foreign_keys = ON");

  // Drop so CREATE matches current DDL (idempotency: tables are re-created every build).
  db.exec(`
    DROP TABLE IF EXISTS metagame_format_pokemon;
    DROP TABLE IF EXISTS metagame_format;
  `);

  db.exec(`
    CREATE TABLE metagame_format (
      id TEXT NOT NULL PRIMARY KEY,
      display_name TEXT NOT NULL
    );
    CREATE TABLE metagame_format_pokemon (
      format_id TEXT NOT NULL,
      pokemon_id INTEGER NOT NULL,
      PRIMARY KEY (format_id, pokemon_id),
      FOREIGN KEY (format_id) REFERENCES metagame_format(id),
      FOREIGN KEY (pokemon_id) REFERENCES pokemon_v2_pokemon(id)
    );
    CREATE INDEX IF NOT EXISTS metagame_format_pokemon_format_id_idx
      ON metagame_format_pokemon (format_id);
  `);

  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    console.warn(`[buildMetagameFormats] no JSON files found in ${DATA_DIR}`);
  }

  for (const file of files) {
    const path = join(DATA_DIR, file);
    const raw = JSON.parse(readFileSync(path, "utf-8"));
    if (!isFormatFile(raw)) {
      console.error(`[buildMetagameFormats] invalid format file: ${path}`);
      process.exit(1);
    }

    if (raw.pokemonIds.length === 0) {
      console.error(
        `[buildMetagameFormats] format "${raw.id}" has empty pokemonIds`,
      );
      process.exit(1);
    }

    const duplicates = raw.pokemonIds.filter(
      (id, i) => raw.pokemonIds.indexOf(id) !== i,
    );
    if (duplicates.length > 0) {
      console.error(
        `[buildMetagameFormats] format "${raw.id}" has duplicate Pokémon IDs: ${[...new Set(duplicates)].join(", ")}`,
      );
      process.exit(1);
    }

    // Validate every Pokémon ID exists.
    const placeholders = raw.pokemonIds.map(() => "?").join(",");
    const found = db
      .query<{ id: number }, number[]>(
        `SELECT id FROM pokemon_v2_pokemon WHERE id IN (${placeholders})`,
      )
      .all(...raw.pokemonIds);
    const foundIds = new Set(found.map((r) => r.id));
    const missing = raw.pokemonIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      console.error(
        `[buildMetagameFormats] format "${raw.id}" references nonexistent Pokémon IDs: ${missing.join(", ")}`,
      );
      process.exit(1);
    }

    // Replace any prior rows for this format (idempotent).
    db.transaction(() => {
      db.run(
        "INSERT OR REPLACE INTO metagame_format (id, display_name) VALUES (?, ?)",
        [raw.id, raw.displayName],
      );
      db.run("DELETE FROM metagame_format_pokemon WHERE format_id = ?", [
        raw.id,
      ]);
      const insert = db.prepare(
        "INSERT INTO metagame_format_pokemon (format_id, pokemon_id) VALUES (?, ?)",
      );
      for (const pid of raw.pokemonIds) {
        insert.run(raw.id, pid);
      }
    })();

    console.log(
      `[buildMetagameFormats] ${raw.id}: ${raw.pokemonIds.length} Pokémon`,
    );
  }

  db.close();
};

main();
