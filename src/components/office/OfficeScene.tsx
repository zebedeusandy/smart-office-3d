import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Edges,
  Grid,
  Html,
  OrbitControls,
  RoundedBox,
  Sparkles,
} from "@react-three/drei";
import { DoubleSide, MathUtils, Vector3, type OrthographicCamera } from "three";
import { OfficeRoom } from "@/components/office/OfficeRoom";
import { Bench, Plant, Tree } from "@/components/office/OfficeFixtures";
import { courtyardSeed } from "@/data/office";
import { getSeatSlots } from "@/lib/office-layout";
import type { Employee, Room } from "@/types/office";

export type OfficeSelection =
  | { type: "room"; roomId: string }
  | { type: "employee"; employeeId: string }
  | { type: "desk"; roomId: string; seatIndex: number };

const DEFAULT_TARGET = new Vector3(0, 0.5, 0);
const DEFAULT_POSITION = new Vector3(19, 17, 19);

interface ControlsLike {
  target: Vector3;
  update: () => void;
}

function SceneReady({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (!done.current) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

function CameraRig({
  focusPoint,
  focusSignal,
  zoomFactor,
  resetSignal,
}: {
  focusPoint: [number, number, number];
  focusSignal: number;
  zoomFactor: number;
  resetSignal: number;
}) {
  const camera = useThree((state) => state.camera) as OrthographicCamera;
  const controls = useThree((state) => state.controls) as unknown as ControlsLike | null;
  const { size } = useThree();
  const targetGoal = useRef(DEFAULT_TARGET.clone());
  const flyFrames = useRef(0);

  const baseZoom = useMemo(() => {
    const fitted = Math.min(size.width / 30, size.height / 16.5);
    return MathUtils.clamp(fitted, 11, 58);
  }, [size.width, size.height]);

  const zoomGoal = useRef(baseZoom * zoomFactor);

  useEffect(() => {
    targetGoal.current.set(focusPoint[0], focusPoint[1], focusPoint[2]);
  }, [focusPoint, focusSignal]);

  useEffect(() => {
    zoomGoal.current = baseZoom * zoomFactor;
  }, [baseZoom, zoomFactor]);

  useEffect(() => {
    if (resetSignal === 0) return;
    targetGoal.current.copy(DEFAULT_TARGET);
    flyFrames.current = 110;
  }, [resetSignal]);

  useFrame((_, delta) => {
    if (!controls) return;
    const step = Math.min(1, 1 - Math.pow(0.0015, delta));

    const previousTarget = controls.target.clone();
    controls.target.lerp(targetGoal.current, step);
    camera.position.add(controls.target.clone().sub(previousTarget));

    if (flyFrames.current > 0) {
      camera.position.lerp(DEFAULT_POSITION, step);
      flyFrames.current -= 1;
    }

    if (Math.abs(camera.zoom - zoomGoal.current) > 0.002) {
      camera.zoom += (zoomGoal.current - camera.zoom) * step;
      camera.updateProjectionMatrix();
    }

    controls.update();
  });

  return null;
}

function BuildingShell() {
  return (
    <group>
      <RoundedBox
        args={[21, 0.5, 17.4]}
        radius={0.34}
        smoothness={4}
        position={[0, -0.24, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#0a1727" metalness={0.62} roughness={0.42} />
      </RoundedBox>

      <mesh position={[0, -0.1, 8.68]}>
        <boxGeometry args={[20.4, 0.05, 0.05]} />
        <meshStandardMaterial color="#0e7490" emissive="#22d3ee" emissiveIntensity={1.1} />
      </mesh>
      <mesh position={[0, -0.1, -8.68]}>
        <boxGeometry args={[20.4, 0.05, 0.05]} />
        <meshStandardMaterial color="#0e7490" emissive="#22d3ee" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[10.48, -0.1, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[17.2, 0.05, 0.05]} />
        <meshStandardMaterial color="#0e7490" emissive="#22d3ee" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[-10.48, -0.1, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[17.2, 0.05, 0.05]} />
        <meshStandardMaterial color="#0e7490" emissive="#22d3ee" emissiveIntensity={0.6} />
      </mesh>

      {[
        [0, -0.48, 8.4],
        [0, -0.48, -8.4],
        [10.2, -0.48, 0],
        [-10.2, -0.48, 0],
      ].map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]}>
          <boxGeometry args={index < 2 ? [20, 0.02, 0.5] : [0.5, 0.02, 16.8]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.12} />
        </mesh>
      ))}
    </group>
  );
}

