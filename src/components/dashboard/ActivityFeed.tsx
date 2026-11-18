import { Boxes, CheckCircle2, Cpu, DoorOpen, Users } from "lucide-react";
import type { ActivityItem, ActivityType } from "@/types/office";
import { cn } from "@/lib/utils";

const typeMeta: Record<
  ActivityType,
  { icon: typeof Users; className: string }
> = {
  room: { icon: DoorOpen, className: "bg-cyan-400/10 text-cyan-300" },
  employee: { icon: Users, className: "bg-blue-400/10 text-blue-300" },
  task: { icon: CheckCircle2, className: "bg-emerald-400/10 text-emerald-300" },
  system: { icon: Cpu, className: "bg-violet-400/10 text-violet-300" },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <ol className="relative space-y-4">
      <span className="absolute bottom-2 left-[15px] top-2 w-px bg-gradient-to-b from-cyan-400/30 via-white/10 to-transparent" />
      {items.slice(0, 5).map((item) => {
        const meta = typeMeta[item.type];
        const Icon = meta.icon;
        return (
          <li key={item.id} className="relative flex gap-3">
            <span
              className={cn(
                "z-10 grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.06]",
                meta.className,
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 pb-0.5">
              <p className="text-[11.5px] leading-5 text-slate-300">
                <span className="font-medium text-white">{item.actor}</span>{" "}
                {item.action}{" "}
                <span className="font-medium text-cyan-200">{item.target}</span>
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                {item.time}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function ActivityFooter({ total }: { total: number }) {
  return (
    <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-[10px] text-muted-foreground">
      <Boxes className="size-3.5 text-cyan-300/80" />
      {total} floor events captured today
    </div>
  );
}
