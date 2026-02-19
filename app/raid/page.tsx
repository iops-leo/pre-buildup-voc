'use client';

import { RaidLobby } from '@/components/raid/RaidLobby';

export default function RaidPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />
      <div className="relative z-10">
        <RaidLobby />
      </div>
    </main>
  );
}
