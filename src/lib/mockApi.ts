// Mock data layer for Apex Trade.
// TODO: Connect Express backend endpoints here — every export below is a
// drop-in replacement target for a real REST/WebSocket call.

export type NetworkId = "solana" | "base";

export type Asset = "SOL" | "BASE";

export interface Prediction {
  id: string;
  asset: Asset;
  action: "BUY" | "SELL";
  confidence: number; // 0..100
  reason: string;
  ts: number;
}

export interface Kpi {
  asset: Asset;
  price: number;
  change24h: number; // percent
  volume24h: number; // USD
}

export interface CandlePoint {
  t: string; // label
  sol: number;
  base: number;
}

export interface ExecutionRow {
  id: string;
  ts: number;
  asset: Asset;
  action: "BUY" | "SELL";
  amount: number;
  price: number;
  txHash: string;
}

const REASONS = [
  "Order-flow imbalance +2.4σ",
  "Funding rate divergence",
  "Liquidity sweep detected",
  "Whale accumulation cluster",
  "Volatility compression breakout",
  "Cross-venue basis arbitrage",
  "Sentiment delta > threshold",
  "On-chain netflow inversion",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function shortHash(): string {
  const hex = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < 3; i++) s += hex[Math.floor(Math.random() * 16)];
  s += "...";
  for (let i = 0; i < 3; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}

// TODO: Connect Express backend endpoint here — GET /api/predictions/stream (WS)
export function makePrediction(asset?: Asset): Prediction {
  const a = asset ?? (Math.random() > 0.5 ? "SOL" : "BASE");
  return {
    id: crypto.randomUUID(),
    asset: a,
    action: Math.random() > 0.42 ? "BUY" : "SELL",
    confidence: Math.round(62 + Math.random() * 36),
    reason: rand(REASONS),
    ts: Date.now(),
  };
}

export function seedPredictions(n = 8): Prediction[] {
  return Array.from({ length: n }, () => makePrediction()).map((p, i) => ({
    ...p,
    ts: Date.now() - i * 9000,
  }));
}

// TODO: Connect Express backend endpoint here — GET /api/markets/kpi
export function seedKpis(): Kpi[] {
  return [
    { asset: "SOL", price: 184.27, change24h: 4.82, volume24h: 2_410_000_000 },
    { asset: "BASE", price: 1.0021, change24h: -0.14, volume24h: 1_180_000_000 },
  ];
}

// TODO: Connect Express backend endpoint here — GET /api/markets/series?range=24h
export function seedSeries(points = 48): CandlePoint[] {
  const out: CandlePoint[] = [];
  let sol = 180;
  let base = 1;
  for (let i = 0; i < points; i++) {
    sol += (Math.random() - 0.45) * 2.4;
    base += (Math.random() - 0.5) * 0.004;
    const h = String(Math.floor((i / points) * 24)).padStart(2, "0");
    out.push({ t: `${h}:00`, sol: +sol.toFixed(2), base: +base.toFixed(4) });
  }
  return out;
}

// TODO: Connect Express backend endpoint here — GET /api/executions
export function seedExecutions(n = 9): ExecutionRow[] {
  return Array.from({ length: n }, (_, i) => {
    const asset: Asset = Math.random() > 0.5 ? "SOL" : "BASE";
    return {
      id: crypto.randomUUID(),
      ts: Date.now() - i * 47_000,
      asset,
      action: Math.random() > 0.5 ? "BUY" : "SELL",
      amount: +(Math.random() * (asset === "SOL" ? 12 : 4200)).toFixed(2),
      price:
        asset === "SOL"
          ? +(180 + Math.random() * 8).toFixed(2)
          : +(1 + Math.random() * 0.01).toFixed(4),
      txHash: shortHash(),
    };
  });
}

export function makeExecution(asset?: Asset, action?: "BUY" | "SELL"): ExecutionRow {
  const a = asset ?? (Math.random() > 0.5 ? "SOL" : "BASE");
  return {
    id: crypto.randomUUID(),
    ts: Date.now(),
    asset: a,
    action: action ?? (Math.random() > 0.5 ? "BUY" : "SELL"),
    amount: +(Math.random() * (a === "SOL" ? 12 : 4200)).toFixed(2),
    price:
      a === "SOL" ? +(180 + Math.random() * 8).toFixed(2) : +(1 + Math.random() * 0.01).toFixed(4),
    txHash: shortHash(),
  };
}

export function formatUsd(n: number, digits = 2): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(digits)}`;
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h`;
}

export function clockHHMMSS(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-GB", { hour12: false });
}
