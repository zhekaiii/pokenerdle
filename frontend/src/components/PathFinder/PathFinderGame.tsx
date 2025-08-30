import { usePokemonNames } from "@/hooks/usePokemonNames";
import { useToast } from "@/hooks/useToast";
import { QUERY_KEY } from "@/lib/query";
import { getSharedAbilities } from "@/utils/pokeChainUtils";
import {
  PathFinderResponse,
  PokemonNamesResponse,
  PokemonWithAbilities,
} from "@pokenerdle/shared";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Target,
  TriangleAlert,
} from "lucide-react";
import posthog from "posthog-js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import api from "../../api";
import LoadingDialog from "../recyclables/LoadingDialog";
import PokemonCombobox from "../recyclables/PokemonCombobox";
import { Button } from "../ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import PathBoard from "./PathBoard";
import { useEventTracking } from "./hooks/useEventTracking";

const PathFinderGame: React.FC = () => {
  const [challenge, setChallenge] = useState<PathFinderResponse | null>(null);
  const [input, setInput] = useState("");
  const [path, setPath] = useState<PokemonWithAbilities[]>([]);
  const fullPath = useMemo(() => {
    if (!challenge) return [];
    return [challenge.startPokemon, ...path, challenge.endPokemon];
  }, [challenge, path]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [numGuesses, setNumGuesses] = useState(0);
  const pokemonNames = usePokemonNames();
  const queryClient = useQueryClient();
  const lastPokemon =
    challenge && (path.length ? path[path.length - 1] : challenge.startPokemon);
  const lastPokemonName = lastPokemon && pokemonNames[lastPokemon.id];

  const isPuzzleSolved = useMemo(() => {
    if (!challenge || path.length == 0) return false;
    return (
      getSharedAbilities(challenge.endPokemon, path[path.length - 1]).length > 0
    );
  }, [challenge, path]);

  const { reportAbandon } = useEventTracking({
    challenge,
    isPuzzleSolved,
    startTime,
    numGuesses,
  });

  const fetchChallenge = async () => {
    reportAbandon();
    posthog.capture("pathfinder_new_challenge");
    try {
      setNumGuesses(0);
      setIsLoading(true);
      const data = await api.pathfinder.getChallenge();
      setChallenge(data);
      setPath([]); // Reset path when getting new challenge
      setInput("");
      setStartTime(Date.now());
    } catch (error) {
      console.error("Error fetching Path Finder challenge:", error);
      toast({
        variant: "destructive",
        description:
          "Failed to fetch Path Finder challenge. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = useCallback((index: number) => {
    setPath((prevPath) => prevPath.slice(0, index - 1));
  }, []);

  useEffect(() => {
    if (isPuzzleSolved) {
      const timeTaken = Date.now() - startTime;
      toast({
        variant: "positive",
        description: (
          <div className="tw:flex tw:flex-nowrap">
            <CheckCircle className="tw:mr-2" />
            <div>
              <div>Puzzle solved! Well done!</div>
              <div>Time taken: {Math.floor(timeTaken / 1000)} seconds</div>
              <div>Chain length: {fullPath.length}</div>
              <div>Number of guesses: {numGuesses}</div>
            </div>
          </div>
        ),
      });
      posthog.capture("pathfinder_solved", {
        time_taken_ms: timeTaken,
        path_length: fullPath.length,
        optimal_length: challenge!.pathLength,
        num_guesses: numGuesses,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only want to run on puzzle solved
  }, [isPuzzleSolved]);

  const handleSelect = async (pokemon: PokemonNamesResponse) => {
    if (!challenge) {
      return;
    }
    try {
      setIsLoading(true);
      const pokemonWithAbilities = await queryClient.fetchQuery({
        queryKey: [QUERY_KEY.POKEMON, pokemon.id],
        queryFn: () => api.data.getPokemonWithAbilities(pokemon.id),
      });
      const pokemonName = pokemonNames[pokemon.id];
      setNumGuesses(numGuesses + 1);
      const previousPokemon = path.length
        ? path[path.length - 1]
        : challenge.startPokemon;
      const isAbilityShared = previousPokemon.abilities.some((ability) =>
        pokemonWithAbilities.abilities.some((a) => a.id === ability.id)
      );
      if (!isAbilityShared) {
        toast({
          variant: "destructive",
          description: (
            <div className="tw:flex tw:flex-nowrap">
              <TriangleAlert className="tw:mr-2" />
              <div>
                {pokemonName?.name || pokemonName?.speciesName} does not share
                an ability with {pokemonName?.name || pokemonName?.speciesName}
              </div>
            </div>
          ),
        });
        return;
      }
      setPath([...path, pokemonWithAbilities]);
    } catch (error) {
      console.error("Error fetching Pokemon:", error);
      toast({
        variant: "destructive",
        description: "Failed to fetch Pokemon. Please try again later.",
      });
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  const isPathOptimal = challenge && fullPath.length === challenge.pathLength;

  useEffect(() => {
    fetchChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only want to run on mount
  }, []);

  if (!challenge)
    return (
      <Card className="tw:max-w-lg tw:mx-auto tw:mt-8">
        <CardContent className="tw:p-8 tw:text-center">
          <p>Loading Path Finder Challenge...</p>
        </CardContent>
      </Card>
    );

  return (
    <>
      <LoadingDialog open={isLoading} />
      <div className="tw:container tw:mx-auto tw:p-4">
        <Card className="tw:max-w-4xl tw:mx-auto tw:relative">
          <Button
            asChild
            className="tw:absolute tw:top-2 tw:end-2"
            variant="transparent"
            size="icon"
          >
            <Link to="/how-to-play/path-finder">
              <HelpCircle className="tw:size-6" />
            </Link>
          </Button>
          <CardHeader className="tw:text-center">
            <CardTitle className="tw:text-3xl tw:flex tw:items-center tw:justify-center tw:gap-2">
              <Target className="tw:text-primary" />
              Path Finder
            </CardTitle>
            <CardDescription>
              Find a path between these Pokémon by connecting them through
              shared abilities!
            </CardDescription>
          </CardHeader>

          <CardContent className="tw:space-y-6">
            {/* Path Building Section */}
            <div className="tw:border-t tw:pt-6">
              {/* Visual Path Display - BattleBoard Style */}
              <div className="tw:mb-4">
                <p className="tw:text-sm tw:text-muted-foreground tw:mb-4 tw:text-center">
                  Your Path:
                </p>
                <div className="tw:flex tw:justify-center">
                  <PathBoard
                    startPokemon={challenge.startPokemon}
                    endPokemon={challenge.endPokemon}
                    pathPokemon={path}
                    onRemove={handleRemove}
                  />
                </div>

                {/* Path Status */}
                {isPuzzleSolved && (
                  <div className="tw:text-center tw:mt-2">
                    <div className="tw:flex tw:items-center tw:justify-center tw:gap-1 tw:text-positive">
                      <CheckCircle size={16} className="tw:me-2" />
                      <span className="tw:text-sm">
                        {isPathOptimal
                          ? "Shortest possible path achieved!"
                          : "Path is longer than optimal"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pokemon Search */}
              {!isPuzzleSolved && (
                <div className="tw:space-y-2">
                  <label className="tw:text-sm tw:font-medium">
                    Which Pokémon shares an ability with{" "}
                    {lastPokemonName?.name || lastPokemonName?.speciesName}?
                  </label>
                  <PokemonCombobox
                    input={input}
                    setInput={setInput}
                    filter={(p) =>
                      !fullPath.some((pokemon) => pokemon.id === p.id)
                    }
                    onSelect={handleSelect}
                    disabled={isLoading || isPuzzleSolved}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="tw:flex tw:gap-2 tw:justify-center tw:pt-4 tw:border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setPath([]);
                  setInput("");
                }}
                disabled={isPuzzleSolved || path.length === 0}
              >
                Clear Path
              </Button>
              <Button
                onClick={fetchChallenge}
                className="tw:flex tw:items-center tw:gap-2"
              >
                <RefreshCw size={16} />
                New Challenge
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PathFinderGame;
