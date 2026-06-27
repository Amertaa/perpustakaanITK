export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">📚</span>
          <h1 className="text-2xl font-bold text-white mt-3">SIPUS ITK</h1>
          <p className="text-primary-200 text-sm mt-1">Sistem Perpustakaan Institut Teknologi Kalimantan</p>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {children}
        </div>
        <p className="text-center text-primary-300 text-xs mt-6">
          © 2026 Perpustakaan ITK. All rights reserved.
        </p>
      </div>
    </div>
  );
}
