import { useEffect } from "react";
import { X } from "lucide-react";

export function Drawer({ side, open, onClose, title, children }: { side: "left" | "right"; open: boolean; onClose: () => void; title: string; children: React.ReactNode; }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={onClose} />
      <aside className={`fixed bottom-0 top-0 z-50 flex w-[88vw] max-w-[360px] flex-col border-white/5 bg-[color:var(--background)] transition-transform lg:hidden ${side === "left" ? "left-0 border-r" : "right-0 border-l"} ${open ? "translate-x-0" : side === "left" ? "-translate-x-full" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <span className="text-[12px] font-semibold tracking-[0.16em] text-white">{title.toUpperCase()}</span>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-md border border-white/5 text-white/60 hover:bg-white/[0.04]"><X className="size-4" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
      </aside>
    </>
  );
}