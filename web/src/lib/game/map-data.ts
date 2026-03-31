import type { TerritoryDef } from "./types";

/** 6×3 grid: indices row-major. Continents: rows 0,1 = Core; 2 = Rim; 3 = Void. */
function gridNeighbors(id: number): number[] {
  const row = Math.floor(id / 6);
  const col = id % 6;
  const n: number[] = [];
  if (col < 5) n.push(id + 1);
  if (col > 0) n.push(id - 1);
  if (row < 2) n.push(id + 6);
  if (row > 0) n.push(id - 6);
  return n;
}

const names = [
  "Neon Core",
  "Pulse Gate",
  "Arc Spire",
  "Flux Grid",
  "Byte Harbor",
  "Synth Plaza",
  "Chrome Veil",
  "Shadow Stack",
  "Cryo Line",
  "Volt Yard",
  "Data Forge",
  "Echo Ward",
  "Null Sector",
  "Rift Dock",
  "Glitch Run",
  "Nova Rim",
  "Phantom Hub",
  "Cyber Well",
];

const positions: { x: number; y: number }[] = [];
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 6; col++) {
    positions.push({
      x: 12 + col * 15.5,
      y: 18 + row * 28,
    });
  }
}

export const TERRITORIES: TerritoryDef[] = names.map((name, id) => ({
  id,
  name,
  x: positions[id].x,
  y: positions[id].y,
  neighbors: gridNeighbors(id),
}));

/** Continent groups: own all → +2 armies each reinforce phase */
export const CONTINENTS: { ids: number[]; bonus: number; label: string }[] = [
  { ids: [0, 1, 2, 3, 4, 5], bonus: 2, label: "Core Grid" },
  { ids: [6, 7, 8, 9, 10, 11], bonus: 2, label: "Chrome Rim" },
  { ids: [12, 13, 14, 15, 16, 17], bonus: 2, label: "Void Belt" },
];

export function continentBonusFor(player: 0 | 1, owners: { owner: 0 | 1 }[]): number {
  let bonus = 0;
  for (const c of CONTINENTS) {
    const ownsAll = c.ids.every((i) => owners[i].owner === player);
    if (ownsAll) bonus += c.bonus;
  }
  return bonus;
}
