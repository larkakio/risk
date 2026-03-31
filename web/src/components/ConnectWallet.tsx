"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState } from "react";

export function ConnectWallet() {
  const { address, isConnected, status } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);

  if (status === "connecting") {
    return (
      <span className="text-sm text-cyan-200/80">Connecting…</span>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-cyan-100/90">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <button
          type="button"
          onClick={() => disconnect()}
          className="rounded border border-fuchsia-500/50 px-3 py-1.5 text-xs text-fuchsia-200 hover:bg-fuchsia-500/10"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full min-w-0 overflow-visible sm:w-auto">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg bg-gradient-to-r from-cyan-500/30 to-fuchsia-600/40 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(0,245,255,0.35)] ring-1 ring-cyan-400/50"
        >
          Connect wallet
        </button>
      </div>
      {open && (
        <div
          className="absolute right-0 z-[100] mt-2 w-[min(100%,280px)] max-h-[min(70vh,420px)] overflow-y-auto rounded-xl border border-cyan-500/30 bg-[#0d0518]/98 p-2 shadow-[0_0_32px_rgba(0,0,0,0.6)] backdrop-blur-md sm:min-w-[220px] sm:w-auto"
          role="listbox"
          aria-label="Wallet connectors"
        >
          <p className="mb-2 px-2 text-xs text-cyan-200/70">Choose wallet</p>
          <ul className="flex flex-col gap-1">
            {connectors.map((c) => (
              <li key={c.uid}>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    connect({ connector: c });
                    setOpen(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-cyan-100 hover:bg-cyan-500/15 disabled:opacity-50"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
          {error && (
            <p className="mt-2 px-2 text-xs text-red-400">{error.message}</p>
          )}
        </div>
      )}
    </div>
  );
}
