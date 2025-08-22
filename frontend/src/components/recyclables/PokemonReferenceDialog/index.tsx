import placeholderIcon from "@/assets/question_mark.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { usePokemonByGeneration } from "@/hooks/usePokemonIdsByGeneration";
import { MAX_GENERATION, MIN_GENERATION } from "@/lib/constants";
import { atom, useAtom } from "jotai";
import { Loader2 } from "lucide-react";
import React, { useEffect, useRef } from "react";
import styles from "./index.module.scss";

const dialogScrollPositionsAtom = atom<Record<string, number>>({});
const tabAtom = atom(MIN_GENERATION);

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PokemonReferenceDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { getPokemonIcon } = usePokemonIcons();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [savedScrollPositions, setSavedScrollPositions] = useAtom(
    dialogScrollPositionsAtom
  );

  const [activeGeneration, setActiveGeneration] = useAtom(tabAtom);
  const { pokemon, isLoading, fetch } =
    usePokemonByGeneration(activeGeneration);

  useEffect(() => {
    fetch();
  }, [activeGeneration, fetch]);

  // Create generation tabs
  const generations = Array.from({ length: MAX_GENERATION }, (_, i) =>
    (MIN_GENERATION + i).toString()
  );

  // Save scroll position when dialog closes
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || open) return;

    setSavedScrollPositions((prev) => ({
      ...prev,
      [activeGeneration]: scrollContainer.scrollTop,
    }));
  }, [open, activeGeneration, setSavedScrollPositions]);

  // Restore scroll position when dialog opens
  useEffect(() => {
    if (!open || !scrollContainerRef.current) return;

    const timer = setTimeout(() => {
      const savedPosition = savedScrollPositions[activeGeneration];
      if (scrollContainerRef.current && savedPosition) {
        scrollContainerRef.current.scrollTop = savedPosition;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [open, activeGeneration, savedScrollPositions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="tw:max-h-[80vh] tw:flex tw:flex-col">
        <DialogHeader>
          <DialogTitle>Pokemon Reference</DialogTitle>
          <DialogDescription>
            Note that some icons might be missing.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeGeneration.toString()}
          onValueChange={(value) => setActiveGeneration(parseInt(value))}
          className="tw:flex-1 tw:flex tw:flex-col tw:min-h-0"
        >
          <TabsList className="tw:grid tw:w-full tw:grid-cols-9">
            {generations.map((gen) => (
              <TabsTrigger key={gen} value={gen}>
                {gen}
              </TabsTrigger>
            ))}
          </TabsList>

          {generations.map((gen) => {
            return (
              <TabsContent
                key={gen}
                value={gen}
                className="tw:flex-1 tw:mt-2 tw:overflow-auto"
              >
                {isLoading ? (
                  <Loader2 className="tw:w-10 tw:h-10 tw:m-auto tw:animate-spin tw:my-10" />
                ) : pokemon.length === 0 ? (
                  <div className="tw:my-10 tw:text-center">
                    No Pokemon found for Generation {gen}
                  </div>
                ) : (
                  <div ref={scrollContainerRef} className={styles.PokemonGrid}>
                    {pokemon.map((pokemon) => (
                      <div
                        key={pokemon.id}
                        className={styles.PokemonItem}
                        title={pokemon.name || pokemon.speciesName}
                      >
                        <img
                          src={getPokemonIcon(pokemon.id)}
                          alt={pokemon.name || pokemon.speciesName}
                          className={styles.PokemonIcon}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = placeholderIcon;
                          }}
                        />
                        <span className={styles.PokemonName}>
                          {pokemon.name || pokemon.speciesName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PokemonReferenceDialog;
