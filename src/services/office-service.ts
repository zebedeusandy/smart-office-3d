import {
  attendanceSeed,
  departmentSeed,
  employeesSeed,
  meetingsSeed,
  notificationsSeed,
  recentActivitySeed,
  roomsSeed,
  weeklyActivitySeed,
  workspaceMetrics,
} from "@/data/office";
import type {
  DashboardSnapshot,
  Employee,
  OfficeSnapshot,
  Room,
} from "@/types/office";

/**
 * Data access boundary for the office.
 *
 * Components never import seed data directly — they go through this service so a
 * Firestore-backed implementation can be dropped in for stage two:
 *
 *   const firestoreOfficeService: OfficeService & RealtimeOfficeService = {
 *     async fetchSnapshot() { ...getDocs(...) },
 *     subscribe({ onSnapshot, onError }) { return onSnapshot(collection(...), ...) },
 *   };
 *
 * Swap `officeService` below and every screen updates without changes.
 */
export interface OfficeService {
  fetchSnapshot(): Promise<OfficeSnapshot>;
  fetchDashboard(): Promise<DashboardSnapshot>;
}

export interface RealtimeOfficeService {
  subscribe(handlers: {
    onSnapshot: (snapshot: OfficeSnapshot) => void;
    onError: (error: Error) => void;
  }): () => void;
}

const ROOM_TYPE_LABEL: Record<Room["kind"], string> = {
  workspace: "Workspace",
  management: "Management",
  meeting: "Meeting",
  reception: "Reception",
  server: "IT",
  lounge: "Lounge",
  storage: "Storage",
};

export const roomKindLabel = (kind: Room["kind"]) => ROOM_TYPE_LABEL[kind];

export const occupantsOfRoom = (employees: Employee[], roomId: string) =>
  employees.filter((employee) => employee.location.roomId === roomId);

const toSnapshot = (): OfficeSnapshot => ({
  rooms: roomsSeed.map((room) => ({ ...room, center: { ...room.center } })),
  employees: employeesSeed.map((employee) => ({
    ...employee,
    location: { ...employee.location },
  })),
  updatedAt: Date.now(),
  source: "mock",
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildDashboard = (snapshot: OfficeSnapshot): DashboardSnapshot => {
  const inOffice = snapshot.employees.filter(
    (employee) => employee.presence === "in-office",
  );
  const remote = snapshot.employees.filter(
    (employee) => employee.presence === "remote",
  );
  const absent = snapshot.employees.filter(
    (employee) => employee.status === "absent",
  );
  const totalCapacity = snapshot.rooms.reduce(
    (total, room) => total + room.capacity,
    0,
  );
  const availableRooms = snapshot.rooms.filter(
    (room) => occupantsOfRoom(snapshot.employees, room.id).length < room.capacity,
  ).length;

  return {
    stats: {
      totalEmployees: snapshot.employees.length,
      presentToday: inOffice.length,
      absentToday: absent.length,
      remoteToday: remote.length,
      activeTasks: workspaceMetrics.activeTasks,
      availableRooms,
      totalRooms: snapshot.rooms.length,
      meetingsToday: meetingsSeed.length,
      occupancyRate: Math.round((inOffice.length / totalCapacity) * 100),
    },
    attendance: attendanceSeed.map((point) => ({ ...point })),
    weeklyActivity: weeklyActivitySeed.map((point) => ({ ...point })),
    departments: departmentSeed.map((department) => ({ ...department })),
    recentActivity: recentActivitySeed.map((item) => ({ ...item })),
    meetings: meetingsSeed.map((meeting) => ({
      ...meeting,
      attendees: [...meeting.attendees],
    })),
    notifications: notificationsSeed.map((notification) => ({ ...notification })),
  };
};

export const officeService: OfficeService = {
  async fetchSnapshot() {
    await wait(320);
    return toSnapshot();
  },
  async fetchDashboard() {
    await wait(420);
    return buildDashboard(toSnapshot());
  },
};
