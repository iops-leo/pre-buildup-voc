import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Vocabulary, Unit, Lesson } from '@/data/vocabulary';

export type QuizMode = 'korean_to_english' | 'english_to_korean' | 'spelling' | 'speaking' | 'writing';

export interface QuizHistoryEntry {
    id: string;
    date: string;
    unitNumber: number | null;
    lessonNumber: number | null;
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
];

interface QuizState {
    // Current Quiz State
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

    // Actions
    startQuiz: (unit: Unit, lesson: Lesson, mode: QuizMode) => void;
    startReviewQuiz: (mode: QuizMode) => void;
    startPreview: (unit: Unit, lesson: Lesson) => void;
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
}

export const useQuizStore = create<QuizState>()(
    persist(
        (set, get) => ({
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

            startQuiz: (unit, lesson, mode) => {
                const shuffled = [...lesson.vocabulary].sort(() => Math.random() - 0.5);
                set({
                    currentUnit: unit,
                    currentLesson: lesson,
                    quizActive: true,
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
                    currentUnit: null,
                    currentLesson: null,
                    quizActive: true,
                    mode,
                    questions: shuffled,
                    currentQuestionIndex: 0,
                    score: 0,
                    correctAnswers: 0,
                    wrongAnswers: [],
                    startTime: Date.now(),
                });
            },

            startPreview: (unit, lesson) => {
                set({
                    currentUnit: unit,
                    currentLesson: lesson,
                    previewActive: true,
                    quizActive: false,
                    questions: lesson.vocabulary,
                });
            },

            retryQuiz: () => {
                const state = get();
                if (!state.currentUnit || !state.currentLesson) {
                    if (state.persistentWrongAnswers.length > 0) {
                        get().startReviewQuiz(state.mode);
                    }
                    return;
                }
                get().startQuiz(state.currentUnit, state.currentLesson, state.mode);
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
                const baseXp = state.correctAnswers * 10;
                const bonusXp = percentage === 100 ? 50 : percentage >= 80 ? 20 : 0;
                const totalXp = baseXp + bonusXp;

                const historyEntry: QuizHistoryEntry = {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
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
                    if (state.currentUnit && state.currentLesson) {
                        const key = `${state.currentUnit.unit}-${state.currentLesson.lesson}`;
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
                const state = get();
                const newBadges = [...state.earnedBadges];
                let badgeAdded = false;

                BADGES.forEach(badge => {
                    if (!newBadges.includes(badge.id)) {
                        if (badge.condition(state, historyEntry)) {
                            newBadges.push(badge.id);
                            badgeAdded = true;
                            // Optionally trigger a toast/notification here via UI components
                        }
                    }
                });

                if (badgeAdded) {
                    set({ earnedBadges: newBadges });
                }
            }
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
