import { useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { DoubleSide, type Group, type MeshBasicMaterial } from "three";
import { Chair, shade } from "@/components/office/OfficeFixtures";
import type { SeatSlot } from "@/types/office";

export function DeskBody({
  variant = "standard",
  accent,
  occupied,
}: {
  variant?: "standard" | "executive" | "reception";
  accent: string;
  occupied: boolean;
}) {
  const executive = variant === "executive";
  const wide = executive ? 1.12 : variant === "reception" ? 0.98 : 0.9;
  const deep = executive ? 0.62 : 0.56;

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.33, 0]}>
        <boxGeometry args={[wide, 0.045, deep]} />
        <meshStandardMaterial color="#dbe4ef" roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.352, 0]}>
        <boxGeometry args={[wide - 0.04, 0.004, deep - 0.04]} />
        <meshStandardMaterial color="#eef4fb" roughness={0.3} metalness={0.15} />
      </mesh>
      {[-wide / 2 + 0.07, wide / 2 - 0.07].map((x) => (
        <mesh key={x} castShadow position={[x, 0.17, 0]}>
          <boxGeometry args={[0.035, 0.32, deep - 0.08]} />
          <meshStandardMaterial
            color={executive ? "#22324a" : "#2b3c53"}
            metalness={0.65}
            roughness={0.35}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.18, -deep / 2 + 0.14]}>
        <boxGeometry args={[wide - 0.22, 0.2, 0.025]} />
        <meshStandardMaterial color="#1c2c42" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, -deep / 2 + 0.015]}>
        <boxGeometry args={[wide - 0.3, 0.018, 0.012]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={occupied ? 1.1 : 0.45}
        />
      </mesh>

      {/* Monitor, screen faces the seated person (towards -Z of the desk). */}
      <group position={[executive ? -0.24 : 0, 0.355, 0.13]}>
        <mesh castShadow position={[0, 0.13, 0.02]}>
          <boxGeometry args={[executive ? 0.6 : 0.5, 0.28, 0.022]} />
          <meshStandardMaterial color="#08111d" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.13, 0.005]} rotation-y={Math.PI}>
          <planeGeometry args={[executive ? 0.56 : 0.46, 0.24]} />
          <meshStandardMaterial
            color="#0b2237"
            emissive="#38bdf8"
            emissiveIntensity={occupied ? 0.75 : 0.18}
            roughness={0.25}
          />
        </mesh>
        {occupied && (
          <mesh position={[0, 0.16, 0.002]} rotation-y={Math.PI}>
            <planeGeometry args={[executive ? 0.34 : 0.26, 0.025]} />
            <meshBasicMaterial color={accent} transparent opacity={0.8} />
          </mesh>
        )}
        <mesh position={[0, 0.03, 0.06]}>
          <boxGeometry args={[0.05, 0.16, 0.03]} />
          <meshStandardMaterial color="#26374f" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.01, 0.055]}>
          <boxGeometry args={[0.2, 0.02, 0.13]} />
          <meshStandardMaterial color="#26374f" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {executive && (
        <group position={[0.3, 0.355, 0.13]}>
          <mesh castShadow position={[0, 0.12, 0.018]}>
            <boxGeometry args={[0.4, 0.25, 0.02]} />
            <meshStandardMaterial color="#08111d" metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.12, 0.005]} rotation-y={Math.PI}>
            <planeGeometry args={[0.36, 0.21]} />
            <meshStandardMaterial
              color="#0b2237"
              emissive="#22d3ee"
              emissiveIntensity={occupied ? 0.6 : 0.14}
              roughness={0.25}
            />
          </mesh>
        </group>
      )}

      <mesh position={[0, 0.36, -0.08]}>
        <boxGeometry args={[0.3, 0.014, 0.1]} />
        <meshStandardMaterial color="#1f2f44" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0.25, 0.36, -0.06]}>
        <sphereGeometry args={[0.028, 10, 8]} />
        <meshStandardMaterial color="#33475f" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[-0.27, 0.385, -0.09]}>
        <cylinderGeometry args={[0.035, 0.03, 0.07, 12]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.45} />
      </mesh>
      <mesh position={[-0.27, 0.42, -0.09]}>
        <cylinderGeometry args={[0.03, 0.03, 0.005, 12]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} />
      </mesh>
      {[-0.09, -0.03].map((x) => (
        <mesh key={x} position={[x, 0.355, -0.06]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.18, 0.24]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
        </mesh>
      ))}
      <mesh castShadow position={[0.36, 0.1, -0.16]}>
        <boxGeometry args={[0.16, 0.2, 0.22]} />
        <meshStandardMaterial color="#132133" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.36, 0.21, -0.05]}>
        <boxGeometry args={[0.03, 0.01, 0.01]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

export function OfficeDesk({
  seat,
  accent,
  occupied,
  selected,
  variant = "standard",
  onSelect,
}: {
  seat: SeatSlot;
  accent: string;
  occupied: boolean;
  selected: boolean;
  variant?: "standard" | "executive" | "reception";
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const highlightRef = useRef<MeshBasicMaterial>(null);
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    const step = Math.min(1, delta * 8);
    if (highlightRef.current) {
      const target = selected ? 0.55 : hovered ? 0.32 : 0;
      highlightRef.current.opacity += (target - highlightRef.current.opacity) * step;
    }
    if (groupRef.current) {
      const target = hovered ? 1.015 : 1;
      groupRef.current.scale.x += (target - groupRef.current.scale.x) * step;
      groupRef.current.scale.z += (target - groupRef.current.scale.z) * step;
    }
  });

  const handlePointer = (event: ThreeEvent<PointerEvent>, active: boolean) => {
    event.stopPropagation();
    setHovered(active);
    document.body.style.cursor = active ? "pointer" : "auto";
  };

  return (
    <group
      ref={groupRef}
      position={[seat.x, 0, seat.z]}
      rotation-y={seat.facing}
      onClick={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "auto";
        onSelect();
      }}
      onPointerOver={(event) => handlePointer(event, true)}
      onPointerOut={(event) => handlePointer(event, false)}
    >
      <Chair accent={accent} />
      <group position={[0, 0, 0.64]}>
        <DeskBody variant={variant} accent={accent} occupied={occupied} />
      </group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, 0.3]}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshBasicMaterial
          ref={highlightRef}
          color={accent}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      {(selected || hovered) && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0.32]}>
          <ringGeometry args={[0.52, 0.56, 40]} />
          <meshBasicMaterial
            color={selected ? accent : shade(accent, 0.8)}
            transparent
            opacity={selected ? 0.85 : 0.45}
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
