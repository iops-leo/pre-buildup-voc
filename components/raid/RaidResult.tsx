'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRaidStore } from '@/store/useRaidStore';
import { getMonsterById } from '@/data/monsters';
import { useRouter } from 'next/navigation';
import { Trophy, Target, Zap, RotateCcw, Home } from 'lucide-react';

const STAR_COUNT = 20;

function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 3 + 1,
      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A8E6CF', '#FF8B94', '#C3A6FF'][
        Math.floor(Math.random() * 6)
      ],
      tilt: Math.random() * 10 - 10,
      tiltDelta: Math.random() * 0.2 - 0.1,
    }));

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();

        p.y += p.d;
        p.tilt += p.tiltDelta;

        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  return canvasRef;
}

export function RaidResult() {
  const { room, myPlayerId, resetRaid } = useRaidStore();
  const router = useRouter();
  const isVictory = room?.isVictory ?? false;
  const confettiRef = useConfetti(isVictory);

  if (!room) return null;

  const monster = getMonsterById(room.monsterId);
  const me = room.players.find((p) => p.id === myPlayerId);
  const partner = room.players.find((p) => p.id !== myPlayerId);

  const totalDamage = room.players.reduce((sum, p) => sum + p.damageDealt, 0);
  const totalCorrect = room.players.reduce((sum, p) => sum + p.answersCorrect, 0);
  const totalAnswers = room.players.reduce((sum, p) => sum + p.answersCorrect + p.answersWrong, 0);
  const teamAccuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

  const durationSec = room.startedAt && room.endedAt
    ? Math.floor((room.endedAt - room.startedAt) / 1000)
    : 0;
  const durationText = durationSec > 60
    ? `${Math.floor(durationSec / 60)}분 ${durationSec % 60}초`
    : `${durationSec}초`;

  function handleReplay() {
    resetRaid();
    router.push('/raid');
  }

  function handleHome() {
    resetRaid();
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start p-4 pt-8 overflow-y-auto">
      {/* Confetti canvas */}
      {isVictory && (
        <canvas
          ref={confettiRef}
          className="fixed inset-0 pointer-events-none z-10"
        />
      )}

      <div className="relative z-20 w-full max-w-md space-y-4">
        {/* Victory/Defeat header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            animate={isVictory ? { rotate: [0, -10, 10, -5, 5, 0] } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-8xl mb-4"
          >
            {isVictory ? '🏆' : '💀'}
          </motion.div>
          <h1
            className={`text-5xl font-black mb-2 ${isVictory ? 'text-yellow-400' : 'text-red-400'}`}
          >
            {isVictory ? '승리!' : '패배...'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isVictory
              ? `${monster?.name}을(를) 물리쳤습니다!`
              : `${monster?.name}에게 패배했습니다.`}
          </p>
        </motion.div>

        {/* Monster result */}
        {monster && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl border p-4 flex items-center gap-4 ${isVictory ? 'bg-yellow-950/30 border-yellow-800' : 'bg-red-950/20 border-red-900'}`}
          >
            <div className={`text-5xl ${!isVictory ? 'grayscale' : ''}`}>{monster.emoji}</div>
            <div>
              <div className="font-black text-white">{monster.name}</div>
              {isVictory && (
                <div className="text-yellow-400 text-sm mt-0.5">
                  🪙 코인 보상: <span className="font-bold">{monster.coinReward}</span>
                </div>
              )}
              <div className="text-slate-400 text-xs mt-1">
                남은 HP: <span className={`font-bold ${isVictory ? 'text-green-400' : 'text-red-400'}`}>
                  {room.monsterCurrentHp}/{room.monsterMaxHp}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Team stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-slate-900 border border-slate-800 p-4"
        >
          <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
            <Trophy size={14} className="text-yellow-400" />
            팀 성과
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Zap size={16} className="text-yellow-400" />, label: '총 데미지', value: totalDamage.toLocaleString(), color: 'text-yellow-300' },
              { icon: <Target size={16} className="text-green-400" />, label: '팀 정확도', value: `${teamAccuracy}%`, color: 'text-green-300' },
              { icon: <span className="text-base">⏱</span>, label: '클리어 시간', value: durationText, color: 'text-blue-300' },
            ].map((stat, i) => (
              <div key={i} className="text-center bg-slate-800/50 rounded-xl p-2.5">
                <div className="flex justify-center mb-1">{stat.icon}</div>
                <div className={`font-black text-sm ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Player breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3"
        >
          <h3 className="text-sm font-bold text-slate-400">플레이어 기록</h3>
          {room.players.map((player, i) => {
            const total = player.answersCorrect + player.answersWrong;
            const acc = total > 0 ? Math.round((player.answersCorrect / total) * 100) : 0;
            const contribution = totalDamage > 0 ? Math.round((player.damageDealt / totalDamage) * 100) : 0;
            const isCurrentPlayer = player.id === myPlayerId;

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`rounded-xl p-3 border ${isCurrentPlayer ? 'border-blue-700 bg-blue-950/30' : 'border-slate-800 bg-slate-800/30'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{player.role === 'host' ? '👑' : '🎮'}</span>
                  <span className="font-bold text-white text-sm">{player.name}</span>
                  {isCurrentPlayer && <span className="text-xs text-blue-400">(나)</span>}
                  {i === 0 && player.damageDealt > (room.players[1]?.damageDealt ?? 0) && (
                    <span className="ml-auto text-xs bg-yellow-900/50 text-yellow-400 border border-yellow-800 px-1.5 py-0.5 rounded-full">MVP</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-yellow-400 font-bold text-sm">{player.damageDealt.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">데미지</div>
                  </div>
                  <div>
                    <div className="text-green-400 font-bold text-sm">{acc}%</div>
                    <div className="text-xs text-slate-500">정확도</div>
                  </div>
                  <div>
                    <div className="text-blue-400 font-bold text-sm">{contribution}%</div>
                    <div className="text-xs text-slate-500">기여도</div>
                  </div>
                </div>
                {/* Damage contribution bar */}
                <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${contribution}%` }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3"
        >
          <button
            onClick={handleReplay}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw size={18} />
            다시 레이드
          </button>
          <button
            onClick={handleHome}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
          >
            <Home size={18} />
            홈
          </button>
        </motion.div>
      </div>
    </div>
  );
}
