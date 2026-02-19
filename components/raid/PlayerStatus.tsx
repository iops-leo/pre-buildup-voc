'use client';

import { motion } from 'framer-motion';
import { Player } from '@/store/useRaidStore';
import { subjectInfo, difficultyInfo, Subject, Difficulty } from '@/data/questions';
import { Shield, Zap, Target } from 'lucide-react';

interface PlayerStatusProps {
  player: Player;
  isMe: boolean;
  side: 'left' | 'right';
}

const subjectColors: Record<Subject, string> = {
  math: 'border-blue-600 bg-blue-950/50',
  korean: 'border-rose-600 bg-rose-950/50',
  social: 'border-green-600 bg-green-950/50',
  science: 'border-purple-600 bg-purple-950/50',
  english: 'border-emerald-600 bg-emerald-950/50',
};

const difficultyGlows: Record<Difficulty, string> = {
  easy: 'shadow-green-900/30',
  normal: 'shadow-yellow-900/30',
  hard: 'shadow-red-900/30',
};

export function PlayerStatus({ player, isMe, side }: PlayerStatusProps) {
  const config = player.config;
  const subject = config?.subject;
  const difficulty = config?.difficulty;

  const subjectBorder = subject ? subjectColors[subject] : 'border-slate-700 bg-slate-900';
  const diffGlow = difficulty ? difficultyGlows[difficulty] : '';
  const totalAnswers = player.answersCorrect + player.answersWrong;
  const accuracy = totalAnswers > 0 ? Math.round((player.answersCorrect / totalAnswers) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-2xl border-2 p-3 flex flex-col gap-2 shadow-lg ${subjectBorder} ${diffGlow} ${isMe ? 'ring-2 ring-blue-500/50' : ''}`}
    >
      {/* Player header */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg font-black ${isMe ? 'bg-blue-600' : 'bg-slate-700'}`}>
            {player.role === 'host' ? '👑' : '🎮'}
          </div>
          {/* Online indicator */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${player.isConnected ? 'bg-green-400' : 'bg-slate-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-white truncate">{player.name}</span>
            {isMe && (
              <span className="text-xs text-blue-400 font-medium shrink-0">(나)</span>
            )}
          </div>
          <div className="text-xs text-slate-400">
            {player.role === 'host' ? '방장' : '참가자'}
          </div>
        </div>
      </div>

      {/* Subject/Difficulty config */}
      {config ? (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
            {subjectInfo[config.subject]?.emoji} {subjectInfo[config.subject]?.name}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
            {difficultyInfo[config.difficulty]?.emoji} {difficultyInfo[config.difficulty]?.name}
          </span>
        </div>
      ) : (
        <div className="text-xs text-slate-500 italic">설정 중...</div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 pt-1 border-t border-slate-800">
        <div className="flex items-center gap-1">
          <Zap size={12} className="text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">{player.damageDealt.toLocaleString()}</span>
          <span className="text-xs text-slate-500">데미지</span>
        </div>
        <div className="flex items-center gap-1">
          <Target size={12} className="text-green-400" />
          <span className="text-xs font-bold text-green-400">{accuracy}%</span>
          <span className="text-xs text-slate-500">정확도</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield size={12} className="text-slate-400" />
          <span className="text-xs text-slate-400">{player.answersCorrect}/{totalAnswers}</span>
        </div>
      </div>

      {/* Ready indicator */}
      {config?.ready !== undefined && (
        <div className={`text-xs text-center py-1 rounded-lg font-bold ${config.ready ? 'bg-green-900/60 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
          {config.ready ? '✓ 준비 완료' : '준비 중...'}
        </div>
      )}
    </motion.div>
  );
}
