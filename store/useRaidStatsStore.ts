import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RaidBadge {
  id: string;
  icon: string;
  name: string;
  description: string;
}

export interface RaidStats {
  totalRaidsCompleted: number;
  totalVictories: number;
  bossesDefeated: string[]; // monster IDs of defeated bosses
  totalDamageDealt: number;
  maxCombo: number;
  soloVictories: number;
  multiVictories: number;
  perfectRaids: number; // 100% accuracy
  fastClears: number; // under 60 seconds
}

export const RAID_BADGES: RaidBadge[] = [
  // Milestones
  { id: 'raid_first', icon: '\u{1F5E1}\uFE0F', name: '\uCCA8 \uB808\uC774\uB4DC', description: '\uCCA8 \uBC88\uC9F8 \uB808\uC774\uB4DC\uB97C \uC644\uB8CC\uD588\uC5B4\uC694!' },
  { id: 'raid_5', icon: '\u2694\uFE0F', name: '\uB808\uC774\uB4DC \uD5CC\uD130', description: '\uB808\uC774\uB4DC 5\uD68C \uC644\uB8CC!' },
  { id: 'raid_10', icon: '\u{1F3C6}', name: '\uB808\uC774\uB4DC \uB9C8\uC2A4\uD130', description: '\uB808\uC774\uB4DC 10\uD68C \uC644\uB8CC!' },
  { id: 'raid_25', icon: '\u{1F451}', name: '\uB808\uC774\uB4DC \uC655', description: '\uB808\uC774\uB4DC 25\uD68C \uC644\uB8CC!' },
  // Victory milestones
  { id: 'victory_first', icon: '\u{1F389}', name: '\uCCA8 \uC2B9\uB9AC', description: '\uCCA8 \uBC88\uC9F8 \uBAAC\uC2A4\uD130\uB97C \uCC98\uCE58\uD588\uC5B4\uC694!' },
  { id: 'victory_10', icon: '\u{1F4AA}', name: '\uBAAC\uC2A4\uD130 \uD0AC\uB7EC', description: '\uBAAC\uC2A4\uD130 10\uB9C8\uB9AC \uCC98\uCE58!' },
  { id: 'victory_25', icon: '\u{1F531}', name: '\uBAAC\uC2A4\uD130 \uC2AC\uB808\uC774\uC5B4', description: '\uBAAC\uC2A4\uD130 25\uB9C8\uB9AC \uCC98\uCE58!' },
  // Accuracy
  { id: 'perfect_raid', icon: '\u{1F3AF}', name: '\uC644\uBCBD\uD55C \uB808\uC774\uB4DC', description: '\uB808\uC774\uB4DC\uC5D0\uC11C 100% \uC815\uD655\uB3C4 \uB2EC\uC131!' },
  { id: 'perfect_raid_3', icon: '\u{1F48E}', name: '\uB2E4\uC774\uC544\uBAAC\uB4DC \uB808\uC774\uB4DC', description: '\uD37C\uD399\uD2B8 \uB808\uC774\uB4DC 3\uD68C \uB2EC\uC131!' },
  // Combo
  { id: 'combo_5', icon: '\u{1F525}', name: '\uCF64\uBCF4 \uD30C\uC774\uD130', description: '5\uCF64\uBCF4 \uB2EC\uC131!' },
  { id: 'combo_10', icon: '\u{1F4A5}', name: '\uCF64\uBCF4 \uB9C8\uC2A4\uD130', description: '10\uCF64\uBCF4 \uB2EC\uC131!' },
  { id: 'combo_15', icon: '\u26A1', name: '\uCF64\uBCF4\uC758 \uC2E0', description: '15\uCF64\uBCF4 \uB2EC\uC131!' },
  // Boss clears
  { id: 'boss_forest', icon: '\u{1F332}', name: '\uC232\uC758 \uC218\uD638\uC790', description: '\uB098\uBB34 \uACE8\uB818\uC744 \uCC98\uCE58\uD588\uC5B4\uC694!' },
  { id: 'boss_ice', icon: '\u2744\uFE0F', name: '\uC5BC\uC74C \uC815\uBCF5\uC790', description: '\uC5BC\uC74C \uC5EC\uC655\uC744 \uCC98\uCE58\uD588\uC5B4\uC694!' },
  { id: 'boss_volcano', icon: '\u{1F30B}', name: '\uD654\uC0B0 \uD0D0\uD5D8\uAC00', description: '\uD654\uC5FC\uC655\uC744 \uCC98\uCE58\uD588\uC5B4\uC694!' },
  { id: 'boss_haunted', icon: '\u{1F47B}', name: '\uC5B4\uB460\uC758 \uC815\uBCF5\uC790', description: '\uC5B4\uB460\uC758 \uAD70\uC8FC\uB97C \uCC98\uCE58\uD588\uC5B4\uC694!' },
  { id: 'boss_all', icon: '\u{1F409}', name: '\uB4DC\uB798\uACE4 \uC2AC\uB808\uC774\uC5B4', description: '\uBAA8\uB4E0 \uC6D4\uB4DC \uBCF4\uC2A4\uB97C \uCC98\uCE58\uD588\uC5B4\uC694!' },
  // Mode-specific
  { id: 'solo_first', icon: '\u{1F3AE}', name: '\uC194\uB85C \uD50C\uB808\uC774\uC5B4', description: '\uC194\uB85C \uB808\uC774\uB4DC \uCCA8 \uC2B9\uB9AC!' },
  { id: 'solo_10', icon: '\u{1F3C5}', name: '\uACE0\uB3C5\uD55C \uC601\uC6C5', description: '\uC194\uB85C \uB808\uC774\uB4DC 10\uD68C \uC2B9\uB9AC!' },
  { id: 'multi_first', icon: '\u{1F91D}', name: '\uD300\uC6CC\uD06C', description: '\uBA40\uD2F0\uD50C\uB808\uC774 \uB808\uC774\uB4DC \uCCA8 \uC2B9\uB9AC!' },
  // Speed
  { id: 'fast_clear', icon: '\u23F1\uFE0F', name: '\uC2A4\uD53C\uB4DC \uD074\uB9AC\uC5B4', description: '60\uCD08 \uC774\uB0B4\uC5D0 \uB808\uC774\uB4DC \uD074\uB9AC\uC5B4!' },
  { id: 'fast_clear_3', icon: '\u{1F680}', name: '\uBC88\uAC1C \uD074\uB9AC\uC5B4', description: '\uC2A4\uD53C\uB4DC \uD074\uB9AC\uC5B4 3\uD68C \uB2EC\uC131!' },
  // Damage
  { id: 'damage_500', icon: '\u{1F4A5}', name: '\uB370\uBBF8\uC9C0 \uB51C\uB7EC', description: '\uD55C \uB808\uC774\uB4DC\uC5D0\uC11C 500 \uB370\uBBF8\uC9C0!' },
  { id: 'damage_1000', icon: '\u2604\uFE0F', name: '\uD3ED\uBC1C \uB370\uBBF8\uC9C0', description: '\uD55C \uB808\uC774\uB4DC\uC5D0\uC11C 1000 \uB370\uBBF8\uC9C0!' },
  { id: 'total_damage_5000', icon: '\u{1F31F}', name: '\uB204\uC801 \uD30C\uAD34\uC790', description: '\uCD1D \uB204\uC801 \uB370\uBBF8\uC9C0 5000 \uB2EC\uC131!' },
];

