import { useMemo } from "react";
import { NavLink } from "react-router";
import {
  Boxes,
  CalendarClock,
  LayoutDashboard,
  LibraryBig,
  MessagesSquare,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useOfficeSnapshot } from "@/hooks/use-office-data";
import { cn } from "@/lib/utils";

const navigationGroups = [
  {
    label: "Workspace",
    items: [
      {
        to: "/dashboard",
        label: "Dashboard",
        description: "Your day at a glance",
        icon: LayoutDashboard,
      },
      {
        to: "/feed",
        label: "Team feed",
        description: "Updates and discussion",
        icon: MessagesSquare,
      },
      {
        to: "/catalog",
        label: "Catalog",
        description: "Playbooks and resources",
        icon: LibraryBig,
      },
      {
        to: "/bookings",
        label: "Bookings",
        description: "Rooms and schedules",
        icon: CalendarClock,
      },
    ],
  },
  {
    label: "Building",
    items: [
      {
        to: "/office",
        label: "3D Office",
        description: "Live isometric floor",
        icon: Boxes,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        to: "/admin",
        label: "Admin",
        description: "Manage the hub",
        icon: ShieldCheck,
      },
    ],
  },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-4">
      {navigationGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 hidden px-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/60 lg:block">
            {group.label}
          </p>
          <div className="flex flex-col gap-1.5">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                title={item.label}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm transition-all duration-300",
                    isActive
                      ? "border-cyan-300/20 bg-gradient-to-r from-cyan-400/15 via-blue-500/10 to-transparent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      : "text-slate-400 hover:border-white/5 hover:bg-white/[0.04] hover:text-slate-100",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
                        isActive
                          ? "bg-cyan-400/15 text-cyan-300 shadow-[0_0_18px_-4px_rgba(34,211,238,0.8)]"
                          : "bg-white/[0.03] text-slate-400 group-hover:text-cyan-200",
                      )}
                    >
                      <item.icon className="size-4" />
                    </span>
                    <span className="min-w-0 md:hidden lg:block">
                      <span className="block truncate font-medium">
                        {item.label}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground/80">
                        {item.description}
                      </span>
                    </span>
                    {isActive && (
                      <span className="absolute -left-px top-1/2 hidden h-6 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-cyan-300 to-blue-500 shadow-[0_0_12px_rgba(34,211,238,0.9)] lg:block" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function OccupancyCard() {
  const { data, loading } = useOfficeSnapshot();
  const summary = useMemo(() => {
    if (!data) return null;
    const onSite = data.employees.filter(
      (employee) => employee.presence === "in-office",
    ).length;
    const total = data.employees.length;
    return {
      onSite,
      total,
      percent: Math.round((onSite / total) * 100),
      rooms: data.rooms.length,
    };
  }, [data]);

  return (
    <div className="hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 lg:block">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <Radio className="size-3.5 text-cyan-300" />
          On the floor
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-400 pulse-dot" />
          Live
        </span>
      </div>

      {loading || !summary ? (
        <div className="mt-4 space-y-2">
          <div className="h-8 w-24 animate-pulse rounded-md bg-white/5" />
          <div className="h-1.5 w-full animate-pulse rounded-full bg-white/5" />
        </div>
      ) : (
        <>
          <p className="mt-3 font-display text-2xl font-semibold text-white">
            {summary.onSite}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              / {summary.total} on site
            </span>
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(34,211,238,0.7)] transition-[width] duration-700"
              style={{ width: `${summary.percent}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {summary.rooms} connected spaces · {summary.percent}% presence
          </p>
        </>
      )}
    </div>
  );
}

export function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-5 px-3 pb-5 pt-5">
      <div className="px-2 md:flex md:justify-center lg:justify-start">
        <span className="md:hidden lg:block">
          <Logo />
        </span>
        <span className="hidden md:block lg:hidden">
          <Logo compact />
        </span>
      </div>

      <div className="hidden px-2 md:block">
        <div className="neon-line h-px w-full opacity-40" />
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <NavItems onNavigate={onNavigate} />
      </div>

      <OccupancyCard />

      <div className="hidden rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 lg:block">
        <p className="flex items-center gap-2 text-[10px] font-medium text-slate-300">
          <span className="size-1.5 rounded-full bg-cyan-300" />
          Internal prototype · v2
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
          Posts and bookings are stored in this browser. Admins can reset the
          workspace.
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[84px] flex-col border-r border-white/[0.06] bg-[#070f1f]/85 backdrop-blur-xl md:flex lg:w-[264px]">
      <SidebarBody />
    </aside>
  );
}
