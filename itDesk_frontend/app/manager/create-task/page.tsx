import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { Alert } from "@/components/ui/Alert";
import { TaskCard } from "@/components/ui/TaskCard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { managerUser, staffList } from "@/lib/data/staff";
import type { Task } from "@/types";

export const metadata: Metadata = { title: "Create Task — IT Desk" };

const previewTask: Task = {
  id: "preview",
  title: "Inspect network switch in server room",
  category: "network",
  priority: "high",
  status: "todo",
  assignedTo: staffList[0],
  assignedBy: managerUser,
  createdAt: "due today",
  isManagerAssigned: true,
};

const assignee = staffList[0];

export default function CreateTaskPage() {
  return (
    <AppShell user={managerUser} subtitle="Create Task">
      <h1 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-ink mb-0.5">
        Create &amp; Assign Task
      </h1>
      <p className="font-mono text-[10px] text-ink5 mb-4">
        // Manager action · Task appears on staff board immediately
      </p>

      <Alert variant="green">
        ✓&nbsp; As manager, you can create tasks and assign them directly to IT staff.
      </Alert>

      {/* Two-col — stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
        {/* Task details */}
        <div className="bg-surf border border-border rounded-[10px] p-4">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-ink4 mb-3">Task details</p>

          <div className="mb-3">
            <label className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5">Task title</label>
            <input
              className="w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-uac-green transition-colors"
              defaultValue="Inspect network switch in server room"
            />
          </div>

          <div className="mb-3">
            <label className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5">Description</label>
            <textarea
              className="w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-uac-green transition-colors resize-none min-h-[72px]"
              defaultValue="The network switch in the server room has been running hot. Please inspect the cooling, check the port indicator lights for any errors, and report back with findings before end of day."
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div>
              <label className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5">Category</label>
              <select className="w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 text-[12px] text-ink outline-none appearance-none">
                <option>Network</option>
                <option>Hardware</option>
                <option>Software</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5">Priority</label>
              <select className="w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 text-[12px] text-ink outline-none appearance-none">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5">Due date (optional)</label>
            <input
              className="w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 font-mono text-[11px] text-ink outline-none focus:border-uac-green transition-colors"
              defaultValue="31 March 2026 — End of Day"
            />
          </div>
        </div>

        {/* Right col — assignee + preview + actions */}
        <div className="flex flex-col gap-3">
          {/* Assignee */}
          <div className="bg-surf border border-border rounded-[10px] p-4">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-ink4 mb-3">Assign to staff member</p>
            <div className="mb-3">
              <label className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5">Assignee</label>
              <select className="w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 text-[12px] text-ink outline-none appearance-none">
                <option>{assignee.name} (IT Support — Dairies Plant)</option>
                <option>Unassigned</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-uac-green-soft border border-uac-green-mid rounded-[6px] px-2.5 py-2">
              <Avatar initials={assignee.initials} role={assignee.role} size="md" />
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-uac-green-dk">{assignee.name}</p>
                <p className="font-mono text-[9px] text-uac-green truncate">
                  {assignee.department} · {assignee.openTaskCount} open tasks
                </p>
              </div>
              <div className="ml-auto shrink-0">
                <Badge role={assignee.role} />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-surf border border-border rounded-[10px] p-4">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-ink4 mb-2.5">
              Preview — how it appears on staff board
            </p>
            <TaskCard task={previewTask} />
            <p className="font-mono text-[9px] text-ink5 mt-2">
              ↑ Purple &quot;assigned by manager&quot; label flags this as a manager task
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="green" className="flex-1 justify-center">Assign task →</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
