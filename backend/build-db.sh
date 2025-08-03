cd pokeapi 
source .venv/bin/activate 
make migrate 
make build-db 
mv db.sqlite3 ../prisma 
pnpm prisma generate
cd ..
bun run ./src/refreshGraph.ts
