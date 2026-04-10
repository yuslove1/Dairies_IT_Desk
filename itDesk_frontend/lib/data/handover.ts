import type { HandoverNote } from "@/types";

export const handoverNotes: HandoverNote[] = [
  {
    id: "h1",
    title: "Server room access",
    content: "Key is always at the security post (gate-2). Sign access log before picking the key.",
    updatedAt: "Updated 28 Mar",
    isActive: true,
  },
  {
    id: "h2",
    title: "ISP contact details",
    content: "FibreOne: 0700-587-000 · Account: UAC-444444444. Call if down 30+ min.",
    updatedAt: "Updated 25 Mar",
    isActive: true,
  },
  {
    id: "h3",
    title: "Production office Printer — known issue",
    content: "Recurring jam. Roller ordered (~1 week). Use Logistics office printer meanwhile.",
    updatedAt: "Added today",
    isActive: true,
  },
  {
    id: "h4",
    title: "Admin credentials register",
    content: "All admin passwords are in the physical IT register in the office drawer. Never store digitally.",
    updatedAt: "Updated 20 Mar",
    isActive: true,
  },
];
