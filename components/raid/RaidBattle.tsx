'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRaidStore } from '@/store/useRaidStore';
import { getMonsterById } from '@/data/monsters';
import { MonsterDisplay } from './MonsterDisplay';
import { QuestionPanel } from './QuestionPanel';
import { PlayerStatus } from './PlayerStatus';
import { Flame, Zap } from 'lucide-react';

export function RaidBattle() {
  const {
    room,
    myPlayerId,
    currentQuestion,
    answerResult,
    lastDamage,
    comboCount,
    monsterShaking,
    setMonsterShaking,
    loadNextQuestion,
    phase,
  } = useRaidStore();

  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load first question on mount
  useEffect(() => {
    if (!currentQuestion && room?.phase === 'battle') {
      loadNextQuestion();
    }
  }, []);

  // Reset shake after animation
  useEffect(() => {
    if (monsterShaking) {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      shakeTimeoutRef.current = setTimeout(() => {
        setMonsterShaking(false);
      }, 500);
    }
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, [monsterShaking]);

  if (!room) return null;

  const monster = getMonsterById(room.monsterId);
  if (!monster) return null;

  const me = room.players.find((p) => p.id === myPlayerId);
  const partner = room.players.find((p) => p.id !== myPlayerId);

  const hpPercent = room.monsterCurrentHp / room.monsterMaxHp;
  const isDangerous = hpPercent <= 0.3;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* Danger flash overlay */}
      <AnimatePresence>
        {isDangerous && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.08, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="fixed inset-0 bg-red-600 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="px-4 pt-safe-top pt-3 pb-2 flex items-center justify-between bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-slate-400 font-medium">레이드 진행 중</span>
        </div>
        {/* Combo display */}
        <AnimatePresence>
          {comboCount >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 bg-yellow-900/50 border border-yellow-700 rounded-full px-3 py-1"
            >
              <Flame size={14} className="text-yellow-400" />
              <span className="text-yellow-300 font-black text-sm">{comboCount} 연속!</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-1.5">
          <Zap size={14} className="text-yellow-400" />
          <span className="text-xs text-slate-400">
            총 데미지: <span className="text-yellow-400 font-bold">
              {room.players.reduce((sum, p) => sum + p.damageDealt, 0).toLocaleString()}
            </span>
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
        {/* Monster display */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MonsterDisplay
            monster={monster}
            currentHp={room.monsterCurrentHp}
            maxHp={room.monsterMaxHp}
            isShaking={monsterShaking}
            lastDamage={answerResult === 'correct' ? lastDamage : null}
            comboCount={comboCount}
          />
        </motion.div>

        {/* Question panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <QuestionPanel />
        </motion.div>

        {/* Player status row */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          {me && (
            <PlayerStatus
              player={me}
              isMe={true}
              side="left"
            />
          )}
          {partner ? (
            <PlayerStatus
              player={partner}
              isMe={false}
              side="right"
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center py-4 text-slate-600 text-sm">
              <span className="text-2xl mb-1">👤</span>
              <span className="text-xs">혼자 레이드 중</span>
            </div>
          )}
        </div>
      </div>

      {/* Fever mode indicator (combo >= 5) */}
      <AnimatePresence>
        {comboCount >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-black text-sm px-4 py-2 rounded-full shadow-lg shadow-orange-900/50 flex items-center gap-2">
              🔥 피버 모드! 데미지 2배!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
