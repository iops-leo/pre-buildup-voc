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

  const { room, phase, myPlayerId, rejoinRoom } = useRaidStore();
  const [mounted, setMounted] = useState(false);
  const [rejoining, setRejoining] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // 이미 방에 있으면 무시
    if (room && room.code === roomId && myPlayerId) return;
    // 재접속 시도
    if (!rejoining) {
      setRejoining(true);
      rejoinRoom(roomId).then((success) => {
        if (!success) {
          router.replace('/raid');
        }
        setRejoining(false);
      });
    }
  }, [mounted, room, roomId, myPlayerId, rejoining, rejoinRoom, router]);

  if (!mounted || rejoining) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">⚔️</div>
          <div className="text-slate-400 text-sm">방에 재접속 중...</div>
        </div>
      </main>
    );
  }
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
