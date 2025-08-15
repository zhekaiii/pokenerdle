import { WrongAnswerReason } from "@pokenerdle/shared";
import posthog from "posthog-js";

export type PokemonGuessedEvent =
  | PokemonGuessedEventCorrect
  | PokemonGuessedEventIncorrect;

type PokemonGuessedEventBase = {
  pokemon_id: number;
  pokemon_name: string;
  is_single_player: boolean;
};

type PokemonGuessedEventCorrect = PokemonGuessedEventBase & {
  is_correct: true;
  streak_count: number;
  is_evolution_link: boolean;
  chain_position: number;
};

type PokemonGuessedEventIncorrect = PokemonGuessedEventBase & {
  is_correct: false;
  reason: WrongAnswerReason;
};

export type AbilityLinkUsedEvent = {
  ability_name: string;
  ability_id: number;
};

export type RoomCreatedEvent = {
  num_players: number;
  timer_duration: number;
  show_ability: boolean;
};

export const trackPokemonGuessed = (event: PokemonGuessedEvent) => {
  posthog.capture("pokechain_pokemon_guessed", event);
};

export const trackAbilityLinkUsed = (event: AbilityLinkUsedEvent) => {
  posthog.capture("pokechain_ability_link_used", event);
};

export const trackRoomCreated = (event: RoomCreatedEvent) => {
  posthog.capture("pokechain_room_created", event);
};
