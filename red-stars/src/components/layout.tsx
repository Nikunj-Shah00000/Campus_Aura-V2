import { Link, useLocation } from "wouter";
import { StarField } from "./star-field";
import { getIdentity } from "@/lib/identity";
import { useGetLiveStats } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const identity = getIdentity();
  const { data: stats } = useGetLiveStats();

  return (
    <div className="min-h-screen text-white flex flex-col font-sans">
      <StarField />
      
      <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(204,0,34,0.5)] transition-all duration-300">
              <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(204,0,34,1)] animate-pulse" />
            </div>
            <span className="font-bold text-lg tracking-wider">RED STARS</span>
          </Link>

          <nav className="flex items-center gap-4 text-sm font-medium text-gray-400">
            <Link href="/" className={`hover:text-white transition-colors ${location === '/' ? 'text-white' : ''}`}>Rooms</Link>
            <Link href="/counselors" className={`hover:text-white transition-colors ${location === '/counselors' ? 'text-white' : ''}`}>Counselors</Link>
            <Link href="/report" className={`hover:text-white transition-colors ${location === '/report' ? 'text-white' : ''}`}>Report</Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <span className="text-xs text-gray-400 font-mono">{stats?.activeUsers || 0} Online</span>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-sm font-mono text-gray-300">
            {identity}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
