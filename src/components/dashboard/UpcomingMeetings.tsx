import { Link } from "react-router";
import { ArrowUpRight, CalendarClock, MapPin, Video } from "lucide-react";
import type { Meeting, Room } from "@/types/office";
import { cn } from "@/lib/utils";

export function UpcomingMeetings({
  meetings,
  rooms,
}: {
  meetings: Meeting[];
  rooms: Room[];
}) {
  const roomName = (roomId: string) =>
    rooms.find((room) => room.id === roomId)?.name ?? "Unassigned";

  return (
    <div className="scrollbar-thin -mr-1 max-h-[286px] space-y-1.5 overflow-y-auto pr-1">
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className={cn(
            "group rounded-xl border px-3 py-2.5 transition-colors",
            meeting.status === "live"
              ? "border-cyan-300/25 bg-cyan-400/[0.07]"
              : meeting.status === "done"
                ? "border-white/[0.05] bg-white/[0.015] opacity-60"
                : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]",
          )}
        >
          <div className="flex items-start gap-2.5">
            <div className="w-11 shrink-0">
              <p className="font-display text-[11px] font-semibold tabular-nums text-slate-100">
                {meeting.start}
              </p>
              <p className="text-[9px] tabular-nums text-muted-foreground">
                {meeting.end}
              </p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] font-medium leading-4 text-slate-100">
                {meeting.title}
              </p>
              <p className="mt-1 flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                <MapPin className="size-2.5 shrink-0" />
                {roomName(meeting.roomId)}
                <span className="mx-0.5 text-white/20">·</span>
                <span className="truncate">{meeting.organizer}</span>
              </p>
            </div>
            {meeting.status === "live" ? (
              <span className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-emerald-300">
                <span className="size-1 rounded-full bg-emerald-400 pulse-dot" />
                Live
              </span>
            ) : meeting.status === "upcoming" ? (
              <Link
                to={`/office?room=${meeting.roomId}`}
                aria-label={`View ${roomName(meeting.roomId)} in the 3D office`}
                className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-cyan-200"
              >
                <ArrowUpRight className="size-3.5" />
              </Link>
            ) : (
              <Video className="mt-1 size-3.5 shrink-0 text-muted-foreground/60" />
            )}
          </div>
        </div>
      ))}
      {meetings.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <CalendarClock className="size-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">No meetings scheduled.</p>
        </div>
      )}
    </div>
  );
}
