import { Bot, Cpu, Zap, ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { NetworkId } from "@/lib/mockApi";

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
        : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-[color:var(--surface-2)] p-2.5">
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/40">
        {label}
      </div>
      <div
        className={`mt-1 font-mono text-sm font-semibold ${color}`}
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

function RiskSlider({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const pct = ((value - 1) / 99) * 100;
  return (
    <div className={disabled ? "opacity-50 pointer-events-none grayscale" : ""}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-[0.16em] text-foreground/85">
          RISK ALLOCATION
        </span>
        <span className="font-mono text-[12px] font-semibold text-foreground">{value}%</span>
      </div>
      <div className="relative h-9 rounded-md border border-border bg-[color:var(--surface-2)] px-3">
        <div className="relative top-1/2 h-1 -translate-y-1/2 rounded-full bg-foreground/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #9945FF, #14F195)" }}
          />
          <div
            className="absolute top-1/2 grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-background shadow-md"
            style={{ left: `${pct}%` }}
          >
            <span className="size-1.5 rounded-full bg-foreground" />
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
          disabled={disabled}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
        <span>1% · safe</span>
        <span>50%</span>
        <span>100% · aggressive</span>
      </div>
    </div>
  );
}

function ForceButton({
  dir,
  onClick,
  disabled,
}: {
  dir: "BUY" | "SELL";
  onClick: () => void;
  disabled: boolean;
}) {
  const bull = dir === "BUY";
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={disabled ? "Connect wallet to unlock execution" : ""}
      className={`group relative flex h-11 items-center justify-between overflow-hidden rounded-md border px-4 text-[12px] font-bold tracking-[0.18em] transition-all 
        ${
          disabled
            ? "bg-[color:var(--surface-2)] border-border/50 text-foreground/40 cursor-not-allowed opacity-60"
            : bull
              ? "bg-[color:var(--surface-2)] border-[color:var(--bull)]/30 text-[color:var(--bull)] hover:border-[color:var(--bull)] hover:bg-[color:var(--bull)]/10"
              : "bg-[color:var(--surface-2)] border-[color:var(--bear)]/30 text-[color:var(--bear)] hover:border-[color:var(--bear)] hover:bg-[color:var(--bear)]/10"
        }`}
    >
      <span>FORCE {dir}</span>
      <span
        className={`flex items-center gap-2 font-mono text-[10px] tracking-wider ${disabled ? "text-foreground/30" : "text-foreground/50 group-hover:text-foreground/80"}`}
      >
        {bull ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
        {disabled ? "LOCKED" : "EXECUTE"}
      </span>
    </button>
  );
}

export function TradingConsole({
  autoTrade,
  setAutoTrade,
  risk,
  setRisk,
  onForce,
  network,
  walletConnected = false, 
}: {
  autoTrade: boolean;
  setAutoTrade: (v: boolean) => void;
  risk: number;
  setRisk: (v: number) => void;
  onForce: (a: "BUY" | "SELL") => void;
  network: NetworkId;
  walletConnected?: boolean;
}) {
  const netColor = network === "solana" ? "var(--sol-green)" : "var(--base-blue)";

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-[color:var(--surface)]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="size-3.5 text-foreground/55" />
            <h2 className="text-[12px] font-semibold tracking-[0.16em] text-foreground">
              TRADING AGENT
            </h2>
          </div>
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.2em] ${autoTrade ? "text-[color:var(--sol-green)]" : "text-foreground/35"}`}
          >
            {autoTrade ? "● armed" : "○ standby"}
          </span>
        </div>
        <div className="space-y-5 p-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-[0.16em] text-foreground/85">
                AUTO-TRADE
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/40">
                AI Execution
              </span>
            </div>
  
            <button
              onClick={() => walletConnected && setAutoTrade(!autoTrade)}
              disabled={!walletConnected}
              className={`relative h-12 w-full overflow-hidden rounded-md border text-left transition-all 
                ${
                  !walletConnected
                    ? "opacity-50 cursor-not-allowed grayscale border-border bg-[color:var(--surface-2)]"
                    : autoTrade
                      ? "border-transparent glow-sol bg-[color:var(--sol-green)]/8"
                      : "border-border bg-[color:var(--surface-2)] hover:border-foreground/20"
                }`}
            >
              <div className="flex h-full items-center px-3">
                <span
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoTrade ? "bg-[color:var(--sol-green)]" : "bg-foreground/10"}`}
                >
                  <span
                    className={`absolute size-5 rounded-full bg-background border border-border/50 shadow-sm transition-transform ${autoTrade ? "translate-x-[22px]" : "translate-x-0.5"}`}
                  />
                </span>
                <div className="ml-3">
                  <div className="text-[12px] font-semibold text-foreground">
                    {!walletConnected
                      ? "Requires Wallet"
                      : autoTrade
                        ? "Engine Live"
                        : "Engine Off"}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
                    {autoTrade ? "executing on signal" : "manual approval required"}
                  </div>
                </div>
                {/* <Zap
                  className={`ml-auto size-4 ${autoTrade ? "text-[color:var(--sol-green)]" : "text-foreground/30"}`}
                /> */}
              </div>
            </button>
          </div>

          <RiskSlider value={risk} onChange={setRisk} disabled={!walletConnected} />

          <div>
            <div className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-foreground/85">
              MANUAL OVERRIDE
            </div>
            <div className="grid grid-cols-1 gap-2">
              <ForceButton dir="BUY" onClick={() => onForce("BUY")} disabled={!walletConnected} />
              <ForceButton dir="SELL" onClick={() => onForce("SELL")} disabled={!walletConnected} />
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-[color:var(--surface)] p-4">
        <div className="flex items-center gap-2">
          <Cpu className="size-3.5 text-foreground/55" />
          <span className="text-[11px] font-semibold tracking-[0.16em] text-foreground/85">
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
