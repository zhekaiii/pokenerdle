import placeholderIcon from "@/assets/question_mark.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { usePokemonNames } from "@/hooks/usePokemonNames";
import React, { useEffect, useRef } from "react";
import { useSessionStorage } from "react-use";
import styles from "./index.module.scss";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PokemonReferenceDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { getPokemonIcon } = usePokemonIcons();
  const pokemonNames = usePokemonNames();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Store scroll position in localStorage
  const [savedScrollPosition, setSavedScrollPosition] =
    useSessionStorage<number>("pokemon-reference-scroll-position", 0);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || open) return;

    setSavedScrollPosition(scrollContainer.scrollTop);
  }, [open, setSavedScrollPosition]);

  // Reset scroll position when Pokemon data changes
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      if (scrollContainerRef.current && savedScrollPosition) {
        scrollContainerRef.current.scrollTop = savedScrollPosition;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [open, savedScrollPosition]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="tw:max-h-[80vh] tw:flex tw:flex-col">
        <DialogHeader>
          <DialogTitle>Pokemon Reference</DialogTitle>
          <DialogDescription>
            Note that some icons might be missing.
          </DialogDescription>
        </DialogHeader>

        <div ref={scrollContainerRef} className={styles.PokemonGrid}>
          {pokemonNames?.map((pokemon) => (
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
      </DialogContent>
    </Dialog>
  );
};

export default PokemonReferenceDialog;
