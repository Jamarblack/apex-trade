import { useEffect, useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import {
  type Asset,
  type Kpi,
  type NetworkId,
  type Prediction,
  makeExecution,
  seedKpis,
  seedPredictions,
  seedSeries,
} from "@/lib/mockApi";

import { TopNav } from "@/components/TopNav";
import { PredictionStream } from "@/components/PredictionStream";
import { KpiRow, ChartCard } from "@/components/MarketOverview";
import { ExecutionLog } from "@/components/ExecutionLog";
import { TradingConsole } from "@/components/TradingConsole";
import { Drawer } from "@/components/Drawer";
import { WalletModal } from "@/components/WalletModal";
import { useExecutionHistory } from "@/hooks/useExecutionHistory";
import { Analytics } from "@vercel/analytics/react";

const API = "https://apex-trade-bc4l.onrender.com";

export default function App() {
  const [network, setNetwork] = useState<NetworkId>("solana");

  // ── Wallet State ──────────────────────────────────────────────────────────
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // ── Supabase-backed execution history ────────────────────────────────────
  const { executions, loading, addExecution, clearHistory } = useExecutionHistory(
    walletAddress,
    network,
  );

  const [predictions, setPredictions] = useState<Prediction[]>(seedPredictions(8));
  const [kpis, setKpis] = useState<Kpi[]>(seedKpis());
  const [series, setSeries] = useState(seedSeries(60));

  const [autoTrade, setAutoTrade] = useState(false);
  const [risk, setRisk] = useState(25);
  const [activeChart, setActiveChart] = useState<Asset>("SOL");
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // ── 1. Live AI prediction feed ────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    const fetchPrediction = async () => {
      try {
        const res = await fetch(`${API}/api/predictions/stream`);
        if (!res.ok) return;
        const p: Prediction = await res.json();
        if (!alive || !p?.asset) return;
        setPredictions((prev) => [{ ...p, ts: Date.now() }, ...prev].slice(0, 14));
      } catch {}
    };
    fetchPrediction();
    const t = setInterval(fetchPrediction, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  // ── 2. Live market ticks ──────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    const fetchTicks = async () => {
      try {
        const res = await fetch(`${API}/api/markets/ticks`);
        if (!res.ok) return;
        const data = await res.json();
        if (!alive || !Array.isArray(data.kpis)) return;
        setKpis(data.kpis);
        setSeries((prev) => {
          const solKpi = data.kpis.find((k: Kpi) => k.asset === "SOL");
          const baseKpi = data.kpis.find((k: Kpi) => k.asset === "BASE");
          const lastPoint = prev[prev.length - 1];
          const solPrice = Number(solKpi?.price) || lastPoint?.sol || 184.27;
          const basePrice = Number(baseKpi?.price) || lastPoint?.base || 1.0021;
          const next = {
            t: new Date().toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            sol: +solPrice.toFixed(2),
            base: +basePrice.toFixed(4),
          };
          return [...prev.slice(-59), next];
        });
      } catch {}
    };
    fetchTicks();
    const t = setInterval(fetchTicks, 1000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  // ── 3. Auto-trade ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!autoTrade) return;
    let alive = true;
    const executeTrade = async () => {
      try {
        const res = await fetch(`${API}/api/agent/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: null, risk, network }),
        });
        const data = await res.json();
        if (!alive) return;
        if (data.success && data.execution) {
          addExecution(data.execution);
        }
      } catch {
        if (!alive) return;
        addExecution(makeExecution());
      }
    };
    const t = setInterval(executeTrade, 6000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [autoTrade, risk, network]);

  // ── 4. Force trade ────────────────────────────────────────────────────────
  const forceTrade = async (action: "BUY" | "SELL") => {
    try {
      const res = await fetch(`${API}/api/agent/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, risk, network }),
      });
      const data = await res.json();
      if (data.success && data.execution) {
        addExecution(data.execution);
        return;
      }
    } catch {}
    addExecution(makeExecution(undefined, action));
  };

  // ── Wallet connect/disconnect ─────────────────────────────────────────────
  const handleWalletChange = (connected: boolean, address?: string) => {
    setWalletConnected(connected);
    setWalletAddress(connected && address ? address : null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[color:var(--sol-purple)]/40">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(900px 500px at 12% -10%, rgba(153,69,255,0.18), transparent 60%), radial-gradient(900px 600px at 100% 0%, rgba(0,82,255,0.14), transparent 55%), radial-gradient(600px 400px at 50% 110%, rgba(20,241,149,0.10), transparent 55%)",
        }}
      />
      <TopNav
        network={network}
        walletConnected={walletConnected}
        onWalletChange={handleWalletChange}
        onNetwork={setNetwork}
        onLeft={() => setLeftOpen(true)}
        onRight={() => setRightOpen(true)}
        walletModalOpen={walletModalOpen}
        onWalletModalOpen={setWalletModalOpen}
      />

      <main className="mx-auto w-full max-w-[1600px] px-3 pb-24 pt-4 sm:px-6 lg:pb-10">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)_340px]">
          <aside className="hidden lg:block">
            <PredictionStream predictions={predictions} />
          </aside>

          <section className="min-w-0 space-y-4">
            <KpiRow kpis={kpis} activeChart={activeChart} onSelect={setActiveChart} />
            <ChartCard
              series={series}
              activeChart={activeChart}
              onSelect={setActiveChart}
              kpis={kpis}
            />
            <ExecutionLog
              rows={executions}
              loading={loading}
              walletAddress={walletAddress}
              onClear={clearHistory}
            />
          </section>

          <aside className="hidden lg:block">
            <TradingConsole
              autoTrade={autoTrade}
              setAutoTrade={setAutoTrade}
              risk={risk}
              setRisk={setRisk}
              onForce={forceTrade}
              network={network}
              walletConnected={walletConnected}
            />
          </aside>
        </div>
      </main>

      <Drawer
        side="left"
        open={leftOpen}
        onClose={() => setLeftOpen(false)}
        title="AI Prediction Stream"
      >
        <PredictionStream predictions={predictions} />
      </Drawer>
      <Drawer
        side="right"
        open={rightOpen}
        onClose={() => setRightOpen(false)}
        title="Trading Agent"
      >
        <TradingConsole
          autoTrade={autoTrade}
          setAutoTrade={setAutoTrade}
          risk={risk}
          setRisk={setRisk}
          onForce={forceTrade}
          network={network}
          walletConnected={walletConnected}
        />
      </Drawer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[color:var(--surface)]/85 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-2">
          <button
            onClick={() => setLeftOpen(true)}
            className="flex items-center justify-center gap-2 py-3 text-xs font-medium tracking-wide text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <Sparkles className="size-4 text-[color:var(--sol-green)]" /> AI Stream
          </button>
          <button
            onClick={() => setRightOpen(true)}
            className="flex items-center justify-center gap-2 border-l border-border py-3 text-xs font-medium tracking-wide text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <Bot className="size-4 text-[color:var(--base-blue)]" /> Agent
          </button>
        </div>
      </nav>

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        message="On mobile? Copy this link and paste it in your wallet app's browser (Phantom, MetaMask, Trustwallet etc.) to connect seamlessly."
        type="info"
      />
      <Analytics />
    </div>
  );
}
