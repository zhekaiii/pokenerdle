import api from "@/api";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { StatGuessFilter } from "@pokenerdle/shared";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useTranslation } from "react-i18next";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- prefer type aliases
type FilterBarProps = {
  filter: StatGuessFilter;
  onScopeChange: (kind: StatGuessFilter["kind"]) => void;
  onFormatChange: (formatId: string) => void;
  onGenerationToggle: (gen: number) => void;
  onReset: () => void;
};

const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onScopeChange,
  onFormatChange,
  onGenerationToggle,
  onReset,
}) => {
  const { t } = useTranslation("statGuess");
  const { data: formatsData } = useQuery({
    queryKey: ["statGuess", "formats"],
    queryFn: () => api.statGuess.getFormats(),
    staleTime: Infinity,
  });

  return (
    <div className="tw:flex tw:flex-col tw:gap-3 tw:p-3 tw:border tw:rounded-lg">
      <div className="tw:flex tw:items-center tw:justify-between tw:gap-2">
        <Tabs
          value={filter.kind}
          onValueChange={(v) => onScopeChange(v as StatGuessFilter["kind"])}
        >
          <TabsList>
            <TabsTrigger value="all">{t("filters.scope.all")}</TabsTrigger>
            <TabsTrigger value="generations">
              {t("filters.scope.byGeneration")}
            </TabsTrigger>
            <TabsTrigger value="format">
              {t("filters.scope.byFormat")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {filter.kind !== "all" && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            {t("filters.reset")}
          </Button>
        )}
      </div>

      {filter.kind === "generations" && (
        <div className="tw:flex tw:flex-wrap tw:gap-2">
          {GENERATIONS.map((gen) => {
            const active = filter.generations.includes(gen);
            return (
              <Button
                key={gen}
                size="sm"
                variant={active ? "default" : "outline"}
                onClick={() => onGenerationToggle(gen)}
                aria-pressed={active}
              >
                {gen}
              </Button>
            );
          })}
        </div>
      )}

      {filter.kind === "format" && (
        <Select value={filter.formatId} onValueChange={onFormatChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(formatsData?.formats ?? []).map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.displayName} ({f.pokemonCount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default FilterBar;
