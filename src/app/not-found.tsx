import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <span className="text-6xl mb-4">📚</span>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Halaman tidak ditemukan</h1>
      <p className="text-slate-500 mb-6">Halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
      <Link
        href="/"
        className="bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-800 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
