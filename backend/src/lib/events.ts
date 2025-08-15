import { BattleRoom } from "../controllers/types.js";
import { captureEvent } from "./posthog.js";

export type GameStartedEvent = {
  room_id: string;
  num_players: number;
  starter_pokemon_id: number;
  starter_pokemon_name: string;
  timer_duration: number;
};

export type GameEndedEvent = {
  room_id: string;
  end_reason: "timeout" | "forfeit";
  game_duration_ms: number;
  final_scores: number[];
  streak_count: number[];
  total_moves: number;
  starter_pokemon_id: number;
  starter_pokemon_name: string;
  num_players: number;
};

export const trackGameStarted = (room: BattleRoom, roomId: string) => {
  const event: GameStartedEvent = {
    room_id: roomId,
    num_players: room.numPlayers,
    starter_pokemon_id: room.pokemon[0].id,
    starter_pokemon_name: room.pokemon[0].name,
    timer_duration: room.settings.timer,
  };

  captureEvent("pokechain_game_started", event);
};

export const trackGameEnded = (
  room: BattleRoom,
  roomId: string,
  endReason: "timeout" | "forfeit"
) => {
  const event: GameEndedEvent = {
    room_id: roomId,
    end_reason: endReason,
    game_duration_ms: Date.now() - room.gameStartTime,
    final_scores: room.players.map((_, index) => room.points[index]),
    total_moves: room.pokemon.length,
    starter_pokemon_id: room.pokemon[0].id,
    starter_pokemon_name: room.pokemon[0].name,
    num_players: room.numPlayers,
    streak_count: room.players.map((_, index) => room.streak[index]),
  };

  captureEvent("pokechain_game_ended", event);
};
