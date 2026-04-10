import type { LogEntry } from "@/types";

// Today's log entries
export const todayLogs: LogEntry[] = [
  {
    id: "l1",
    time: "09:00",
    description: "Arrived — routine system checks on all admin machines. All normal.",
    category: "routine",
    date: "2026-03-31",
  },
  {
    id: "l2",
    time: "10:15",
    description: "Production printer complaint. Paper jam identified. Ordered replacement roller.",
    category: "hardware",
    date: "2026-03-31",
  },
  {
    id: "l3",
    time: "13:30",
    description: "Configured new laptop for HR manager — OS setup, software, user account.",
    category: "setup",
    date: "2026-03-31",
  },
  {
    id: "l4",
    time: "15:00",
    description: "Investigated intermittent internet in Logistics office. Ongoing.",
    category: "network",
    date: "2026-03-31",
  },
];

// History sidebar items
export const logHistory = [
  { label: "Mon, 30 Mar", date: "2026-03-30" },
  { label: "Fri, 27 Mar", date: "2026-03-27" },
  { label: "Thu, 26 Mar", date: "2026-03-26" },
];
