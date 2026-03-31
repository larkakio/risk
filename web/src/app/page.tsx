import { ConnectWallet } from "@/components/ConnectWallet";
import { WrongNetworkBanner } from "@/components/WrongNetworkBanner";
import { CheckInPanel } from "@/components/CheckInPanel";
import { GameBoard } from "@/components/game/GameBoard";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-4 pb-10 pt-6">
      <header className="flex flex-col gap-4 border-b border-cyan-500/20 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 overflow-visible">
          <div className="min-w-0 flex-1">
            <h1 className="bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-[0_0_18px_rgba(0,245,255,0.45)]">
              Neon Risk
            </h1>
            <p className="mt-1 max-w-md text-sm text-cyan-100/65">
              Swipe between sectors to attack or fortify. Tap to reinforce. Runs as a
              standard web app on Base.
            </p>
          </div>
          <ConnectWallet />
        </div>
        <WrongNetworkBanner />
        <CheckInPanel />
      </header>

      <section aria-label="Game board">
        <GameBoard />
      </section>
    </main>
  );
}
