import { StatGuessFilter } from "@pokenerdle/shared";
import { useState } from "react";

export const DEFAULT_FILTER: StatGuessFilter = { kind: "all" };

export const useStatGuessFilter = () => {
  const [filter, setFilter] = useState<StatGuessFilter>(DEFAULT_FILTER);

  const setScope = (kind: StatGuessFilter["kind"]) => {
    if (kind === "all") setFilter({ kind: "all" });
    else if (kind === "format")
      setFilter({ kind: "format", formatId: "champions-reg-ma" });
    else
      setFilter({
        kind: "generations",
        generations: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      });
  };

  const setFormat = (formatId: string) =>
    setFilter({ kind: "format", formatId });

  const toggleGeneration = (gen: number) => {
    if (filter.kind !== "generations") return;
    const next = filter.generations.includes(gen)
      ? filter.generations.filter((g) => g !== gen)
      : [...filter.generations, gen].sort((a, b) => a - b);
    if (next.length === 0) return;
    setFilter({ kind: "generations", generations: next });
  };

  const reset = () => setFilter(DEFAULT_FILTER);

  return { filter, setScope, setFormat, toggleGeneration, reset };
};
