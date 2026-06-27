import { useEffect, useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import {
  type Asset,
  type ExecutionRow,
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

const API = "http://localhost:5000";

export default function App() {
  const [network, setNetwork] = useState<NetworkId>("solana");

  // ── Wallet State ─────────────────────────────────────────────────────────
  // TODO: Replace this with your actual wallet hook! 
  // Example (Solana): const { connected: walletConnected } = useWallet();
  // Example (Base): const { isConnected: walletConnected } = useAccount();
  const [walletConnected, setWalletConnected] = useState(false); 

  // ── Seed ALL state immediately so UI is never blank ──────────────────────
  const [predictions, setPredictions] = useState<Prediction[]>(seedPredictions(8));
  const [kpis, setKpis] = useState<Kpi[]>(seedKpis());
  const [series, setSeries] = useState(seedSeries(60));
  const [executions, setExecutions] = useState<ExecutionRow[]>([]);

  const [autoTrade, setAutoTrade] = useState(false);
  const [risk, setRisk] = useState(25);
  const [activeChart, setActiveChart] = useState<Asset>("SOL");
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // ── 1. Live AI prediction feed — polls every 5 s ─────────────────────────
  useEffect(() => {
    let alive = true;

    const fetchPrediction = async () => {
      try {
        const res = await fetch(`${API}/api/predictions/stream`);
        if (!res.ok) return;
        const p: Prediction = await res.json();
        if (!alive || !p?.asset) return;
        setPredictions((prev) => [{ ...p, ts: Date.now() }, ...prev].slice(0, 14));
      } catch {
        // backend offline — keep showing seeded predictions, no crash
      }
    };

    fetchPrediction();
    const t = setInterval(fetchPrediction, 5000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  // ── 2. Live market ticks — polls every 1 s ───────────────────────────────
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
          const solKpi  = data.kpis.find((k: Kpi) => k.asset === "SOL");
          const baseKpi = data.kpis.find((k: Kpi) => k.asset === "BASE");

          const lastPoint = prev[prev.length - 1];
          const solPrice  = Number(solKpi?.price)  || lastPoint?.sol  || 184.27;
          const basePrice = Number(baseKpi?.price) || lastPoint?.base || 1.0021;

          const next = {
            t: new Date().toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            sol:  +solPrice.toFixed(2),
            base: +basePrice.toFixed(4),
          };

          return [...prev.slice(-59), next];
        });
      } catch {
        // backend offline — series keeps its last value, chart stays visible
      }
    };

    fetchTicks();
    const t = setInterval(fetchTicks, 1000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  // ── 3. Auto-trade — fires every 6 s when armed ───────────────────────────
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
          setExecutions((prev) => [data.execution, ...prev].slice(0, 30));
        }
      } catch {
        if (!alive) return;
        setExecutions((prev) => [makeExecution(), ...prev].slice(0, 30));
      }
    };

    const t = setInterval(executeTrade, 6000);
    return () => { alive = false; clearInterval(t); };
  }, [autoTrade, risk, network]);

  // ── 4. Force trade (immediate) ───────────────────────────────────────────
  const forceTrade = async (action: "BUY" | "SELL") => {
    try {
      const res = await fetch(`${API}/api/agent/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, risk, network }),
      });
      const data = await res.json();
      if (data.success && data.execution) {
        setExecutions((prev) => [data.execution, ...prev].slice(0, 30));
        return;
      }
    } catch {
      // fall through to local fallback
    }
    setExecutions((prev) => [makeExecution(undefined, action), ...prev].slice(0, 30));
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
        onNetwork={setNetwork}
        onLeft={() => setLeftOpen(true)}
        onRight={() => setRightOpen(true)}
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
            <ExecutionLog rows={executions} />
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

      <Drawer side="left" open={leftOpen} onClose={() => setLeftOpen(false)} title="AI Prediction Stream">
        <PredictionStream predictions={predictions} />
      </Drawer>
      <Drawer side="right" open={rightOpen} onClose={() => setRightOpen(false)} title="Trading Agent">
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
    </div>
  );
}