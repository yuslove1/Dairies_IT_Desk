export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen overflow-hidden bg-paper flex flex-col">{children}</div>;
}
