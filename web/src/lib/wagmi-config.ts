import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected, baseAccount, walletConnect } from "wagmi/connectors";
import type { Chain } from "wagmi/chains";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 8453);

function getTargetChain(): Chain {
  if (chainId === 84532) return baseSepolia;
  return base;
}

const targetChain = getTargetChain();

/** Configured app chain (Base mainnet or Base Sepolia). Use for switch + writes. */
export const TARGET_CHAIN_ID = targetChain.id;

const connectors = [
  injected(),
  baseAccount({ appName: "Neon Risk" }),
];

const wcId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (wcId) {
  connectors.push(
    walletConnect({
      projectId: wcId,
      showQrModal: true,
    }),
  );
}

export const wagmiConfig = createConfig({
  chains: [targetChain],
  connectors,
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [targetChain.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
