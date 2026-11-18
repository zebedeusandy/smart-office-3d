import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  ArrowUpRight,
  CalendarClock,
  LibraryBig,
  Loader2,
  MessagesSquare,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/hub/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { useHubData } from "@/hooks/use-hub-data";
import { useOfficeSnapshot } from "@/hooks/use-office-data";
import { useAuth } from "@/hooks/use-auth";
import { hubService } from "@/services/hub-service";
import {
  CATALOG_CATEGORIES,
  CATEGORY_META,
  displayNameFor,
  formatBookingDate,
  formatRelative,
  POST_TAG_META,
  todayISO,
} from "@/lib/hub-utils";
import { STATUS_META } from "@/lib/office-layout";
import type { CatalogCategory } from "@/types/hub";
import { cn } from "@/lib/utils";

type AdminTab = "content" | "catalog" | "bookings" | "members";

function ConfirmButton({
  onConfirm,
  label,
  question = "Confirm?",
  icon,
}: {
  onConfirm: () => void;
  label: string;
  question?: string;
  icon?: ReactNode;
}) {
  const [armed, setArmed] = useState(false);

  if (armed) {
    return (
      <span className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            onConfirm();
            setArmed(false);
          }}
          className="rounded-md bg-rose-500/20 px-2 py-1 text-[9px] font-medium text-rose-200 transition-colors hover:bg-rose-500/30"
        >
          {question}
        </button>
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="rounded-md px-1.5 py-1 text-[9px] text-muted-foreground hover:text-white"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setArmed(true)}
      className="flex items-center gap-1 rounded-md border border-white/[0.08] px-2 py-1 text-[9px] text-muted-foreground transition-colors hover:border-rose-400/30 hover:text-rose-200"
    >
      {icon ?? <Trash2 className="size-2.5" />}
      {label}
    </button>
  );
}

