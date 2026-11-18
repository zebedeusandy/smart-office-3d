import { CheckCheck, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { AppNotification } from "@/types/office";
import { cn } from "@/lib/utils";

const toneMeta = {
  info: { icon: Info, className: "bg-cyan-400/10 text-cyan-300" },
  success: { icon: CircleCheck, className: "bg-emerald-400/10 text-emerald-300" },
  warning: { icon: TriangleAlert, className: "bg-amber-400/10 text-amber-300" },
} as const;

export function NotificationPanel({
  items,
  onRead,
  onMarkAllRead,
  className,
}: {
  items: AppNotification[];
  onRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  className?: string;
}) {
  const unread = items.filter((item) => !item.read).length;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-1 pb-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white">Notifications</p>
          {unread > 0 && (
            <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-200">
              {unread} new
            </span>
          )}
        </div>
        {onMarkAllRead && unread > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-[11px] font-medium text-cyan-300 transition-colors hover:text-cyan-200"
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="scrollbar-thin mt-2 max-h-[330px] space-y-1 overflow-y-auto pr-1">
        {items.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            You are all caught up.
          </p>
        )}
        {items.map((item) => {
          const tone = toneMeta[item.tone];
          const Icon = tone.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onRead?.(item.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                item.read ? "opacity-65 hover:bg-white/[0.03]" : "hover:bg-white/[0.05]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg",
                  tone.className,
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start gap-2">
                  <span className="flex-1 text-xs font-medium leading-5 text-slate-100">
                    {item.title}
                  </span>
                  {!item.read && (
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan-300" />
                  )}
                </span>
                <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
                  {item.body}
                </span>
                <span className="mt-1 block text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  {item.time}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}