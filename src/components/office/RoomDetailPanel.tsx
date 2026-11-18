import { Crosshair, MapPin, Users, X } from "lucide-react";
import { occupantsOfRoom, roomKindLabel } from "@/services/office-service";
import { roomStatus, STATUS_META } from "@/lib/office-layout";
import type { Employee, Room } from "@/types/office";

export function RoomDetailPanel({
  room,
  employees,
  onClose,
  onSelectEmployee,
  onFocus,
}: {
  room: Room;
  employees: Employee[];
  onClose: () => void;
  onSelectEmployee: (employeeId: string) => void;
  onFocus: () => void;
}) {
  const occupants = occupantsOfRoom(employees, room.id);
  const status = roomStatus(room, occupants);
  const utilisation = Math.min(
    100,
    Math.round((occupants.length / room.capacity) * 100),
  );

  return (
    <div className="glass-panel flex max-h-[70vh] flex-col overflow-hidden rounded-2xl">
      <div
        className="h-1 w-full shrink-0"
        style={{
          background: `linear-gradient(90deg, ${room.accent}, transparent)`,
        }}
      />
      <div className="scrollbar-thin overflow-y-auto p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
              {roomKindLabel(room.kind)}
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold leading-tight text-white">
              {room.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close room details"
            className="grid size-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <p className="mt-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
          {room.description}
        </p>

        <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Users className="size-3.5 text-cyan-300" />
              {occupants.length} / {room.capacity} seats
            </span>
            <span className={status.tone}>{status.label}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{
                width: `${utilisation}%`,
                backgroundColor: room.accent,
                boxShadow: `0 0 12px ${room.accent}88`,
              }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {occupants.slice(0, 5).map((employee) => (
                <span
                  key={employee.id}
                  title={employee.name}
                  className="grid size-6 place-items-center rounded-full border-2 border-[#101b2c] text-[8px] font-bold text-[#06101f]"
                  style={{ backgroundColor: employee.accent }}
                >
                  {employee.initials}
                </span>
              ))}
              {occupants.length === 0 && (
                <span className="text-[10px] text-muted-foreground">Nobody here right now</span>
              )}
            </div>
            {occupants.length > 5 && (
              <span className="text-[10px] text-muted-foreground">
                +{occupants.length - 5}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            In this room
          </p>
          <div className="mt-2 space-y-1.5">
            {occupants.length === 0 && (
              <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-[10px] text-muted-foreground">
                This space is available.
              </p>
            )}
            {occupants.map((employee) => {
              const employeeStatus = STATUS_META[employee.status];
              return (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => onSelectEmployee(employee.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2 text-left transition-colors hover:border-cyan-300/25 hover:bg-white/[0.05]"
                >
                  <span
                    className="grid size-7 shrink-0 place-items-center rounded-full text-[9px] font-bold text-[#06101f]"
                    style={{ backgroundColor: employee.accent }}
                  >
                    {employee.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-medium text-slate-100">
                      {employee.name}
                    </span>
                    <span className="block truncate text-[9.5px] text-muted-foreground">
                      {employee.role}
                    </span>
                  </span>
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: employeeStatus.color }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Amenities
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {room.amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[9.5px] text-slate-300"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/[0.06] px-2.5 py-2 text-[9.5px] text-muted-foreground">
          <MapPin className="size-3 text-cyan-300/80" />
          Wing {Math.abs(room.center.x) < 1 ? "C" : room.center.x < 0 ? "A" : "B"} · Level 04
        </div>

        <button
          type="button"
          onClick={onFocus}
          className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-400/10 text-[11px] font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15"
        >
          <Crosshair className="size-3.5" />
          Center on this room
        </button>
      </div>
    </div>
  );
}
