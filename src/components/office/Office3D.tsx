import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Boxes,
  DoorOpen,
  Layers,
  Loader2,
  Minus,
  MousePointerClick,
  Plus,
  RotateCw,
  Users,
} from "lucide-react";
import { OfficeScene, type OfficeSelection } from "@/components/office/OfficeScene";
import { RoomDetailPanel } from "@/components/office/RoomDetailPanel";
import {
  DeskDetailPanel,
  EmployeeDetailPanel,
} from "@/components/office/EmployeeDetailPanel";
import { useOfficeSnapshot } from "@/hooks/use-office-data";
import { occupantsOfRoom } from "@/services/office-service";
import { getSeatSlots, STATUS_META } from "@/lib/office-layout";
import { cn } from "@/lib/utils";

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error("[Office3D] Scene crashed:", error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="absolute inset-0 z-30 grid place-items-center bg-[#060e1c] p-6">
          <div className="max-w-sm text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-rose-400/20 bg-rose-500/10 text-rose-300">
              <AlertTriangle className="size-5" />
            </span>
            <p className="mt-3 font-display text-base font-semibold text-white">
              WebGL could not start
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              The 3D floor needs hardware acceleration. Enable WebGL in your
              browser, then try again.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ failed: false })}
              className="mt-4 rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-[11px] font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15"
            >
              Retry renderer
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function FloorOverviewPanel({
  employees,
  rooms,
}: {
  employees: { status: keyof typeof STATUS_META }[];
  rooms: { capacity: number; id: string }[];
}) {
  const counts = employees.reduce<Record<string, number>>((acc, employee) => {
    acc[employee.status] = (acc[employee.status] ?? 0) + 1;
    return acc;
  }, {});
  const legends: (keyof typeof STATUS_META)[] = [
    "present",
    "focus",
    "meeting",
    "break",
    "remote",
    "absent",
  ];

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300">
          <Boxes className="size-4" />
        </span>
        <div>
          <h2 className="font-display text-sm font-semibold text-white">
            Floor overview
          </h2>
          <p className="text-[10px] text-muted-foreground">
            Isometric model · level 04
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5">
          <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            Rooms
          </p>
          <p className="mt-0.5 font-display text-lg font-semibold text-white">
            {rooms.length}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5">
          <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            Seats
          </p>
          <p className="mt-0.5 font-display text-lg font-semibold text-white">
            {rooms.reduce((total, room) => total + room.capacity, 0)}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Team status
        </p>
        {legends.map((status) => (
          <div
            key={status}
            className="flex items-center justify-between text-[11px]"
          >
            <span className="flex items-center gap-2 text-slate-300">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: STATUS_META[status].color }}
              />
              {STATUS_META[status].label}
            </span>
            <span className="tabular-nums text-slate-400">
              {counts[status] ?? 0}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-3">
        <InteractiveHint icon={RotateCw} text="Drag to orbit the building" />
        <InteractiveHint icon={Plus} text="Scroll or pinch to zoom" />
        <InteractiveHint icon={MousePointerClick} text="Click a room, desk or person" />
      </div>
    </div>
  );
}

function InteractiveHint({
  icon: Icon,
  text,
}: {
  icon: typeof Plus;
  text: string;
}) {
  return (
    <p className="flex items-center gap-2 text-[10px] text-muted-foreground">
      <Icon className="size-3 text-cyan-300/70" />
      {text}
    </p>
  );
}

