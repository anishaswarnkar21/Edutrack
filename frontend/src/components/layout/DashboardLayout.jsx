import { Sidebar } from "./Sidebar.jsx";

export function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 min-w-0 px-6 sm:px-10 py-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
