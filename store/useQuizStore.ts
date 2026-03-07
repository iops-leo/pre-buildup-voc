import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Vocabulary, Unit, Lesson } from '@/data/vocabulary';

export type QuizMode = 'korean_to_english' | 'english_to_korean' | 'spelling' | 'speaking' | 'writing';

export interface QuizHistoryEntry {
    id: string;
    date: string;
    bookTitle: string | null;
    unitNumber: number | null;
    lessonNumber: number | string | null;
    mode: QuizMode;
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
    durationSeconds: number;
    xpGained?: number;
}

export interface LessonProgress {
    bestScore: number;
    lastPlayedAt: number;
}

// Level Titles & Evolution
export const LEVEL_TITLES = [
    { minLevel: 1, title: 'Baby Egg', icon: '🥚', color: 'text-slate-200' },
    { minLevel: 2, title: 'Wobbly Chick', icon: '🐣', color: 'text-yellow-300' },
    { minLevel: 5, title: 'Smart Owl', icon: '🦉', color: 'text-blue-300' },
    { minLevel: 10, title: 'Fast Eagle', icon: '🦅', color: 'text-amber-400' },
    { minLevel: 20, title: 'Wise Wizard', icon: '🧙‍♂️', color: 'text-purple-400' },
    { minLevel: 30, title: 'Voca King', icon: '👑', color: 'text-rose-400' },
    { minLevel: 50, title: 'Legendary Dragon', icon: '🐉', color: 'text-red-500' },
    { minLevel: 70, title: 'Cosmic Voyager', icon: '🚀', color: 'text-indigo-400' },
    { minLevel: 100, title: 'God of Words', icon: '🌟', color: 'text-yellow-200' },
];

export const getLevelTitle = (level: number) => {
    return LEVEL_TITLES.slice().reverse().find(t => level >= t.minLevel) || LEVEL_TITLES[0];
};

export interface Badge {
    id: string;
    icon: string;
    name: string;
    description: string;
    condition: (state: QuizState, history: QuizHistoryEntry) => boolean;
}

