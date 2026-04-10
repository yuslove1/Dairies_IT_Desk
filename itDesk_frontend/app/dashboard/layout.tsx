// Shared padding wrapper for all authenticated pages
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper p-3 sm:p-5 lg:p-9">
      {children}
    </div>
  );
}
