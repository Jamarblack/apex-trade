import { useEffect, useState, useCallback } from "react";
import type { ExecutionRow } from "@/lib/mockApi";
import { supabase } from "@/lib/supabaseClient";

const toRow = (r: ExecutionRow, walletAddress: string, network: string) => ({
  id: r.id,
  wallet_address: walletAddress.toLowerCase(),
  ts: r.ts,
  asset: r.asset,
  action: r.action,
  amount: Number(r.amount),
  price: Number(r.price),
  tx_hash: r.txHash,
  network,
});

const fromRow = (row: any): ExecutionRow => ({
  id: row.id,
  ts: row.ts,
  asset: row.asset,
  action: row.action,
  amount: row.amount,
  price: row.price,
  txHash: row.tx_hash,
});

export function useExecutionHistory(walletAddress: string | null, network: string = "solana") {
  const [executions, setExecutions] = useState<ExecutionRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress) {
      setExecutions([]);
      return;
    }

    let alive = true;
    setLoading(true);
    console.log("📂 Loading history for wallet:", walletAddress);

    const load = async () => {
      const { data, error } = await supabase
        .from("execution_logs")
        .select("*")
        .eq("wallet_address", walletAddress.toLowerCase())
        .order("ts", { ascending: false })
        .limit(100);

      if (!alive) return;
      if (error) {
        console.error("❌ Supabase fetch error:", error.message);
      } else {
        console.log(`✅ Loaded ${data?.length ?? 0} past executions`);
        setExecutions((data ?? []).map(fromRow));
      }
      setLoading(false);
    };

    load();
    return () => {
      alive = false;
    };
  }, [walletAddress]);

  const addExecution = useCallback(
    async (row: ExecutionRow) => {
      setExecutions((prev) => [row, ...prev].slice(0, 100));

      if (!walletAddress) {
        console.warn("⚠️ No wallet connected — trade shown in UI but NOT saved to Supabase");
        return;
      }

      console.log("💾 Saving to Supabase:", row.id, "wallet:", walletAddress);

      const { error } = await supabase
        .from("execution_logs")
        .insert(toRow(row, walletAddress, network));

      if (error) {
        console.error("❌ Supabase insert error:", error.message);
        setExecutions((prev) => prev.filter((r) => r.id !== row.id));
      } else {
        console.log("✅ Saved to Supabase successfully:", row.id);
      }
    },
    [walletAddress, network],
  );

  const clearHistory = useCallback(async () => {
    if (!walletAddress) return;

    const { error } = await supabase
      .from("execution_logs")
      .delete()
      .eq("wallet_address", walletAddress.toLowerCase());

    if (error) {
      console.error("❌ Supabase delete error:", error.message);
    } else {
      console.log("🗑️ Cleared history for wallet:", walletAddress);
      setExecutions([]);
    }
  }, [walletAddress]);

  return { executions, loading, addExecution, clearHistory };
}
