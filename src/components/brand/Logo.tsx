import { Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-600 shadow-[0_0_28px_-4px_rgba(34,211,238,0.65)]">
        <Boxes className="size-5 text-[#04101f]" strokeWidth={2.4} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-white/40" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="font-display text-[17px] font-semibold tracking-[0.16em] text-white">
            NEXUS
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-cyan-200/60">
            Smart office OS
          </p>
        </div>
      )}
    </div>
  );
}
