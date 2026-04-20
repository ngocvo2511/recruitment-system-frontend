import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,80,212,0.05)]">
        <div className="flex items-center justify-between px-8 py-4 w-full max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-black tracking-tighter bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
            The Curator
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link className="text-slate-500 font-medium hover:opacity-80 transition-all duration-300" href="#">Help</Link>
            <Link className="text-blue-600 font-bold border-b-2 border-blue-600 px-1" href="/login">Sign In</Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {children}

      {/* Footer Component */}
      <footer className="w-full py-12 bg-transparent relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 gap-6 w-full max-w-7xl mx-auto">
          <div className="text-lg font-bold text-slate-900">The Curator</div>
          <div className="flex gap-8">
            <Link className="text-sm tracking-wider uppercase text-slate-500 hover:text-blue-500 transition-colors" href="#">Privacy Policy</Link>
            <Link className="text-sm tracking-wider uppercase text-slate-500 hover:text-blue-500 transition-colors" href="#">Terms of Service</Link>
            <Link className="text-sm tracking-wider uppercase text-slate-500 hover:text-blue-500 transition-colors" href="#">Contact Support</Link>
          </div>
          <div className="text-sm tracking-wider uppercase text-slate-500">
            © 2024 The Ethereal Professional. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
