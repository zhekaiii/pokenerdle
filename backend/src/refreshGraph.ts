import "./lib/prisma.js";
import {
  findLargestConnectedComponent,
  generatePokemonGraph,
} from "./repositories/pokemon.repository.js";

await generatePokemonGraph();
findLargestConnectedComponent();
