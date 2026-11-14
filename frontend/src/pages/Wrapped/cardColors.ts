import { cssVars } from "./style";

// The colours a type gives a standard or foil card: the frame, the background of the art
// window, its rim, the info strip and the paper behind the text. Dragon and fire come from
// the prototype; the rest follow the same recipe (a dark middle between two lights for the
// frame, a white-centred radial for the art window). Gold and rainbow ignore these.
export interface TypeColors {
  frame: string;
  art: string;
  rim: string;
  strip: string;
  paper: string;
}

const colors = (
  frame: [light: string, deep: string, glow: string],
  art: [mid: string, edge: string],
  rim: string,
  strip: [side: string, centre: string],
  paper: [top: string, bottom: string],
): TypeColors => ({
  frame: `linear-gradient(150deg, ${frame[0]}, ${frame[1]} 55%, ${frame[2]})`,
  art: `radial-gradient(circle at 50% 60%, #fff 0, ${art[0]} 55%, ${art[1]} 100%)`,
  rim,
  strip: `linear-gradient(90deg, ${strip[0]}, ${strip[1]}, ${strip[0]})`,
  paper: `linear-gradient(170deg, ${paper[0]}, ${paper[1]})`,
});

export const TYPE_COLORS: Record<string, TypeColors> = {
  bug: colors(["#a8d83a", "#4c7a12", "#e4f58a"], ["#d6eea0", "#7fb02a"], "#4c7a12", ["#bfe070", "#f1fad2"], ["#f6fbe6", "#e1efb8"]),
  dark: colors(["#6b5a52", "#2b2320", "#8a7a70"], ["#c9bdb5", "#5e504a"], "#2b2320", ["#b3a69d", "#e8e0da"], ["#f1ece8", "#d6cdc6"]),
  dragon: colors(["#7b5cff", "#3a2a9e", "#6ad0ff"], ["#b9a8ff", "#6c56d8"], "#3a2a9e", ["#b9a8ff", "#e9e3ff"], ["#f3efff", "#d9d2ff"]),
  electric: colors(["#fff45c", "#c8b400", "#fffcb0"], ["#fff3a0", "#e8c800"], "#8c8200", ["#fff07a", "#fffbd6"], ["#fffde6", "#fff3a8"]),
  fairy: colors(["#ffb0cf", "#d95f94", "#ffe0ee"], ["#ffd0e4", "#ee7fb3"], "#b53e7a", ["#ffc2dc", "#ffeef6"], ["#fff2f8", "#ffd9ea"]),
  fighting: colors(["#e5484d", "#8b1a2b", "#ff9aa0"], ["#ffb3b0", "#d6343c"], "#8b1a2b", ["#ff9a9a", "#ffe3e0"], ["#fff1ef", "#ffcfcb"]),
  fire: colors(["#ff9d42", "#c23a10", "#ffd36a"], ["#ffc18a", "#e2592a"], "#c23a10", ["#ffb27a", "#ffe9d6"], ["#fff4e8", "#ffdcc0"]),
  flying: colors(["#8fb8ff", "#4a6fd0", "#d6e4ff"], ["#cfe0ff", "#7aa2f0"], "#3e5fb8", ["#aac6ff", "#eef4ff"], ["#f0f5ff", "#d3e1ff"]),
  ghost: colors(["#6d6a9c", "#2e2a52", "#aaa6d6"], ["#cbc8ee", "#6d6a9c"], "#2e2a52", ["#aaa6d6", "#e9e8f8"], ["#f1f0fa", "#d6d4ee"]),
  grass: colors(["#6cd46a", "#1f7a2e", "#c3f2a0"], ["#c4eeb0", "#4cb04a"], "#1f7a2e", ["#9de58a", "#e6f9dc"], ["#f0fbe8", "#cfeec0"]),
  ground: colors(["#d9b36a", "#8a5a1e", "#f0dba5"], ["#ecd6a4", "#c0924a"], "#7a4e16", ["#e6c88a", "#f8ecd0"], ["#fbf2de", "#ecd6a4"]),
  ice: colors(["#8be6ee", "#2a9cb0", "#d9fbff"], ["#cdf6fb", "#5fc4d4"], "#1f7f94", ["#a6eef4", "#e8fcff"], ["#effdff", "#cdf1f6"]),
  normal: colors(["#cfc9b0", "#8b8468", "#efeadb"], ["#e3dfcb", "#a8a186"], "#6e6850", ["#d8d3bb", "#f5f2e6"], ["#f7f5ec", "#e3dfcb"]),
  poison: colors(["#c04fd8", "#6a1b8a", "#e9a0f5"], ["#ecb6f6", "#a64cc0"], "#6a1b8a", ["#dd9cee", "#f6e2fb"], ["#faeefd", "#ebcdf5"]),
  psychic: colors(["#ee4f8b", "#8f1043", "#ff9bbd"], ["#ffb3cc", "#d83a76"], "#8f1043", ["#ff9bbd", "#ffe3ec"], ["#fff0f5", "#ffd0e0"]),
  rock: colors(["#a9a58c", "#5b5846", "#d8d5bf"], ["#d6d3bd", "#8b8870"], "#4a4838", ["#c5c2a8", "#efeddc"], ["#f5f4ea", "#dddac4"]),
  steel: colors(["#b7c3cf", "#5f7385", "#e6edf3"], ["#dde5ec", "#8497a8"], "#4d6073", ["#c8d3dd", "#f1f5f8"], ["#f4f7fa", "#d9e1e8"]),
  water: colors(["#5db7ff", "#1769c4", "#a6dcff"], ["#b3defe", "#3c8fe0"], "#14509a", ["#8fcbff", "#e3f3ff"], ["#eef8ff", "#c8e6fb"]),
};

export const typeColors = (type: string): TypeColors =>
  TYPE_COLORS[type] ?? TYPE_COLORS.normal;

// The colours as the CSS variables Card.module.scss reads. A card with no top type gets the
// normal type's colours: without them it would have no frame, and the stylesheet's own
// fallbacks are gold.
export const typeColorVars = (type: string | undefined) => {
  const c = typeColors(type ?? "normal");
  return cssVars({
    "--frame": c.frame,
    "--artbg": c.art,
    "--rim": c.rim,
    "--stripbg": c.strip,
    "--paper": c.paper,
  });
};
