'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Badge, BADGES } from '@/store/useQuizStore';

interface BadgeModalProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
  isEarned: boolean;
}

export function BadgeModal({ badge, isOpen, onClose, isEarned }: BadgeModalProps) {
  if (!badge) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-xs"
          >
            <div className={`rounded-2xl border p-6 text-center ${
              isEarned
                ? 'bg-slate-900 border-yellow-500/50'
                : 'bg-slate-900 border-slate-700'
            }`}>
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Badge icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className={`text-6xl mb-4 ${!isEarned ? 'grayscale opacity-50' : ''}`}
              >
                {badge.icon}
              </motion.div>

              {/* Badge name */}
              <h3 className={`text-xl font-black mb-2 ${
                isEarned ? 'text-yellow-400' : 'text-slate-500'
              }`}>
                {badge.name}
              </h3>

              {/* Badge description */}
              <p className={`text-sm ${isEarned ? 'text-slate-300' : 'text-slate-500'}`}>
                {badge.description}
              </p>

              {/* Status */}
              <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                isEarned
                  ? 'bg-green-900/50 text-green-400 border border-green-700'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
                {isEarned ? '✓ 획득 완료!' : '🔒 미획득'}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface BadgeGridProps {
  earnedBadges: string[];
  onBadgeClick: (badge: Badge) => void;
}

export function BadgeGrid({ earnedBadges, onBadgeClick }: BadgeGridProps) {
  // Sort: earned first, then unearned
  const sortedBadges = [...BADGES].sort((a, b) => {
    const aEarned = earnedBadges.includes(a.id);
    const bEarned = earnedBadges.includes(b.id);
    if (aEarned && !bEarned) return -1;
    if (!aEarned && bEarned) return 1;
    return 0;
  });

  return (
    <div className="grid grid-cols-5 gap-2">
      {sortedBadges.map(badge => {
        const isEarned = earnedBadges.includes(badge.id);
        return (
          <button
            key={badge.id}
            onClick={() => onBadgeClick(badge)}
            className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
              isEarned
                ? 'bg-slate-800 hover:bg-slate-700 border border-slate-600'
                : 'bg-slate-900 border border-slate-800 grayscale opacity-40 hover:opacity-60'
            }`}
            title={badge.name}
          >
            {badge.icon}
          </button>
        );
      })}
    </div>
  );
}
