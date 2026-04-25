import { StatGuessFilter, StatGuessFilterSchema } from "@pokenerdle/shared";
import { atom, useAtom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

export const DEFAULT_FILTER: StatGuessFilter = { kind: "all" };

// Wrap the default JSON storage with a schema-validated reader so an outdated
// or hand-edited persisted value can never crash the page or feed an invalid
// filter to the backend; instead we silently fall back to the default.
const safeStorage = createJSONStorage<StatGuessFilter>(() => localStorage);
const validatingStorage = {
  ...safeStorage,
  getItem: (key: string, initialValue: StatGuessFilter): StatGuessFilter => {
    const stored = safeStorage.getItem(key, initialValue);
    const parsed = StatGuessFilterSchema.safeParse(stored);
    return parsed.success ? parsed.data : initialValue;
  },
};

const filterAtom = import.meta.env.SSR
  ? atom<StatGuessFilter>(DEFAULT_FILTER)
  : atomWithStorage<StatGuessFilter>(
      "statGuesser.filters",
      DEFAULT_FILTER,
      validatingStorage,
      {
        getOnInit: true,
      },
    );

export const useStatGuesserFilter = () => {
  const [filter, setFilter] = useAtom(filterAtom);

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