// Badge condition checker
function checkBadgeCondition(badgeId: string, stats: RaidStats): boolean {
  switch (badgeId) {
    case 'raid_first': return stats.totalRaidsCompleted >= 1;
    case 'raid_5': return stats.totalRaidsCompleted >= 5;
    case 'raid_10': return stats.totalRaidsCompleted >= 10;
    case 'raid_25': return stats.totalRaidsCompleted >= 25;
    case 'victory_first': return stats.totalVictories >= 1;
    case 'victory_10': return stats.totalVictories >= 10;
    case 'victory_25': return stats.totalVictories >= 25;
    case 'perfect_raid': return stats.perfectRaids >= 1;
    case 'perfect_raid_3': return stats.perfectRaids >= 3;
    case 'combo_5': return stats.maxCombo >= 5;
    case 'combo_10': return stats.maxCombo >= 10;
    case 'combo_15': return stats.maxCombo >= 15;
    case 'boss_forest': return stats.bossesDefeated.includes('tree_golem');
    case 'boss_ice': return stats.bossesDefeated.includes('ice_queen');
    case 'boss_volcano': return stats.bossesDefeated.includes('flame_king');
    case 'boss_haunted': return stats.bossesDefeated.includes('dark_lord');
    case 'boss_all': return ['tree_golem', 'ice_queen', 'flame_king', 'dark_lord'].every(id => stats.bossesDefeated.includes(id));
    case 'solo_first': return stats.soloVictories >= 1;
    case 'solo_10': return stats.soloVictories >= 10;
    case 'multi_first': return stats.multiVictories >= 1;
    case 'fast_clear': return stats.fastClears >= 1;
    case 'fast_clear_3': return stats.fastClears >= 3;
    case 'damage_500': return true; // checked at record time
    case 'damage_1000': return true; // checked at record time
    case 'total_damage_5000': return stats.totalDamageDealt >= 5000;
    default: return false;
  }
}

