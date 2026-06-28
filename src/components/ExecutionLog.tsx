import { Radio, ArrowDownRight, ArrowUpRight, Trash2, Loader2 } from "lucide-react";
import { type ExecutionRow, clockHHMMSS } from "@/lib/mockApi";
import sol from "@/assets/sol.png";
import base from "@/assets/base.jpeg";

function ExecutionRowItem({ r }: { r: ExecutionRow }) {
  const bull = r.action === "BUY";
  const accent = r.asset === "SOL" ? "var(--sol-purple)" : "var(--base-blue)";

  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-4 py-2.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5 sm:grid-cols-[90px_64px_72px_minmax(0,1fr)_120px] sm:items-center sm:gap-y-0">
      <span className="order-1 font-mono text-[11px] text-foreground/55 sm:order-none">
        {clockHHMMSS(r.ts)}
      </span>

      <span className="order-2 flex items-center gap-1.5 font-mono text-[11px] font-semibold text-foreground sm:order-none">
        <span className="grid size-3.5 shrink-0 place-items-center overflow-hidden rounded-[3px] bg-black">
          <img
            src={r.asset === "SOL" ? sol : base}
            alt={r.asset}
            className="size-full object-cover"
          />
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

export function ExecutionLog({
  rows,
  loading = false,
  walletAddress,
  onClear,
}: {
  rows: ExecutionRow[];
  loading?: boolean;
  walletAddress: string | null;
  onClear?: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[color:var(--surface)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio className="size-3.5 text-foreground/55" />
          <h2 className="text-[12px] font-semibold tracking-[0.16em] text-foreground">
            EXECUTION LOG
          </h2>
          {walletAddress && (
            <span className="rounded-sm border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-foreground/40">
              {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {loading ? (
            <Loader2 className="size-3.5 animate-spin text-foreground/30" />
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/40">
              {rows.length} fills
            </span>
          )}
          {rows.length > 0 && onClear && !loading && (
            <button
              onClick={onClear}
              title="Clear history"
              className="text-foreground/30 transition-colors hover:text-[color:var(--bear)]"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div className="hidden grid-cols-[90px_64px_72px_minmax(0,1fr)_120px] border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40 sm:grid">
        <span>Time</span>
        <span>Asset</span>
        <span>Side</span>
        <span>Amount · Price</span>
        <span className="text-right">Tx</span>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-px py-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="h-2.5 w-16 animate-pulse rounded bg-white/5" />
              <div className="h-2.5 w-10 animate-pulse rounded bg-white/5" />
              <div className="h-2.5 w-10 animate-pulse rounded bg-white/5" />
              <div className="h-2.5 flex-1 animate-pulse rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <Radio className="size-5 text-foreground/15" />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/25">
            {walletAddress
              ? "No executions yet — use Auto-Trade or Force Buy/Sell"
              : "Connect wallet to track & save executions"}
          </p>
        </div>
      ) : (
        /* Rows */
        <ul className="max-h-[400px] divide-y divide-border overflow-y-auto">
          {rows.map((r) => (
            <ExecutionRowItem key={r.id} r={r} />
          ))}
        </ul>
      )}
    </div>
  );
}
