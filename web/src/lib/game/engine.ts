import { TERRITORIES, continentBonusFor } from "./map-data";
import { rollCombat } from "./combat";
import type { GameState, PlayerId, Phase, TerritoryId } from "./types";

const HUMAN: PlayerId = 0;
const BOT: PlayerId = 1;

function countTerritories(state: GameState, p: PlayerId): number {
  return state.territories.filter((t) => t.owner === p).length;
}

function reinforcementsFor(state: GameState, p: PlayerId): number {
  const n = countTerritories(state, p);
  const base = Math.max(3, Math.floor(n / 3));
  return base + continentBonusFor(p, state.territories);
}

function cloneTerritories(state: GameState) {
  return state.territories.map((t) => ({ ...t }));
}

export function checkWinner(territories: GameState["territories"]): PlayerId | null {
  const o0 = territories.every((t) => t.owner === HUMAN);
  if (o0) return HUMAN;
  const o1 = territories.every((t) => t.owner === BOT);
  if (o1) return BOT;
  return null;
}

export function createInitialGame(): GameState {
  const owners: PlayerId[] = [];
  for (let i = 0; i < 18; i++) owners.push(i % 2 === 0 ? HUMAN : BOT);
  // shuffle
  for (let i = owners.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [owners[i], owners[j]] = [owners[j], owners[i]];
  }
  const territories = owners.map((owner) => ({
    owner,
    armies: 3,
  }));
  const r = reinforcementsFor({ territories, currentPlayer: HUMAN } as GameState, HUMAN);
  return {
    territories,
    currentPlayer: HUMAN,
    phase: "reinforce",
    reinforcementsLeft: r,
    winner: checkWinner(territories),
    selectedFrom: null,
    combatLog: null,
    fortifyDone: false,
  };
}

export function tapReinforce(state: GameState, territoryId: TerritoryId): GameState {
  if (state.phase !== "reinforce" || state.currentPlayer !== HUMAN) return state;
  if (state.reinforcementsLeft <= 0) return state;
  const t = state.territories[territoryId];
  if (t.owner !== HUMAN) return state;
  const territories = cloneTerritories(state);
  territories[territoryId].armies += 1;
  const reinforcementsLeft = state.reinforcementsLeft - 1;
  const next: GameState = {
    ...state,
    territories,
    reinforcementsLeft,
    combatLog: null,
  };
  if (reinforcementsLeft === 0) {
    next.phase = "attack";
  }
  return next;
}

export function endAttackPhase(state: GameState): GameState {
  if (state.phase !== "attack" || state.currentPlayer !== HUMAN) return state;
  return {
    ...state,
    phase: "fortify",
    selectedFrom: null,
    fortifyDone: false,
    combatLog: null,
  };
}

function resolveSwipeTarget(
  fromId: TerritoryId,
  dx: number,
  dy: number,
): TerritoryId | null {
  const from = TERRITORIES[fromId];
  const neighbors = from.neighbors;
  let best: TerritoryId | null = null;
  let bestAngle = Infinity;
  const svx = dx;
  const svy = dy;
  const sl = Math.hypot(svx, svy);
  if (sl < 24) return null;
  for (const nid of neighbors) {
    const to = TERRITORIES[nid];
    const tvx = to.x - from.x;
    const tvy = to.y - from.y;
    const tl = Math.hypot(tvx, tvy);
    if (tl < 1e-6) continue;
    const dot = (svx * tvx + svy * tvy) / (sl * tl);
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
    if (angle < bestAngle) {
      bestAngle = angle;
      best = nid;
    }
  }
  return best;
}

export function swipeAttack(
  state: GameState,
  fromId: TerritoryId,
  dx: number,
  dy: number,
): GameState {
  if (state.phase !== "attack" || state.currentPlayer !== HUMAN) return state;
  const toId = resolveSwipeTarget(fromId, dx, dy);
  if (toId === null) return { ...state, selectedFrom: null };
  const from = state.territories[fromId];
  const to = state.territories[toId];
  if (from.owner !== HUMAN || from.armies < 2) return { ...state, selectedFrom: null };
  if (to.owner !== BOT) return { ...state, selectedFrom: null };
  const territories = cloneTerritories(state);
  let combatLog: string | null = null;
  while (territories[fromId].armies > 1 && territories[toId].owner === BOT) {
    const { att, def, attLoss, defLoss } = rollCombat(
      territories[fromId].armies,
      territories[toId].armies,
    );
    territories[fromId].armies -= attLoss;
    territories[toId].armies -= defLoss;
    combatLog = `A[${att.join(",")}] vs D[${def.join(",")}]`;
    if (territories[toId].armies <= 0) {
      territories[toId].owner = HUMAN;
      territories[toId].armies = territories[fromId].armies - 1;
      territories[fromId].armies = 1;
      break;
    }
  }
  const winner = checkWinner(territories);
  return {
    ...state,
    territories,
    selectedFrom: null,
    combatLog,
    winner,
    phase: winner !== null ? "gameover" : "attack",
  };
}

export function swipeFortify(
  state: GameState,
  fromId: TerritoryId,
  dx: number,
  dy: number,
): GameState {
  if (state.phase !== "fortify" || state.currentPlayer !== HUMAN || state.fortifyDone)
    return state;
  const toId = resolveSwipeTarget(fromId, dx, dy);
  if (toId === null) return { ...state, selectedFrom: null };
  const from = state.territories[fromId];
  const to = state.territories[toId];
  if (from.owner !== HUMAN || to.owner !== HUMAN) return { ...state, selectedFrom: null };
  if (fromId === toId) return { ...state, selectedFrom: null };
  if (from.armies < 2) return { ...state, selectedFrom: null };
  const territories = cloneTerritories(state);
  territories[fromId].armies -= 1;
  territories[toId].armies += 1;
  return endHumanTurn({
    ...state,
    territories,
    selectedFrom: null,
    fortifyDone: true,
    combatLog: "Fortify +1",
  });
}

export function skipFortify(state: GameState): GameState {
  if (state.phase !== "fortify" || state.currentPlayer !== HUMAN) return state;
  return endHumanTurn({ ...state, fortifyDone: true, selectedFrom: null });
}

function endHumanTurn(state: GameState): GameState {
  const r = reinforcementsFor(state, BOT);
  return {
    ...state,
    currentPlayer: BOT,
    phase: "reinforce",
    reinforcementsLeft: r,
    fortifyDone: false,
    combatLog: null,
  };
}

/** After the bot completes reinforce/attack/fortify, advance to the human turn. */
export function afterBotTurn(state: GameState): GameState {
  const r = reinforcementsFor(state, HUMAN);
  return {
    ...state,
    currentPlayer: HUMAN,
    phase: "reinforce",
    reinforcementsLeft: r,
    selectedFrom: null,
    fortifyDone: false,
    combatLog: null,
  };
}
