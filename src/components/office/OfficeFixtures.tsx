import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Color, DoubleSide, type Group, type Mesh, type MeshStandardMaterial } from "three";

export const shade = (hex: string, factor: number) =>
  new Color(hex).multiplyScalar(factor).getStyle();

export function Chair({
  accent = "#38bdf8",
  scale = 1,
}: {
  accent?: string;
  scale?: number;
}) {
  return (
    <group scale={scale}>
      <mesh castShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[0.28, 0.045, 0.28]} />
        <meshStandardMaterial color={shade(accent, 0.55)} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.36, -0.13]} rotation-x={-0.13}>
        <boxGeometry args={[0.28, 0.28, 0.04]} />
        <meshStandardMaterial color={shade(accent, 0.4)} roughness={0.75} />
      </mesh>
      <mesh castShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.2, 8]} />
        <meshStandardMaterial color="#22324a" metalness={0.7} roughness={0.35} />
      </mesh>
      {[0, 1, 2, 3, 4].map((arm) => (
        <mesh
          key={arm}
          position={[
            Math.sin((arm / 5) * Math.PI * 2) * 0.12,
            0.018,
            Math.cos((arm / 5) * Math.PI * 2) * 0.12,
          ]}
          rotation-y={(arm / 5) * Math.PI * 2}
        >
          <boxGeometry args={[0.035, 0.02, 0.26]} />
          <meshStandardMaterial color="#1b2a3d" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export function Plant({
  position = [0, 0, 0],
  scale = 1,
  tone = "#2dd4bf",
}: {
  position?: [number, number, number];
  scale?: number;
  tone?: string;
}) {
  const leaves = [
    { p: [0, 0.4, 0] as [number, number, number], r: 0.15, s: 1 },
    { p: [0.1, 0.48, 0.05] as [number, number, number], r: 0.11, s: 1 },
    { p: [-0.09, 0.46, -0.04] as [number, number, number], r: 0.12, s: 1 },
    { p: [0.02, 0.55, -0.08] as [number, number, number], r: 0.1, s: 1 },
    { p: [-0.05, 0.36, 0.09] as [number, number, number], r: 0.09, s: 1 },
  ];
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.1, 0.075, 0.16, 12]} />
        <meshStandardMaterial color="#d6dde8" roughness={0.55} metalness={0.15} />
      </mesh>
      {leaves.map((leaf, index) => (
        <mesh key={index} position={leaf.p} castShadow>
          <icosahedronGeometry args={[leaf.r, 0]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? tone : shade(tone, 0.7)}
            roughness={0.7}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

export function Sofa({
  accent = "#34d399",
  scale = 1,
}: {
  accent?: string;
  scale?: number;
}) {
  return (
    <group scale={scale}>
      <mesh castShadow position={[0, 0.16, 0]}>
        <boxGeometry args={[0.78, 0.16, 0.34]} />
        <meshStandardMaterial color={shade(accent, 0.32)} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 0.33, -0.12]}>
        <boxGeometry args={[0.78, 0.24, 0.09]} />
        <meshStandardMaterial color={shade(accent, 0.26)} roughness={0.85} />
      </mesh>
      {[-0.33, 0.33].map((x) => (
        <mesh key={x} castShadow position={[x, 0.26, 0]}>
          <boxGeometry args={[0.09, 0.2, 0.34]} />
          <meshStandardMaterial color={shade(accent, 0.28)} roughness={0.85} />
        </mesh>
      ))}
      {[-0.18, 0.18].map((x) => (
        <mesh key={`cushion-${x}`} position={[x, 0.245, 0.02]}>
          <boxGeometry args={[0.31, 0.06, 0.28]} />
          <meshStandardMaterial color={shade(accent, 0.4)} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export function CoffeeTable() {
  return (
    <group>
      <RoundedBox args={[0.9, 0.05, 0.5]} radius={0.02} smoothness={3} position={[0, 0.24, 0]} castShadow>
        <meshStandardMaterial color="#dbe3ee" roughness={0.35} metalness={0.2} />
      </RoundedBox>
      {[
        [-0.38, -0.18],
        [0.38, -0.18],
        [-0.38, 0.18],
        [0.38, 0.18],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} castShadow position={[x, 0.11, z]}>
          <boxGeometry args={[0.03, 0.22, 0.03]} />
          <meshStandardMaterial color="#1a2a41" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0.18, 0.3, 0]}>
        <cylinderGeometry args={[0.045, 0.035, 0.07, 12]} />
        <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export function ServerRack({ position }: { position: [number, number, number] }) {
  const ledRef = useRef<MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (ledRef.current) {
      ledRef.current.emissiveIntensity =
        1.1 + Math.sin(clock.elapsedTime * 2.6 + position[0] * 3) * 0.9;
    }
  });

  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.48, 0]}>
        <boxGeometry args={[0.38, 0.96, 0.5]} />
        <meshStandardMaterial color="#0c1626" metalness={0.65} roughness={0.4} />
      </mesh>
      {[0.16, 0.3, 0.44, 0.58, 0.72].map((y, index) => (
        <group key={y}>
          <mesh position={[0, y, 0.252]}>
            <boxGeometry args={[0.32, 0.1, 0.01]} />
            <meshStandardMaterial color="#12263c" metalness={0.4} roughness={0.6} />
          </mesh>
          <mesh position={[-0.09, y, 0.259]}>
            <boxGeometry args={[0.03, 0.012, 0.005]} />
            <meshStandardMaterial
              ref={index === 0 ? ledRef : undefined}
              color="#22d3ee"
              emissive="#22d3ee"
              emissiveIntensity={index === 0 ? 1.4 : 0.9}
            />
          </mesh>
          <mesh position={[-0.02, y, 0.259]}>
            <boxGeometry args={[0.03, 0.012, 0.005]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? "#34d399" : "#60a5fa"}
              emissive={index % 2 === 0 ? "#34d399" : "#60a5fa"}
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.97, 0]}>
        <boxGeometry args={[0.4, 0.03, 0.52]} />
        <meshStandardMaterial color="#1a2c42" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function Bench({ accent = "#67e8f9" }: { accent?: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.13, 0]}>
        <boxGeometry args={[0.62, 0.07, 0.28]} />
        <meshStandardMaterial color={shade(accent, 0.35)} roughness={0.8} />
      </mesh>
      {[-0.24, 0.24].map((x) => (
        <mesh key={x} castShadow position={[x, 0.06, 0]}>
          <boxGeometry args={[0.04, 0.13, 0.24]} />
          <meshStandardMaterial color="#22324a" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export function Shelf({
  position,
  rotation = 0,
  accent = "#94a3b8",
}: {
  position: [number, number, number];
  rotation?: number;
  accent?: string;
}) {
  return (
    <group position={position} rotation-y={rotation}>
      {[0, 0.32, 0.64].map((y) => (
        <mesh key={y} castShadow position={[0, y + 0.05, 0]}>
          <boxGeometry args={[0.7, 0.035, 0.26]} />
          <meshStandardMaterial color="#3c4a5f" metalness={0.5} roughness={0.55} />
        </mesh>
      ))}
      {[-0.33, 0.33].map((x) => (
        <mesh key={x} castShadow position={[x, 0.36, 0]}>
          <boxGeometry args={[0.03, 0.72, 0.26]} />
          <meshStandardMaterial color="#26364c" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {[0.24, 0.56].map((y, index) => (
        <mesh key={`box-${y}`} position={[index === 0 ? -0.14 : 0.14, y, 0]}>
          <boxGeometry args={[0.26, 0.18, 0.2]} />
          <meshStandardMaterial
            color={index === 0 ? shade(accent, 0.5) : "#7c8ca1"}
            roughness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Tree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.6, 7]} />
        <meshStandardMaterial color="#5b4636" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.72, 0]}>
        <icosahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#155e4f" roughness={0.85} flatShading />
      </mesh>
      <mesh castShadow position={[0.16, 0.6, 0.08]}>
        <icosahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color="#0f766e" roughness={0.85} flatShading />
      </mesh>
      <mesh castShadow position={[-0.14, 0.62, -0.06]}>
        <icosahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial color="#14b8a6" roughness={0.85} flatShading />
      </mesh>
    </group>
  );
}

export function ScreenWall({
  width = 1.5,
  height = 0.72,
  accent = "#22d3ee",
}: {
  width?: number;
  height?: number;
  accent?: string;
}) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[width + 0.08, height + 0.08, 0.035]} />
        <meshStandardMaterial color="#0a1421" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.024]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#082033"
          emissive={accent}
          emissiveIntensity={0.42}
          roughness={0.3}
        />
      </mesh>
      {[-0.25, 0, 0.25].map((offset) => (
        <mesh key={offset} position={[offset, height * 0.12, 0.026]}>
          <planeGeometry args={[width * 0.18, 0.035]} />
          <meshBasicMaterial color={accent} transparent opacity={0.65} />
        </mesh>
      ))}
      <mesh position={[0, -height * 0.22, 0.026]}>
        <planeGeometry args={[width * 0.6, 0.04]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

export function Whiteboard({ width = 1.2, accent = "#22d3ee" }: { width?: number; accent?: string }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[width, 0.62, 0.03]} />
        <meshStandardMaterial color="#e5eef7" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[width - 0.08, 0.54]} />
        <meshStandardMaterial color="#dbeafe" emissive={accent} emissiveIntensity={0.06} roughness={0.6} />
      </mesh>
      {[-0.3, 0.08, 0.26].map((x, index) => (
        <mesh key={x} position={[x, 0.12 - index * 0.13, 0.021]}>
          <planeGeometry args={[width * (0.22 + index * 0.1), 0.014]} />
          <meshBasicMaterial color={index === 1 ? accent : "#3b82f6"} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export function HoloProjector() {
  const ringRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ringRef.current) ringRef.current.rotation.y = clock.elapsedTime * 0.8;
    if (coreRef.current) {
      coreRef.current.rotation.y = clock.elapsedTime * 1.6;
      coreRef.current.position.y = 0.62 + Math.sin(clock.elapsedTime * 2) * 0.03;
    }
  });

  return (
    <group>
      <mesh position={[0, 0.48, 0]} castShadow>
        <cylinderGeometry args={[0.19, 0.22, 0.06, 20]} />
        <meshStandardMaterial color="#0e1e30" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 20]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2.4} transparent opacity={0.85} />
      </mesh>
      <group ref={ringRef} position={[0, 0.72, 0]}>
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.2, 0.008, 8, 32]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.75} />
        </mesh>
        <mesh rotation-x={Math.PI / 2.4}>
          <torusGeometry args={[0.26, 0.006, 8, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.55} />
        </mesh>
      </group>
      <mesh ref={coreRef} position={[0, 0.62, 0]}>
        <icosahedronGeometry args={[0.085, 1]} />
        <meshStandardMaterial color="#a5f3fc" emissive="#22d3ee" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 0.74, 0]}>
        <cylinderGeometry args={[0.05, 0.34, 0.5, 20, 1, true]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.08} side={DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function FloorLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 12]} />
        <meshStandardMaterial color="#26364c" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.74, 8]} />
        <meshStandardMaterial color="#33465e" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <coneGeometry args={[0.13, 0.14, 16, 1, true]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#fbbf24"
          emissiveIntensity={1.4}
          side={DoubleSide}
        />
      </mesh>
      <pointLight position={[0, 0.7, 0]} intensity={2.4} distance={3} color="#fcd34d" />
    </group>
  );
}
