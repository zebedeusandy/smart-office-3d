import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  CalendarClock,
  DoorOpen,
  ListChecks,
  RefreshCw,
  TriangleAlert,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/dashboard/Panel";
import {
  StatisticsCard,
  type StatisticsCardProps,
} from "@/components/dashboard/StatisticsCard";
import { AttendanceChart, WeeklyActivityChart } from "@/components/dashboard/Charts";
import { DepartmentStats } from "@/components/dashboard/DepartmentStats";
import { ActivityFeed, ActivityFooter } from "@/components/dashboard/ActivityFeed";
import { UpcomingMeetings } from "@/components/dashboard/UpcomingMeetings";
import { RoomAvailability } from "@/components/dashboard/RoomAvailability";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { useDashboardData, useOfficeSnapshot } from "@/hooks/use-office-data";
import type { AppNotification } from "@/types/office";

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[136px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-[320px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025] lg:col-span-2" />
        <div className="h-[320px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[280px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]"
          />
        ))}
      </div>
    </div>
  );
}

export function DashboardView() {
  const { data, loading, error, reload } = useDashboardData();
  const office = useOfficeSnapshot();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (data) setNotifications(data.notifications);
  }, [data]);

  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  const cards = useMemo<StatisticsCardProps[]>(() => {
    if (!data) return [];
    const { stats, departments, attendance, meetings, weeklyActivity } = data;
    const latest = attendance[attendance.length - 3];
    const previous = attendance[attendance.length - 4];
    const delta = latest && previous ? latest.present - previous.present : 0;
    const liveMeetings = meetings.filter((meeting) => meeting.status === "live").length;

    return [
      {
        label: "Total employees",
        value: String(stats.totalEmployees),
        hint: `Across ${departments.length} departments`,
        icon: Users,
        accent: "#60a5fa",
        spark: weeklyActivity.map((day) => day.meetings + day.focusHours / 10),
      },
      {
        label: "Present today",
        value: String(stats.presentToday),
        hint: `${Math.round((stats.presentToday / stats.totalEmployees) * 100)}% of the company on site`,
        icon: UserCheck,
        accent: "#22d3ee",
        trend: latest ? `${delta >= 0 ? "+" : ""}${delta} vs ${previous?.day ?? latest.day}` : undefined,
        trendDirection: delta >= 0 ? "up" : "down",
        spark: attendance.map((day) => day.present),
        progress: Math.round((stats.presentToday / stats.totalEmployees) * 100),
      },
      {
        label: "Absent today",
        value: String(stats.absentToday),
        hint: `${stats.remoteToday} working remotely`,
        icon: UserX,
        accent: "#f472b6",
        trendDirection: "flat",
        spark: attendance.map((day) => day.remote),
      },
      {
        label: "Active tasks",
        value: String(stats.activeTasks),
        hint: "In progress across all teams",
        icon: ListChecks,
        accent: "#a78bfa",
        spark: weeklyActivity.map((day) => day.focusHours),
      },
      {
        label: "Available rooms",
        value: String(stats.availableRooms),
        hint: `of ${stats.totalRooms} rooms have free seats`,
        icon: DoorOpen,
        accent: "#34d399",
        progress: Math.round((stats.availableRooms / stats.totalRooms) * 100),
        spark: [4, 5, 3, 6, 4, 5, stats.availableRooms],
      },
      {
        label: "Meetings today",
        value: String(stats.meetingsToday),
        hint: liveMeetings > 0 ? `${liveMeetings} live right now` : "No live sessions",
        icon: CalendarClock,
        accent: "#fbbf24",
        spark: weeklyActivity.map((day) => day.meetings),
      },
    ];
  }, [data]);

  const unread = notifications.filter((item) => !item.read).length;

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-300/80">
            <span className="size-1.5 rounded-full bg-cyan-300 pulse-dot" />
            {dateLabel} · Nexus HQ
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-white sm:text-[30px]">
            Office command center
          </h1>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
            Live presence, room availability and team load across the floor —
            refreshed from the office service.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={reload}
            disabled={loading}
            className="gap-2 border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            asChild
            size="sm"
            className="gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-[#04101f] shadow-[0_14px_32px_-16px_rgba(34,211,238,0.9)] hover:opacity-90"
          >
            <Link to="/office">
              <Boxes className="size-3.5" />
              Live 3D office
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </motion.div>

      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-rose-300" />
            <div>
              <p className="text-sm font-medium text-rose-100">
                Could not load the office snapshot
              </p>
              <p className="mt-0.5 text-[11px] text-rose-200/70">{error}</p>
            </div>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={reload}>
            Try again
          </Button>
        </div>
      )}

      {!data && loading ? (
        <DashboardSkeleton />
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {cards.map((card, index) => (
              <StatisticsCard key={card.label} {...card} index={index} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel
              title="Employee attendance"
              description="On-site and remote presence over the last seven days."
              className="lg:col-span-2"
              action={
                <div className="flex items-center gap-3">
                  <LegendChip color="#22d3ee" label="On site" />
                  <LegendChip color="#6366f1" label="Remote" />
                </div>
              }
            >
              <AttendanceChart data={data.attendance} />
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                    Average on site
                  </p>
                  <p className="mt-0.5 font-display text-sm font-semibold text-white">
                    {Math.round(
                      data.attendance.reduce((total, day) => total + day.present, 0) /
                        data.attendance.length,
                    )}{" "}
                    <span className="text-[10px] font-normal text-muted-foreground">people</span>
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                    Peak day
                  </p>
                  <p className="mt-0.5 font-display text-sm font-semibold text-white">
                    {data.attendance.reduce((best, day) =>
                      day.present > best.present ? day : best,
                    ).day}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                    Seats used
                  </p>
                  <p className="mt-0.5 font-display text-sm font-semibold text-white">
                    {data.stats.occupancyRate}%
                  </p>
                </div>
              </div>
            </Panel>

            <Panel
              title="Departments"
              description="Headcount and desk utilisation by team."
            >
              <DepartmentStats
                departments={data.departments}
                stats={data.stats}
              />
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel
              title="Weekly activity"
              description="Focus and meeting hours logged by the floor."
              action={
                <div className="hidden flex-col items-end gap-1 sm:flex">
                  <LegendChip color="#38bdf8" label="Focus" />
                  <LegendChip color="#a78bfa" label="Meetings" />
                </div>
              }
            >
              <WeeklyActivityChart data={data.weeklyActivity} />
            </Panel>

            <Panel
              title="Meetings today"
              description="Rooms booked across the building."
              action={
                <Link
                  to="/office"
                  className="text-[10px] font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  View floor
                </Link>
              }
            >
              <UpcomingMeetings
                meetings={data.meetings}
                rooms={office.data?.rooms ?? []}
              />
            </Panel>

            <Panel
              title="Recent activity"
              description="What changed on the floor today."
            >
              <ActivityFeed items={data.recentActivity} />
              <ActivityFooter total={data.recentActivity.length * 4} />
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel
              title="Notifications"
              description="Floor alerts and approvals."
              action={
                unread > 0 ? (
                  <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-200">
                    {unread} new
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">All read</span>
                )
              }
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
            </Panel>

            <Panel
              title="Room availability"
              description="Tap a space to open it in the 3D office."
              className="lg:col-span-2"
              action={
                <Link
                  to="/office"
                  className="flex items-center gap-1 text-[10px] font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  Open floor
                  <ArrowRight className="size-3" />
                </Link>
              }
            >
              <RoomAvailability
                rooms={office.data?.rooms ?? []}
                employees={office.data?.employees ?? []}
              />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
