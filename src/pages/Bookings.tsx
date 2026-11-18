import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowUpRight,
  Boxes,
  CalendarClock,
  CalendarPlus,
  Clock,
  DoorOpen,
  Loader2,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/hub/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { useHubData } from "@/hooks/use-hub-data";
import { useOfficeSnapshot } from "@/hooks/use-office-data";
import { useAuth } from "@/hooks/use-auth";
import { hubService } from "@/services/hub-service";
import { displayNameFor, formatBookingDate, todayISO } from "@/lib/hub-utils";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/hub";

export default function Bookings() {
  const { data } = useHubData();
  const office = useOfficeSnapshot();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const rooms = useMemo(
    () =>
      (office.data?.rooms ?? []).filter(
        (room) => room.bookable || room.kind === "management",
      ),
    [office.data?.rooms],
  );

  const [title, setTitle] = useState(searchParams.get("title") ?? "");
  const [note, setNote] = useState(searchParams.get("note") ?? "");
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [attendees, setAttendees] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const selectedRoom = rooms.find((room) => room.id === roomId) ?? rooms[0];

  const roomName = (id: string) =>
    office.data?.rooms.find((room) => room.id === id)?.name ?? "Unassigned room";

  const bookings = data?.bookings ?? [];
  const confirmedUpcoming = bookings.filter(
    (booking) => booking.status === "confirmed" && booking.date >= todayISO(),
  );
  const inactive = bookings.filter(
    (booking) => booking.status === "cancelled" || booking.date < todayISO(),
  );

  const nowTime = new Date().toTimeString().slice(0, 5);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await hubService.createBooking({
        title,
        roomId: selectedRoom?.id ?? "",
        date,
        startTime,
        endTime,
        attendees,
        note,
        organizer: displayNameFor(user),
      });
      toast.success("Room booked. It is on the team schedule.");
      setTitle("");
      setNote("");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "The booking could not be created.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (booking: Booking) => {
    try {
      await hubService.cancelBooking(booking.id);
      setConfirmCancel(null);
      toast.success("Booking cancelled.");
    } catch (cancelError) {
      toast.error(
        cancelError instanceof Error
          ? cancelError.message
          : "The booking could not be cancelled.",
      );
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Bookings"
          title="Book a room or a block of time"
          description="Reserve a space for a meeting, a walkthrough or focused work. Overlapping bookings are rejected before they reach the schedule."
          actions={
            <Link
              to="/office"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[11px] font-medium text-slate-200 transition-colors hover:border-cyan-300/30 hover:bg-white/[0.06]"
            >
              <Boxes className="size-3.5 text-cyan-300" />
              See rooms in 3D
            </Link>
          }
        />

        <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
          <form
            onSubmit={handleSubmit}
            className="glass-panel h-fit rounded-2xl p-4 sm:p-5"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300">
                <CalendarPlus className="size-4" />
              </span>
              <div>
                <p className="text-[12px] font-semibold text-white">New booking</p>
                <p className="text-[10px] text-muted-foreground">
                  Confirmed immediately
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  What is it for?
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Weekly planning, client walkthrough…"
                  required
                  maxLength={100}
                  className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-[12px] text-white outline-none placeholder:text-muted-foreground/60 focus:border-cyan-300/40"
                />
              </label>

              <label className="block">
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Room
                </span>
                <select
                  value={roomId || rooms[0]?.id || ""}
                  onChange={(event) => setRoomId(event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.08] bg-[#0b1627] px-3 text-[12px] text-white outline-none focus:border-cyan-300/40"
                >
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} · {room.capacity} seats
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Date
                  </span>
                  <input
                    type="date"
                    value={date}
                    min={todayISO()}
                    onChange={(event) => setDate(event.target.value)}
                    required
                    className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11.5px] text-white outline-none [color-scheme:dark] focus:border-cyan-300/40"
                  />
                </label>
                <label className="block">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Attendees
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={selectedRoom?.capacity ?? 20}
                    value={attendees}
                    onChange={(event) => setAttendees(Number(event.target.value))}
                    className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-[12px] text-white outline-none focus:border-cyan-300/40"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    From
                  </span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    required
                    className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11.5px] text-white outline-none [color-scheme:dark] focus:border-cyan-300/40"
                  />
                </label>
                <label className="block">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    To
                  </span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    required
                    className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11.5px] text-white outline-none [color-scheme:dark] focus:border-cyan-300/40"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Note for the room display
                </span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={2}
                  maxLength={240}
                  placeholder="Optional context, guests or preparation…"
                  className="mt-1.5 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11.5px] leading-relaxed text-white outline-none placeholder:text-muted-foreground/60 focus:border-cyan-300/40"
                />
              </label>
            </div>

            {error && (
              <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-[10.5px] leading-relaxed text-rose-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !title.trim() || !selectedRoom}
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 text-[11.5px] font-semibold text-[#04101f] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Checking the schedule
                </>
              ) : (
                <>
                  <CalendarPlus className="size-4" />
                  Confirm booking
                </>
              )}
            </button>

            {selectedRoom && (
              <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-medium text-slate-200">
                  <DoorOpen className="size-3.5 text-cyan-300" />
                  {selectedRoom.name}
                </p>
                <p className="mt-1 text-[9.5px] leading-relaxed text-muted-foreground">
                  {selectedRoom.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="flex items-center gap-1 rounded-full border border-white/[0.07] px-1.5 py-0.5 text-[8.5px] text-slate-400">
                    <Users className="size-2.5" />
                    {selectedRoom.capacity} seats
                  </span>
                  <span className="flex items-center gap-1 rounded-full border border-white/[0.07] px-1.5 py-0.5 text-[8.5px] text-slate-400">
                    <MapPin className="size-2.5" />
                    Level 04
                  </span>
                </div>
              </div>
            )}
          </form>

          <div className="space-y-4">
            <Panel
              title="Confirmed schedule"
              description="Upcoming bookings across every bookable room."
              action={
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2 py-0.5 text-[9px] font-medium text-emerald-300">
                  {confirmedUpcoming.length} upcoming
                </span>
              }
            >
              {confirmedUpcoming.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
                  <CalendarClock className="size-5 text-muted-foreground" />
                  <p className="text-[11px] text-muted-foreground">
                    The schedule is clear. Create the first booking.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {confirmedUpcoming.map((booking) => {
                    const isToday = booking.date === todayISO();
                    const isNow =
                      isToday &&
                      booking.startTime <= nowTime &&
                      booking.endTime > nowTime;
                    return (
                      <div
                        key={booking.id}
                        className={cn(
                          "rounded-xl border px-3 py-2.5",
                          isNow
                            ? "border-cyan-300/25 bg-cyan-400/[0.06]"
                            : "border-white/[0.06] bg-white/[0.02]",
                        )}
                      >
                        <div className="flex flex-wrap items-start gap-3">
                          <div className="w-14 shrink-0">
                            <p className="font-display text-[11px] font-semibold tabular-nums text-slate-100">
                              {booking.startTime}
                            </p>
                            <p className="text-[9px] tabular-nums text-muted-foreground">
                              {booking.endTime}
                            </p>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-[11.5px] font-medium text-slate-100">
                                {booking.title}
                              </p>
                              {isNow && (
                                <span className="flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-emerald-300">
                                  <span className="size-1 rounded-full bg-emerald-400 pulse-dot" />
                                  In progress
                                </span>
                              )}
                            </div>
                            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[9.5px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarClock className="size-2.5" />
                                {formatBookingDate(booking.date)}
                              </span>
                              <span className="text-white/20">·</span>
                              <span className="flex items-center gap-1">
                                <DoorOpen className="size-2.5" />
                                {roomName(booking.roomId)}
                              </span>
                              <span className="text-white/20">·</span>
                              <span className="flex items-center gap-1">
                                <Users className="size-2.5" />
                                {booking.attendees}
                              </span>
                            </p>
                            {booking.note && (
                              <p className="mt-1 line-clamp-1 text-[9.5px] italic text-muted-foreground/80">
                                {booking.note}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <span className="hidden text-[9px] text-muted-foreground sm:inline">
                              {booking.organizer}
                            </span>
                            {confirmCancel === booking.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleCancel(booking)}
                                  className="rounded-md bg-rose-500/20 px-2 py-1 text-[9px] font-medium text-rose-200 hover:bg-rose-500/30"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmCancel(null)}
                                  className="rounded-md px-1.5 py-1 text-[9px] text-muted-foreground hover:text-white"
                                  aria-label="Keep booking"
                                >
                                  <X className="size-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmCancel(booking.id)}
                                className="rounded-md border border-white/[0.08] px-2 py-1 text-[9px] text-muted-foreground transition-colors hover:border-rose-400/30 hover:text-rose-200"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            <Panel
              title="Room availability today"
              description="Spaces you can book right now."
              action={
                <Link
                  to="/office"
                  className="flex items-center gap-1 text-[10px] font-medium text-cyan-300 hover:text-cyan-200"
                >
                  Inspect
                  <ArrowUpRight className="size-3" />
                </Link>
              }
            >
              <div className="grid gap-2 sm:grid-cols-3">
                {rooms.map((room) => {
                  const roomBookings = confirmedUpcoming.filter(
                    (booking) =>
                      booking.roomId === room.id && booking.date === todayISO(),
                  );
                  const active = roomBookings.find(
                    (booking) =>
                      booking.startTime <= nowTime && booking.endTime > nowTime,
                  );
                  return (
                    <div
                      key={room.id}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5"
                    >
                      <p className="flex items-center gap-1.5 text-[10px] font-medium text-slate-200">
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: room.accent }}
                        />
                        {room.name}
                      </p>
                      <p className="mt-1 text-[9px] text-muted-foreground">
                        {roomBookings.length === 0
                          ? "Free all day"
                          : `${roomBookings.length} booking${roomBookings.length === 1 ? "" : "s"} today`}
                      </p>
                      <p
                        className={cn(
                          "mt-2 flex items-center gap-1 text-[8.5px]",
                          active ? "text-amber-300" : "text-emerald-300",
                        )}
                      >
                        <Clock className="size-2.5" />
                        {active
                          ? `In use until ${active.endTime}`
                          : "Available now"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel
              title="Past and cancelled"
              description="A record of earlier room activity."
            >
              {inactive.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-[10px] text-muted-foreground">
                  Nothing archived yet.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {inactive.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.015] px-2.5 py-2 text-[9.5px] text-muted-foreground"
                    >
                      <span className="w-14 shrink-0 tabular-nums">
                        {booking.startTime}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-slate-300">
                        {booking.title}
                      </span>
                      <span className="hidden sm:inline">{formatBookingDate(booking.date)}</span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[8px] font-medium",
                          booking.status === "cancelled"
                            ? "bg-rose-400/10 text-rose-300"
                            : "bg-white/[0.05] text-slate-400",
                        )}
                      >
                        {booking.status === "cancelled" ? "Cancelled" : "Completed"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
