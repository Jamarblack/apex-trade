import { Sparkles } from "lucide-react";
import { type Prediction, timeAgo } from "@/lib/mockApi";

function ConfidenceRing({ value, color }: { value: number; color: string }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative grid size-10 shrink-0 place-items-center">
      <svg width={40} height={40} className="-rotate-90">
        <circle cx={20} cy={20} r={r} stroke="var(--border)" strokeWidth={3} fill="none" />
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
      <span className="absolute font-mono text-[10px] font-semibold text-foreground">{value}</span>
    </div>
  );
}

function PredictionCard({ p, live }: { p: Prediction; live: boolean }) {
  const isBuy = p.action === "BUY";
  const accent = isBuy ? "var(--bull)" : "var(--bear)";
  return (
    <li className={`group rounded-md border border-border bg-[color:var(--surface-2)] p-3 transition-colors hover:border-foreground/20 ${live ? "ring-1 ring-[color:var(--sol-green)]/30 shadow-[0_0_12px_rgba(20,241,149,0.1)]" : ""}`}>
      <div className="flex items-center gap-3">
        <ConfidenceRing value={p.confidence} color={accent as string} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-foreground">{p.asset}</span>
            <span className="rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider" style={{ background: `color-mix(in oklab, ${accent} 14%, transparent)`, color: accent }}>{p.action}</span>
            {live ? (
              <span className="ml-auto flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--sol-green)]">
                <span className="size-1.5 rounded-full bg-[color:var(--sol-green)] pulse-live" /> live
              </span>
            ) : (
              <span className="ml-auto font-mono text-[10px] text-foreground/40">{timeAgo(p.ts)}</span>
            )}
          </div>
          <p className="mt-1 truncate text-[11px] text-foreground/60">{p.reason}</p>
        </div>
      </div>
    </li>
  );
}

export function PredictionStream({ predictions }: { predictions: Prediction[] }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-[color:var(--surface)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-[color:var(--sol-green)]" />
          <h2 className="text-[12px] font-semibold tracking-[0.16em] text-foreground">AI PREDICTION STREAM</h2>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/40">live · {predictions.length}</span>
      </div>
      <div className="scanline relative max-h-[680px] flex-1 overflow-y-auto px-2 py-2 lg:max-h-[760px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <ul className="space-y-1.5">
          {predictions.map((p, i) => (
            <PredictionCard key={p.id} p={p} live={i === 0} />
          ))}
        </ul>
      </div>
    </div>
  );
}