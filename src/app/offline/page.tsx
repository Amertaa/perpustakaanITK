export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-primary-900 flex items-center justify-center p-6">
      <div className="text-center text-white">
        <span className="text-6xl">📚</span>
        <h1 className="text-2xl font-bold mt-4">Tidak Ada Koneksi</h1>
        <p className="text-primary-200 mt-2">Periksa koneksi internet kamu dan coba lagi.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-white text-primary-800 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
