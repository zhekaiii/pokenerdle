import { WrongAnswerReason } from "@pokenerdle/shared";
import posthog from "posthog-js";

export type PokemonGuessedEvent =
  | PokemonGuessedEventCorrect
  | PokemonGuessedEventIncorrect;

interface PokemonGuessedEventBase {
  pokemon_id: number;
  pokemon_name: string;
  is_single_player: boolean;
}

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

export interface AbilityLinkUsedEvent {
  ability_name: string;
  ability_id: number;
}

export interface RoomCreatedEvent {
  num_players: number;
  timer_duration: number;
  show_ability: boolean;
}

export type GoogleSignInSource =
  | "daily_challenge_stats_dialog"
  | "daily_challenge_archive"
  | "daily_challenge_gameplay"
  | "settings"
  | "profile_dropdown";

export interface GoogleSignInClickedEvent {
  source: GoogleSignInSource;
}

export const trackPokemonGuessed = (event: PokemonGuessedEvent) => {
  posthog.capture("pokechain_pokemon_guessed", event);
};

export const trackAbilityLinkUsed = (event: AbilityLinkUsedEvent) => {
  posthog.capture("pokechain_ability_link_used", event);
};

export const trackRoomCreated = (event: RoomCreatedEvent) => {
  posthog.capture("pokechain_room_created", event);
};

export const trackGoogleSignInClicked = (event: GoogleSignInClickedEvent) => {
  posthog.capture("google_sign_in_clicked", event);
};
