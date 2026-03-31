"use client";

import {
  useAccount,
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { checkInAbi } from "@/lib/check-in-abi";
import { getCheckInDataSuffix } from "@/lib/attribution";

const addr = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS as
  | `0x${string}`
  | undefined;

export function CheckInPanel() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, error, isPending, reset } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const validAddr = addr && addr !== "0x0000000000000000000000000000000000000000";

  function onCheckIn() {
    if (!validAddr) return;
    reset();
    const dataSuffix = getCheckInDataSuffix();
    writeContract({
      address: addr,
      abi: checkInAbi,
      functionName: "checkIn",
      chainId,
      dataSuffix,
    });
  }

  if (!isConnected) return null;

  return (
    <div className="rounded-xl border border-cyan-500/25 bg-black/30 px-4 py-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-cyan-200/60">
        Daily on-chain check-in
      </p>
      {!validAddr ? (
        <p className="text-xs text-amber-200/80">
          Set <code className="text-cyan-300">NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS</code>{" "}
          after deploy.
        </p>
      ) : (
        <>
          <button
            type="button"
            disabled={isPending || confirming}
            onClick={onCheckIn}
            className="rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-50"
          >
            {isPending || confirming
              ? "Confirm in wallet…"
              : isSuccess
                ? "Checked in ✓"
                : "Check in (gas only)"}
          </button>
          {error && (
            <p className="mt-2 text-xs text-red-400">{error.message}</p>
          )}
        </>
      )}
    </div>
  );
}
