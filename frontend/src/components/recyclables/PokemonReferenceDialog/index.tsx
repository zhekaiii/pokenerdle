import placeholderIcon from "@/assets/question_mark.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
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
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { atom, useAtom } from "jotai";
import { Loader2 } from "lucide-react";
import React, { useEffect, useRef } from "react";
import styles from "./index.module.scss";

const dialogScrollPositionsAtom = atom<Record<string, number>>({});
const tabAtom = atom(MIN_GENERATION);

const generations = Array.from(
  { length: MAX_GENERATION },
  (_, i) => MIN_GENERATION + i
);

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuess?: (pokemon: PokemonNamesResponse) => void;
};

const PokemonReferenceDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  onGuess,
}) => {
  const { getPokemonIcon } = usePokemonIcons();
  const scrollContainerRef = useRef<Record<number, HTMLDivElement | null>>(
    Object.fromEntries(generations.map((gen) => [gen, null]))
  );
  const [confirmGuessOpen, setConfirmGuessOpen] = React.useState(false);
  const [selectedPokemon, setSelectedPokemon] =
    React.useState<PokemonNamesResponse | null>(null);

  const handlePokemonClick = (pokemon: PokemonNamesResponse) => {
    setSelectedPokemon(pokemon);
    setConfirmGuessOpen(true);
  };

  const handleConfirmGuess = () => {
    if (selectedPokemon && onGuess) {
      onGuess(selectedPokemon);
    }
    setConfirmGuessOpen(false);
    setSelectedPokemon(null);
  };

  const handleCancelGuess = () => {
    setConfirmGuessOpen(false);
    setSelectedPokemon(null);
  };

  const [savedScrollPositions, setSavedScrollPositions] = useAtom(
    dialogScrollPositionsAtom
  );

  const [activeGeneration, setActiveGeneration] = useAtom(tabAtom);
  const { pokemon, isLoading, fetch } =
    usePokemonByGeneration(activeGeneration);

  useEffect(() => {
    fetch();
  }, [activeGeneration, fetch]);

  // Save scroll position when dialog closes
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current[activeGeneration];
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
      if (scrollContainerRef.current[activeGeneration] && savedPosition) {
        scrollContainerRef.current[activeGeneration].scrollTop = savedPosition;
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
              <TabsTrigger key={gen} value={gen.toString()}>
                {gen}
              </TabsTrigger>
            ))}
          </TabsList>

          {generations.map((gen) => {
            return (
              <TabsContent
                key={gen}
                value={gen.toString()}
                className="tw:flex-1 tw:mt-2 tw:overflow-auto"
                ref={(el) => {
                  if (el) {
                    scrollContainerRef.current[gen] = el;
                  }
                }}
              >
                {isLoading ? (
                  <Loader2 className="tw:w-10 tw:h-10 tw:m-auto tw:animate-spin tw:my-10" />
                ) : pokemon.length === 0 ? (
                  <div className="tw:my-10 tw:text-center">
                    No Pokemon found for Generation {gen}
                  </div>
                ) : (
                  <div className={styles.PokemonGrid}>
                    {pokemon.map((pokemon) => (
                      <div
                        key={pokemon.id}
                        className={styles.PokemonItem}
                        title={pokemon.name || pokemon.speciesName}
                        onClick={() => handlePokemonClick(pokemon)}
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

      <AlertDialog open={confirmGuessOpen} onOpenChange={setConfirmGuessOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Guess</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to guess{" "}
              <strong>
                {selectedPokemon?.name || selectedPokemon?.speciesName}
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelGuess}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmGuess}>
              Guess
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default PokemonReferenceDialog;
