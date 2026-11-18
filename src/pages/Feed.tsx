import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  CalendarClock,
  LibraryBig,
  MessageSquarePlus,
  MessagesSquare,
  Users,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/hub/PageHeader";
import { PostComposer } from "@/components/hub/PostComposer";
import { PostCard } from "@/components/hub/PostCard";
import { Panel } from "@/components/dashboard/Panel";
import { useHubData } from "@/hooks/use-hub-data";
import { useOfficeSnapshot } from "@/hooks/use-office-data";
import {
  CATEGORY_META,
  formatBookingDate,
  POST_TAG_META,
  todayISO,
} from "@/lib/hub-utils";
import type { PostTag } from "@/types/hub";
import { cn } from "@/lib/utils";

const filters: { value: "all" | PostTag; label: string }[] = [
  { value: "all", label: "All posts" },
  { value: "update", label: "Updates" },
  { value: "announcement", label: "Announcements" },
  { value: "question", label: "Questions" },
  { value: "resource", label: "Resources" },
];

export default function Feed() {
  const { data, loading } = useHubData();
  const office = useOfficeSnapshot();
  const [filter, setFilter] = useState<"all" | PostTag>("all");

  const posts = data?.posts ?? [];
  const filtered = useMemo(
    () => (filter === "all" ? posts : posts.filter((post) => post.tag === filter)),
    [posts, filter],
  );

  const bookings = data?.bookings ?? [];
  const upcoming = bookings
    .filter(
      (booking) =>
        booking.status === "confirmed" && booking.date >= todayISO(),
    )
    .slice(0, 3);

  const roomName = (roomId: string) =>
    office.data?.rooms.find((room) => room.id === roomId)?.name ?? "Unassigned room";

  const catalog = data?.catalog.slice(0, 3) ?? [];
  const onSite = office.data?.employees.filter(
    (employee) => employee.presence === "in-office",
  ).length;

  return (
    <AppLayout>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Team feed"
          title="What the team is working on"
          description="Share updates, ask for help and keep the context in one place. Everyone in the workspace can post, react and comment."
          actions={
            <a
              href="#composer"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 px-3.5 py-2 text-[11px] font-semibold text-[#04101f] shadow-[0_16px_40px_-20px_rgba(34,211,238,0.9)] transition-opacity hover:opacity-90"
            >
              <MessageSquarePlus className="size-3.5" />
              New post
            </a>
          }
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_318px]">
          <div className="space-y-4">
            <PostComposer />

            <div className="flex flex-wrap items-center gap-1.5">
              {filters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[10px] font-medium transition-colors",
                    filter === option.value
                      ? "border-cyan-300/35 bg-cyan-400/10 text-cyan-100"
                      : "border-white/[0.07] bg-white/[0.02] text-muted-foreground hover:border-white/15 hover:text-slate-200",
                  )}
                >
                  {option.label}
                </button>
              ))}
              <span className="ml-auto text-[10px] text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "post" : "posts"}
              </span>
            </div>

            {loading && !data ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[200px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="glass-panel flex flex-col items-center gap-2 rounded-2xl px-6 py-14 text-center">
                <span className="grid size-11 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <MessagesSquare className="size-5" />
                </span>
                <p className="font-display text-sm font-semibold text-white">
                  Nothing here yet
                </p>
                <p className="max-w-xs text-[11px] leading-relaxed text-muted-foreground">
                  {filter === "all"
                    ? "Be the first to share an update with the team."
                    : `No ${POST_TAG_META[filter].label.toLowerCase()} posts yet. Start one above.`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <Panel
              title="Hub at a glance"
              description="The workspace right now."
              action={
                <Link
                  to="/catalog"
                  className="text-[10px] font-medium text-cyan-300 hover:text-cyan-200"
                >
                  Catalog
                </Link>
              }
            >
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Posts", value: posts.length, icon: MessagesSquare },
                  { label: "Catalog", value: data?.catalog.length ?? 0, icon: LibraryBig },
                  { label: "Bookings", value: bookings.filter((b) => b.status === "confirmed").length, icon: CalendarClock },
                  { label: "On site", value: onSite ?? 0, icon: Users },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-2.5"
                  >
                    <stat.icon className="size-3.5 text-cyan-300/80" />
                    <p className="mt-2 font-display text-lg font-semibold leading-none text-white">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              title="Next on the schedule"
              description="Confirmed room bookings."
              action={
                <Link
                  to="/bookings"
                  className="text-[10px] font-medium text-cyan-300 hover:text-cyan-200"
                >
                  Book a room
                </Link>
              }
            >
              <div className="space-y-2">
                {upcoming.length === 0 && (
                  <p className="rounded-lg border border-dashed border-white/10 px-3 py-5 text-center text-[10px] text-muted-foreground">
                    No confirmed bookings ahead.
                  </p>
                )}
                {upcoming.map((booking) => (
                  <Link
                    key={booking.id}
                    to="/bookings"
                    className="flex items-start gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2 transition-colors hover:bg-white/[0.05]"
                  >
                    <CalendarClock className="mt-0.5 size-3.5 shrink-0 text-cyan-300" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10.5px] font-medium text-slate-100">
                        {booking.title}
                      </p>
                      <p className="truncate text-[9px] text-muted-foreground">
                        {formatBookingDate(booking.date)} · {booking.startTime} ·{" "}
                        {roomName(booking.roomId)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </Panel>

            <Panel
              title="Recently added"
              description="Fresh in the catalog."
            >
              <div className="space-y-2">
                {catalog.map((item) => {
                  const meta = CATEGORY_META[item.category];
                  return (
                    <Link
                      key={item.id}
                      to={`/catalog/${item.id}`}
                      className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2 transition-colors hover:bg-white/[0.05]"
                    >
                      <span
                        className="grid size-6 shrink-0 place-items-center rounded-md"
                        style={{ backgroundColor: `${meta.accent}18`, color: meta.accent }}
                      >
                        <meta.icon className="size-3" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[10.5px] text-slate-200">
                        {item.name}
                      </span>
                      <ArrowRight className="size-3 shrink-0 text-muted-foreground/60" />
                    </Link>
                  );
                })}
                {catalog.length === 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    The catalog is empty.
                  </p>
                )}
                <Link
                  to="/catalog"
                  className="mt-1 flex items-center gap-1 text-[10px] font-medium text-cyan-300 hover:text-cyan-200"
                >
                  Browse the catalog
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </Panel>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
