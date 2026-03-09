cd pokeapi
source .venv/bin/activate
make migrate
make build-db
mv db.sqlite3 ../prisma-sqlite
cd ../prisma-sqlite
sqlite3 db.sqlite3 < preprocess.sql
pnpm prisma generate --schema=./prisma-sqlite/schema.prisma
cd ..
bun run ./src/refreshGraph.ts
