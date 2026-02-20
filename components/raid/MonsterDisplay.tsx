'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Monster, MonsterTrait } from '@/data/monsters';
import Image from 'next/image';
import { useState } from 'react';

interface MonsterDisplayProps {
  monster: Monster;
  currentHp: number;
  maxHp: number;
  isShaking: boolean;
  lastDamage: number | null;
  comboCount: number;
  showMiss?: boolean;
}

const traitConfig: Record<MonsterTrait, { label: string; color: string; emoji: string }> = {
  poison: { label: '독', color: 'text-green-400 bg-green-900/50', emoji: '☠️' },
  freeze: { label: '빙결', color: 'text-blue-300 bg-blue-900/50', emoji: '❄️' },
  burn: { label: '화상', color: 'text-orange-400 bg-orange-900/50', emoji: '🔥' },
  evade: { label: '회피', color: 'text-yellow-300 bg-yellow-900/50', emoji: '💨' },
  drain: { label: '흡혈', color: 'text-red-400 bg-red-900/50', emoji: '🩸' },
  rage: { label: '분노', color: 'text-red-500 bg-red-900/50', emoji: '😡' },
  invisible: { label: '투명', color: 'text-slate-400 bg-slate-800/50', emoji: '👻' },
  revive: { label: '부활', color: 'text-purple-400 bg-purple-900/50', emoji: '✨' },
};

const worldThemeColors: Record<string, string> = {
  forest: 'from-green-950 to-slate-950',
  ice: 'from-blue-950 to-slate-950',
  volcano: 'from-red-950 to-slate-950',
  haunted: 'from-purple-950 to-slate-950',
};

export function MonsterDisplay({
  monster,
  currentHp,
  maxHp,
  isShaking,
  lastDamage,
  comboCount,
  showMiss = false,
}: MonsterDisplayProps) {
  const hpPercent = Math.max(0, (currentHp / maxHp) * 100);
  const [imgError, setImgError] = useState(false);

  const hpBarColor =
    hpPercent > 60
      ? 'from-green-500 to-emerald-400'
      : hpPercent > 30
      ? 'from-yellow-500 to-orange-400'
      : 'from-red-600 to-rose-500';

  const worldTheme = worldThemeColors[monster.world === 1 ? 'forest' : monster.world === 2 ? 'ice' : monster.world === 3 ? 'volcano' : 'haunted'] || 'from-slate-900 to-slate-950';

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-b ${worldTheme} border border-slate-800`}>
      {/* Background glow for boss */}
      {monster.isBoss && (
        <div className="absolute inset-0 bg-gradient-radial from-yellow-900/20 via-transparent to-transparent pointer-events-none" />
      )}

      <div className="p-4 flex flex-col items-center gap-3">
        {/* Boss badge */}
        {monster.isBoss && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full"
          >
            BOSS
          </motion.div>
        )}

        {/* Monster image/emoji */}
        <motion.div
          animate={isShaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          {!imgError ? (
            <div className="relative w-32 h-32">
              <Image
                src={`/monsters/${monster.id}.png`}
                alt={monster.name}
                fill
                className="object-contain drop-shadow-2xl"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="w-32 h-32 flex items-center justify-center text-7xl drop-shadow-2xl">
              {monster.emoji}
            </div>
          )}

          {/* Damage number popup */}
          <AnimatePresence>
            {lastDamage !== null && lastDamage > 0 && (
              <motion.div
                key={`damage-${Date.now()}`}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -60, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10"
              >
                <span className={`font-black text-2xl drop-shadow-lg ${comboCount >= 3 ? 'text-yellow-300' : 'text-red-400'}`}>
                  -{lastDamage}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Miss popup */}
          <AnimatePresence>
            {showMiss && (
              <motion.div
                key={`miss-${Date.now()}`}
                initial={{ opacity: 1, y: 0, scale: 1, rotate: -10 }}
                animate={{ opacity: 0, y: -50, scale: 1.3, rotate: 10 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10"
              >
                <span className="font-black text-2xl text-slate-400 drop-shadow-lg">
                  MISS! 💨
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Combo indicator */}
          <AnimatePresence>
            {comboCount >= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-black px-1.5 py-0.5 rounded-full"
              >
                {comboCount}x 콤보!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Monster name */}
        <div className="text-center">
          <h2 className="text-xl font-black text-white">{monster.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{monster.description}</p>
        </div>

        {/* HP Bar */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-400 font-medium">HP</span>
            <span className={`text-sm font-bold ${hpPercent <= 30 ? 'text-red-400' : 'text-slate-200'}`}>
              {currentHp.toLocaleString()} / {maxHp.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${hpBarColor} relative`}
              animate={{ width: `${hpPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* HP bar shine */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
            </motion.div>
          </div>
        </div>

        {/* Traits */}
        {monster.traits.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {monster.traits.map((trait) => {
              const cfg = traitConfig[trait];
              return (
                <span
                  key={trait}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium border border-current/30 ${cfg.color}`}
                >
                  {cfg.emoji} {cfg.label}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