interface RaidStatsState {
  stats: RaidStats;
  earnedRaidBadges: string[];
  newBadges: string[]; // badges earned in the latest raid (for display)
  recordRaidResult: (result: {
    isVictory: boolean;
    monsterId: string;
    isBoss: boolean;
    myDamage: number;
    myCorrect: number;
    myWrong: number;
    maxCombo: number;
    durationSec: number;
    soloMode: boolean;
  }) => void;
  clearNewBadges: () => void;
}

export const useRaidStatsStore = create<RaidStatsState>()(
  persist(
    (set, get) => ({
      stats: {
        totalRaidsCompleted: 0,
        totalVictories: 0,
        bossesDefeated: [],
        totalDamageDealt: 0,
        maxCombo: 0,
        soloVictories: 0,
        multiVictories: 0,
        perfectRaids: 0,
        fastClears: 0,
      },
      earnedRaidBadges: [],
      newBadges: [],

      recordRaidResult: (result) => {
        const { stats, earnedRaidBadges } = get();
        const totalAnswers = result.myCorrect + result.myWrong;
        const accuracy = totalAnswers > 0 ? result.myCorrect / totalAnswers : 0;
        const isPerfect = accuracy === 1 && totalAnswers > 0;
        const isFastClear = result.isVictory && result.durationSec <= 60;

        const newStats: RaidStats = {
          totalRaidsCompleted: stats.totalRaidsCompleted + 1,
          totalVictories: stats.totalVictories + (result.isVictory ? 1 : 0),
          bossesDefeated: result.isVictory && result.isBoss && !stats.bossesDefeated.includes(result.monsterId)
            ? [...stats.bossesDefeated, result.monsterId]
            : stats.bossesDefeated,
          totalDamageDealt: stats.totalDamageDealt + result.myDamage,
          maxCombo: Math.max(stats.maxCombo, result.maxCombo),
          soloVictories: stats.soloVictories + (result.isVictory && result.soloMode ? 1 : 0),
          multiVictories: stats.multiVictories + (result.isVictory && !result.soloMode ? 1 : 0),
          perfectRaids: stats.perfectRaids + (isPerfect ? 1 : 0),
          fastClears: stats.fastClears + (isFastClear ? 1 : 0),
        };

        // Check for newly earned badges
        const newlyEarned: string[] = [];
        RAID_BADGES.forEach(badge => {
          if (!earnedRaidBadges.includes(badge.id)) {
            let earned = false;
            // Special per-raid checks
            if (badge.id === 'damage_500') earned = result.myDamage >= 500;
            else if (badge.id === 'damage_1000') earned = result.myDamage >= 1000;
            else earned = checkBadgeCondition(badge.id, newStats);

            if (earned) newlyEarned.push(badge.id);
          }
        });

        set({
          stats: newStats,
          earnedRaidBadges: [...earnedRaidBadges, ...newlyEarned],
          newBadges: newlyEarned,
        });
      },

      clearNewBadges: () => set({ newBadges: [] }),
    }),
    {
      name: 'raid-stats-storage',
      partialize: (state) => ({
        stats: state.stats,
        earnedRaidBadges: state.earnedRaidBadges,
      }),
    }
  )
);
