"use client";

import { useEffect, useRef } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { TARGET_CHAIN_ID } from "@/lib/wagmi-config";

/**
 * Prompts the wallet to switch to Base once when connected on the wrong chain.
 * Avoids repeat prompts after rejection until disconnect or successful switch.
 */
export function AutoSwitchChain() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending } = useSwitchChain();
  const autoTried = useRef(false);

  useEffect(() => {
    if (!isConnected) {
      autoTried.current = false;
      return;
    }
    if (chainId === TARGET_CHAIN_ID) {
      autoTried.current = false;
      return;
    }
    if (autoTried.current || isPending) return;

    autoTried.current = true;
    switchChainAsync({ chainId: TARGET_CHAIN_ID }).catch(() => {
      /* user dismissed or wallet cannot switch — WrongNetworkBanner remains */
    });
  }, [isConnected, chainId, isPending, switchChainAsync]);

  return null;
}
