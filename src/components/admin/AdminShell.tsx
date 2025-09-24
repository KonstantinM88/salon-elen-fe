import AdminNav from "./AdminNav";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="border-r bg-white p-4 lg:p-6 sticky top-0 h-svh">
        <div className="mb-4">
          <div className="text-lg font-semibold">Admin</div>
          <div className="text-xs opacity-60">панель управления</div>
        </div>
        <AdminNav />
      </aside>

      <main className="p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}
