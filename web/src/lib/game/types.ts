export type PlayerId = 0 | 1;

export type Phase = "reinforce" | "attack" | "fortify" | "gameover";

export type TerritoryId = number;

export interface TerritoryDef {
  id: TerritoryId;
  name: string;
  /** 0–100 viewBox coords */
  x: number;
  y: number;
  neighbors: TerritoryId[];
}

export interface TerritoryState {
  owner: PlayerId;
  armies: number;
}

export interface GameState {
  territories: TerritoryState[];
  currentPlayer: PlayerId;
  phase: Phase;
  reinforcementsLeft: number;
  winner: PlayerId | null;
  /** Human-selected origin for swipe */
  selectedFrom: TerritoryId | null;
  /** Last combat log for HUD */
  combatLog: string | null;
  /** Must complete fortify once per turn */
  fortifyDone: boolean;
}