function Courtyard() {
  const { center, size } = courtyardSeed;
  return (
    <group position={[center.x, 0.02, center.z]}>
      <mesh receiveShadow position={[0, 0.03, 0]}>
        <boxGeometry args={[size.width, 0.1, size.depth]} />
        <meshStandardMaterial color="#0f332d" roughness={0.9} />
        <Edges color="#34d399" threshold={12} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.09, 0]}>
        <planeGeometry args={[size.width - 0.6, size.depth - 0.6]} />
        <meshStandardMaterial color="#14503f" roughness={0.95} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.1, 0.3]}>
        <planeGeometry args={[1.2, size.depth - 0.9]} />
        <meshStandardMaterial color="#c2b8a1" roughness={0.85} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[1.5, 0.105, -0.8]}>
        <circleGeometry args={[0.65, 28]} />
        <meshStandardMaterial
          color="#0e7490"
          metalness={0.4}
          roughness={0.15}
          emissive="#22d3ee"
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[1.5, 0.12, -0.8]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.64, 0.74, 32]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.45} side={DoubleSide} />
      </mesh>
      <Tree position={[-1.9, 0.08, -1.3]} scale={1.15} />
      <Tree position={[-1.4, 0.08, 1.35]} scale={0.85} />
      <Tree position={[2.3, 0.08, 1.4]} scale={1} />
      <group position={[-0.5, 0.1, -1.55]} rotation-y={0.3}>
        <Bench accent="#34d399" />
      </group>
      <group position={[0.6, 0.1, 1.55]} rotation-y={Math.PI * 0.85}>
        <Bench accent="#67e8f9" />
      </group>
      <Plant position={[2.35, 0.08, -1.5]} tone="#4ade80" scale={0.9} />
      <Html
        position={[0, 1.35, 0]}
        center
        zIndexRange={[20, 5]}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-300/25 bg-[#04170f]/85 px-2 py-[3px] text-[9px] font-medium text-emerald-200 backdrop-blur-md">
          <span className="size-1 rounded-full bg-emerald-400" />
          Outdoor Courtyard
        </div>
      </Html>
    </group>
  );
}

function Landscape() {
  const trees: { position: [number, number, number]; scale: number }[] = [
    { position: [-11.4, -0.42, 6.4], scale: 1.35 },
    { position: [-11.6, -0.42, -3.6], scale: 1.05 },
    { position: [11.2, -0.42, -4.2], scale: 1.2 },
    { position: [11.4, -0.42, 2.2], scale: 0.9 },
    { position: [-4.6, -0.42, 9.2], scale: 1.1 },
    { position: [3.1, -0.42, 9.4], scale: 0.85 },
  ];

  return (
    <group>
      {trees.map((tree) => (
        <Tree key={tree.position.join("-")} {...tree} />
      ))}
      {[-9, -4.5, 4.5, 9].map((x) => (
        <mesh key={`hedge-${x}`} castShadow position={[x, -0.3, 8.9]}>
          <boxGeometry args={[2.1, 0.24, 0.4]} />
          <meshStandardMaterial color="#14532d" roughness={0.95} />
        </mesh>
      ))}
      {[
        [-10.9, -8.2],
        [10.7, -8.2],
        [-10.9, 0.4],
      ].map(([x, z]) => (
        <Plant key={`${x}-${z}`} position={[x, -0.42, z]} tone="#22c55e" scale={1.2} />
      ))}
    </group>
  );
}