export function Office3D() {
  const { data, loading, error, reload } = useOfficeSnapshot();
  const [searchParams, setSearchParams] = useSearchParams();
  const [zoomFactor, setZoomFactor] = useState(1);
  const [resetSignal, setResetSignal] = useState(0);
  const [focusSignal, setFocusSignal] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  const rooms = data?.rooms ?? [];
  const employees = data?.employees ?? [];

  const selection = useMemo<OfficeSelection | null>(() => {
    const employeeId = searchParams.get("employee");
    const desk = searchParams.get("desk");
    const roomId = searchParams.get("room");

    if (employeeId) return { type: "employee", employeeId };
    if (desk) {
      const [deskRoom, seat] = desk.split(":");
      const seatIndex = Number(seat);
      if (deskRoom && Number.isInteger(seatIndex)) {
        return { type: "desk", roomId: deskRoom, seatIndex };
      }
    }
    if (roomId) return { type: "room", roomId };
    return null;
  }, [searchParams]);

  const setSelection = useCallback(
    (next: OfficeSelection | null) => {
      const params = new URLSearchParams();
      if (next?.type === "room") params.set("room", next.roomId);
      if (next?.type === "employee") params.set("employee", next.employeeId);
      if (next?.type === "desk") {
        params.set("desk", `${next.roomId}:${next.seatIndex}`);
      }
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  const selectRoom = useCallback(
    (roomId: string) => setSelection({ type: "room", roomId }),
    [setSelection],
  );
  const selectEmployee = useCallback(
    (employeeId: string) => setSelection({ type: "employee", employeeId }),
    [setSelection],
  );
  const selectDesk = useCallback(
    (roomId: string, seatIndex: number, employeeId?: string) => {
      if (employeeId) {
        setSelection({ type: "employee", employeeId });
      } else {
        setSelection({ type: "desk", roomId, seatIndex });
      }
    },
    [setSelection],
  );
  const clearSelection = useCallback(
    () => setSelection(null),
    [setSelection],
  );

  const onReady = useCallback(() => setSceneReady(true), []);
  const focusSelection = useCallback(() => setFocusSignal((value) => value + 1), []);

  const resetView = useCallback(() => {
    setZoomFactor(1);
    setResetSignal((value) => value + 1);
  }, []);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (!typing && event.key.toLowerCase() === "r") {
        resetView();
      }
      if (event.key === "Escape") {
        clearSelection();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearSelection, resetView]);

  const selectedEmployee =
    selection?.type === "employee"
      ? employees.find((employee) => employee.id === selection.employeeId) ?? null
      : null;
  const selectedEmployeeRoom = selectedEmployee?.location.roomId
    ? rooms.find((room) => room.id === selectedEmployee.location.roomId) ?? null
    : null;

  const selectionRoomId =
    selection?.type === "room"
      ? selection.roomId
      : selection?.type === "desk"
        ? selection.roomId
        : selectedEmployee?.location.roomId ?? null;
  const selectedRoom =
    rooms.find((room) => room.id === selectionRoomId) ?? null;

  const selectedDeskRoom =
    selection?.type === "desk"
      ? rooms.find((room) => room.id === selection.roomId) ?? null
      : null;

  const inOffice = employees.filter(
    (employee) => employee.presence === "in-office",
  ).length;

  const panel =
    selectedEmployee ? (
      <EmployeeDetailPanel
        employee={selectedEmployee}
        room={selectedEmployeeRoom}
        seatIndex={selectedEmployee.location.seatIndex}
        employees={employees}
        onClose={clearSelection}
        onFocus={focusSelection}
        onSelectRoom={selectRoom}
      />
    ) : selection?.type === "desk" && selectedDeskRoom ? (
      <DeskDetailPanel
        room={selectedDeskRoom}
        seatIndex={selection.seatIndex}
        seatCount={getSeatSlots(selectedDeskRoom).length}
        employees={employees}
        onClose={clearSelection}
        onFocus={focusSelection}
      />
    ) : selectedRoom && selection?.type === "room" ? (
      <RoomDetailPanel
        room={selectedRoom}
        employees={employees}
        onClose={clearSelection}
        onSelectEmployee={selectEmployee}
        onFocus={focusSelection}
      />
    ) : null;

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-300/80">
            <span className="size-1.5 rounded-full bg-cyan-300 pulse-dot" />
            Interactive floor · Level 04
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-white sm:text-[30px]">
            3D Office
          </h1>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
            A live miniature of the building. Orbit the model, inspect rooms and
            see exactly who is at which desk.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-slate-300">
            <Users className="size-3.5 text-cyan-300" />
            <span className="font-semibold text-white">{inOffice}</span> on site
          </span>
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-slate-300">
            <DoorOpen className="size-3.5 text-emerald-300" />
            <span className="font-semibold text-white">{rooms.length}</span>{" "}
            connected spaces
          </span>
          <span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[10px] text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-400 pulse-dot" />
            Sensors live
          </span>
        </div>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {rooms.map((room) => {
          const occupants = occupantsOfRoom(employees, room.id);
          const active = selectionRoomId === room.id;
          return (
            <button
              key={room.id}
              type="button"
              onClick={() => selectRoom(room.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] transition-all",
                active
                  ? "border-cyan-300/35 bg-cyan-400/10 text-cyan-100"
                  : "border-white/[0.07] bg-white/[0.025] text-slate-300 hover:border-white/15 hover:bg-white/[0.05]",
              )}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: room.accent }}
              />
              {room.name}
              <span className="tabular-nums text-[9px] text-muted-foreground">
                {occupants.length}/{room.capacity}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_336px]">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#060e1c] shadow-[0_50px_120px_-60px_rgba(0,0,0,0.95)]">
          <div className="pointer-events-none absolute inset-0 z-10 grid-blueprint opacity-[0.12]" />
          <div className="relative h-[64vh] min-h-[440px] w-full lg:h-[calc(100vh-280px)] lg:min-h-[540px]">
            {data ? (
              <SceneBoundary>
                <OfficeScene
                  rooms={rooms}
                  employees={employees}
                  selection={selection}
                  showLabels={showLabels}
                  autoRotate={autoRotate}
                  zoomFactor={zoomFactor}
                  focusSignal={focusSignal}
                  resetSignal={resetSignal}
                  onReady={onReady}
                  onSelectRoom={selectRoom}
                  onSelectEmployee={selectEmployee}
                  onSelectDesk={selectDesk}
                  onBackgroundClick={clearSelection}
                />
              </SceneBoundary>
            ) : error ? (
              <div className="absolute inset-0 grid place-items-center p-6">
                <div className="max-w-sm text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-rose-400/20 bg-rose-500/10 text-rose-300">
                    <AlertTriangle className="size-5" />
                  </span>
                  <p className="mt-3 font-display text-base font-semibold text-white">
                    Floor data unavailable
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={reload}
                    className="mt-4 rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-[11px] font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15"
                  >
                    Retry loading
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0" />
            )}

            {(loading || !sceneReady) && !error && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-[#060e1c]/85 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-7 animate-spin text-cyan-300" />
                  <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/80">
                    Assembling the floor
                  </p>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute left-3 top-3 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-[#071322]/80 px-3 py-1.5 backdrop-blur-md">
              <Layers className="size-3.5 text-cyan-300" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-100/90">
                Orthographic · isometric
              </span>
            </div>

            <div className="absolute right-3 top-3 z-30 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowLabels((value) => !value)}
                aria-label={showLabels ? "Hide room labels" : "Show room labels"}
                title={showLabels ? "Hide room labels" : "Show room labels"}
                className={cn(
                  "grid size-8 place-items-center rounded-lg border backdrop-blur-md transition-colors",
                  showLabels
                    ? "border-cyan-300/30 bg-cyan-400/15 text-cyan-100"
                    : "border-white/10 bg-[#071322]/80 text-slate-400 hover:text-white",
                )}
              >
                <Layers className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAutoRotate((value) => !value)}
                aria-label={autoRotate ? "Stop auto-orbit" : "Start auto-orbit"}
                title={autoRotate ? "Stop auto-orbit" : "Start auto-orbit"}
                className={cn(
                  "grid size-8 place-items-center rounded-lg border backdrop-blur-md transition-colors",
                  autoRotate
                    ? "border-cyan-300/30 bg-cyan-400/15 text-cyan-100"
                    : "border-white/10 bg-[#071322]/80 text-slate-400 hover:text-white",
                )}
              >
                <RotateCw className={cn("size-3.5", autoRotate && "animate-[spin_6s_linear_infinite]")} />
              </button>
            </div>

            <div className="absolute bottom-4 right-3 z-30 flex flex-col gap-1 rounded-xl border border-white/10 bg-[#071322]/85 p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setZoomFactor((value) => Math.min(1.9, value * 1.16))}
                disabled={zoomFactor >= 1.9}
                aria-label="Zoom in"
                title="Zoom in"
                className="grid size-8 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-35"
              >
                <Plus className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomFactor((value) => Math.max(0.65, value / 1.16))}
                disabled={zoomFactor <= 0.65}
                aria-label="Zoom out"
                title="Zoom out"
                className="grid size-8 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-35"
              >
                <Minus className="size-4" />
              </button>
              <span className="mx-auto my-0.5 h-px w-5 bg-white/10" />
              <button
                type="button"
                onClick={resetView}
                aria-label="Reset camera"
                title="Reset camera (R)"
                className="grid size-8 place-items-center rounded-lg text-cyan-200 transition-colors hover:bg-cyan-400/15 hover:text-cyan-100"
              >
                <RotateCw className="size-3.5" />
              </button>
            </div>

            <div className="pointer-events-none absolute bottom-4 left-4 z-30 hidden items-center gap-2 rounded-full border border-white/10 bg-[#071322]/80 px-3 py-1.5 text-[9.5px] text-slate-400 backdrop-blur-md sm:flex">
              <MousePointerClick className="size-3.5 text-cyan-300" />
              Drag to orbit · Scroll to zoom · Click to inspect
            </div>
          </div>
        </div>

        <aside className="hidden max-h-[calc(100vh-180px)] xl:sticky xl:top-20 xl:block">
          {panel ?? <FloorOverviewPanel employees={employees} rooms={rooms} />}
        </aside>
      </div>

      <div className="grid gap-4 xl:hidden">
        {panel ?? <FloorOverviewPanel employees={employees} rooms={rooms} />}
      </div>
    </div>
  );
}
