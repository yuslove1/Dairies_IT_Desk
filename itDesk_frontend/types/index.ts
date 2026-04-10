// ── Shared TypeScript types for IT Desk ──

export type Priority = "high" | "med" | "low";
export type TaskStatus = "todo" | "wip" | "done";
export type TaskCategory = "hardware" | "network" | "software" | "urgent";
export type LogCategory = "routine" | "hardware" | "network" | "software" | "setup";
export type UserRole = "staff" | "manager" | "admin";

export interface User {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
  department: string;
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

// Sidebar nav item shape
export interface NavItem {
  label: string;
  icon: string;
  href: string;
  count?: number;
  countVariant?: "red" | "green";
}
