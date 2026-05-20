// ── Shared TypeScript types for IT Desk ──

export type Priority = "high" | "med" | "low";
export type TaskStatus = "todo" | "wip" | "done";
export type TaskCategory = "hardware" | "network" | "software" | "urgent";
export type LogCategory = "routine" | "hardware" | "network" | "software" | "setup";
export type UserRole = "staff" | "manager" | "admin";

// ── Asset Management ──
export type AssetType =
  | "laptop"
  | "desktop"
  | "printer"
  | "ups"
  | "switch"
  | "server"
  | "monitor"
  | "phone"
  | "keyboard"
  | "other";

export type AssetStatus = "active" | "in_repair" | "retired" | "unassigned";

export interface User {
  id:            string;
  name:          string;
  initials:      string;
  email?:        string;   // optional — populated from session storage
  role:          UserRole;
  department:    string;
  openTaskCount?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  status: TaskStatus;
  assignedTo: User;
  assignedBy?: User; // if manager-created
  createdAt: string;  // "HH:MM" or "Mon", "today" etc.
  dueDate?: string;
  isManagerAssigned?: boolean;
}

export interface LogEntry {
  id: string;
  time: string;       // e.g. "09:00"
  description: string;
  category: LogCategory;
  date: string;       // "YYYY-MM-DD"
}

export interface HandoverNote {
  id: string;
  title: string;
  content: string;
  updatedAt: string;  // display string e.g. "Updated 28 Mar"
  isActive: boolean;
}

export interface ReportSnapshot {
  generatedAt: string;
  generatedBy: User;
  expiresIn: string;
  token: string;
  stats: { todo: number; wip: number; done: number };
  logs: LogEntry[];
  openTasks: { label: string; title: string }[];
  handoverNotes: HandoverNote[];
}

export interface Asset {
  id: string;
  name: string;           // e.g. "HP LaserJet Pro M404dn"
  type: AssetType;
  serialNumber?: string;  // often found on a sticker on the device
  location: string;       // physical location e.g. "Production Office"
  department: string;     // owning department e.g. "HR"
  status: AssetStatus;
  purchaseDate?: string;  // ISO date string "YYYY-MM-DD"
  warrantyExpiry?: string;
  notes?: string;
  addedAt: string;        // display string e.g. "12 Jan 2025"
}

// ── Sidebar nav item shape ──
export interface NavItem {
  label: string;
  icon: string;
  href: string;
  count?: number;
  countVariant?: "red" | "green";
}