export default function Admin() {
  const { data, loading } = useHubData();
  const office = useOfficeSnapshot();
  const { user } = useAuth();
  const [tab, setTab] = useState<AdminTab>("content");

  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState<CatalogCategory>("playbook");
  const [itemSummary, setItemSummary] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemTags, setItemTags] = useState("");
  const [itemFormat, setItemFormat] = useState("");
  const [savingItem, setSavingItem] = useState(false);

  const posts = data?.posts ?? [];
  const catalog = data?.catalog ?? [];
  const bookings = data?.bookings ?? [];
  const employees = office.data?.employees ?? [];
  const roomName = (roomId: string) =>
    office.data?.rooms.find((room) => room.id === roomId)?.name ?? "Unknown room";

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed",
  );

  const sortedBookings = useMemo(
    () =>
      [...bookings].sort((a, b) =>
        `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`),
      ),
    [bookings],
  );

  const tabs: { id: AdminTab; label: string; count: number; icon: typeof Users }[] = [
    { id: "content", label: "Content", count: posts.length, icon: MessagesSquare },
    { id: "catalog", label: "Catalog", count: catalog.length, icon: LibraryBig },
    { id: "bookings", label: "Bookings", count: bookings.length, icon: CalendarClock },
    { id: "members", label: "Members", count: employees.length, icon: Users },
  ];

  const handleAddItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingItem(true);
    try {
      const item = await hubService.addCatalogItem({
        name: itemName,
        category: itemCategory,
        summary: itemSummary,
        description: itemDescription,
        owner: displayNameFor(user),
        tags: itemTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        format: itemFormat,
      });
      setItemName("");
      setItemSummary("");
      setItemDescription("");
      setItemTags("");
      setItemFormat("");
      toast.success(`"${item.name}" was added to the catalog.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The item could not be added.",
      );
    } finally {
      setSavingItem(false);
    }
  };

  const handleReset = async () => {
    try {
      await hubService.resetWorkspace();
      toast.success("Workspace reset to the demo content.");
    } catch {
      toast.error("The workspace could not be reset.");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Admin"
          title="Run the hub from one place"
          description="Moderate what the team posts, maintain the catalog, keep the booking schedule honest and check who is around."
          actions={
            <ConfirmButton
              onConfirm={handleReset}
              label="Reset demo data"
              question="Reset everything?"
              icon={<RotateCcw className="size-3" />}
            />
          }
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Posts", value: posts.length, icon: MessagesSquare, accent: "#22d3ee" },
            { label: "Catalog items", value: catalog.length, icon: LibraryBig, accent: "#a78bfa" },
            { label: "Confirmed bookings", value: confirmedBookings.length, icon: CalendarClock, accent: "#34d399" },
            { label: "Team members", value: employees.length, icon: Users, accent: "#fbbf24" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-10 size-24 rounded-full opacity-15 blur-2xl"
                style={{ backgroundColor: stat.accent }}
              />
              <stat.icon className="size-4" style={{ color: stat.accent }} />
              <p className="mt-3 font-display text-[24px] font-semibold leading-none text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTab(entry.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium transition-colors",
                tab === entry.id
                  ? "border-cyan-300/35 bg-cyan-400/10 text-cyan-100"
                  : "border-white/[0.07] bg-white/[0.02] text-muted-foreground hover:text-slate-200",
              )}
            >
              <entry.icon className="size-3" />
              {entry.label}
              <span className="tabular-nums opacity-60">{entry.count}</span>
            </button>
          ))}
          <p className="ml-auto hidden items-center gap-1.5 text-[9px] text-muted-foreground sm:flex">
            <ShieldCheck className="size-3 text-emerald-300" />
            Internal prototype · every teammate has admin access
          </p>
        </div>

        {loading && !data ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-cyan-300" />
          </div>
        ) : (
          <>
            {tab === "content" && (
              <Panel
                title="Content moderation"
                description="Remove posts that are out of date or do not belong in the team feed."
              >
                <div className="space-y-2">
                  {posts.length === 0 && (
                    <p className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-[10px] text-muted-foreground">
                      No posts to moderate.
                    </p>
                  )}
                  {posts.map((post) => {
                    const tag = POST_TAG_META[post.tag];
                    return (
                      <div
                        key={post.id}
                        className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                      >
                        <span
                          className="grid size-8 shrink-0 place-items-center rounded-full text-[9px] font-bold text-[#06101f]"
                          style={{ backgroundColor: post.authorAccent }}
                        >
                          {post.authorInitials}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11.5px] font-medium text-slate-100">
                            {post.title}
                          </p>
                          <p className="mt-0.5 text-[9.5px] text-muted-foreground">
                            {post.authorName} · {formatRelative(post.createdAt)} ·{" "}
                            {post.comments.length} comments · {post.likes} likes
                          </p>
                        </div>
                        <span
                          className={cn(
                            "hidden rounded-full border px-2 py-0.5 text-[8.5px] sm:inline",
                            tag.className,
                          )}
                        >
                          {tag.label}
                        </span>
                        <Link
                          to="/feed"
                          className="text-[9px] text-muted-foreground hover:text-cyan-200"
                        >
                          View
                        </Link>
                        <ConfirmButton
                          label="Delete"
                          question="Delete post?"
                          onConfirm={async () => {
                            try {
                              await hubService.deletePost(post.id);
                              toast.success("Post removed from the feed.");
                            } catch {
                              toast.error("The post could not be removed.");
                            }
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </Panel>
            )}

            {tab === "catalog" && (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
                <Panel
                  title="Catalog items"
                  description="Everything the team can browse. Removing an item breaks existing links to it."
                >
                  <div className="space-y-1.5">
                    {catalog.map((item) => {
                      const meta = CATEGORY_META[item.category];
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                        >
                          <span
                            className="grid size-7 shrink-0 place-items-center rounded-lg"
                            style={{ backgroundColor: `${meta.accent}18`, color: meta.accent }}
                          >
                            <meta.icon className="size-3.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-medium text-slate-100">
                              {item.name}
                            </p>
                            <p className="truncate text-[9px] text-muted-foreground">
                              {meta.label} · {item.owner} · {formatRelative(item.updatedAt)}
                            </p>
                          </div>
                          <Link
                            to={`/catalog/${item.id}`}
                            className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-white/10 hover:text-cyan-200"
                            aria-label={`Open ${item.name}`}
                          >
                            <ArrowUpRight className="size-3" />
                          </Link>
                          <ConfirmButton
                            label="Remove"
                            question="Remove item?"
                            onConfirm={async () => {
                              try {
                                await hubService.deleteCatalogItem(item.id);
                                toast.success("Catalog item removed.");
                              } catch {
                                toast.error("The item could not be removed.");
                              }
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </Panel>

                <form
                  onSubmit={handleAddItem}
                  className="glass-panel h-fit rounded-2xl p-4 sm:p-5"
                >
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300">
                      <Plus className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-white">
                        Add a catalog item
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Available to everyone immediately
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    <input
                      value={itemName}
                      onChange={(event) => setItemName(event.target.value)}
                      placeholder="Resource name"
                      required
                      maxLength={90}
                      className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11.5px] text-white outline-none placeholder:text-muted-foreground/60 focus:border-cyan-300/40"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={itemCategory}
                        onChange={(event) =>
                          setItemCategory(event.target.value as CatalogCategory)
                        }
                        className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#0b1627] px-2 text-[11px] text-white outline-none focus:border-cyan-300/40"
                      >
                        {CATALOG_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {CATEGORY_META[category].label}
                          </option>
                        ))}
                      </select>
                      <input
                        value={itemFormat}
                        onChange={(event) => setItemFormat(event.target.value)}
                        placeholder="Format (PDF, Notion…)"
                        className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11px] text-white outline-none placeholder:text-muted-foreground/60 focus:border-cyan-300/40"
                      />
                    </div>
                    <input
                      value={itemSummary}
                      onChange={(event) => setItemSummary(event.target.value)}
                      placeholder="One-line summary"
                      required
                      maxLength={160}
                      className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11.5px] text-white outline-none placeholder:text-muted-foreground/60 focus:border-cyan-300/40"
                    />
                    <textarea
                      value={itemDescription}
                      onChange={(event) => setItemDescription(event.target.value)}
                      rows={3}
                      placeholder="Detail for the item page (optional)"
                      className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 text-[11px] leading-relaxed text-white outline-none placeholder:text-muted-foreground/60 focus:border-cyan-300/40"
                    />
                    <input
                      value={itemTags}
                      onChange={(event) => setItemTags(event.target.value)}
                      placeholder="Tags, comma separated"
                      className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11px] text-white outline-none placeholder:text-muted-foreground/60 focus:border-cyan-300/40"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingItem}
                    className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 text-[11px] font-semibold text-[#04101f] transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {savingItem ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Plus className="size-3.5" />
                    )}
                    Publish to catalog
                  </button>
                </form>
              </div>
            )}

            {tab === "bookings" && (
              <Panel
                title="Booking management"
                description="Cancel bookings that are no longer happening so the room frees up."
                action={
                  <Link
                    to="/bookings"
                    className="text-[10px] font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    Open booking form
                  </Link>
                }
              >
                <div className="space-y-1.5">
                  {sortedBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-wrap items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                    >
                      <span className="w-10 shrink-0 font-display text-[10px] tabular-nums text-slate-300">
                        {booking.startTime}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-slate-100">
                          {booking.title}
                        </p>
                        <p className="truncate text-[9px] text-muted-foreground">
                          {formatBookingDate(booking.date)} · {roomName(booking.roomId)} ·{" "}
                          {booking.organizer}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[8.5px] font-medium",
                          booking.status === "cancelled"
                            ? "bg-rose-400/10 text-rose-300"
                            : booking.date < todayISO()
                              ? "bg-white/[0.05] text-slate-400"
                              : "bg-emerald-400/10 text-emerald-300",
                        )}
                      >
                        {booking.status === "cancelled"
                          ? "Cancelled"
                          : booking.date < todayISO()
                            ? "Completed"
                            : "Confirmed"}
                      </span>
                      {booking.status === "confirmed" &&
                        booking.date >= todayISO() && (
                        <ConfirmButton
                          label="Cancel"
                          question="Cancel booking?"
                          onConfirm={async () => {
                            try {
                              await hubService.cancelBooking(booking.id);
                              toast.success("Booking cancelled.");
                            } catch {
                              toast.error("The booking could not be cancelled.");
                            }
                          }}
                        />
                      )}
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <p className="py-8 text-center text-[10px] text-muted-foreground">
                      No bookings yet.
                    </p>
                  )}
                </div>
              </Panel>
            )}

            {tab === "members" && (
              <Panel
                title="Team members"
                description="Open a member in the 3D floor to see where they sit today."
                action={
                  <span className="text-[9px] text-muted-foreground">
                    {employees.length} people ·{" "}
                    {new Set(employees.map((employee) => employee.department)).size}{" "}
                    departments
                  </span>
                }
              >
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {employees.map((employee) => {
                    const status = STATUS_META[employee.status];
                    return (
                      <Link
                        key={employee.id}
                        to={`/office?employee=${employee.id}`}
                        className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 transition-colors hover:border-cyan-300/25 hover:bg-white/[0.05]"
                      >
                        <span
                          className="grid size-8 shrink-0 place-items-center rounded-full text-[9px] font-bold text-[#06101f]"
                          style={{ backgroundColor: employee.accent }}
                        >
                          {employee.initials}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[10.5px] font-medium text-slate-100">
                            {employee.name}
                          </span>
                          <span className="block truncate text-[9px] text-muted-foreground">
                            {employee.role}
                          </span>
                        </span>
                        <span
                          className="size-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: status.color }}
                          title={status.label}
                        />
                      </Link>
                    );
                  })}
                </div>
              </Panel>
            )}
          </>
        )}

        <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[10px] leading-relaxed text-muted-foreground">
          Admin actions apply to the browser-local workspace used by this
          prototype. Once a shared backend is connected, the same service methods
          can be backed by live data and permission-checked per role.
        </p>
      </div>
    </AppLayout>
  );
}
