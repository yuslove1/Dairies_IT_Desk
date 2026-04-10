import type { User } from "@/types";

// All staff in the department
export const staffList: User[] = [
  {
    id: "adesina",
    name: "Adesina",
    initials: "AD",
    role: "staff",
    department: "IT Support · Dairies Plant",
    openTaskCount: 2,
  },
];

export const managerUser: User = {
  id: "lm",
  name: "L. Manager",
  initials: "LM",
  role: "manager",
  department: "IT Management · Dairies Plant",
};

// Simulated session — swap to managerUser to see manager views
export const currentUser: User = staffList[0];
