import { X } from "lucide-react";
import { useState } from "react";

export interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  type?: "error" | "info" | "warning";
}

export function WalletModal({
  isOpen,
  onClose,
  message = "Phantom wallet extension not detected. Please install it.",
  type = "error",
}: WalletModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const bgColor =
    type === "error"
      ? "bg-red-950/40"
      : type === "warning"
        ? "bg-yellow-950/40"
        : "bg-blue-950/40";

  const borderColor =
    type === "error"
      ? "border-red-900/50"
      : type === "warning"
        ? "border-yellow-900/50"
        : "border-blue-900/50";

  const accentColor =
    type === "error"
      ? "text-red-400"
      : type === "warning"
        ? "text-yellow-400"
        : "text-blue-400";

  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={`relative w-full max-w-md rounded-lg ${bgColor} border ${borderColor} bg-opacity-95 p-6 shadow-2xl`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-foreground/40 hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <h2 className={`text-lg font-semibold ${accentColor}`}>
            {type === "error"
              ? "⚠️ Connection Required"
              : type === "warning"
                ? "⚡ Mobile User?"
                : "ℹ️ Info"}
          </h2>
        </div>

        {/* Message */}
        <p className="mb-6 text-sm text-foreground/80 leading-relaxed">
          {message}
        </p>

        {/* Mobile wallet instructions */}
        <div className="mb-6 rounded-md bg-white/5 p-4 border border-white/10">
          <p className="text-xs font-semibold text-foreground/70 mb-3 uppercase tracking-wider">
            📱 For Mobile Users
          </p>
          <ol className="space-y-2 text-xs text-foreground/70">
            <li>
              <span className="font-semibold text-foreground">1.</span> Copy
              this link
            </li>
            <li>
              <span className="font-semibold text-foreground">2.</span> Open
              your wallet browser (Phantom, Magic Eden, etc.)
            </li>
            <li>
              <span className="font-semibold text-foreground">3.</span> Paste &
              connect
            </li>
          </ol>
        </div>

        {/* URL copy button */}
        <button
          onClick={copyToClipboard}
          className={`w-full mb-3 rounded-md px-4 py-3 font-mono text-xs font-semibold transition-all ${
            copied
              ? "bg-green-600/20 text-green-400 border border-green-600/50"
              : `${bgColor} border ${borderColor} text-foreground hover:bg-white/5`
          }`}
        >
          {copied ? "✓ Copied!" : `Copy Link: ${currentUrl.slice(0, 40)}...`}
        </button>

        {/* Primary action */}
        <button
          onClick={onClose}
          className={`w-full rounded-md px-4 py-2.5 font-semibold text-sm transition-all ${accentColor} hover:bg-white/10`}
        >
          Got it, thanks
        </button>
      </div>
    </div>
  );
}