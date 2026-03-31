import { TERRITORIES } from "./map-data";
import { rollCombat } from "./combat";
import { afterBotTurn, checkWinner } from "./engine";
import type { GameState, PlayerId, TerritoryId } from "./types";

const BOT: PlayerId = 1;
const HUMAN: PlayerId = 0;

function cloneTerritories(state: GameState) {
  return state.territories.map((t) => ({ ...t }));
}

function randomPick<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function botReinforce(state: GameState): GameState {
  const territories = cloneTerritories(state);
  let left = state.reinforcementsLeft;
  const owned = territories
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.owner === BOT);
  while (left > 0 && owned.length) {
    const border = owned.filter(({ i }) =>
      TERRITORIES[i].neighbors.some((n) => territories[n].owner === HUMAN),
    );
    const pool = border.length ? border : owned;
    const pick = randomPick(pool);
    if (!pick) break;
    territories[pick.i].armies += 1;
    left--;
  }
  return {
    ...state,
    territories,
    reinforcementsLeft: 0,
    phase: "attack",
  };
}

function oneAttack(state: GameState): GameState | null {
  const candidates: { from: TerritoryId; to: TerritoryId }[] = [];
  for (let i = 0; i < state.territories.length; i++) {
    const t = state.territories[i];
    if (t.owner !== BOT || t.armies < 2) continue;
    for (const n of TERRITORIES[i].neighbors) {
      if (state.territories[n].owner === HUMAN) {
        candidates.push({ from: i, to: n });
      }
    }
  }
  const pick = randomPick(candidates);
  if (!pick) return null;
  const territories = cloneTerritories(state);
  const { from, to } = pick;
  while (territories[from].armies > 1 && territories[to].owner === HUMAN) {
    const { attLoss, defLoss } = rollCombat(
      territories[from].armies,
      territories[to].armies,
    );
    territories[from].armies -= attLoss;
    territories[to].armies -= defLoss;
    if (territories[to].armies <= 0) {
      territories[to].owner = BOT;
      territories[to].armies = territories[from].armies - 1;
      territories[from].armies = 1;
      break;
    }
  }
  const winner = checkWinner(territories);
  return {
    ...state,
    territories,
    winner,
    phase: winner !== null ? "gameover" : "attack",
  };
}

function botAttackPhase(state: GameState): GameState {
  let s = state;
  let moves = 0;
  const maxMoves = 12;
  while (s.phase === "attack" && moves < maxMoves) {
    const next = oneAttack(s);
    if (!next || next.winner !== null) {
      s = next ?? { ...s, phase: "fortify" };
      break;
    }
    s = next;
    moves++;
    if (Math.random() < 0.35) break;
  }
  if (s.phase === "gameover") return s;
  return { ...s, phase: "fortify" };
}

function botFortify(state: GameState): GameState {
  const own = state.territories
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.owner === BOT && t.armies > 1);
  const moves: { from: TerritoryId; to: TerritoryId }[] = [];
  for (const { i } of own) {
    for (const n of TERRITORIES[i].neighbors) {
      if (state.territories[n].owner === BOT && n !== i) {
        moves.push({ from: i, to: n });
      }
    }
  }
  const pick = randomPick(moves);
  if (!pick) return state;
  const territories = cloneTerritories(state);
  if (territories[pick.from].armies < 2) return state;
  territories[pick.from].armies -= 1;
  territories[pick.to].armies += 1;
  return { ...state, territories };
}

/** Single synchronous bot full turn from reinforce through fortify. */
export function runBotTurn(state: GameState): GameState {
  if (state.currentPlayer !== BOT || state.phase === "gameover") return state;
  let s: GameState = { ...state, combatLog: null };
  s = botReinforce(s);
  if (s.winner !== null) return s;
  s = botAttackPhase(s);
  if (s.winner !== null) return s;
  s = botFortify(s);
  return afterBotTurn(s);
}
