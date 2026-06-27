import { useState } from "react";
import { Bot, ChevronDown, Hexagon, Menu, Wallet, Sun, Moon } from "lucide-react";
import type { NetworkId } from "@/lib/mockApi";
import { useTheme } from "./ThemeProvider";
import sol from "@/assets/sol.png";
import base from "@/assets/base.jpeg";
import logo from "@/assets/logo.png";

export const NETWORK_META: Record<
  NetworkId,
  { label: string; color: string; glow: string; icon: string }
> = {
  solana: { label: "Solana", color: "#14F195", glow: "glow-sol", icon: sol },
  base: { label: "Base", color: "#0052FF", glow: "glow-base", icon: base },
};

function StatusPill() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/5 bg-[color:var(--surface)] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55">
      <span className="relative grid size-2 place-items-center">
        <span className="absolute size-2 rounded-full bg-[color:var(--sol-green)] pulse-live" />
        <span className="size-1.5 rounded-full bg-[color:var(--sol-green)]" />
      </span>
      AI Engine · Online
      <span className="mx-1 text-foreground/15">|</span>
      Latency <span className="text-foreground/80">42ms</span>
    </div>
  );
}

export function TopNav({
  network,
  walletConnected,
  onWalletChange,
  onNetwork,
  onLeft,
  onRight,
}: {
  network: NetworkId;
  walletConnected: boolean;
  onWalletChange: (connected: boolean) => void;
  onNetwork: (n: NetworkId) => void;
  onLeft: () => void;
  onRight: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Wallet State
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const meta = NETWORK_META[network];

  // Native Web3 Connection Logic
  const connectWallet = async () => {
    if (walletAddress) {

      setWalletAddress(null);
      onWalletChange(false);
      return;
    }

    setIsConnecting(true);
    try {
      if (network === "solana") {
        const provider = (window as any).solana;
        if (provider?.isPhantom) {
          const resp = await provider.connect();
          const address = resp.publicKey.toString();
          setWalletAddress(address);
          onWalletChange(true);
        } else {
          alert("Phantom wallet extension not detected. Please install it.");
        }
      } else if (network === "base") {
        const provider = (window as any).ethereum;
        if (provider) {
          const accounts = await provider.request({ method: "eth_requestAccounts" });
          setWalletAddress(accounts[0]);
          onWalletChange(true);
        } else {
          alert("MetaMask or Coinbase Wallet not detected. Please install one.");
        }
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-[color:var(--background)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-3 px-3 sm:px-6">
        <button
          onClick={onLeft}
          className="grid size-9 shrink-0 place-items-center rounded-md border border-border text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5 lg:hidden"
        >
          <Menu className="size-4" />
        </button>

        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid size-7 place-items-center rounded-[6px]">
            <img src={logo} alt="Apex Trade" className="size-6 text-black" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <div className="text-[13px] font-bold tracking-[0.18em] text-foreground">
              APEX<span className="text-foreground/40">·</span>TRADE
            </div>
            <div className="mt-1 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/40 sm:block">
              
            </div>
          </div>
        </div>

        <div className="ml-3 hidden items-center gap-2 md:flex">
          <StatusPill />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* THEME TOGGLE */}
          {/* <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="grid size-9 place-items-center rounded-md border border-border bg-[color:var(--surface)] text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button> */}

          {/* NETWORK SELECTOR */}
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 items-center gap-2 rounded-md border border-border bg-[color:var(--surface)] px-2.5 text-[12px] font-medium text-foreground/85 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span
                className="grid size-4 place-items-center rounded-[3px] text-[10px] font-bold"
                style={{ background: "#000", color: "#fff" }}
              >
                <img src={meta.icon} alt={meta.label} className="size-full object-cover" />
              </span>
              <span className="hidden sm:inline">{meta.label}</span>
              <ChevronDown className="size-3.5 text-foreground/50" />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-md border border-border bg-[color:var(--surface-2)]/95 p-1 shadow-2xl backdrop-blur-xl">
                  {(Object.keys(NETWORK_META) as NetworkId[]).map((n) => {
                    const m = NETWORK_META[n];
                    const active = n === network;
                    return (
                      <button
                        key={n}
                        onClick={() => {
                          onNetwork(n);
                          setWalletAddress(null);
                          onWalletChange(false);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded px-2 py-2 text-left text-[12px] ${active ? "bg-black/5 dark:bg-white/10 text-foreground" : "text-foreground/75 hover:bg-black/5 dark:hover:bg-white/5"}`}
                      >
                        <span
                          className="grid size-4 place-items-center rounded-[3px] text-[10px] font-bold"
                          style={{ background: "#000", color: "#fff" }}
                        >
                          <img src={m.icon} alt={m.label} className="size-full object-cover" />
                        </span>
                        {m.label}
                        {active && (
                          <span className="ml-auto text-[10px] text-foreground/40">selected</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* CONNECT WALLET BUTTON */}
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className={`group flex h-9 items-center gap-2 rounded-md border border-border bg-[color:var(--surface)] px-3 text-[12px] font-semibold transition-all ${walletConnected ? "text-foreground border-transparent " + meta.glow : "text-foreground/90 hover:border-transparent " + (network === "solana" ? "hover:glow-sol" : "hover:glow-base")}`}
          >
            <Wallet
              className={`size-3.5 ${walletConnected ? "text-[color:var(--sol-green)]" : "text-foreground/70 group-hover:text-foreground"}`}
            />
            <span className="hidden sm:inline">
              {isConnecting
                ? "Connecting..."
                : walletConnected
                  ? formatAddress(walletAddress ?? "")
                  : "Connect Wallet"}
            </span>
            <span className="sm:hidden">
              {walletConnected ? formatAddress(walletAddress ?? "").slice(0, 6) : "Connect"}
            </span>
          </button>

          <button
            onClick={onRight}
            className="grid size-9 shrink-0 place-items-center rounded-md border border-border text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5 lg:hidden"
          >
            <Bot className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
