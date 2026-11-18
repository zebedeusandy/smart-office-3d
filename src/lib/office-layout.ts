import type { Employee, EmployeeStatus, Room, SeatSlot } from "@/types/office";

/**
 * Seat slots are derived from each room's kind and size. Desks, chairs and the
 * 3D employee characters all read from this single source, so seat indices in
 * the data layer always line up with the visual floor.
 */
export function getSeatSlots(room: Room): SeatSlot[] {
  const { width, depth } = room.size;
  const slots: SeatSlot[] = [];

  const add = (x: number, z: number, facing: number) => {
    slots.push({
      index: slots.length,
      id: `${room.id}-seat-${slots.length}`,
      x,
      z,
      facing,
    });
  };

  switch (room.kind) {
    case "workspace": {
      const columns = [-1.45, 1.45];
      const rows = [
        { z: -depth / 2 + 1.05, facing: 0 },
        { z: depth / 2 - 1.05, facing: Math.PI },
      ];
      rows.forEach((row) =>
        columns.forEach((x) => add(x, row.z, row.facing)),
      );
      break;
    }
    case "management":
      add(-1.5, -depth / 2 + 1.2, 0);
      add(1.5, -depth / 2 + 1.2, 0);
      break;
    case "meeting": {
      const seats = 8;
      const radiusX = 1.55;
      const radiusZ = 1.2;
      for (let i = 0; i < seats; i += 1) {
        const angle = (i / seats) * Math.PI * 2;
        const x = Math.sin(angle) * radiusX;
        const z = Math.cos(angle) * radiusZ;
        add(x, z, Math.atan2(-x, -z));
      }
      break;
    }
    case "reception":
      add(-1.4, -0.7, 0);
      add(1.1, 1.1, Math.PI);
      break;
    case "server":
      add(-0.6, 1.15, Math.PI);
      add(1.4, 1.15, Math.PI);
      break;
    case "lounge":
      add(-1.8, -1.15, 0);
      add(-0.65, -1.15, 0);
      add(2.0, 0.2, -Math.PI / 2);
      add(1.4, 1.15, Math.PI);
      break;
    case "storage":
      break;
    default:
      break;
  }

  return slots;
}

export function getEmployeeSeat(
  employee: Employee,
  rooms: Room[],
): { room: Room; slot: SeatSlot } | null {
  if (!employee.location.roomId || employee.location.seatIndex === null) {
    return null;
  }
  const room = rooms.find((item) => item.id === employee.location.roomId);
  if (!room) return null;
  const slot = getSeatSlots(room)[employee.location.seatIndex];
  if (!slot) return null;
  return { room, slot };
}

export const STATUS_META: Record<
  EmployeeStatus,
  { label: string; color: string; tone: string }
> = {
  present: {
    label: "Present",
    color: "#34d399",
    tone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  },
  focus: {
    label: "Deep focus",
    color: "#22d3ee",
    tone: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
  },
  meeting: {
    label: "In a meeting",
    color: "#a78bfa",
    tone: "border-violet-400/25 bg-violet-400/10 text-violet-200",
  },
  break: {
    label: "On break",
    color: "#fbbf24",
    tone: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  },
  remote: {
    label: "Remote",
    color: "#60a5fa",
    tone: "border-blue-400/25 bg-blue-400/10 text-blue-200",
  },
  absent: {
    label: "Absent",
    color: "#94a3b8",
    tone: "border-white/10 bg-white/5 text-muted-foreground",
  },
};

export const roomStatus = (
  room: Room,
  occupants: Employee[],
): { label: string; tone: string } => {
  const free = Math.max(0, room.capacity - occupants.length);
  if (occupants.length === 0) {
    return { label: "Available", tone: "text-emerald-300" };
  }
  if (free === 0) {
    return { label: "At capacity", tone: "text-amber-300" };
  }
  return {
    label: `${free} ${free === 1 ? "seat" : "seats"} free`,
    tone: "text-cyan-300",
  };
};
