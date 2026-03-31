import { Attribution } from "ox/erc8021";
import type { Hex } from "viem";

/** ERC-8021 suffix for check-in tx. Uses explicit hex override if set, else ox from bc_ code. */
export function getCheckInDataSuffix(): Hex | undefined {
  const override = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX?.trim();
  if (override?.startsWith("0x") && override.length > 2) {
    return override as Hex;
  }
  const code = process.env.NEXT_PUBLIC_BUILDER_CODE?.trim();
  if (!code) return undefined;
  return Attribution.toDataSuffix({ codes: [code] });
}
