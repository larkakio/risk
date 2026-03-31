"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi-config";

const targetId = wagmiConfig.chains[0].id;

export function WrongNetworkBanner() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === targetId) return null;

  return (
    <div
      className="border border-[#ff00ea]/60 bg-[#1a0520]/95 px-4 py-3 text-center text-sm text-[#ff9ef0] shadow-[0_0_24px_rgba(255,0,234,0.25)]"
      role="status"
    >
      <span className="font-medium">Wrong network.</span>{" "}
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchChain({ chainId: targetId })}
        className="ml-2 rounded border border-cyan-400/70 px-3 py-1 text-cyan-300 underline-offset-2 hover:underline disabled:opacity-50"
      >
        {isPending ? "Switching…" : "Switch to Base"}
      </button>
    </div>
  );
}
