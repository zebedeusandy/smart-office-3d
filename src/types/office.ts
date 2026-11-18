export type RoomKind =
  | "workspace"
  | "management"
  | "meeting"
  | "reception"
  | "server"
  | "lounge"
  | "storage";

export interface Point2D {
  x: number;
  z: number;
}

export interface Room {
  id: string;
  name: string;
  kind: RoomKind;
  description: string;
  /** Accent colour used by the floor, lights and UI chips. */
  accent: string;
  /** Centre of the room on the office floor plane. */
  center: Point2D;
  size: { width: number; depth: number };
  capacity: number;
  amenities: string[];
  /** Bookable spaces are surfaced as "available rooms". */
  bookable: boolean;
}

export type EmployeeStatus =
  | "present"
  | "focus"
  | "meeting"
  | "break"
  | "remote"
  | "absent";

export type Presence = "in-office" | "remote" | "away";

/**
 * Where an employee sits today. `roomId` + `seatIndex` map onto the seat slots
 * generated for that room, which keeps 3D positions fully data-driven.
 * A `position` override allows an employee to stand anywhere in the office.
 */
export interface EmployeeLocation {
  roomId: string | null;
  seatIndex: number | null;
  position?: Point2D;
  facing?: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  initials: string;
  /** Hex colour for the character and UI chips. */
  accent: string;
  status: EmployeeStatus;
  presence: Presence;
  location: EmployeeLocation;
  focus: string;
  joinedAt: string;
}

export interface OfficeSnapshot {
  rooms: Room[];
  employees: Employee[];
  updatedAt: number;
  source: "mock" | "firestore";
}

export interface AttendancePoint {
  day: string;
  present: number;
  remote: number;
}

export interface ActivityPoint {
  day: string;
  focusHours: number;
  meetings: number;
}

export interface DepartmentSummary {
  id: string;
  name: string;
  headcount: number;
  occupancy: number;
  color: string;
}

export type ActivityType = "room" | "employee" | "task" | "system";

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  type: ActivityType;
}

export interface Meeting {
  id: string;
  title: string;
  roomId: string;
  start: string;
  end: string;
  organizer: string;
  attendees: string[];
  status: "live" | "upcoming" | "done";
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  tone: "info" | "success" | "warning";
  read: boolean;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  remoteToday: number;
  activeTasks: number;
  availableRooms: number;
  totalRooms: number;
  meetingsToday: number;
  occupancyRate: number;
}

export interface DashboardSnapshot {
  stats: DashboardStats;
  attendance: AttendancePoint[];
  weeklyActivity: ActivityPoint[];
  departments: DepartmentSummary[];
  recentActivity: ActivityItem[];
  meetings: Meeting[];
  notifications: AppNotification[];
}

/** Seat slot generated for a room — shared by desks and employee characters. */
export interface SeatSlot {
  index: number;
  id: string;
  x: number;
  z: number;
  /** Direction the seated person faces, in radians (0 = +Z). */
  facing: number;
}
