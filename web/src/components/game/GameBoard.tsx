"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TERRITORIES } from "@/lib/game/map-data";
import {
  createInitialGame,
  endAttackPhase,
  skipFortify,
  swipeAttack,
  swipeFortify,
  tapReinforce,
} from "@/lib/game/engine";
import { runBotTurn } from "@/lib/game/bot";
import type { GameState, TerritoryId } from "@/lib/game/types";

export function GameBoard() {
  const [game, setGame] = useState<GameState>(() => createInitialGame());
  const [hint, setHint] = useState<string | null>(
    "Tap your sectors to place reinforcements.",
  );
  const dragRef = useRef<{
    from: TerritoryId;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (game.currentPlayer !== 1 || game.phase === "gameover" || game.winner !== null)
      return;
    const id = window.setTimeout(() => {
      setGame((prev) => runBotTurn(prev));
    }, 700);
    return () => window.clearTimeout(id);
  }, [game.currentPlayer, game.phase, game.winner]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent, tid: TerritoryId) => {
      if (game.currentPlayer !== 0 || game.phase === "gameover") return;
      if (game.phase === "reinforce") return;
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      if (game.phase === "attack") {
        const t = game.territories[tid];
        if (t.owner === 0 && t.armies >= 2) {
          dragRef.current = { from: tid, x: e.clientX, y: e.clientY };
          setGame((g) => ({ ...g, selectedFrom: tid }));
        }
      }
      if (game.phase === "fortify" && !game.fortifyDone) {
        const t = game.territories[tid];
        if (t.owner === 0 && t.armies >= 2) {
          dragRef.current = { from: tid, x: e.clientX, y: e.clientY };
          setGame((g) => ({ ...g, selectedFrom: tid }));
        }
      }
    },
    [game],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current;
      dragRef.current = null;
      if (!d) return;
      setGame((g) => {
        if (g.currentPlayer !== 0) return g;
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        if (g.phase === "attack" && g.selectedFrom === d.from) {
          return swipeAttack(g, d.from, dx, dy);
        }
        if (g.phase === "fortify" && g.selectedFrom === d.from) {
          return swipeFortify(g, d.from, dx, dy);
        }
        return { ...g, selectedFrom: null };
      });
    },
    [],
  );

  const onTerritoryClick = (tid: TerritoryId) => {
    if (game.currentPlayer !== 0) return;
    if (game.phase !== "reinforce") return;
    setGame((g) => {
      const next = tapReinforce(g, tid);
      if (next.reinforcementsLeft === 0 && next.phase === "attack") {
        queueMicrotask(() =>
          setHint("Swipe from your sector toward an enemy to attack."),
        );
      }
      return next;
    });
  };

  const phaseLabel =
    game.phase === "reinforce"
      ? "Reinforce"
      : game.phase === "attack"
        ? "Attack"
        : game.phase === "fortify"
          ? "Fortify"
          : "Done";

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-fuchsia-300/90">
          Phase: <strong className="text-cyan-300">{phaseLabel}</strong>
        </span>
        {game.phase === "reinforce" && game.currentPlayer === 0 && (
          <span className="text-cyan-200/80">
            Units: <strong>{game.reinforcementsLeft}</strong>
          </span>
        )}
      </div>

      {hint && game.phase === "attack" && (
        <p className="text-xs text-cyan-200/70">{hint}</p>
      )}

      <div
        className="relative touch-none rounded-2xl border border-cyan-500/30 bg-[#060210]/90 p-3 shadow-[0_0_40px_rgba(0,245,255,0.08)] select-none"
        style={{ touchAction: "none" }}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <svg
          viewBox="0 0 100 100"
          className="h-auto w-full"
          style={{ minHeight: "280px" }}
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {TERRITORIES.map((t) => {
            const st = game.territories[t.id];
            const isHuman = st.owner === 0;
            const selected = game.selectedFrom === t.id;
            const fill = isHuman ? "rgba(0,245,255,0.22)" : "rgba(255,0,234,0.2)";
            const stroke = selected
              ? "#ffff00"
              : isHuman
                ? "#00f5ff"
                : "#ff00ea";
            return (
              <g key={t.id}>
                <circle
                  cx={t.x}
                  cy={t.y}
                  r={5.2}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={selected ? 0.9 : 0.55}
                  filter="url(#glow)"
                  className="cursor-pointer"
                  onPointerDown={(e) => onPointerDown(e, t.id)}
                  onClick={() => onTerritoryClick(t.id)}
                />
                <text
                  x={t.x}
                  y={t.y - 7}
                  textAnchor="middle"
                  className="fill-cyan-100/90"
                  style={{
                    fontSize: "3.2px",
                    pointerEvents: "none",
                  }}
                >
                  {st.armies}
                </text>
                <text
                  x={t.x}
                  y={t.y + 8.5}
                  textAnchor="middle"
                  className="fill-fuchsia-200/70"
                  style={{
                    fontSize: "2.2px",
                    pointerEvents: "none",
                  }}
                >
                  {t.name.length > 10 ? t.name.slice(0, 9) + "…" : t.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {game.combatLog && (
        <p className="text-center font-mono text-xs text-amber-200/90">{game.combatLog}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {game.phase === "attack" && game.currentPlayer === 0 && (
          <button
            type="button"
            onClick={() => setGame((g) => endAttackPhase(g))}
            className="rounded-lg border border-amber-400/40 px-3 py-2 text-sm text-amber-200 hover:bg-amber-500/10"
          >
            End attacks
          </button>
        )}
        {game.phase === "fortify" && game.currentPlayer === 0 && !game.fortifyDone && (
          <button
            type="button"
            onClick={() => setGame((g) => skipFortify(g))}
            className="rounded-lg border border-slate-500/50 px-3 py-2 text-sm text-slate-300 hover:bg-slate-500/10"
          >
            Skip fortify
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setGame(createInitialGame());
            setHint("Tap your sectors to place reinforcements.");
          }}
          className="rounded-lg border border-cyan-500/40 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-500/10"
        >
          New game
        </button>
      </div>

      {game.winner !== null && (
        <p className="text-center text-lg font-bold text-fuchsia-300">
          {game.winner === 0 ? "You win" : "Neon AI wins"}
        </p>
      )}

      {game.currentPlayer === 1 && game.phase !== "gameover" && (
        <p className="text-center text-sm text-fuchsia-200/80">Opponent turn…</p>
      )}
    </div>
  );
}
