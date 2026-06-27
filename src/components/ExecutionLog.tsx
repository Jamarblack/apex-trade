import { Radio, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { type ExecutionRow, clockHHMMSS } from "@/lib/mockApi";

function ExecutionRowItem({ r }: { r: ExecutionRow }) {
  const bull = r.action === "BUY";
  const accent = r.asset === "SOL" ? "var(--sol-purple)" : "var(--base-blue)";
  
  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-4 py-2.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5 sm:grid-cols-[90px_64px_72px_minmax(0,1fr)_120px] sm:items-center sm:gap-y-0">
      <span className="order-1 font-mono text-[11px] text-foreground/55 sm:order-none">
        {clockHHMMSS(r.ts)}
      </span>
      
      <span className="order-2 flex items-center gap-1.5 font-mono text-[11px] font-semibold text-foreground sm:order-none">
        <span 
          className="grid size-3.5 place-items-center rounded-[2px] text-[8px] font-bold text-white dark:text-black" 
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
          color: bull ? "var(--bull)" : "var(--bear)" 
        }}
      >
        {bull ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
        {r.action}
      </span>
      
      <span className="order-4 font-mono text-[11px] text-foreground/80 sm:order-none">
        <span className="text-foreground">{r.amount}</span>
        <span className="px-1 text-foreground/30">@</span>
        <span className="text-foreground/70">
          ${r.asset === "SOL" ? r.price.toFixed(2) : r.price.toFixed(4)}
        </span>
      </span>
      
      <span className="order-5 hidden text-right font-mono text-[11px] text-foreground/40 sm:order-none sm:inline">
        {r.txHash}
      </span>
    </li>
  );
}

export function ExecutionLog({ rows }: { rows: ExecutionRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[color:var(--surface)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio className="size-3.5 text-foreground/55" />
          <h2 className="text-[12px] font-semibold tracking-[0.16em] text-foreground">EXECUTION LOG</h2>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/40">
          last {rows.length} fills
        </span>
      </div>
      
      <div className="hidden grid-cols-[90px_64px_72px_minmax(0,1fr)_120px] border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40 sm:grid">
        <span>Time</span>
        <span>Asset</span>
        <span>Side</span>
        <span>Amount · Price</span>
        <span className="text-right">Tx</span>
      </div>
      
      <ul className="divide-y divide-border">
        {rows.map((r) => <ExecutionRowItem key={r.id} r={r} />)}
      </ul>
    </div>
  );
}