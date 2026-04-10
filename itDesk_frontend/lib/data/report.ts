import type { ReportSnapshot } from "@/types";
import { todayLogs } from "./logs";
import { handoverNotes } from "./handover";
import { staffList } from "./staff";

// Static snapshot — in production this would be fetched by token
export const reportSnapshot: ReportSnapshot = {
  generatedAt: "Tue 31 Mar 2026, 2:45 PM",
  generatedBy: staffList[0],
  expiresIn: "23h 15m",
  token: "V6d9Kp2mXqRt",
  stats: { todo: 3, wip: 2, done: 3 },
  logs: todayLogs,
  openTasks: [
    { label: "HIGH", title: "Escalate internet downtime to ISP — overdue" },
    { label: "OPEN", title: "Reset WiFi password for production team" },
    { label: "WIP",  title: "Printer server setup — awaiting Vendor feedback (~1 week)" },
  ],
  // Show only the two most relevant notes in the public report
  handoverNotes: handoverNotes.filter((n) => ["h3", "h2"].includes(n.id)),
};
