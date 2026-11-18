import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatisticsCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  accent: string;
  trend?: string;
  trendDirection?: "up" | "down" | "flat";
  progress?: number;
  spark?: number[];
  index?: number;
}

export function StatisticsCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  trend,
  trendDirection = "up",
  progress,
  spark,
  index = 0,
}: StatisticsCardProps) {
  const TrendIcon =
    trendDirection === "up"
      ? ArrowUpRight
      : trendDirection === "down"
        ? ArrowDownRight
        : Minus;
  const trendTone =
    trendDirection === "up"
      ? "text-emerald-300"
      : trendDirection === "down"
        ? "text-rose-300"
        : "text-muted-foreground";
  const max = spark && spark.length ? Math.max(...spark) : 1;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-16 size-32 rounded-full opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-35"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-center justify-between">
        <span
          className="grid size-8 place-items-center rounded-lg border border-white/10"
          style={{ backgroundColor: `${accent}1f`, color: accent }}
        >
          <Icon className="size-4" />
        </span>
        {trend && (
          <span className={cn("flex items-center gap-0.5 text-[10px] font-medium", trendTone)}>
            <TrendIcon className="size-3" />
            {trend}
          </span>
        )}
      </div>

      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-[26px] font-semibold leading-none text-white">
        {value}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-[10px] leading-4 text-muted-foreground">
          {hint}
        </p>
        {spark && (
          <div className="flex h-6 shrink-0 items-end gap-[3px]" aria-hidden>
            {spark.map((point, position) => (
              <span
                key={position}
                className="w-[3px] rounded-full"
                style={{
                  height: `${Math.max(18, (point / max) * 100)}%`,
                  backgroundColor: accent,
                  opacity: 0.25 + (position / spark.length) * 0.65,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {typeof progress === "number" && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              backgroundColor: accent,
              boxShadow: `0 0 10px ${accent}99`,
            }}
          />
        </div>
      )}
    </motion.article>
  );
}
