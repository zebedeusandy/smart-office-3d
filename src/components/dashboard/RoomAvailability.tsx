import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { occupantsOfRoom, roomKindLabel } from "@/services/office-service";
import { roomStatus } from "@/lib/office-layout";
import type { Employee, Room } from "@/types/office";

export function RoomAvailability({
  rooms,
  employees,
}: {
  rooms: Room[];
  employees: Employee[];
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {rooms.map((room) => {
        const occupants = occupantsOfRoom(employees, room.id);
        const status = roomStatus(room, occupants);
        const utilisation = Math.min(
          100,
          Math.round((occupants.length / room.capacity) * 100),
        );

        return (
          <Link
            key={room.id}
            to={`/office?room=${room.id}`}
            className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 transition-all hover:border-cyan-300/25 hover:bg-white/[0.05]"
          >
            <span
              className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 text-[10px] font-semibold"
              style={{
                backgroundColor: `${room.accent}14`,
                color: room.accent,
                borderColor: `${room.accent}33`,
              }}
            >
              {occupants.length}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-[11px] font-medium text-slate-100">
                  {room.name}
                </span>
                <span className="shrink-0 text-[9px] uppercase tracking-wider text-muted-foreground">
                  {roomKindLabel(room.kind)}
                </span>
              </span>
              <span className="mt-1 flex items-center gap-2">
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className="block h-full rounded-full transition-[width] duration-700"
                    style={{
                      width: `${utilisation}%`,
                      backgroundColor: room.accent,
                      boxShadow: `0 0 8px ${room.accent}88`,
                    }}
                  />
                </span>
                <span className={`shrink-0 text-[9px] ${status.tone}`}>
                  {status.label}
                </span>
              </span>
            </span>
            <ArrowUpRight className="size-3 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-cyan-200" />
          </Link>
        );
      })}
    </div>
  );
}
