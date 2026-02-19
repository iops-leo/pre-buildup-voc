'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRaidStore } from '@/store/useRaidStore';
import { RaidWaitingRoom } from '@/components/raid/RaidWaitingRoom';
import { RaidBattle } from '@/components/raid/RaidBattle';
import { RaidResult } from '@/components/raid/RaidResult';

export default function RaidRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;

  const { room, phase, myPlayerId } = useRaidStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // If no room is loaded or room code doesn't match, redirect to lobby
    if (!room || room.code !== roomId || !myPlayerId) {
      router.replace('/raid');
    }
  }, [mounted, room, roomId, myPlayerId]);

  if (!mounted) return null;
  if (!room || !myPlayerId) return null;

  // Use room.phase as source of truth
  const currentPhase = room.phase;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />
      <div className="relative z-10 min-h-screen">
        {currentPhase === 'waiting' && <RaidWaitingRoom />}
        {currentPhase === 'battle' && <RaidBattle />}
        {currentPhase === 'result' && <RaidResult />}
      </div>
    </main>
  );
}
