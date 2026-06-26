import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  ChevronDown,
  Cpu,
  Hexagon,
  Menu,
  Radio,
  Sparkles,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  type Asset,
  type ExecutionRow,
  type Kpi,
  type NetworkId,
  type Prediction,
  clockHHMMSS,
  formatUsd,
  makeExecution,
  makePrediction,
  seedExecutions,
  seedKpis,
  seedPredictions,
  seedSeries,
  timeAgo,
} from "@/lib/mockApi";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Apex Trade — AI Market Prediction & Automated Trading" },
      {
        name: "description",
        content:
          "Apex Trade is an institutional-grade AI prediction engine and autonomous trading console for Solana and Base.",
      },
      { property: "og:title", content: "Apex Trade — AI Trading Terminal" },
      {
        property: "og:description",
        content: "Real-time AI predictions, automated execution, and risk-managed alpha across Solana and Base.",
      },
    ],
  }),
  component: Index,
});

/* ---------------------------------------------------------------- */
/* Apex Trade — institutional AI trading terminal                   */
/* ---------------------------------------------------------------- */

const NETWORK_META: Record<
  NetworkId,
  { label: string; color: string; glow: string; mark: string }
> = {
  solana: { label: "Solana", color: "#14F195", glow: "glow-sol", mark: "◎" },
  base: { label: "Base", color: "#0052FF", glow: "glow-base", mark: "▣" },
};

