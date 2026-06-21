import BottomNav from '@/components/shared/BottomNav';

export default function MahasiswaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-lg mx-auto pb-nav">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