export const BADGES: Badge[] = [
    // 시작 & 마일스톤
    {
        id: 'first_step',
        icon: '🥚',
        name: '첫 걸음',
        description: '첫 번째 퀴즈를 완료했어요!',
        condition: (state, history) => state.quizHistory.length === 1
    },
    {
        id: 'quiz_10',
        icon: '📚',
        name: '열공생',
        description: '퀴즈 10회 완료!',
        condition: (state) => state.quizHistory.length >= 10
    },
    {
        id: 'quiz_50',
        icon: '📖',
        name: '단어 헌터',
        description: '퀴즈 50회 완료!',
        condition: (state) => state.quizHistory.length >= 50
    },
    {
        id: 'quiz_100',
        icon: '🏅',
        name: '백전노장',
        description: '퀴즈 100회 완료!',
        condition: (state) => state.quizHistory.length >= 100
    },

    // 점수 관련
    {
        id: 'perfect_score',
        icon: '💯',
        name: '백점 만점',
        description: '퀴즈에서 100점을 맞았어요!',
        condition: (state, history) => history.percentage === 100
    },
    {
        id: 'perfect_3',
        icon: '🌟',
        name: '완벽주의자',
        description: '100점 3회 달성!',
        condition: (state) => state.quizHistory.filter(h => h.percentage === 100).length >= 3
    },
    {
        id: 'perfect_10',
        icon: '✨',
        name: '만점 수집가',
        description: '100점 10회 달성!',
        condition: (state) => state.quizHistory.filter(h => h.percentage === 100).length >= 10
    },

    // 속도 관련
    {
        id: 'speed_racer',
        icon: '⚡',
        name: '스피드 레이서',
        description: '30초 안에 퀴즈를 완료했어요!',
        condition: (state, history) => history.durationSeconds <= 30 && history.correctAnswers >= 5
    },
    {
        id: 'lightning',
        icon: '🚀',
        name: '번개손',
        description: '20초 안에 퀴즈 완료!',
        condition: (state, history) => history.durationSeconds <= 20 && history.correctAnswers >= 5
    },

    // 스트릭 관련
    {
        id: 'streak_3',
        icon: '🔥',
        name: '작심삼일 탈출',
        description: '3일 연속으로 학습했어요!',
        condition: (state) => state.streak >= 3
    },
    {
        id: 'streak_7',
        icon: '🔥',
        name: '일주일 불꽃',
        description: '7일 연속 학습!',
        condition: (state) => state.streak >= 7
    },
    {
        id: 'streak_14',
        icon: '💪',
        name: '2주 마라톤',
        description: '14일 연속 학습!',
        condition: (state) => state.streak >= 14
    },
    {
        id: 'streak_30',
        icon: '🏆',
        name: '한 달의 기적',
        description: '30일 연속 학습!',
        condition: (state) => state.streak >= 30
    },

    // 레벨 관련
    {
        id: 'level_5',
        icon: '🎓',
        name: '모범생',
        description: '레벨 5를 달성했어요!',
        condition: (state) => state.level >= 5
    },
    {
        id: 'level_10',
        icon: '🦅',
        name: '고수의 길',
        description: '레벨 10 달성!',
        condition: (state) => state.level >= 10
    },
    {
        id: 'level_20',
        icon: '🧙‍♂️',
        name: '단어 마법사',
        description: '레벨 20 달성!',
        condition: (state) => state.level >= 20
    },
    {
        id: 'level_50',
        icon: '🐉',
        name: '전설의 시작',
        description: '레벨 50 달성!',
        condition: (state) => state.level >= 50
    },

    // 모드별 배지
    {
        id: 'spelling_master',
        icon: '✍️',
        name: '스펠링 마스터',
        description: '스펠링 모드 10회 완료!',
        condition: (state) => state.quizHistory.filter(h => h.mode === 'spelling').length >= 10
    },
    {
        id: 'speaking_master',
        icon: '🎤',
        name: '말하기 달인',
        description: '말하기 모드 10회 완료!',
        condition: (state) => state.quizHistory.filter(h => h.mode === 'speaking').length >= 10
    },
    {
        id: 'writing_master',
        icon: '📝',
        name: '셀프시험 왕',
        description: '셀프시험 모드 10회 완료!',
        condition: (state) => state.quizHistory.filter(h => h.mode === 'writing').length >= 10
    },
    {
        id: 'all_rounder',
        icon: '🎯',
        name: '올라운더',
        description: '모든 모드를 각각 5회 이상 완료!',
        condition: (state) => {
            const modes = ['korean_to_english', 'english_to_korean', 'spelling', 'speaking', 'writing'] as QuizMode[];
            return modes.every(mode => state.quizHistory.filter(h => h.mode === mode).length >= 5);
        }
    },

    // 복습 관련
    {
        id: 'reviewer',
        icon: '🔄',
        name: '복습왕',
        description: '틀린 단어 10개를 다시 맞췄어요!',
        condition: (state) => {
            // 복습 퀴즈(유닛/레슨 없음)에서 맞춘 횟수 체크
            const reviewQuizzes = state.quizHistory.filter(h => h.unitNumber === null);
            return reviewQuizzes.reduce((acc, h) => acc + h.correctAnswers, 0) >= 10;
        }
    },
    {
        id: 'clean_slate',
        icon: '🧹',
        name: '완전 정복',
        description: '복습 목록을 비웠어요!',
        condition: (state) => state.quizHistory.length >= 5 && state.persistentWrongAnswers.length === 0
    },

    // XP 관련
    {
        id: 'xp_1000',
        icon: '💎',
        name: 'XP 수집가',
        description: '1,000 XP 달성!',
        condition: (state) => state.xp >= 1000
    },
    {
        id: 'xp_5000',
        icon: '💠',
        name: 'XP 부자',
        description: '5,000 XP 달성!',
        condition: (state) => state.xp >= 5000
    },
    {
        id: 'xp_10000',
        icon: '👑',
        name: 'XP 왕',
        description: '10,000 XP 달성!',
        condition: (state) => state.xp >= 10000
    },

    // 재미/활동 관련 (New)
    {
        id: 'scholar',
        icon: '📖',
        name: '하루 3번 공부',
        description: '하루에 퀴즈를 3번 완료했어요!',
        condition: (state, history) => {
            const today = new Date(history.date).toDateString();
            const todayCount = state.quizHistory.filter(h => new Date(h.date).toDateString() === today).length;
            return todayCount >= 3;
        }
    },
    {
        id: 'enthusiast',
        icon: '📚',
        name: '하루 5번 공부',
        description: '하루에 퀴즈를 5번 완료했어요!',
        condition: (state, history) => {
            const today = new Date(history.date).toDateString();
            const todayCount = state.quizHistory.filter(h => new Date(h.date).toDateString() === today).length;
            return todayCount >= 5;
        }
    },
    {
        id: 'turtle',
        icon: '🐢',
        name: '천천히 꼼꼼하게',
        description: '3분 이상 걸려서 100점을 맞았어요!',
        condition: (state, history) => history.percentage === 100 && history.durationSeconds >= 180
    },
    {
        id: 'lightning_fast',
        icon: '⚡',
        name: '번개처럼 빠르게',
        description: '20초 안에 100점을 맞았어요!',
        condition: (state, history) => history.percentage === 100 && history.durationSeconds <= 20
    },

    // 시간/습관 관련 (New)
    {
        id: 'early_bird',
        icon: '🌅',
        name: '얼리 버드',
        description: '오전 5시 ~ 9시 사이에 학습했어요!',
        condition: (state, history) => {
            const hour = new Date(history.date).getHours();
            return hour >= 5 && hour < 9;
        }
    },
    {
        id: 'night_owl',
        icon: '🦉',
        name: '올빼미족',
        description: '밤 10시 ~ 새벽 2시 사이에 학습했어요!',
        condition: (state, history) => {
            const hour = new Date(history.date).getHours();
            return hour >= 22 || hour < 2;
        }
    },
    {
        id: 'weekend_warrior',
        icon: '📅',
        name: '주말 전사',
        description: '주말(토/일)에 학습했어요!',
        condition: (state, history) => {
            const day = new Date(history.date).getDay();
            return day === 0 || day === 6;
        }
    },
    {
        id: 'speed_demon',
        icon: '⚡',
        name: '스피드 데몬',
        description: '1분 안에 100점을 맞았어요!',
        condition: (state, history) => history.percentage === 100 && history.durationSeconds <= 60
    },
    {
        id: 'focus_master',
        icon: '🧘',
        name: '집중의 신',
        description: '한 번의 퀴즈에 15분 이상 투자했어요!',
        condition: (state, history) => history.durationSeconds >= 900
    },
    {
        id: 'writing_perfect',
        icon: '✍️',
        name: '받아쓰기 장인',
        description: '쓰기 모드에서 100점을 맞았어요!',
        condition: (state, history) => history.mode === 'writing' && history.percentage === 100
    },
    {
        id: 'comeback_kid',
        icon: '👋',
        name: '돌아온 탕아',
        description: '3일 만에 다시 돌아왔어요!',
        condition: (state) => {
            if (state.quizHistory.length < 2) return false;
            const current = new Date(state.quizHistory[0].date);
            const prev = new Date(state.quizHistory[1].date);
            const diffMs = current.getTime() - prev.getTime();
            const days = diffMs / (1000 * 60 * 60 * 24);
            return days >= 3;
        }
    },

    // 재미있는 특수 뱃지들
    {
        id: 'lucky_7',
        icon: '🎰',
        name: '럭키 세븐',
        description: '점수가 77%였어요!',
        condition: (state, history) => history.percentage === 77
    },
    {
        id: 'triple_7',
        icon: '🍀',
        name: '대박 777',
        description: 'XP가 777을 넘었어요!',
        condition: (state) => state.xp >= 777 && state.xp < 1000
    },
    {
        id: 'half_half',
        icon: '⚖️',
        name: '반반 치킨',
        description: '정확히 50%를 맞았어요!',
        condition: (state, history) => history.percentage === 50
    },
    {
        id: 'almost_perfect',
        icon: '😭',
        name: '아깝다!',
        description: '한 문제만 틀렸어요...',
        condition: (state, history) => history.totalQuestions > 5 && history.correctAnswers === history.totalQuestions - 1
    },
    {
        id: 'close_call',
        icon: '😅',
        name: '아슬아슬',
        description: '70% 딱 맞춰서 통과!',
        condition: (state, history) => history.percentage === 70
    },
    {
        id: 'zero_hero',
        icon: '💀',
        name: '다시 태어나자',
        description: '0점을 경험했어요... 괜찮아!',
        condition: (state, history) => history.percentage === 0 && history.totalQuestions >= 5
    },
    {
        id: 'first_blood',
        icon: '🩸',
        name: '첫 피',
        description: '첫 문제를 틀렸지만 결국 100점!',
        condition: (state, history) => history.percentage === 100 && history.totalQuestions >= 5
    },
    {
        id: 'marathon',
        icon: '🏃',
        name: '마라톤 러너',
        description: '하루에 10개 퀴즈 완료!',
        condition: (state, history) => {
            const today = new Date(history.date).toDateString();
            const todayCount = state.quizHistory.filter(h => new Date(h.date).toDateString() === today).length;
            return todayCount >= 10;
        }
    },
    {
        id: 'grinder',
        icon: '⚙️',
        name: '그라인더',
        description: '하루에 20개 퀴즈 완료!',
        condition: (state, history) => {
            const today = new Date(history.date).toDateString();
            const todayCount = state.quizHistory.filter(h => new Date(h.date).toDateString() === today).length;
            return todayCount >= 20;
        }
    },
    {
        id: 'lunch_break',
        icon: '🍱',
        name: '점심시간 공부',
        description: '12시~1시 사이에 학습했어요!',
        condition: (state, history) => {
            const hour = new Date(history.date).getHours();
            return hour === 12;
        }
    },
    {
        id: 'midnight',
        icon: '🌙',
        name: '자정의 학생',
        description: '자정(0시)에 공부했어요!',
        condition: (state, history) => {
            const hour = new Date(history.date).getHours();
            return hour === 0;
        }
    },
    {
        id: 'new_year',
        icon: '🎆',
        name: '새해 첫 공부',
        description: '1월 1일에 공부했어요!',
        condition: (state, history) => {
            const date = new Date(history.date);
            return date.getMonth() === 0 && date.getDate() === 1;
        }
    },
    {
        id: 'christmas',
        icon: '🎄',
        name: '크리스마스 공부',
        description: '12월 25일에도 공부했어요!',
        condition: (state, history) => {
            const date = new Date(history.date);
            return date.getMonth() === 11 && date.getDate() === 25;
        }
    },
    {
        id: 'halloween',
        icon: '🎃',
        name: '할로윈 학습',
        description: '10월 31일에 공부했어요!',
        condition: (state, history) => {
            const date = new Date(history.date);
            return date.getMonth() === 9 && date.getDate() === 31;
        }
    },
    {
        id: 'valentines',
        icon: '💕',
        name: '발렌타인 공부',
        description: '2월 14일에 공부했어요!',
        condition: (state, history) => {
            const date = new Date(history.date);
            return date.getMonth() === 1 && date.getDate() === 14;
        }
    },
    {
        id: 'childrens_day',
        icon: '🎈',
        name: '어린이날 학습',
        description: '5월 5일에도 공부했어요!',
        condition: (state, history) => {
            const date = new Date(history.date);
            return date.getMonth() === 4 && date.getDate() === 5;
        }
    },
    {
        id: 'friday_13',
        icon: '👻',
        name: '13일의 금요일',
        description: '13일의 금요일에 공부했어요!',
        condition: (state, history) => {
            const date = new Date(history.date);
            return date.getDay() === 5 && date.getDate() === 13;
        }
    },
    {
        id: 'word_destroyer',
        icon: '💥',
        name: '단어 파괴자',
        description: '총 500문제 정답!',
        condition: (state) => state.quizHistory.reduce((acc, h) => acc + h.correctAnswers, 0) >= 500
    },
    {
        id: 'word_terminator',
        icon: '🤖',
        name: '터미네이터',
        description: '총 1000문제 정답!',
        condition: (state) => state.quizHistory.reduce((acc, h) => acc + h.correctAnswers, 0) >= 1000
    },
    {
        id: 'perfectionist',
        icon: '💎',
        name: '퍼펙셔니스트',
        description: '100점 20회 달성!',
        condition: (state) => state.quizHistory.filter(h => h.percentage === 100).length >= 20
    },
    {
        id: 'diamond_hands',
        icon: '💠',
        name: '다이아몬드 핸드',
        description: '50일 연속 학습!',
        condition: (state) => state.streak >= 50
    },
    {
        id: 'centurion',
        icon: '🏛️',
        name: '센추리온',
        description: '100일 연속 학습!',
        condition: (state) => state.streak >= 100
    },
    {
        id: 'speaking_star',
        icon: '⭐',
        name: '말하기 스타',
        description: '말하기 모드에서 100점!',
        condition: (state, history) => history.mode === 'speaking' && history.percentage === 100
    },
    {
        id: 'spelling_ace',
        icon: '🅰️',
        name: '스펠링 에이스',
        description: '스펠링 모드에서 100점!',
        condition: (state, history) => history.mode === 'spelling' && history.percentage === 100
    },
    {
        id: 'quick_learner',
        icon: '🧠',
        name: '빠른 학습자',
        description: '첫 퀴즈에서 90% 이상!',
        condition: (state, history) => state.quizHistory.length === 1 && history.percentage >= 90
    },
    {
        id: 'unstoppable',
        icon: '🚂',
        name: '멈출 수 없어',
        description: '5개 퀴즈 연속 80% 이상!',
        condition: (state) => {
            if (state.quizHistory.length < 5) return false;
            return state.quizHistory.slice(0, 5).every(h => h.percentage >= 80);
        }
    },
    {
        id: 'legend',
        icon: '👑',
        name: '레전드',
        description: '10개 퀴즈 연속 100점!',
        condition: (state) => {
            if (state.quizHistory.length < 10) return false;
            return state.quizHistory.slice(0, 10).every(h => h.percentage === 100);
        }
    },

    // ===== 몬스터 레이드 =====
    {
        id: 'raid_first',
        icon: '🗡️',
        name: '첫 레이드',
        description: '첫 번째 레이드를 완료했어요!',
        condition: (state) => state.raidCount >= 1
    },
    {
        id: 'raid_5',
        icon: '⚔️',
        name: '레이드 헌터',
        description: '레이드 5회 완료!',
        condition: (state) => state.raidCount >= 5
    },
    {
        id: 'raid_10',
        icon: '🏆',
        name: '레이드 마스터',
        description: '레이드 10회 완료!',
        condition: (state) => state.raidCount >= 10
    },
    {
        id: 'raid_25',
        icon: '🎖️',
        name: '레이드 왕',
        description: '레이드 25회 완료!',
        condition: (state) => state.raidCount >= 25
    },
    {
        id: 'victory_first',
        icon: '🎉',
        name: '첫 승리',
        description: '첫 번째 몬스터를 처치했어요!',
        condition: (state) => state.raidVictories >= 1
    },
    {
        id: 'victory_10',
        icon: '💪',
        name: '몬스터 킬러',
        description: '몬스터 10마리 처치!',
        condition: (state) => state.raidVictories >= 10
    },
    {
        id: 'victory_25',
        icon: '🔱',
        name: '몬스터 슬레이어',
        description: '몬스터 25마리 처치!',
        condition: (state) => state.raidVictories >= 25
    },
    {
        id: 'raid_perfect',
        icon: '🎯',
        name: '완벽한 레이드',
        description: '레이드에서 100% 정확도 달성!',
        condition: (state) => state.raidPerfectCount >= 1
    },
    {
        id: 'raid_perfect_3',
        icon: '💎',
        name: '다이아몬드 레이드',
        description: '퍼펙트 레이드 3회 달성!',
        condition: (state) => state.raidPerfectCount >= 3
    },
    {
        id: 'raid_combo_5',
        icon: '🔥',
        name: '콤보 파이터',
        description: '레이드에서 5콤보 달성!',
        condition: (state) => state.raidMaxCombo >= 5
    },
    {
        id: 'raid_combo_10',
        icon: '💥',
        name: '콤보 마스터',
        description: '레이드에서 10콤보 달성!',
        condition: (state) => state.raidMaxCombo >= 10
    },
    {
        id: 'raid_combo_15',
        icon: '⚡',
        name: '콤보의 신',
        description: '레이드에서 15콤보 달성!',
        condition: (state) => state.raidMaxCombo >= 15
    },
    {
        id: 'boss_forest',
        icon: '🌲',
        name: '숲의 수호자',
        description: '나무 골렘을 처치했어요!',
        condition: (state) => state.raidBossesDefeated.includes('tree_golem')
    },
    {
        id: 'boss_ice',
        icon: '❄️',
        name: '얼음 정복자',
        description: '얼음 여왕을 처치했어요!',
        condition: (state) => state.raidBossesDefeated.includes('ice_queen')
    },
    {
        id: 'boss_volcano',
        icon: '🌋',
        name: '화산 탐험가',
        description: '화염왕을 처치했어요!',
        condition: (state) => state.raidBossesDefeated.includes('flame_king')
    },
    {
        id: 'boss_haunted',
        icon: '👻',
        name: '어둠의 정복자',
        description: '어둠의 군주를 처치했어요!',
        condition: (state) => state.raidBossesDefeated.includes('dark_lord')
    },
    {
        id: 'boss_all',
        icon: '🐲',
        name: '드래곤 슬레이어',
        description: '모든 월드 보스를 처치했어요!',
        condition: (state) => ['tree_golem', 'ice_queen', 'flame_king', 'dark_lord'].every(id => state.raidBossesDefeated.includes(id))
    },
    {
        id: 'solo_first',
        icon: '🎮',
        name: '솔로 플레이어',
        description: '솔로 레이드 첫 승리!',
        condition: (state) => state.raidSoloVictories >= 1
    },
    {
        id: 'solo_10',
        icon: '🏅',
        name: '고독한 영웅',
        description: '솔로 레이드 10회 승리!',
        condition: (state) => state.raidSoloVictories >= 10
    },
    {
        id: 'multi_first',
        icon: '🤝',
        name: '팀워크',
        description: '멀티플레이 레이드 첫 승리!',
        condition: (state) => state.raidMultiVictories >= 1
    },
    {
        id: 'raid_fast',
        icon: '⏱️',
        name: '스피드 클리어',
        description: '60초 이내에 레이드 클리어!',
        condition: (state) => state.raidFastClears >= 1
    },
    {
        id: 'raid_fast_3',
        icon: '🚀',
        name: '번개 클리어',
        description: '스피드 클리어 3회 달성!',
        condition: (state) => state.raidFastClears >= 3
    },
    {
        id: 'raid_damage_5000',
        icon: '☄️',
        name: '누적 파괴자',
        description: '레이드 총 누적 데미지 5000 달성!',
        condition: (state) => state.raidTotalDamage >= 5000
    },
    {
        id: 'raid_damage_10000',
        icon: '🌟',
        name: '전설의 딜러',
        description: '레이드 총 누적 데미지 10000 달성!',
        condition: (state) => state.raidTotalDamage >= 10000
    },
];

