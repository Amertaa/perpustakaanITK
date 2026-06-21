import AdminSidebar, { AdminMobileNav } from '@/components/shared/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="md:ml-60 pb-16 md:pb-0">
        {children}
      </main>
      <AdminMobileNav />
    </div>
  );
}
