import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  Boxes,
  CalendarClock,
  CircleHelp,
  CircleUserRound,
  Command,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Logo } from "@/components/brand/Logo";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardData, useOfficeSnapshot } from "@/hooks/use-office-data";
import { useHubData } from "@/hooks/use-hub-data";
import { displayNameFor, initialsFor } from "@/lib/hub-utils";
import type { AppNotification } from "@/types/office";
import { cn } from "@/lib/utils";

const shortcuts = [
  { keys: "Drag", action: "Orbit the office" },
  { keys: "Scroll", action: "Zoom in and out" },
  { keys: "Shift + drag", action: "Pan across the floor" },
  { keys: "Click", action: "Inspect a room, desk or person" },
  { keys: "R", action: "Reset the camera" },
];

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: office } = useOfficeSnapshot();
  const { data: dashboard } = useDashboardData();
  const { data: hub } = useHubData();
  const [now, setNow] = useState(() => new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (dashboard) setNotifications(dashboard.notifications);
  }, [dashboard]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const unread = notifications.filter((item) => !item.read).length;
  const displayName = displayNameFor(user);
  const displayEmail = user?.email || "Signed in as a guest";
  const initials = useMemo(() => initialsFor(displayName), [displayName]);

  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeLabel = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#060d1c]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2.5 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white md:hidden"
        >
          <Menu className="size-4" />
        </button>

        <div className="md:hidden">
          <Logo compact />
        </div>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="group flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-left text-xs text-muted-foreground transition-all hover:border-cyan-300/25 hover:bg-white/[0.05] sm:max-w-[340px]"
        >
          <Search className="size-3.5 shrink-0 text-muted-foreground group-hover:text-cyan-300" />
          <span className="truncate">Search the hub…</span>
          <kbd className="ml-auto hidden shrink-0 items-center gap-0.5 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground sm:flex">
            <Command className="size-2.5" />K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="mr-1 hidden items-center gap-3 border-r border-white/[0.08] pr-4 lg:flex">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {dateLabel}
              </p>
              <p className="font-display text-sm font-medium tabular-nums text-slate-100">
                {timeLabel}
              </p>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
              Live
            </span>
          </div>

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            aria-label="Help and controls"
            className="hidden size-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white sm:grid"
          >
            <CircleHelp className="size-[18px]" />
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Notifications"
                className="relative grid size-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <Bell className="size-[18px]" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full border border-[#07111f] bg-gradient-to-br from-cyan-300 to-blue-500 px-1 text-[9px] font-bold leading-4 text-[#05101e]">
                    {unread}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={10}
              className="glass-panel w-[min(340px,calc(100vw-1.5rem))] border-white/10 p-3"
            >
              <NotificationPanel
                items={notifications}
                onRead={(id) =>
                  setNotifications((items) =>
                    items.map((item) =>
                      item.id === id ? { ...item, read: true } : item,
                    ),
                  )
                }
                onMarkAllRead={() =>
                  setNotifications((items) =>
                    items.map((item) => ({ ...item, read: true })),
                  )
                }
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="ml-0.5 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-0.5 pr-1.5 transition-colors hover:border-cyan-300/30 hover:bg-white/[0.07]"
              >
                <span className="relative grid size-8 place-items-center rounded-full bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-600 text-[11px] font-bold text-[#06101f]">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={displayName}
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[#07111f] bg-emerald-400" />
                </span>
                <span className="hidden text-left leading-tight lg:block">
                  <span className="block max-w-[120px] truncate text-[11px] font-medium text-slate-100">
                    {displayName}
                  </span>
                  <span className="block text-[9px] uppercase tracking-wider text-emerald-300/90">
                    Online
                  </span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="glass-panel w-64 border-white/10 p-1.5"
            >
              <DropdownMenuLabel className="px-2 py-2">
                <span className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-600 text-[10px] font-bold text-[#06101f]">
                    {initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-white">
                      {displayName}
                    </span>
                    <span className="block truncate text-[10px] font-normal text-muted-foreground">
                      {displayEmail}
                    </span>
                  </span>
                </span>
              </DropdownMenuLabel>
              <div className="mb-1 flex items-center gap-1.5 px-2 pb-2 text-[10px] text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Online · Hub Agent Net
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 py-2 text-xs"
                onSelect={() => navigate("/dashboard")}
              >
                <LayoutDashboard className="size-3.5 text-cyan-300" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 py-2 text-xs"
                onSelect={() => navigate("/feed")}
              >
                <MessagesSquare className="size-3.5 text-cyan-300" />
                Team feed
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 py-2 text-xs"
                onSelect={() => navigate("/bookings")}
              >
                <CalendarClock className="size-3.5 text-cyan-300" />
                Bookings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 py-2 text-xs"
                onSelect={() => navigate("/office")}
              >
                <Boxes className="size-3.5 text-cyan-300" />
                Open 3D office
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 py-2 text-xs"
                onSelect={() => navigate("/admin")}
              >
                <ShieldCheck className="size-3.5 text-cyan-300" />
                Admin workspace
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="gap-2 py-2 text-xs"
                onSelect={handleSignOut}
              >
                <LogOut className="size-3.5" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <GlobalSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        rooms={office?.rooms ?? []}
        employees={office?.employees ?? []}
        catalog={hub?.catalog ?? []}
      />

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="glass-panel border-white/10 sm:max-w-md">
          <DialogHeader>
            <span className="mb-2 grid size-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <CircleHelp className="size-5" />
            </span>
            <DialogTitle>Finding your way around</DialogTitle>
            <DialogDescription>
              The 3D office is a live model. Every room, desk and person on it
              can be inspected, and the rest of the hub is one click away.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 divide-y divide-white/[0.06] rounded-xl border border-white/[0.07] bg-white/[0.02]">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.keys}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <span className="text-xs text-slate-300">{shortcut.action}</span>
                <kbd className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-cyan-200">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-cyan-300/15 bg-cyan-400/[0.06] p-3">
            <CircleUserRound className="mt-0.5 size-4 shrink-0 text-cyan-300" />
            <p className="text-[11px] leading-relaxed text-slate-300">
              Posts, bookings and catalog entries are saved in this browser for
              now. The service interfaces are already shaped for a shared
              backend, so live team data can be connected without UI changes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setHelpOpen(false);
              navigate("/office");
            }}
            className={cn(
              "mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-xl",
              "bg-gradient-to-r from-cyan-400 to-blue-500 text-xs font-semibold text-[#05101e]",
              "shadow-[0_16px_40px_-18px_rgba(34,211,238,0.9)] transition-opacity hover:opacity-90",
            )}
          >
            <Boxes className="size-4" />
            Open the live floor
          </button>
        </DialogContent>
      </Dialog>
    </header>
  );
}
