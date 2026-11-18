import { useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Color, DoubleSide, type Group, type MeshBasicMaterial } from "three";
import { STATUS_META } from "@/lib/office-layout";
import type { Employee, SeatSlot } from "@/types/office";

const skinTones = ["#f2c9a5", "#d8a279", "#b37c56", "#8d5b3c", "#f6d8bc", "#a86a45"];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const darken = (hex: string, factor: number) =>
  new Color(hex).multiplyScalar(factor).getStyle();

export function EmployeeCharacter({
  employee,
  seat,
  selected,
  onSelect,
}: {
  employee: Employee;
  seat: SeatSlot;
  selected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<Group>(null);
  const torsoRef = useRef<Group>(null);
  const ringMaterial = useRef<MeshBasicMaterial>(null);
  const status = STATUS_META[employee.status];

  const seed = useMemo(() => hashString(employee.id), [employee.id]);
  const skin = skinTones[seed % skinTones.length];
  const hair = seed % 3 === 0 ? "#2b1d16" : seed % 3 === 1 ? "#4a3426" : "#171b22";
  const phase = seed % 100;

  useFrame(({ clock }, delta) => {
    const step = Math.min(1, delta * 9);
    if (groupRef.current) {
      const target = selected ? 1.14 : hovered ? 1.08 : 1;
      const current = groupRef.current.scale.x;
      const next = current + (target - current) * step;
      groupRef.current.scale.setScalar(next);
    }
    if (torsoRef.current) {
      torsoRef.current.position.y =
        Math.sin(clock.elapsedTime * 1.8 + phase) * 0.012;
      torsoRef.current.rotation.z =
        Math.sin(clock.elapsedTime * 0.9 + phase) * 0.018;
    }
    if (ringMaterial.current) {
      ringMaterial.current.opacity = selected
        ? 0.6 + Math.sin(clock.elapsedTime * 3.4) * 0.25
        : hovered
          ? 0.5
          : 0.24;
    }
  });

  const setCursor = (active: boolean) => {
    document.body.style.cursor = active ? "pointer" : "auto";
  };

  return (
    <group
      ref={groupRef}
      position={[seat.x, 0, seat.z]}
      rotation-y={seat.facing}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        setCursor(false);
        onSelect();
      }}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setHovered(true);
        setCursor(true);
      }}
      onPointerOut={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setHovered(false);
        setCursor(false);
      }}
    >
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.007, 0]}>
        <ringGeometry args={[0.17, 0.22, 32]} />
        <meshBasicMaterial
          ref={ringMaterial}
          color={status.color}
          transparent
          opacity={0.24}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {selected && (
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 1.1, 20, 1, true]} />
          <meshBasicMaterial
            color={status.color}
            transparent
            opacity={0.07}
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      <group ref={torsoRef}>
        {/* hips + seated torso */}
        <mesh castShadow position={[0, 0.245, 0]}>
          <boxGeometry args={[0.23, 0.1, 0.2]} />
          <meshStandardMaterial color="#1b2a3f" roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, 0.43, 0]}>
          <capsuleGeometry args={[0.098, 0.2, 5, 12]} />
          <meshStandardMaterial color={employee.accent} roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.34, 0.09]}>
          <boxGeometry args={[0.075, 0.11, 0.02]} />
          <meshStandardMaterial color={darken(employee.accent, 0.45)} roughness={0.7} />
        </mesh>
        <mesh position={[0.045, 0.5, 0.101]}>
          <boxGeometry args={[0.04, 0.012, 0.006]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>

        {/* arms reaching towards the desk */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            castShadow
            position={[side * 0.125, 0.4, 0.07]}
            rotation-x={-0.65}
            rotation-z={side * 0.2}
          >
            <capsuleGeometry args={[0.032, 0.16, 4, 8]} />
            <meshStandardMaterial color={employee.accent} roughness={0.7} />
          </mesh>
        ))}

        {/* head */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.035, 0.04, 0.05, 10]} />
          <meshStandardMaterial color={skin} roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, 0.685, 0]}>
          <sphereGeometry args={[0.1, 20, 16]} />
          <meshStandardMaterial color={skin} roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.715, -0.012]}>
          <sphereGeometry args={[0.102, 20, 16, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
        {[-0.035, 0.035].map((x) => (
          <mesh key={x} position={[x, 0.69, 0.093]}>
            <sphereGeometry args={[0.011, 8, 8]} />
            <meshStandardMaterial color="#16202f" roughness={0.4} />
          </mesh>
        ))}
      </group>

      {(hovered || selected) && (
        <Html
          position={[0, 1.06, 0]}
          center
          zIndexRange={[30, 10]}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div className="whitespace-nowrap rounded-lg border border-cyan-300/25 bg-[#071322]/95 px-2 py-1 text-center shadow-[0_10px_30px_rgba(0,0,0,0.55)] backdrop-blur">
            <p className="text-[9px] font-semibold leading-3 text-white">
              {employee.name}
            </p>
            <p className="mt-0.5 flex items-center justify-center gap-1 text-[7px] uppercase tracking-wider text-cyan-200/80">
              <span
                className="size-1 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              {status.label}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
