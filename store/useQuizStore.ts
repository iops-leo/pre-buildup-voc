import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Vocabulary, Unit, Lesson } from '@/data/vocabulary';

export type QuizMode = 'korean_to_english' | 'english_to_korean' | 'spelling' | 'speaking';

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
    {
        id: 'first_step',
        icon: '🥚',
        name: '첫 걸음',
        description: '첫 번째 퀴즈를 완료했어요!',
        condition: (state, history) => state.quizHistory.length === 1
    },
    {
        id: 'perfect_score',
        icon: '💯',
        name: '백점 만점',
        description: '퀴즈에서 100점을 맞았어요!',
        condition: (state, history) => history.percentage === 100
    },
    {
        id: 'speed_racer',
        icon: '⚡',
        name: '스피드 레이서',
        description: '30초 안에 퀴즈를 완료했어요!',
        condition: (state, history) => history.durationSeconds <= 30 && history.correctAnswers >= 5
    },
    {
        id: 'streak_3',
        icon: '🔥',
        name: '작심삼일 탈출',
        description: '3일 연속으로 학습했어요!',
        condition: (state) => state.streak >= 3
    },
    {
        id: 'level_5',
        icon: '🎓',
        name: '모범생',
        description: '레벨 5를 달성했어요!',
        condition: (state) => state.level >= 5
    }
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
