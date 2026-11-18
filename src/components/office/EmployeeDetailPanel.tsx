import {
  Briefcase,
  CalendarDays,
  Crosshair,
  Mail,
  MapPin,
  MonitorSmartphone,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { STATUS_META } from "@/lib/office-layout";
import { occupantsOfRoom } from "@/services/office-service";
import type { Employee, Room } from "@/types/office";

const joinedLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export function EmployeeDetailPanel({
  employee,
  room,
  seatIndex,
  employees,
  onClose,
  onFocus,
  onSelectRoom,
}: {
  employee: Employee;
  room: Room | null;
  seatIndex: number | null;
  employees: Employee[];
  onClose: () => void;
  onFocus: () => void;
  onSelectRoom: (roomId: string) => void;
}) {
  const status = STATUS_META[employee.status];
  const onFloor = employee.presence === "in-office";
  const roomOccupancy = room
    ? occupantsOfRoom(employees, room.id).length
    : 0;

  return (
    <div className="glass-panel flex max-h-[70vh] flex-col overflow-hidden rounded-2xl">
      <div
        className="h-1 w-full shrink-0"
        style={{
          background: `linear-gradient(90deg, ${employee.accent}, transparent)`,
        }}
      />
      <div className="scrollbar-thin overflow-y-auto p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="relative grid size-12 place-items-center rounded-2xl text-sm font-bold text-[#06101f] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]"
              style={{ backgroundColor: employee.accent }}
            >
              {employee.initials}
              <span
                className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#101c2d]"
                style={{ backgroundColor: status.color }}
              />
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-display text-base font-semibold text-white">
                {employee.name}
              </h2>
              <p className="truncate text-[11px] text-muted-foreground">
                {employee.role}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close employee details"
            className="grid size-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full border px-2 py-0.5 text-[9.5px] font-medium ${status.tone}`}
          >
            {status.label}
          </span>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[9.5px] text-slate-300">
            {employee.department}
          </span>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[9.5px] text-slate-300">
            {onFloor ? "In office" : employee.presence === "remote" ? "Remote" : "Away"}
          </span>
        </div>

        <div className="mt-4 space-y-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
          <DetailRow icon={MapPin} label="Location">
            {room ? (
              <button
                type="button"
                onClick={() => onSelectRoom(room.id)}
                className="text-left text-cyan-200 underline-offset-2 hover:underline"
              >
                {room.name}
              </button>
            ) : (
              <span className="text-muted-foreground">
                {employee.presence === "remote" ? "Working remotely" : "Not on the floor"}
              </span>
            )}
          </DetailRow>
          <DetailRow icon={MonitorSmartphone} label="Desk">
            {seatIndex !== null && room ? (
              <span>
                Desk {String(seatIndex + 1).padStart(2, "0")} ·{" "}
                {room.capacity} seat space
              </span>
            ) : (
              <span className="text-muted-foreground">Unassigned</span>
            )}
          </DetailRow>
          <DetailRow icon={Briefcase} label="Current focus">
            {employee.focus}
          </DetailRow>
          <DetailRow icon={CalendarDays} label="With the team since">
            {joinedLabel(employee.joinedAt)}
          </DetailRow>
          <DetailRow icon={Mail} label="Email">
            <a
              href={`mailto:${employee.email}`}
              className="break-all text-cyan-200 underline-offset-2 hover:underline"
            >
              {employee.email}
            </a>
          </DetailRow>
        </div>

        {room && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[10px] text-muted-foreground">
            <span>Room occupancy</span>
            <span className="text-slate-200">
              {roomOccupancy} of {room.capacity} seats filled
            </span>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onFocus}
            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-400/10 text-[11px] font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15"
          >
            <Crosshair className="size-3.5" />
            {onFloor ? "Find on floor" : "Center on building"}
          </button>
          {room && (
            <button
              type="button"
              onClick={() => onSelectRoom(room.id)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:bg-white/[0.07] hover:text-white"
              aria-label={`Open ${room.name}`}
              title={`Open ${room.name}`}
            >
              <MapPin className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 text-[11px] leading-4 text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DeskDetailPanel({
  room,
  seatIndex,
  seatCount,
  employees,
  onClose,
  onFocus,
}: {
  room: Room;
  seatIndex: number;
  seatCount: number;
  employees: Employee[];
  onClose: () => void;
  onFocus: () => void;
}) {
  const occupants = occupantsOfRoom(employees, room.id);
  return (
    <div className="glass-panel flex flex-col overflow-hidden rounded-2xl">
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${room.accent}, transparent)`,
        }}
      />
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
              Available desk
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold text-white">
              Desk {String(seatIndex + 1).padStart(2, "0")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close desk details"
            className="grid size-7 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
          This seat in {room.name} is free right now. {occupants.length} people
          are checked in to the room.
        </p>

        <div className="mt-3 space-y-2 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="text-muted-foreground">Room</span>
            <span className="text-slate-200">{room.name}</span>
          </div>
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="text-muted-foreground">Seat</span>
            <span className="text-slate-200">
              {seatIndex + 1} of {seatCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="text-muted-foreground">Setup</span>
            <span className="text-slate-200">Monitor · Dock · Chair</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onFocus}
          className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-400/10 text-[11px] font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15"
        >
          <Crosshair className="size-3.5" />
          Center on this desk
        </button>
      </div>
    </div>
  );
}
