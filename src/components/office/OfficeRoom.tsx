import { useMemo, useState } from "react";
import { Html, Edges, RoundedBox } from "@react-three/drei";
import { DoubleSide } from "three";
import {
  Bench,
  Chair,
  CoffeeTable,
  FloorLamp,
  HoloProjector,
  Plant,
  ScreenWall,
  ServerRack,
  Shelf,
  Sofa,
  Whiteboard,
  shade,
} from "@/components/office/OfficeFixtures";
import { OfficeDesk } from "@/components/office/OfficeDesk";
import { EmployeeCharacter } from "@/components/office/EmployeeCharacter";
import { getSeatSlots } from "@/lib/office-layout";
import type { Employee, Room, RoomKind } from "@/types/office";

const FLOOR_COLOR: Record<RoomKind, string> = {
  workspace: "#10203a",
  management: "#161f3a",
  meeting: "#0b2638",
  reception: "#0d2230",
  server: "#091525",
  lounge: "#0f2430",
  storage: "#151c27",
};

function GlassWall({
  length,
  height,
  accent,
  position,
  rotationY = 0,
}: {
  length: number;
  height: number;
  accent: string;
  position: [number, number, number];
  rotationY?: number;
}) {
  const mullions = Math.max(2, Math.round(length / 1.5));
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[length, height, 0.035]} />
        <meshPhysicalMaterial
          color="#b9e6ff"
          transparent
          opacity={0.09}
          roughness={0.06}
          metalness={0.15}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, height + 0.015, 0]}>
        <boxGeometry args={[length, 0.028, 0.05]} />
        <meshStandardMaterial
          color="#5f8ba4"
          emissive={accent}
          emissiveIntensity={0.35}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      {Array.from({ length: mullions + 1 }).map((_, index) => {
        const x = -length / 2 + (index / mullions) * length;
        return (
          <mesh key={x} position={[x, height / 2, 0]}>
            <boxGeometry args={[0.028, height, 0.045]} />
            <meshStandardMaterial color="#43647c" metalness={0.8} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

export function OfficeRoom({
  room,
  employees,
  selected,
  selectedEmployeeId,
  selectedSeatIndex,
  showLabel,
  onSelectRoom,
  onSelectEmployee,
  onSelectDesk,
}: {
  room: Room;
  employees: Employee[];
  selected: boolean;
  selectedEmployeeId: string | null;
  selectedSeatIndex: number | null;
  showLabel: boolean;
  onSelectRoom: () => void;
  onSelectEmployee: (employeeId: string) => void;
  onSelectDesk: (roomId: string, seatIndex: number, employeeId?: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const { width, depth } = room.size;
  const seats = useMemo(() => getSeatSlots(room), [room]);
  const occupants = useMemo(
    () => employees.filter((employee) => employee.location.roomId === room.id),
    [employees, room.id],
  );
  const occupantBySeat = useMemo(() => {
    const map = new Map<number, Employee>();
    occupants.forEach((employee) => {
      if (employee.location.seatIndex !== null) {
        map.set(employee.location.seatIndex, employee);
      }
    });
    return map;
  }, [occupants]);

  const isWorkspace = room.kind === "workspace";
  const deskVariant =
    room.kind === "management"
      ? "executive"
      : room.kind === "reception"
        ? "reception"
        : "standard";

  return (
    <group
      position={[room.center.x, 0, room.center.z]}
      onClick={(event) => {
        event.stopPropagation();
        onSelectRoom();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* floor plate */}
      <mesh receiveShadow position={[0, 0.03, 0]}>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial
          color={FLOOR_COLOR[room.kind]}
          metalness={0.55}
          roughness={0.38}
        />
        <Edges
          color={selected ? room.accent : shade(room.accent, 0.7)}
          threshold={10}
        />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.083, 0]}>
        <planeGeometry args={[width - 0.32, depth - 0.32]} />
        <meshBasicMaterial
          color={room.accent}
          transparent
          opacity={selected ? 0.18 : hovered ? 0.1 : 0.045}
          depthWrite={false}
        />
      </mesh>

      {selected && (
        <>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.09, 0]}>
            <ringGeometry args={[width * 0.44, width * 0.46, 4]} />
            <meshBasicMaterial
              color={room.accent}
              transparent
              opacity={0.4}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <pointLight
            position={[0, 1.6, 0]}
            intensity={7}
            distance={6}
            decay={2}
            color={room.accent}
          />
        </>
      )}

      {/* glass shell */}
      <GlassWall
        length={width}
        height={1.28}
        accent={room.accent}
        position={[0, 0.08, -depth / 2 + 0.03]}
      />
      <GlassWall
        length={depth}
        height={1.28}
        accent={room.accent}
        position={[-width / 2 + 0.03, 0.08, 0]}
        rotationY={Math.PI / 2}
      />

      {room.kind === "storage" && (
        <>
          <GlassWall
            length={width}
            height={1.28}
            accent={room.accent}
            position={[0, 0.08, depth / 2 - 0.03]}
          />
          <GlassWall
            length={depth}
            height={1.28}
            accent={room.accent}
            position={[width / 2 - 0.03, 0.08, 0]}
            rotationY={Math.PI / 2}
          />
        </>
      )}

      {/* shared architectural details */}
      <mesh position={[0, 0.095, depth / 2 - 0.32]} receiveShadow>
        <boxGeometry args={[width - 1.4, 0.02, 0.22]} />
        <meshStandardMaterial color="#1b2f47" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* entry portal with a half-open glass door */}
      <group position={[0, 0.08, depth / 2 - 0.05]}>
        {[-0.62, 0.62].map((x) => (
          <mesh key={x} castShadow position={[x, 0.62, 0]}>
            <boxGeometry args={[0.05, 1.24, 0.07]} />
            <meshStandardMaterial color="#31536b" metalness={0.75} roughness={0.3} />
          </mesh>
        ))}
        <mesh castShadow position={[0, 1.25, 0]}>
          <boxGeometry args={[1.3, 0.05, 0.07]} />
          <meshStandardMaterial
            color="#31536b"
            emissive={room.accent}
            emissiveIntensity={0.3}
            metalness={0.75}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0.62, 0.62, 0]}>
          <boxGeometry args={[0.58, 1.16, 0.02]} />
          <meshPhysicalMaterial
            color="#b9e6ff"
            transparent
            opacity={0.13}
            roughness={0.08}
            metalness={0.15}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0.35, 0.7, -0.04]}>
          <boxGeometry args={[0.02, 0.22, 0.02]} />
          <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={0.8} />
        </mesh>
      </group>
      <Plant position={[-width / 2 + 0.55, 0.08, -depth / 2 + 0.55]} tone="#2dd4bf" />
      <Plant position={[width / 2 - 0.5, 0.08, depth / 2 - 0.5]} tone="#34d399" scale={0.9} />

      {/* room specific fit-out */}
      {isWorkspace && (
        <>
          <group position={[-width / 2 + 0.08, 0.85, 0.6]} rotation-y={Math.PI / 2}>
            <Whiteboard width={1.15} accent={room.accent} />
          </group>
          <group position={[1.35, 0.88, -depth / 2 + 0.12]}>
            <ScreenWall width={1.35} height={0.62} accent={room.accent} />
          </group>
          <mesh castShadow position={[-width / 2 + 0.42, 0.35, -depth / 2 + 1.15]}>
            <RoundedBox args={[0.72, 0.7, 0.72]} radius={0.05} smoothness={3}>
              <meshStandardMaterial color="#16263d" metalness={0.5} roughness={0.5} />
            </RoundedBox>
          </mesh>
          <mesh position={[-width / 2 + 0.42, 0.4, -depth / 2 + 1.15]}>
            <boxGeometry args={[0.06, 0.55, 0.6]} />
            <meshStandardMaterial
              color={shade(room.accent, 0.5)}
              emissive={room.accent}
              emissiveIntensity={0.18}
            />
          </mesh>
          <mesh castShadow position={[width / 2 - 0.3, 0.28, -0.6]}>
            <boxGeometry args={[0.32, 0.48, 1.2]} />
            <meshStandardMaterial color="#1a2a40" metalness={0.4} roughness={0.55} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.088, 0.15]}>
            <planeGeometry args={[2.2, 1.15]} />
            <meshStandardMaterial color={shade(room.accent, 0.4)} transparent opacity={0.12} />
          </mesh>
        </>
      )}

      {room.kind === "management" && (
        <>
          <group position={[0, 0.85, -depth / 2 + 0.12]}>
            <ScreenWall width={1.5} height={0.68} accent={room.accent} />
          </group>
          <mesh castShadow position={[-width / 2 + 0.65, 0.24, -depth / 2 + 0.5]}>
            <boxGeometry args={[0.75, 0.42, 0.32]} />
            <meshStandardMaterial color="#1d2c42" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[-width / 2 + 0.65, 0.47, -depth / 2 + 0.5]}>
            <boxGeometry args={[0.7, 0.02, 0.28]} />
            <meshStandardMaterial color="#dbe4ef" roughness={0.4} />
          </mesh>
          <CoffeeTable />
          <Plant position={[width / 2 - 0.55, 0.08, -depth / 2 + 0.6]} tone="#34d399" scale={1.15} />
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.09, 0.15]}>
            <planeGeometry args={[2.4, 1.3]} />
            <meshStandardMaterial color="#1e2a46" transparent opacity={0.5} />
          </mesh>
        </>
      )}

      {room.kind === "meeting" && (
        <>
          <RoundedBox
            args={[2.2, 0.08, 1.1]}
            radius={0.04}
            smoothness={4}
            position={[0, 0.42, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#dfe8f2" roughness={0.35} metalness={0.25} />
          </RoundedBox>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.22, 0.26, 0.3, 16]} />
            <meshStandardMaterial color="#22324a" metalness={0.65} roughness={0.3} />
          </mesh>
          <mesh position={[0.6, 0.18, 0]}>
            <cylinderGeometry args={[0.16, 0.2, 0.3, 16]} />
            <meshStandardMaterial color="#22324a" metalness={0.65} roughness={0.3} />
          </mesh>
          <mesh position={[-0.6, 0.18, 0]}>
            <cylinderGeometry args={[0.16, 0.2, 0.3, 16]} />
            <meshStandardMaterial color="#22324a" metalness={0.65} roughness={0.3} />
          </mesh>
          <HoloProjector />
          <group position={[0, 0.9, -depth / 2 + 0.12]}>
            <ScreenWall width={1.9} height={0.8} accent={room.accent} />
          </group>
          <group position={[-width / 2 + 0.1, 0.88, 0.3]} rotation-y={Math.PI / 2}>
            <Whiteboard width={1.5} accent={room.accent} />
          </group>
          {seats.map((seat) => (
            <group key={seat.id} position={[seat.x, 0.08, seat.z]} rotation-y={seat.facing}>
              <Chair accent={room.accent} />
            </group>
          ))}
          <Plant position={[width / 2 - 0.5, 0.08, -depth / 2 + 0.55]} tone="#34d399" />
          <Plant position={[-width / 2 + 0.5, 0.08, depth / 2 - 0.55]} tone="#2dd4bf" scale={0.85} />
        </>
      )}

      {room.kind === "reception" && (
        <>
          <mesh castShadow position={[0.5, 0.24, -depth / 2 + 0.42]}>
            <boxGeometry args={[2.5, 0.44, 0.42]} />
            <meshStandardMaterial color="#dbe4ef" roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh position={[0.5, 0.29, -depth / 2 + 0.635]}>
            <boxGeometry args={[2.42, 0.06, 0.01]} />
            <meshStandardMaterial
              color={room.accent}
              emissive={room.accent}
              emissiveIntensity={0.9}
            />
          </mesh>
          <group position={[0.5, 0.98, -depth / 2 + 0.16]}>
            <ScreenWall width={2.1} height={0.72} accent={room.accent} />
          </group>
          <group position={[1.1, 0.08, 1.1]} rotation-y={Math.PI}>
            <Bench accent={room.accent} />
          </group>
          <group position={[0.15, 0.08, 1.35]}>
            <CoffeeTable />
          </group>
          <group position={[width / 2 - 0.45, 0.24, -1.1]}>
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[0.45, 1.1, 0.45]} />
              <meshStandardMaterial color="#15263c" metalness={0.45} roughness={0.55} />
            </mesh>
            {[0.2, 0.5, 0.8].map((y) => (
              <mesh key={y} position={[0, y, 0.23]}>
                <boxGeometry args={[0.34, 0.03, 0.01]} />
                <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={0.7} />
              </mesh>
            ))}
          </group>
          <mesh rotation-x={-Math.PI / 2} position={[0.4, 0.09, 0.9]}>
            <planeGeometry args={[2.6, 1.4]} />
            <meshStandardMaterial color={shade(room.accent, 0.3)} transparent opacity={0.22} />
          </mesh>
        </>
      )}

      {room.kind === "server" && (
        <>
          {[-2.15, -1.35, -0.55, 0.25, 1.05, 1.85].map((x) => (
            <ServerRack key={x} position={[x, 0.08, -depth / 2 + 0.48]} />
          ))}
          <mesh position={[0, 0.1, -depth / 2 + 0.16]}>
            <boxGeometry args={[width - 0.8, 0.02, 0.08]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#22d3ee"
              emissiveIntensity={0.9}
            />
          </mesh>
          <mesh castShadow position={[width / 2 - 0.4, 0.42, 0.9]}>
            <boxGeometry args={[0.42, 0.84, 0.52]} />
            <meshStandardMaterial color="#162435" metalness={0.5} roughness={0.5} />
          </mesh>
          {[0.28, 0.45, 0.62].map((y) => (
            <mesh key={y} position={[width / 2 - 0.4, y, 0.64]}>
              <boxGeometry args={[0.3, 0.015, 0.01]} />
              <meshStandardMaterial color="#93c5fd" emissive="#60a5fa" emissiveIntensity={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 0.115, 1.6]}>
            <boxGeometry args={[width - 1.6, 0.012, 0.1]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.35} />
          </mesh>
          <pointLight position={[0, 1.2, 0]} intensity={3.4} distance={3.4} color="#22d3ee" />
        </>
      )}

      {room.kind === "lounge" && (
        <>
          <group position={[-1.225, 0.08, -1.15]} scale={2}>
            <Sofa accent={room.accent} />
          </group>
          <group position={[2.15, 0.08, 0.2]} rotation-y={-Math.PI / 2} scale={1.1}>
            <Sofa accent={room.accent} />
          </group>
          <group position={[1.4, 0.08, 1.15]} rotation-y={Math.PI} scale={1.1}>
            <Sofa accent={room.accent} />
          </group>
          <group position={[-0.35, 0.08, 0.35]}>
            <CoffeeTable />
          </group>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.09, 0.1]}>
            <planeGeometry args={[2.8, 2.2]} />
            <meshStandardMaterial color={shade(room.accent, 0.32)} transparent opacity={0.24} />
          </mesh>
          <mesh castShadow position={[-width / 2 + 0.45, 0.3, 0.9]}>
            <boxGeometry args={[0.45, 0.6, 1.9]} />
            <meshStandardMaterial color="#1c2d43" metalness={0.4} roughness={0.55} />
          </mesh>
          <mesh position={[-width / 2 + 0.45, 0.61, 0.9]}>
            <boxGeometry args={[0.5, 0.03, 1.95]} />
            <meshStandardMaterial color="#dbe4ef" roughness={0.35} />
          </mesh>
          {[-0.7, 0.15, 0.95].map((z) => (
            <group key={z} position={[-width / 2 + 0.45, 0.72, z]}>
              <mesh position={[0, 0.06, 0]}>
                <cylinderGeometry args={[0.05, 0.045, 0.1, 10]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.055, 0]}>
                <cylinderGeometry args={[0.048, 0.048, 0.005, 10]} />
                <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={0.4} />
              </mesh>
            </group>
          ))}
          <group position={[0.1, 0.9, -depth / 2 + 0.1]}>
            <ScreenWall width={1.7} height={0.72} accent={room.accent} />
          </group>
          <FloorLamp position={[width / 2 - 0.45, 0.08, -depth / 2 + 0.6]} />
          <Plant position={[-width / 2 + 0.5, 0.08, -depth / 2 + 0.55]} tone="#34d399" scale={1.15} />
        </>
      )}

      {room.kind === "storage" && (
        <>
          {[-1.8, -1.0, -0.2, 0.6, 1.4, 2.2].map((x) => (
            <Shelf
              key={x}
              position={[x, 0.08, -depth / 2 + 0.22]}
              accent={room.accent}
            />
          ))}
          {[
            [-1.5, 0.25, 0.4],
            [-0.9, 0.18, 0.9],
            [0.9, 0.3, 0.6],
            [1.7, 0.2, 1.3],
          ].map(([x, h, z]) => (
            <mesh key={`${x}-${z}`} castShadow position={[x, h, z]} rotation-y={x * 0.3}>
              <boxGeometry args={[0.44, h * 2, 0.44]} />
              <meshStandardMaterial color="#6b7d92" roughness={0.75} />
            </mesh>
          ))}
          <group position={[width / 2 - 0.35, 0.5, -0.9]}>
            <mesh castShadow>
              <boxGeometry args={[0.35, 1, 0.9]} />
              <meshStandardMaterial color="#26384e" metalness={0.55} roughness={0.4} />
            </mesh>
            {[0.2, 0.5, 0.8].map((y) => (
              <mesh key={y} position={[0.19, y - 0.5, 0]}>
                <boxGeometry args={[0.01, 0.07, 0.5]} />
                <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={0.35} />
              </mesh>
            ))}
          </group>
          <mesh position={[0, 0.115, 1.75]}>
            <boxGeometry args={[width - 1.8, 0.012, 0.08]} />
            <meshStandardMaterial color="#94a3b8" emissive="#94a3b8" emissiveIntensity={0.2} />
          </mesh>
        </>
      )}

      {/* desks for seat based rooms */}
      {(room.kind === "workspace" ||
        room.kind === "management" ||
        room.kind === "reception" ||
        room.kind === "server") &&
        seats
          .filter((seat) => room.kind !== "reception" || seat.index === 0)
          .map((seat) => {
          const occupant = occupantBySeat.get(seat.index);
          return (
            <OfficeDesk
              key={seat.id}
              seat={seat}
              accent={room.accent}
              occupied={Boolean(occupant)}
              variant={deskVariant}
              selected={
                selected && selectedSeatIndex === seat.index && !selectedEmployeeId
              }
              onSelect={() =>
                onSelectDesk(room.id, seat.index, occupant?.id)
              }
            />
          );
        })}

      {/* people */}
      {occupants.map((employee) => {
        if (employee.location.seatIndex === null) return null;
        const seat = seats[employee.location.seatIndex];
        if (!seat) return null;
        return (
          <EmployeeCharacter
            key={employee.id}
            employee={employee}
            seat={seat}
            selected={selectedEmployeeId === employee.id}
            onSelect={() => onSelectEmployee(employee.id)}
          />
        );
      })}

      {showLabel && (
        <Html
          position={[0, 1.62, 0]}
          center
          zIndexRange={[20, 5]}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-[3px] text-[9px] font-medium shadow-[0_8px_24px_rgba(2,6,23,0.6)] backdrop-blur-md transition-colors ${
              selected
                ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100"
                : "border-white/10 bg-[#081423]/85 text-slate-300"
            }`}
          >
            <span
              className="size-1 rounded-full"
              style={{ backgroundColor: room.accent }}
            />
            {room.name}
            <span className="ml-0.5 text-[8px] tabular-nums text-white/45">
              {occupants.length}/{room.capacity}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}
