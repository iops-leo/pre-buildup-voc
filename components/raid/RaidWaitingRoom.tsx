'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRaidStore, PlayerConfig } from '@/store/useRaidStore';
import { getMonsterById } from '@/data/monsters';
import {
  Subject,
  Difficulty,
  subjectInfo,
  difficultyInfo,
  allCategories,
} from '@/data/questions';
import { Copy, Check, Users, Swords } from 'lucide-react';

export function RaidWaitingRoom() {
  const { room, myPlayerId, setPlayerConfig, startBattle } = useRaidStore();
  const [copied, setCopied] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState<Subject>('math');
  const [selectedCategory, setSelectedCategory] = useState<string>('addition');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [configured, setConfigured] = useState(false);

  if (!room) return null;

  const monster = getMonsterById(room.monsterId);
  const me = room.players.find((p) => p.id === myPlayerId);
  const partner = room.players.find((p) => p.id !== myPlayerId);
  const isHost = me?.role === 'host';
  const allReady = room.players.length === 2 && room.players.every((p) => p.config?.ready);
  const categories = allCategories[selectedSubject] as unknown as Record<string, unknown>;
  const categoryKeys = Object.keys(categories);

  function handleCopyCode() {
    navigator.clipboard.writeText(room!.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCategoryChange(subj: Subject) {
    setSelectedSubject(subj);
    const cats = Object.keys(allCategories[subj] as Record<string, unknown>);
    setSelectedCategory(cats[0] || '');
    setConfigured(false);
  }

  async function handleConfirmConfig() {
    const config: PlayerConfig = {
      subject: selectedSubject,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      ready: true,
    };
    await setPlayerConfig(config);
    setConfigured(true);
  }

  async function handleStartBattle() {
    if (allReady) {
      await startBattle();
    }
  }

  const categoryLabels: Record<Subject, Record<string, string>> = {
    math: {
      addition: '덧셈',
      subtraction: '뺄셈',
      multiplication: '구구단',
      division: '나눗셈',
    },
    korean: {
      idiom: '사자성어',
      proverb: '속담',
      spelling: '맞춤법',
      antonym: '반대말',
    },
    social: {
      flag: '국기',
      capital: '수도',
      koreaGeography: '한국지리',
      worldGeography: '세계지리',
    },
    science: {
      solarSystem: '태양계',
      animal: '동물',
      element: '원소',
      humanBody: '인체',
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4 pt-8">
      <div className="w-full max-w-lg space-y-4">
        {/* Room code banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center justify-between"
        >
          <div>
            <div className="text-xs text-slate-500 mb-0.5">방 코드</div>
            <div className="text-3xl font-black tracking-widest text-white font-mono">{room.code}</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-sm"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? '복사됨!' : '코드 복사'}
            </button>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Users size={12} />
              <span>{room.players.length} / 2명</span>
            </div>
          </div>
        </motion.div>

        {/* Monster preview */}
        {monster && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center gap-4"
          >
            <div className="text-5xl">{monster.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-lg">{monster.name}</span>
                {monster.isBoss && (
                  <span className="text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">BOSS</span>
                )}
              </div>
              <div className="text-sm text-slate-400 mt-0.5">{monster.description}</div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-slate-500">HP: <span className="text-red-400 font-bold">{monster.hp}</span></span>
                <span className="text-xs text-slate-500">보상: <span className="text-yellow-400 font-bold">🪙 {monster.coinReward}</span></span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Players status */}
        <div className="grid grid-cols-2 gap-3">
          {[me, partner].map((player, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl border p-3 ${player ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/50 border-slate-800 border-dashed'}`}
            >
              {player ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{player.role === 'host' ? '👑' : '🎮'}</span>
                    <span className="text-sm font-bold text-white truncate">{player.name}</span>
                    {player.id === myPlayerId && (
                      <span className="text-xs text-blue-400 ml-auto">(나)</span>
                    )}
                  </div>
                  {player.config ? (
                    <div className="text-xs text-green-400 font-medium flex items-center gap-1">
                      <Check size={12} />
                      준비 완료
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">설정 중...</div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-16 text-slate-600">
                  <Users size={20} />
                  <span className="text-xs mt-1">대기 중...</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* My configuration */}
        {!configured ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4"
          >
            <h3 className="font-black text-white text-lg">내 과목 설정</h3>

            {/* Subject */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-2">과목 선택</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(subjectInfo) as Subject[]).map((subj) => (
                  <button
                    key={subj}
                    onClick={() => handleCategoryChange(subj)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                      selectedSubject === subj
                        ? 'border-blue-500 bg-blue-900/40 text-white'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-lg">{subjectInfo[subj].emoji}</span>
                    {subjectInfo[subj].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-2">카테고리</label>
              <div className="grid grid-cols-2 gap-2">
                {categoryKeys.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? 'border-purple-500 bg-purple-900/40 text-white'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {categoryLabels[selectedSubject]?.[cat] ?? cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-2">난이도</label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                      selectedDifficulty === diff
                        ? diff === 'easy'
                          ? 'border-green-500 bg-green-900/40 text-green-300'
                          : diff === 'normal'
                          ? 'border-yellow-500 bg-yellow-900/40 text-yellow-300'
                          : 'border-red-500 bg-red-900/40 text-red-300'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {difficultyInfo[diff].emoji} {difficultyInfo[diff].name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirmConfig}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              준비 완료 ✓
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-green-950/50 border border-green-700 p-4 text-center"
          >
            <div className="text-3xl mb-2">✅</div>
            <div className="text-green-300 font-black text-lg">준비 완료!</div>
            <div className="text-green-400/70 text-sm mt-1">
              {subjectInfo[selectedSubject].name} / {categoryLabels[selectedSubject]?.[selectedCategory] ?? selectedCategory} / {difficultyInfo[selectedDifficulty].name}
            </div>
            <button
              onClick={() => setConfigured(false)}
              className="mt-3 text-xs text-slate-400 hover:text-slate-200 transition-colors underline"
            >
              설정 변경
            </button>
          </motion.div>
        )}

        {/* Start battle button (host only) */}
        {isHost && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleStartBattle}
            disabled={!allReady}
            className={`w-full py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all ${
              allReady
                ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-900/30'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Swords size={24} />
            {allReady ? '전투 시작!' : '모두 준비 완료 대기 중...'}
          </motion.button>
        )}

        {!isHost && (
          <div className="text-center text-slate-500 text-sm py-2">
            {allReady ? '방장이 전투를 시작하길 기다리는 중...' : '방장이 전투를 시작할 수 있습니다'}
          </div>
        )}
      </div>
    </div>
  );
}
