# Neon Risk (Base)

- **Live**: [https://risk-seven.vercel.app](https://risk-seven.vercel.app) — set `NEXT_PUBLIC_BASE_APP_ID` on Vercel (same as base.dev app id) so `<meta name="base:app_id">` is present for URL verification.
- **Web app**: [`web/`](web/) — Next.js App Router, Wagmi/Viem, daily `checkIn` with optional ERC-8021 `dataSuffix` via `ox/erc8021`. Set env vars from [`web/.env.example`](web/.env.example). Vercel **Root Directory** = `web`.
- **Contracts**: [`contracts/`](contracts/) — Foundry `CheckIn.sol` on Base mainnet: `0x5ddBB86b4B6504BA81598e6B6069dc50d11E7238`. Further deploys: see [`contracts/README.md`](contracts/README.md). App env: `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` (see [`web/.env.example`](web/.env.example)).
- **Assets**: [`web/public/app-icon.jpg`](web/public/app-icon.jpg) (1024×1024) and [`web/public/app-thumbnail.jpg`](web/public/app-thumbnail.jpg) (1.91∶1) for Base.dev listings.
