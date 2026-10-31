The generated PokéAPI database is committed as `db.sqlite3.gz`. Backend builds
and local development automatically unpack it to `db.sqlite3` using Node.js.
The uncompressed database is ignored by Git and included in the deployment's
build output.

After changing the database, run from the repository root:

```sh
pnpm --filter @pokenerdle/backend db:pack
```

Commit the updated `db.sqlite3.gz`. The existing `build-db` command also packs
the database after a successful rebuild. To unpack it manually, run:

```sh
pnpm --filter @pokenerdle/backend db:unpack
```

Database generation remains a separate maintenance task; deployment only
unpacks the committed archive.
