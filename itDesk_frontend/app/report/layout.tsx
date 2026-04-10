export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper p-3 sm:p-5 lg:p-9 max-w-5xl mx-auto">
      {children}
    </div>
  );
}
