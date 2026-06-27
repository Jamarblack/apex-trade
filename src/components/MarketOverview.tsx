import { Activity, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { type Asset, type Kpi, formatUsd, seedSeries } from "@/lib/mockApi";
import sol from "@/assets/sol.png";
import base from "@/assets/base.jpeg";

function Stat({ label, value, tone }: { label: string; value: string; tone?: "bull" | "bear" }) {
  const color =
    tone === "bull"
      ? "text-[color:var(--bull)]"
      : tone === "bear"
        ? "text-[color:var(--bear)]"
        : "text-foreground";
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/40">{label}</div>
      <div className={`mt-1 font-mono text-sm font-semibold ${color}`}>{value}</div>
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
      className={`group relative overflow-hidden rounded-lg border bg-[color:var(--surface)] p-4 text-left transition-all ${active ? "border-foreground/20 shadow-md" : "border-border hover:border-foreground/10"}`}
    >
      {active && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
      )}
      <div className="flex items-center gap-2">
        <span className="grid size-5 place-items-center rounded-[4px] bg-black dark:bg-black overflow-hidden border border-border/50">
          <img 
            src={isSol ? sol : base} 
            alt={`${k.asset} logo`} 
            className="size-3.5 object-contain" 
          />
        </span>
        <span className="text-[11px] font-semibold tracking-[0.18em] text-foreground/80">
          {k.asset}
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
          {isSol ? "Solana" : "Base"}
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            ${k.asset === "SOL" ? k.price.toFixed(2) : k.price.toFixed(4)}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">
            24h vol {formatUsd(k.volume24h)}
          </div>
        </div>
        <div
          className={`flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] font-semibold ${up ? "bg-[color:var(--bull)]/10 text-[color:var(--bull)]" : "bg-[color:var(--bear)]/10 text-[color:var(--bear)]"}`}
        >
          {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {up ? "+" : ""}
          {k.change24h.toFixed(2)}%
        </div>
      </div>
    </button>
  );
}

export function KpiRow({
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
        <KpiCard
          key={k.asset}
          k={k}
          active={activeChart === k.asset}
          onClick={() => onSelect(k.asset)}
        />
      ))}
    </div>
  );
}

export function ChartCard({
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
  const k = kpis.find((x) => x.asset === activeChart) || {
    asset: activeChart,
    price: activeChart === "SOL" ? 70.71 : 1580.75,
    change24h: 0,
    volume24h: 0,
  };

  const isSol = activeChart === "SOL";
  const dataKey = isSol ? "sol" : "base";
  const stroke = isSol ? "url(#solStroke)" : "var(--base-blue)";
  const fill = isSol ? "url(#solFill)" : "url(#baseFill)";

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[color:var(--surface)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="size-3.5 text-foreground/55" />
          <h2 className="text-[12px] font-semibold tracking-[0.16em] text-foreground">
            MARKET OVERVIEW
          </h2>
        </div>
        <div className="ml-auto flex items-center gap-1 rounded-md border border-border bg-[color:var(--surface-2)] p-0.5">
          {(["SOL", "BASE"] as Asset[]).map((a) => {
            const active = a === activeChart;
            const c = a === "SOL" ? "var(--sol-purple)" : "var(--base-blue)";
            return (
              <button
                key={a}
                onClick={() => onSelect(a)}
                className={`relative rounded px-3 py-1 font-mono text-[11px] font-semibold tracking-wider transition-colors ${active ? "text-foreground" : "text-foreground/45 hover:text-foreground/80"}`}
                style={
                  active ? { background: `color-mix(in oklab, ${c} 20%, transparent)` } : undefined
                }
              >
                {a}
              </button>
            );
          })}
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
        <Stat
          label="AI Bias"
          value={isSol ? "Bullish" : "Neutral"}
          tone={isSol ? "bull" : undefined}
        />
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
              tick={{ fill: "var(--foreground)", opacity: 0.5, fontSize: 10, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              minTickGap={32}
            />
            <YAxis
              orientation="right"
              tick={{ fill: "var(--foreground)", opacity: 0.5, fontSize: 10, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
              width={50}
              tickFormatter={(v: number) => (isSol ? v.toFixed(0) : v.toFixed(3))}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontSize: 11,
                fontFamily: "JetBrains Mono",
              }}
              labelStyle={{ color: "var(--foreground)", opacity: 0.6 }}
              itemStyle={{ color: "var(--foreground)" }}
              formatter={(v: number) => [isSol ? v.toFixed(2) : v.toFixed(4), activeChart]}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={stroke}
              strokeWidth={2}
              fill={fill}
              activeDot={{
                r: 4,
                fill: isSol ? "#14F195" : "#0052FF",
                stroke: "var(--background)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}