function SceneContent({
  rooms,
  employees,
  selection,
  showLabels,
  autoRotate,
  zoomFactor,
  focusSignal,
  resetSignal,
  onReady,
  onSelectRoom,
  onSelectEmployee,
  onSelectDesk,
  onBackgroundClick,
}: {
  rooms: Room[];
  employees: Employee[];
  selection: OfficeSelection | null;
  showLabels: boolean;
  autoRotate: boolean;
  zoomFactor: number;
  focusSignal: number;
  resetSignal: number;
  onReady: () => void;
  onSelectRoom: (roomId: string) => void;
  onSelectEmployee: (employeeId: string) => void;
  onSelectDesk: (roomId: string, seatIndex: number, employeeId?: string) => void;
  onBackgroundClick: () => void;
}) {
  const focusPoint = useMemo<[number, number, number]>(() => {
    if (!selection) return [0, 0.5, 0];

    if (selection.type === "employee") {
      const employee = employees.find((item) => item.id === selection.employeeId);
      if (!employee || !employee.location.roomId || employee.location.seatIndex === null) {
        return [0, 0.5, 0];
      }
      const room = rooms.find((item) => item.id === employee.location.roomId);
      if (!room) return [0, 0.5, 0];
      const seat = getSeatSlots(room)[employee.location.seatIndex];
      if (!seat) return [room.center.x, 0.6, room.center.z];
      return [room.center.x + seat.x, 0.4, room.center.z + seat.z];
    }

    const room = rooms.find((item) => item.id === selection.roomId);
    if (!room) return [0, 0.5, 0];

    if (selection.type === "desk") {
      const seat = getSeatSlots(room)[selection.seatIndex];
      if (!seat) return [room.center.x, 0.6, room.center.z];
      return [room.center.x + seat.x, 0.4, room.center.z + seat.z];
    }

    return [room.center.x, 0.7, room.center.z];
  }, [selection, rooms, employees]);

  const selectedRoomId =
    selection?.type === "room"
      ? selection.roomId
      : selection?.type === "desk"
        ? selection.roomId
        : null;
  const selectedEmployeeId =
    selection?.type === "employee" ? selection.employeeId : null;
  const selectedSeatIndex =
    selection?.type === "desk" ? selection.seatIndex : null;

  return (
    <>
      <SceneReady onReady={onReady} />
      <color attach="background" args={["#060e1c"]} />

      <ambientLight intensity={0.85} color="#9cc3ff" />
      <hemisphereLight args={["#cfeaff", "#030812", 0.75]} />
      <directionalLight
        castShadow
        position={[16, 24, 12]}
        intensity={2.2}
        color="#edf5ff"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={60}
      />
      <pointLight position={[0, 10, 0]} intensity={26} distance={30} decay={2} color="#22d3ee" />
      <pointLight position={[-12, 6, 9]} intensity={16} distance={24} decay={2} color="#3b82f6" />
      <pointLight position={[12, 6, -9]} intensity={14} distance={24} decay={2} color="#8b5cf6" />

      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, -0.44, 0]}
        receiveShadow
        onClick={(event) => {
          if (event.delta <= 2) onBackgroundClick();
        }}
      >
        <planeGeometry args={[110, 110]} />
        <meshStandardMaterial color="#050c18" roughness={0.94} metalness={0.15} />
      </mesh>
      <Grid
        position={[0, -0.43, 0]}
        args={[80, 80]}
        cellSize={1.2}
        cellThickness={0.55}
        cellColor="#103a55"
        sectionSize={6}
        sectionThickness={0.9}
        sectionColor="#155e75"
        fadeDistance={48}
        fadeStrength={1.2}
        followCamera={false}
      />

      <BuildingShell />
      <Landscape />
      <Courtyard />

      {rooms.map((room) => (
        <OfficeRoom
          key={room.id}
          room={room}
          employees={employees}
          selected={selectedRoomId === room.id}
          selectedEmployeeId={selectedEmployeeId}
          selectedSeatIndex={selectedSeatIndex}
          showLabel={showLabels}
          onSelectRoom={() => onSelectRoom(room.id)}
          onSelectEmployee={onSelectEmployee}
          onSelectDesk={onSelectDesk}
        />
      ))}

      <ContactShadows
        position={[0, -0.42, 0]}
        scale={38}
        blur={2.6}
        opacity={0.5}
        far={10}
        resolution={512}
        frames={1}
        color="#01050c"
      />
      <Sparkles
        count={48}
        scale={[28, 8, 24]}
        position={[0, 3, 0]}
        size={1.8}
        speed={0.25}
        opacity={0.28}
        color="#67e8f9"
      />

      <CameraRig
        focusPoint={focusPoint}
        focusSignal={focusSignal}
        zoomFactor={zoomFactor}
        resetSignal={resetSignal}
      />
      <OrbitControls
        makeDefault
        enablePan
        screenSpacePanning
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.65}
        panSpeed={0.85}
        zoomSpeed={0.9}
        minPolarAngle={0.28}
        maxPolarAngle={Math.PI / 2.12}
        minZoom={8}
        maxZoom={120}
        autoRotate={autoRotate}
        autoRotateSpeed={0.32}
      />
    </>
  );
}

export function OfficeScene(props: {
  rooms: Room[];
  employees: Employee[];
  selection: OfficeSelection | null;
  showLabels: boolean;
  autoRotate: boolean;
  zoomFactor: number;
  focusSignal: number;
  resetSignal: number;
  onReady: () => void;
  onSelectRoom: (roomId: string) => void;
  onSelectEmployee: (employeeId: string) => void;
  onSelectDesk: (roomId: string, seatIndex: number, employeeId?: string) => void;
  onBackgroundClick: () => void;
}) {
  return (
    <Canvas
      orthographic
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [19, 17, 19], zoom: 30, near: -200, far: 500 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onPointerMissed={() => props.onBackgroundClick()}
      onCreated={({ gl }) => {
        gl.setClearColor("#060e1c");
      }}
    >
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
}