interface QuizState {
    // Current Quiz State
    currentBookTitle: string | null;
    currentUnit: Unit | null;
    currentLesson: Lesson | null;
    quizActive: boolean;
    previewActive: boolean;
    mode: QuizMode;
    questions: Vocabulary[];
    currentQuestionIndex: number;
    score: number;
    correctAnswers: number;
    wrongAnswers: Vocabulary[];
    persistentWrongAnswers: Vocabulary[];
    startTime: number;
    quizHistory: QuizHistoryEntry[];
    lessonProgress: Record<string, LessonProgress>;

    // Gamification State
    xp: number;
    level: number;
    streak: number;
    lastStudyDate: string | null;
    earnedBadges: string[]; // Badge IDs

    // Raid Stats (persisted)
    raidCount: number;
    raidVictories: number;
    raidBossesDefeated: string[];
    raidTotalDamage: number;
    raidMaxCombo: number;
    raidSoloVictories: number;
    raidMultiVictories: number;
    raidPerfectCount: number;
    raidFastClears: number;

    // Actions
    startQuiz: (bookTitle: string, unit: Unit, lesson: Lesson, mode: QuizMode) => void;
    startReviewQuiz: (mode: QuizMode) => void;
    startPreview: (bookTitle: string, unit: Unit, lesson: Lesson) => void;
    retryQuiz: () => void;
    submitAnswer: (isCorrect: boolean, word: Vocabulary) => void;
    nextQuestion: () => void;
    endQuiz: () => void;
    resetQuiz: () => void;
    clearReviewList: () => void;
    clearHistory: () => void;

