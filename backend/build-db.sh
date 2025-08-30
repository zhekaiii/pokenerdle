cd pokeapi
source .venv/bin/activate
make migrate
make build-db
mv db.sqlite3 ../prisma
cd ../prisma
sqlite3 db.sqlite3 < preprocess.sql
pnpm prisma generate
cd ..
bun run ./src/refreshGraph.ts
