export type BattleRoomSettings = {
  timer: number;
  showAbility: boolean;
};

export type ForfeitInfo = {
  forfeit: boolean;
  forfeitedBy: string;
};

export enum WrongAnswerReason {
  EvolutionLinkDepleted,
  AbilityLinkDepleted,
  NoSharedAbility,
}