    // Gamification Actions
    addXp: (amount: number) => void;
    checkAchievements: (historyEntry: QuizHistoryEntry) => void;
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
    }) => string[]; // returns newly earned badge IDs
}

export const useQuizStore = create<QuizState>()(
    persist(
        (set, get) => ({
            currentBookTitle: null,
            currentUnit: null,
            currentLesson: null,
            quizActive: false,
            previewActive: false,
            mode: 'korean_to_english',
            questions: [],
            currentQuestionIndex: 0,
            score: 0,
            correctAnswers: 0,
            wrongAnswers: [],
            persistentWrongAnswers: [],
            startTime: 0,
            quizHistory: [],
            lessonProgress: {},

            // Gamification Initial State
            xp: 0,
            level: 1,
            streak: 0,
            lastStudyDate: null,
            earnedBadges: [],

            // Raid Stats
            raidCount: 0,
            raidVictories: 0,
            raidBossesDefeated: [],
            raidTotalDamage: 0,
            raidMaxCombo: 0,
            raidSoloVictories: 0,
            raidMultiVictories: 0,
            raidPerfectCount: 0,
            raidFastClears: 0,

            startQuiz: (bookTitle, unit, lesson, mode) => {
                const shuffled = [...lesson.vocabulary].sort(() => Math.random() - 0.5);
                set({
                    currentBookTitle: bookTitle,
                    currentUnit: unit,
                    currentLesson: lesson,
                    quizActive: true,
                    previewActive: false,
                    mode,
                    questions: shuffled,
                    currentQuestionIndex: 0,
                    score: 0,
                    correctAnswers: 0,
                    wrongAnswers: [],
                    startTime: Date.now(),
                });
            },

            startReviewQuiz: (mode) => {
                const wrong = get().persistentWrongAnswers;
                if (wrong.length === 0) return;

                const shuffled = [...wrong].sort(() => Math.random() - 0.5);
                set({
                    currentBookTitle: null,
                    currentUnit: null,
                    currentLesson: null,
                    quizActive: true,
                    previewActive: false,
                    mode,
                    questions: shuffled,
                    currentQuestionIndex: 0,
                    score: 0,
                    correctAnswers: 0,
                    wrongAnswers: [],
                    startTime: Date.now(),
                });
            },

            startPreview: (bookTitle, unit, lesson) => {
                set({
                    currentBookTitle: bookTitle,
                    currentUnit: unit,
                    currentLesson: lesson,
                    previewActive: true,
                    quizActive: false,
                    questions: lesson.vocabulary,
                });
            },

            retryQuiz: () => {
                const state = get();
                if (!state.currentUnit || !state.currentLesson || !state.currentBookTitle) {
                    if (state.persistentWrongAnswers.length > 0) {
                        get().startReviewQuiz(state.mode);
                    }
                    return;
                }
                get().startQuiz(state.currentBookTitle, state.currentUnit, state.currentLesson, state.mode);
            },

            submitAnswer: (isCorrect, word) => {
                set((state) => {
                    const newWrong = isCorrect ? state.wrongAnswers : [...state.wrongAnswers, word];
                    const newPersistent = isCorrect
                        ? state.persistentWrongAnswers
                        : [...state.persistentWrongAnswers, word];

                    const uniquePersistent = Array.from(new Set(newPersistent.map(w => w.word)))
                        .map(w => newPersistent.find(p => p.word === w)!);

                    // 정답 시 persistentWrongAnswers에서 해당 단어 제거
                    let finalPersistent = uniquePersistent;
                    if (isCorrect) {
                        finalPersistent = uniquePersistent.filter(w => w.word !== word.word);
                    }

                    return {
                        correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
                        wrongAnswers: newWrong,
                        persistentWrongAnswers: finalPersistent,
                    };
                });
            },

            nextQuestion: () => {
                set((state) => {
                    if (state.currentQuestionIndex >= state.questions.length - 1) {
                        return { quizActive: false };
                    }
                    return { currentQuestionIndex: state.currentQuestionIndex + 1 };
                });
            },

            endQuiz: () => {
                const state = get();
                const durationSeconds = Math.floor((Date.now() - state.startTime) / 1000);
                const percentage = Math.round((state.correctAnswers / state.questions.length) * 100) || 0;

                // XP Calculation: base 10 per word, bonus for %
                // 셀프시험(writing) 모드는 자기 채점이므로 XP 미지급
                const isWritingMode = state.mode === 'writing';
                const baseXp = isWritingMode ? 0 : state.correctAnswers * 10;
                const bonusXp = isWritingMode ? 0 : (percentage === 100 ? 50 : percentage >= 80 ? 20 : 0);
                const totalXp = baseXp + bonusXp;

                const historyEntry: QuizHistoryEntry = {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    bookTitle: state.currentBookTitle ?? null,
                    unitNumber: state.currentUnit?.unit ?? null,
                    lessonNumber: state.currentLesson?.lesson ?? null,
                    mode: state.mode,
                    totalQuestions: state.questions.length,
                    correctAnswers: state.correctAnswers,
                    percentage,
                    durationSeconds,
                    xpGained: totalXp,
                };

                // Update Streak Logic
                const today = new Date().toDateString();
                const last = state.lastStudyDate ? new Date(state.lastStudyDate).toDateString() : null;

                let newStreak = state.streak;
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                if (today !== last) {
                    if (last === yesterday.toDateString()) {
                        newStreak += 1;
                    } else if (last !== today) {
                        // Reset if gap > 1 day, unless it's the very first time (streak 0)
                        newStreak = 1;
                    }
                }

                // Update State first
                set((s) => {
                    const newState: Partial<QuizState> = {
                        quizActive: false,
                        quizHistory: [historyEntry, ...s.quizHistory].slice(0, 50),
                        lastStudyDate: new Date().toISOString(),
                        streak: newStreak,
                    };

                    // Update Lesson Progress
                    if (state.currentUnit && state.currentLesson && state.currentBookTitle) {
                        // For backward compatibility, original "Pre-Build Up" saves using unit-lesson
                        // Otherwise format as "bookTitle-unit-lesson"
                        const key = state.currentBookTitle === "Pre-Build Up"
                            ? `${state.currentUnit.unit}-${state.currentLesson.lesson}`
                            : `${state.currentBookTitle}-${state.currentUnit.unit}-${state.currentLesson.lesson}`;

                        const prev = s.lessonProgress[key];
                        const newBest = Math.max(prev?.bestScore ?? 0, percentage);

                        newState.lessonProgress = {
                            ...s.lessonProgress,
                            [key]: {
                                bestScore: newBest,
                                lastPlayedAt: Date.now()
                            }
                        };
                    }
                    return newState as QuizState;
                });

                // Add XP and Check Achievements
                get().addXp(totalXp);
                get().checkAchievements(historyEntry);
            },

            resetQuiz: () => {
                set({
                    quizActive: false,
                    previewActive: false,
                    currentBookTitle: null,
                    currentUnit: null,
                    currentLesson: null,
                    questions: [],
                    currentQuestionIndex: 0,
                    score: 0,
                    correctAnswers: 0,
                    wrongAnswers: [],
                });
            },

            clearReviewList: () => set({ persistentWrongAnswers: [] }),
            clearHistory: () => set({ quizHistory: [] }),

            addXp: (amount) => {
                set((state) => {
                    const newXp = state.xp + amount;
                    const newLevel = Math.floor(newXp / 1000) + 1; // Simple Level Formula: 1000 XP per level
                    return { xp: newXp, level: newLevel };
                });
            },

            checkAchievements: (historyEntry) => {
                // Re-fetch state to get the latest values after endQuiz updates
                const state = get();
                const newBadges = [...state.earnedBadges];
                let badgeAdded = false;

                BADGES.forEach(badge => {
                    if (!newBadges.includes(badge.id)) {
                        try {
                            if (badge.condition(state, historyEntry)) {
                                newBadges.push(badge.id);
                                badgeAdded = true;
                            }
                        } catch {
                            // Skip badge if condition throws
                        }
                    }
                });

                if (badgeAdded) {
                    set({ earnedBadges: newBadges });
                }
            },

            recordRaidResult: (result) => {
                const state = get();
                const totalAnswers = result.myCorrect + result.myWrong;
                const isPerfect = totalAnswers > 0 && result.myCorrect === totalAnswers;
                const isFastClear = result.isVictory && result.durationSec <= 60;

                // Update raid stats
                set({
                    raidCount: state.raidCount + 1,
                    raidVictories: state.raidVictories + (result.isVictory ? 1 : 0),
                    raidBossesDefeated: result.isVictory && result.isBoss && !state.raidBossesDefeated.includes(result.monsterId)
                        ? [...state.raidBossesDefeated, result.monsterId]
                        : state.raidBossesDefeated,
                    raidTotalDamage: state.raidTotalDamage + result.myDamage,
                    raidMaxCombo: Math.max(state.raidMaxCombo, result.maxCombo),
                    raidSoloVictories: state.raidSoloVictories + (result.isVictory && result.soloMode ? 1 : 0),
                    raidMultiVictories: state.raidMultiVictories + (result.isVictory && !result.soloMode ? 1 : 0),
                    raidPerfectCount: state.raidPerfectCount + (isPerfect ? 1 : 0),
                    raidFastClears: state.raidFastClears + (isFastClear ? 1 : 0),
                });

                // Check badges
                const updatedState = get();
                const newBadges = [...updatedState.earnedBadges];
                const newlyEarned: string[] = [];

                BADGES.forEach(badge => {
                    if (!newBadges.includes(badge.id)) {
                        try {
                            if (badge.condition(updatedState, {} as QuizHistoryEntry)) {
                                newBadges.push(badge.id);
                                newlyEarned.push(badge.id);
                            }
                        } catch {
                            // Skip badges that require valid historyEntry
                        }
                    }
                });

                if (newlyEarned.length > 0) {
                    set({ earnedBadges: newBadges });
                }

                return newlyEarned;
            },
        }),
        {
            name: 'quiz-storage',
            partialize: (state) => ({
                persistentWrongAnswers: state.persistentWrongAnswers,
                quizHistory: state.quizHistory,
                xp: state.xp,
                level: state.level,
                streak: state.streak,
                lastStudyDate: state.lastStudyDate,
                earnedBadges: state.earnedBadges,
                lessonProgress: state.lessonProgress,
                raidCount: state.raidCount,
                raidVictories: state.raidVictories,
                raidBossesDefeated: state.raidBossesDefeated,
                raidTotalDamage: state.raidTotalDamage,
                raidMaxCombo: state.raidMaxCombo,
                raidSoloVictories: state.raidSoloVictories,
                raidMultiVictories: state.raidMultiVictories,
                raidPerfectCount: state.raidPerfectCount,
                raidFastClears: state.raidFastClears,
            }),
            version: 1,
            migrate: (persistedState: any, version) => {
                if (version === 0) {
                    const history = persistedState.quizHistory || [];
                    const progress: Record<string, LessonProgress> = {};

                    history.forEach((h: QuizHistoryEntry) => {
                        if (h.unitNumber && h.lessonNumber) {
                            const key = `${h.unitNumber}-${h.lessonNumber}`;
                            const prev = progress[key]?.bestScore || 0;
                            // Update only if better, or initialize
                            if (h.percentage >= prev) {
                                progress[key] = {
                                    bestScore: Math.max(prev, h.percentage),
                                    lastPlayedAt: new Date(h.date).getTime()
                                };
                            }
                        }
                    });

                    return {
                        ...persistedState,
                        lessonProgress: progress,
                    };
                }
                return persistedState;
            },
        }
    )
);