function Index() {
  const [network, setNetwork] = useState<NetworkId>("solana");
  const [predictions, setPredictions] = useState<Prediction[]>(() => seedPredictions(10));
  const [kpis, setKpis] = useState<Kpi[]>(() => seedKpis());
  const [series, setSeries] = useState(() => seedSeries(48));
  const [executions, setExecutions] = useState<ExecutionRow[]>(() => seedExecutions(9));
  const [autoTrade, setAutoTrade] = useState(false);
  const [risk, setRisk] = useState(25);
  const [activeChart, setActiveChart] = useState<Asset>("SOL");

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // Live prediction feed
  useEffect(() => {
    // TODO: Connect Express backend endpoint here — WS /api/predictions/stream
    const t = setInterval(() => {
      setPredictions((prev) => [makePrediction(), ...prev].slice(0, 14));
    }, 4200);
    return () => clearInterval(t);
  }, []);

  // Live KPI ticks
  useEffect(() => {
    // TODO: Connect Express backend endpoint here — WS /api/markets/ticks
    const t = setInterval(() => {
      setKpis((prev) =>
        prev.map((k) => {
          const drift = (Math.random() - 0.5) * (k.asset === "SOL" ? 0.6 : 0.0008);
          const newPrice = +(k.price + drift).toFixed(k.asset === "SOL" ? 2 : 4);
          const change = +(k.change24h + (Math.random() - 0.5) * 0.08).toFixed(2);
          return { ...k, price: newPrice, change24h: change };
        }),
      );
      setSeries((prev) => {
        const last = prev[prev.length - 1]!;
        const next = {
          t: clockHHMMSS(Date.now()).slice(0, 5),
          sol: +(last.sol + (Math.random() - 0.45) * 1.2).toFixed(2),
          base: +(last.base + (Math.random() - 0.5) * 0.003).toFixed(4),
        };
        return [...prev.slice(1), next];
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);

  // Auto-trade execution simulator
  useEffect(() => {
    if (!autoTrade) return;
    // TODO: Connect Express backend endpoint here — POST /api/agent/execute
    const t = setInterval(() => {
      setExecutions((prev) => [makeExecution(), ...prev].slice(0, 30));
    }, 5200);
    return () => clearInterval(t);
  }, [autoTrade]);

  const forceTrade = (action: "BUY" | "SELL") => {
    setExecutions((prev) => [makeExecution(undefined, action), ...prev].slice(0, 30));
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[color:var(--sol-purple)]/40">
      {/* Ambient backdrop */}
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
          {/* LEFT — Predictions (desktop) */}
          <aside className="hidden lg:block">
            <PredictionStream predictions={predictions} />
          </aside>

          {/* CENTER */}
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

          {/* RIGHT — Trading console (desktop) */}
          <aside className="hidden lg:block">
            <TradingConsole
              autoTrade={autoTrade}
              setAutoTrade={setAutoTrade}
              risk={risk}
              setRisk={setRisk}
              onForce={forceTrade}
              network={network}
            />
          </aside>
        </div>
      </main>

      {/* Mobile drawers */}
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
        />
      </Drawer>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-[color:var(--surface)]/85 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-2">
          <button
            onClick={() => setLeftOpen(true)}
            className="flex items-center justify-center gap-2 py-3 text-xs font-medium tracking-wide text-white/80 hover:bg-white/[0.04]"
          >
            <Sparkles className="size-4 text-[color:var(--sol-green)]" /> AI Stream
          </button>
          <button
            onClick={() => setRightOpen(true)}
            className="flex items-center justify-center gap-2 border-l border-white/5 py-3 text-xs font-medium tracking-wide text-white/80 hover:bg-white/[0.04]"
          >
            <Bot className="size-4 text-[color:var(--base-blue)]" /> Agent
          </button>
        </div>
      </nav>
    </div>
  );
}

/* ---------------- Top Nav ---------------- */
function TopNav({
  network,
  onNetwork,
  onLeft,
  onRight,
}: {
  network: NetworkId;
  onNetwork: (n: NetworkId) => void;
  onLeft: () => void;
  onRight: () => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = NETWORK_META[network];
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[color:var(--background)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-3 px-3 sm:px-6">
        <button
          onClick={onLeft}
          className="grid size-9 shrink-0 place-items-center rounded-md border border-white/5 text-white/70 hover:bg-white/[0.04] lg:hidden"
          aria-label="Open AI stream"
        >
          <Menu className="size-4" />
        </button>

        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid size-7 place-items-center rounded-[6px] bg-gradient-to-br from-[color:var(--sol-purple)] to-[color:var(--sol-green)]">
            <Hexagon className="size-3.5 text-black" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <div className="text-[13px] font-bold tracking-[0.18em] text-white">
              APEX<span className="text-white/40">·</span>TRADE
            </div>
            <div className="mt-1 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 sm:block">
              v0.1 · institutional terminal
            </div>
          </div>
        </div>

        <div className="ml-3 hidden items-center gap-2 md:flex">
          <StatusPill />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Network select */}
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 items-center gap-2 rounded-md border border-white/5 bg-[color:var(--surface)] px-2.5 text-[12px] font-medium text-white/85 hover:bg-white/[0.04]"
            >
              <span
                className="grid size-4 place-items-center rounded-[3px] text-[10px] font-bold"
                style={{ background: meta.color, color: "#000" }}
              >
                {meta.mark}
              </span>
              <span className="hidden sm:inline">{meta.label}</span>
              <ChevronDown className="size-3.5 text-white/50" />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-md border border-white/5 bg-[color:var(--surface-2)]/95 p-1 shadow-2xl backdrop-blur-xl">
                  {(Object.keys(NETWORK_META) as NetworkId[]).map((n) => {
                    const m = NETWORK_META[n];
                    const active = n === network;
                    return (
                      <button
                        key={n}
                        onClick={() => {
                          onNetwork(n);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded px-2 py-2 text-left text-[12px] ${
                          active ? "bg-white/[0.05] text-white" : "text-white/75 hover:bg-white/[0.04]"
                        }`}
                      >
                        <span
                          className="grid size-4 place-items-center rounded-[3px] text-[10px] font-bold"
                          style={{ background: m.color, color: "#000" }}
                        >
                          {m.mark}
                        </span>
                        {m.label}
                        {active && <span className="ml-auto text-[10px] text-white/40">selected</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Connect Wallet */}
          <button
            className={`group flex h-9 items-center gap-2 rounded-md border border-white/10 bg-[color:var(--surface)] px-3 text-[12px] font-semibold text-white/90 transition-all hover:border-transparent ${
              network === "solana" ? "hover:glow-sol" : "hover:glow-base"
            }`}
          >
            <Wallet className="size-3.5 text-white/70 group-hover:text-white" />
            <span className="hidden sm:inline">Connect Wallet</span>
            <span className="sm:hidden">Connect</span>
          </button>

          <button
            onClick={onRight}
            className="grid size-9 shrink-0 place-items-center rounded-md border border-white/5 text-white/70 hover:bg-white/[0.04] lg:hidden"
            aria-label="Open trading console"
          >
            <Bot className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function StatusPill() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/5 bg-[color:var(--surface)] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
      <span className="relative grid size-2 place-items-center">
        <span className="absolute size-2 rounded-full bg-[color:var(--sol-green)] pulse-live" />
        <span className="size-1.5 rounded-full bg-[color:var(--sol-green)]" />
      </span>
      AI Engine · Online
      <span className="mx-1 text-white/15">|</span>
      Latency <span className="text-white/80">42ms</span>
    </div>
  );
}

/* ---------------- Prediction Stream ---------------- */
function PredictionStream({ predictions }: { predictions: Prediction[] }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-white/5 bg-[color:var(--surface)]">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-[color:var(--sol-green)]" />
          <h2 className="text-[12px] font-semibold tracking-[0.16em] text-white">
            AI PREDICTION STREAM
          </h2>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          live · {predictions.length}
        </span>
      </div>
      <div className="scanline relative max-h-[680px] flex-1 overflow-y-auto px-2 py-2 lg:max-h-[760px]">
        <ul className="space-y-1.5">
          {predictions.map((p, i) => (
            <PredictionCard key={p.id} p={p} live={i === 0} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function PredictionCard({ p, live }: { p: Prediction; live: boolean }) {
  const isBuy = p.action === "BUY";
  const accent = isBuy ? "var(--bull)" : "var(--bear)";
  return (
    <li
      className={`group rounded-md border border-white/[0.04] bg-[color:var(--surface-2)]/60 p-3 transition-colors hover:border-white/10 ${
        live ? "ring-1 ring-[color:var(--sol-green)]/30" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <ConfidenceRing value={p.confidence} color={accent as string} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-white">{p.asset}</span>
            <span
              className="rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider"
              style={{
                background: `color-mix(in oklab, ${accent} 14%, transparent)`,
                color: accent,
              }}
            >
              {p.action}
            </span>
            {live && (
              <span className="ml-auto flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--sol-green)]">
                <span className="size-1.5 rounded-full bg-[color:var(--sol-green)] pulse-live" />
                live
              </span>
            )}
            {!live && (
              <span className="ml-auto font-mono text-[10px] text-white/35">
                {timeAgo(p.ts)}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-[11px] text-white/55">{p.reason}</p>
        </div>
      </div>
    </li>
  );
}

function ConfidenceRing({ value, color }: { value: number; color: string }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative grid size-10 shrink-0 place-items-center">
      <svg width={40} height={40} className="-rotate-90">
        <circle cx={20} cy={20} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={3} fill="none" />
        <circle
          cx={20}
          cy={20}
          r={r}
          stroke={color}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <span className="absolute font-mono text-[10px] font-semibold text-white">{value}</span>
    </div>
  );
}

/* ---------------- KPI Row ---------------- */
function KpiRow({
  kpis,
  activeChart,
  onSelect,
}: {
  kpis: Kpi[];
  activeChart: Asset;
  onSelect: (a: Asset) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {kpis.map((k) => (
        <KpiCard key={k.asset} k={k} active={activeChart === k.asset} onClick={() => onSelect(k.asset)} />
      ))}
    </div>
  );
}

function KpiCard({ k, active, onClick }: { k: Kpi; active: boolean; onClick: () => void }) {
  const up = k.change24h >= 0;
  const isSol = k.asset === "SOL";
  const accent = isSol ? "var(--sol-purple)" : "var(--base-blue)";
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-lg border bg-[color:var(--surface)] p-4 text-left transition-all ${
        active ? "border-white/15" : "border-white/5 hover:border-white/10"
      }`}
    >
      {active && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
      )}
      <div className="flex items-center gap-2">
        <span
          className="grid size-5 place-items-center rounded-[4px] font-mono text-[10px] font-bold text-black"
          style={{ background: accent }}
        >
          {isSol ? "◎" : "▣"}
        </span>
        <span className="text-[11px] font-semibold tracking-[0.18em] text-white/70">
          {k.asset}/USD
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
          {isSol ? "Solana" : "Base"}
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="font-mono text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            ${k.asset === "SOL" ? k.price.toFixed(2) : k.price.toFixed(4)}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
            24h vol {formatUsd(k.volume24h)}
          </div>
        </div>
        <div
          className={`flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] font-semibold ${
            up
              ? "bg-[color:var(--bull)]/10 text-[color:var(--bull)]"
              : "bg-[color:var(--bear)]/10 text-[color:var(--bear)]"
          }`}
        >
          {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {up ? "+" : ""}
          {k.change24h.toFixed(2)}%
        </div>
      </div>
    </button>
  );
}

/* ---------------- Chart ---------------- */
function ChartCard({
  series,
  activeChart,
  onSelect,
  kpis,
}: {
  series: ReturnType<typeof seedSeries>;
  activeChart: Asset;
  onSelect: (a: Asset) => void;
  kpis: Kpi[];
}) {
  const k = kpis.find((x) => x.asset === activeChart)!;
  const isSol = activeChart === "SOL";
  const dataKey = isSol ? "sol" : "base";
  const stroke = isSol ? "url(#solStroke)" : "var(--base-blue)";
  const fill = isSol ? "url(#solFill)" : "url(#baseFill)";

  return (
    <div className="overflow-hidden rounded-lg border border-white/5 bg-[color:var(--surface)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="size-3.5 text-white/55" />
          <h2 className="text-[12px] font-semibold tracking-[0.16em] text-white">
            MARKET OVERVIEW
          </h2>
        </div>
        <div className="ml-auto flex items-center gap-1 rounded-md border border-white/5 bg-[color:var(--surface-2)] p-0.5">
          {(["SOL", "BASE"] as Asset[]).map((a) => {
            const active = a === activeChart;
            const c = a === "SOL" ? "var(--sol-purple)" : "var(--base-blue)";
            return (
              <button
                key={a}
                onClick={() => onSelect(a)}
                className={`relative rounded px-3 py-1 font-mono text-[11px] font-semibold tracking-wider transition-colors ${
                  active ? "text-white" : "text-white/45 hover:text-white/80"
                }`}
                style={active ? { background: `color-mix(in oklab, ${c} 18%, transparent)` } : undefined}
              >
                {a}
              </button>
            );
          })}
        </div>
        <div className="hidden items-center gap-1 rounded-md border border-white/5 bg-[color:var(--surface-2)] p-0.5 sm:flex">
          {["1H", "4H", "1D", "1W"].map((t, i) => (
            <button
              key={t}
              className={`rounded px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider ${
                i === 2 ? "bg-white/[0.06] text-white" : "text-white/40 hover:text-white/75"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 px-4 pt-4 sm:grid-cols-4">
        <Stat label="Price" value={`$${isSol ? k.price.toFixed(2) : k.price.toFixed(4)}`} />
        <Stat
          label="24h Δ"
          value={`${k.change24h >= 0 ? "+" : ""}${k.change24h.toFixed(2)}%`}
          tone={k.change24h >= 0 ? "bull" : "bear"}
        />
        <Stat label="Volume" value={formatUsd(k.volume24h)} />
        <Stat label="AI Bias" value={isSol ? "Bullish" : "Neutral"} tone={isSol ? "bull" : undefined} />
      </div>

      <div className="h-[280px] w-full px-2 pb-3 pt-4 sm:h-[340px] sm:px-4">
        <ResponsiveContainer>
          <AreaChart data={series} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="solStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9945FF" />
                <stop offset="100%" stopColor="#14F195" />
              </linearGradient>
              <linearGradient id="solFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9945FF" stopOpacity={0.35} />
                <stop offset="60%" stopColor="#14F195" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#14F195" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="baseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0052FF" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#0052FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="t"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              minTickGap={32}
            />
            <YAxis
              orientation="right"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
              width={50}
              tickFormatter={(v: number) => (isSol ? v.toFixed(0) : v.toFixed(3))}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeDasharray: "3 3" }}
              contentStyle={{
                background: "#0a0a0a",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                fontSize: 11,
                fontFamily: "JetBrains Mono",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.55)" }}
              itemStyle={{ color: "#fff" }}
              formatter={(v: number) => [isSol ? v.toFixed(2) : v.toFixed(4), activeChart]}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={stroke}
              strokeWidth={2}
              fill={fill}
              activeDot={{ r: 4, fill: isSol ? "#14F195" : "#0052FF", stroke: "#0a0a0a", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "bull" | "bear";
}) {
  const color =
    tone === "bull" ? "text-[color:var(--bull)]" : tone === "bear" ? "text-[color:var(--bear)]" : "text-white";
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">{label}</div>
      <div className={`mt-1 font-mono text-sm font-semibold ${color}`}>{value}</div>
    </div>
  );
}

/* ---------------- Trading Console ---------------- */
function TradingConsole({
  autoTrade,
  setAutoTrade,
  risk,
  setRisk,
  onForce,
  network,
}: {
  autoTrade: boolean;
  setAutoTrade: (v: boolean) => void;
  risk: number;
  setRisk: (v: number) => void;
  onForce: (a: "BUY" | "SELL") => void;
  network: NetworkId;
}) {
  const netColor = network === "solana" ? "var(--sol-green)" : "var(--base-blue)";
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-white/5 bg-[color:var(--surface)]">
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="size-3.5 text-white/55" />
            <h2 className="text-[12px] font-semibold tracking-[0.16em] text-white">
              TRADING AGENT
            </h2>
          </div>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ color: autoTrade ? "#14F195" : "rgba(255,255,255,0.35)" }}
          >
            {autoTrade ? "● armed" : "○ standby"}
          </span>
        </div>

        <div className="space-y-5 p-4">
          {/* Auto-trade switch */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-[0.16em] text-white/85">
                AUTO-TRADE
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                AI Execution
              </span>
            </div>
            <button
              onClick={() => setAutoTrade(!autoTrade)}
              className={`relative h-12 w-full overflow-hidden rounded-md border text-left transition-all ${
                autoTrade
                  ? "border-transparent glow-sol bg-[color:var(--sol-green)]/8"
                  : "border-white/10 bg-[color:var(--surface-2)] hover:border-white/20"
              }`}
            >
              <div className="flex h-full items-center px-3">
                <span
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoTrade ? "bg-[color:var(--sol-green)]" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute size-5 rounded-full bg-black shadow-lg transition-transform ${
                      autoTrade ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </span>
                <div className="ml-3">
                  <div className="text-[12px] font-semibold text-white">
                    {autoTrade ? "Engine Live" : "Engine Off"}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                    {autoTrade ? "executing on signal" : "manual approval required"}
                  </div>
                </div>
                <Zap
                  className={`ml-auto size-4 ${
                    autoTrade ? "text-[color:var(--sol-green)]" : "text-white/30"
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Risk dial */}
          <RiskSlider value={risk} onChange={setRisk} />

          {/* Force buttons */}
          <div>
            <div className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-white/85">
              MANUAL OVERRIDE
            </div>
            <div className="grid grid-cols-1 gap-2">
              <ForceButton dir="BUY" onClick={() => onForce("BUY")} />
              <ForceButton dir="SELL" onClick={() => onForce("SELL")} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/5 bg-[color:var(--surface)] p-4">
        <div className="flex items-center gap-2">
          <Cpu className="size-3.5 text-white/55" />
          <span className="text-[11px] font-semibold tracking-[0.16em] text-white/85">
            AGENT TELEMETRY
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <TeleStat label="Win Rate" value="68.4%" />
          <TeleStat label="Sharpe" value="2.31" />
          <TeleStat label="Net P/L (7d)" value="+$12.8K" tone="bull" />
          <TeleStat label="Open Risk" value={`${risk}%`} accent={netColor} />
        </div>
      </div>
    </div>
  );
}

function RiskSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const pct = ((value - 1) / 99) * 100;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-[0.16em] text-white/85">
          RISK ALLOCATION
        </span>
        <span className="font-mono text-[12px] font-semibold text-white">{value}%</span>
      </div>
      <div className="relative h-9 rounded-md border border-white/10 bg-[color:var(--surface-2)] px-3">
        <div className="relative top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/[0.06]">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #9945FF, #14F195)",
              boxShadow: "0 0 12px rgba(20,241,149,0.45)",
            }}
          />
          <div
            className="absolute top-1/2 grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black"
            style={{ left: `${pct}%`, boxShadow: "0 0 12px rgba(255,255,255,0.25)" }}
          >
            <span className="size-1.5 rounded-full bg-white" />
          </div>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Risk allocation"
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
        <span>1% · safe</span>
        <span>50%</span>
        <span>100% · aggressive</span>
      </div>
    </div>
  );
}

function ForceButton({ dir, onClick }: { dir: "BUY" | "SELL"; onClick: () => void }) {
  const bull = dir === "BUY";
  return (
    <button
      onClick={onClick}
      className={`group relative flex h-11 items-center justify-between overflow-hidden rounded-md border bg-[color:var(--surface-2)] px-4 text-[12px] font-bold tracking-[0.18em] transition-all ${
        bull
          ? "border-[color:var(--bull)]/30 text-[color:var(--bull)] hover:border-[color:var(--bull)] hover:bg-[color:var(--bull)]/10"
          : "border-[color:var(--bear)]/30 text-[color:var(--bear)] hover:border-[color:var(--bear)] hover:bg-[color:var(--bear)]/10"
      }`}
    >
      <span>FORCE {dir}</span>
      <span className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-white/50 group-hover:text-white/80">
        {bull ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
        EXECUTE
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-16 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${bull ? "rgba(20,241,149,0.18)" : "rgba(255,77,109,0.18)"})`,
        }}
      />
    </button>
  );
}

function TeleStat({
  label,
  value,
  tone,
  accent,
}: {
  label: string;
  value: string;
  tone?: "bull" | "bear";
  accent?: string;
}) {
  const color =
    tone === "bull"
      ? "text-[color:var(--bull)]"
      : tone === "bear"
        ? "text-[color:var(--bear)]"
        : "text-white";
  return (
    <div className="rounded-md border border-white/[0.04] bg-[color:var(--surface-2)] p-2.5">
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">{label}</div>
      <div
        className={`mt-1 font-mono text-sm font-semibold ${color}`}
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

/* ---------------- Execution Log ---------------- */
function ExecutionLog({ rows }: { rows: ExecutionRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/5 bg-[color:var(--surface)]">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio className="size-3.5 text-white/55" />
          <h2 className="text-[12px] font-semibold tracking-[0.16em] text-white">
            EXECUTION LOG
          </h2>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          last {rows.length} fills
        </span>
      </div>

      {/* header row */}
      <div className="hidden grid-cols-[90px_64px_72px_minmax(0,1fr)_120px] border-b border-white/5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 sm:grid">
        <span>Time</span>
        <span>Asset</span>
        <span>Side</span>
        <span>Amount · Price</span>
        <span className="text-right">Tx</span>
      </div>

      <ul className="divide-y divide-white/[0.04]">
        {rows.map((r) => (
          <ExecutionRowItem key={r.id} r={r} />
        ))}
      </ul>
    </div>
  );
}

function ExecutionRowItem({ r }: { r: ExecutionRow }) {
  const bull = r.action === "BUY";
  const accent = r.asset === "SOL" ? "var(--sol-purple)" : "var(--base-blue)";
  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-4 py-2.5 transition-colors hover:bg-white/[0.02] sm:grid-cols-[90px_64px_72px_minmax(0,1fr)_120px] sm:items-center sm:gap-y-0">
      <span className="order-1 font-mono text-[11px] text-white/55 sm:order-none">
        {clockHHMMSS(r.ts)}
      </span>
      <span className="order-2 flex items-center gap-1.5 font-mono text-[11px] font-semibold text-white sm:order-none">
        <span
          className="grid size-3.5 place-items-center rounded-[2px] text-[8px] font-bold text-black"
          style={{ background: accent }}
        >
          {r.asset === "SOL" ? "◎" : "▣"}
        </span>
        {r.asset}
      </span>
      <span
        className="order-3 inline-flex w-fit items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider sm:order-none"
        style={{
          background: bull ? "rgba(20,241,149,0.10)" : "rgba(255,77,109,0.10)",
          color: bull ? "var(--bull)" : "var(--bear)",
        }}
      >
        {bull ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
        {r.action}
      </span>
      <span className="order-4 font-mono text-[11px] text-white/80 sm:order-none">
        <span className="text-white">{r.amount}</span>
        <span className="px-1 text-white/30">@</span>
        <span className="text-white/70">
          ${r.asset === "SOL" ? r.price.toFixed(2) : r.price.toFixed(4)}
        </span>
      </span>
      <span className="order-5 hidden text-right font-mono text-[11px] text-white/40 sm:order-none sm:inline">
        {r.txHash}
      </span>
    </li>
  );
}

/* ---------------- Drawer ---------------- */
function Drawer({
  side,
  open,
  onClose,
  title,
  children,
}: {
  side: "left" | "right";
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed bottom-0 top-0 z-50 flex w-[88vw] max-w-[360px] flex-col border-white/5 bg-[color:var(--background)] transition-transform lg:hidden ${
          side === "left" ? "left-0 border-r" : "right-0 border-l"
        } ${open ? "translate-x-0" : side === "left" ? "-translate-x-full" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <span className="text-[12px] font-semibold tracking-[0.16em] text-white">
            {title.toUpperCase()}
          </span>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md border border-white/5 text-white/60 hover:bg-white/[0.04]"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
      </aside>
    </>
  );
}

// silence unused-import warnings under strict tsgo
void useMemo;
void useRef;
