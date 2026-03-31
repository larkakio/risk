# Neon Risk (Base)

- **Live**: [https://risk-seven.vercel.app](https://risk-seven.vercel.app) — on Vercel set `NEXT_PUBLIC_BASE_APP_ID` (base.dev app id, `<meta name="base:app_id">`) and `NEXT_PUBLIC_BUILDER_CODE` (e.g. `bc_sk99y6l7`) for ERC-8021 attribution on check-in txs.
- **Web app**: [`web/`](web/) — Next.js App Router, Wagmi/Viem, daily `checkIn` with optional ERC-8021 `dataSuffix` via `ox/erc8021`. Set env vars from [`web/.env.example`](web/.env.example). Vercel **Root Directory** = `web`.
- **Contracts**: [`contracts/`](contracts/) — Foundry `CheckIn.sol` on Base mainnet: `0x5ddBB86b4B6504BA81598e6B6069dc50d11E7238`. Further deploys: see [`contracts/README.md`](contracts/README.md). App env: `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` (see [`web/.env.example`](web/.env.example)).
- **Assets**: [`web/public/app-icon.jpg`](web/public/app-icon.jpg) (1024×1024) and [`web/public/app-thumbnail.jpg`](web/public/app-thumbnail.jpg) (1.91∶1) for Base.dev listings.
