import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Vocabulary, Unit, Lesson } from '@/data/vocabulary';

export type QuizMode = 'korean_to_english' | 'english_to_korean' | 'spelling';

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
}

interface QuizState {
    currentUnit: Unit | null;
    currentLesson: Lesson | null;
    quizActive: boolean;
    mode: QuizMode;
    questions: Vocabulary[];
    currentQuestionIndex: number;
    score: number;
    correctAnswers: number;
    wrongAnswers: Vocabulary[]; // Current session wrong answers
    persistentWrongAnswers: Vocabulary[]; // All-time wrong answers for review
    startTime: number;
    quizHistory: QuizHistoryEntry[]; // History of completed quizzes

    // Actions
    startQuiz: (unit: Unit, lesson: Lesson, mode: QuizMode) => void;
    startReviewQuiz: (mode: QuizMode) => void;
    retryQuiz: () => void;
    submitAnswer: (isCorrect: boolean, word: Vocabulary) => void;
    nextQuestion: () => void;
    endQuiz: () => void;
    resetQuiz: () => void;
    clearReviewList: () => void;
    clearHistory: () => void;
}

export const useQuizStore = create<QuizState>()(
    persist(
        (set, get) => ({
            currentUnit: null,
            currentLesson: null,
            quizActive: false,
            mode: 'korean_to_english',
            questions: [],
            currentQuestionIndex: 0,
            score: 0,
            correctAnswers: 0,
            wrongAnswers: [],
            persistentWrongAnswers: [],
            startTime: 0,
            quizHistory: [],

            startQuiz: (unit, lesson, mode) => {
                // Shuffle questions
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
                    currentLesson: null, // Indicates review mode
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

            retryQuiz: () => {
                const state = get();
                if (!state.currentUnit || !state.currentLesson) {
                    // If in review mode, restart review
                    if (state.persistentWrongAnswers.length > 0) {
                        get().startReviewQuiz(state.mode);
                    }
                    return;
                }
                // Restart the same lesson with same mode
                get().startQuiz(state.currentUnit, state.currentLesson, state.mode);
            },

            submitAnswer: (isCorrect, word) => {
                set((state) => {
                    const newWrong = isCorrect ? state.wrongAnswers : [...state.wrongAnswers, word];
                    const newPersistent = isCorrect
                        ? state.persistentWrongAnswers
                        : [...state.persistentWrongAnswers, word];

                    // Dedupe persistent
                    const uniquePersistent = Array.from(new Set(newPersistent.map(w => w.word)))
                        .map(w => newPersistent.find(p => p.word === w)!);

                    // Removing if correct in review mode check
                    let finalPersistent = uniquePersistent;
                    if (state.currentLesson === null && isCorrect) { // Review mode
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

                // Create history entry
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
                };

                set((s) => ({
                    quizActive: false,
                    quizHistory: [historyEntry, ...s.quizHistory].slice(0, 50), // Keep last 50 entries
                }));
            },

            resetQuiz: () => {
                set({
                    quizActive: false,
                    currentUnit: null,
                    currentLesson: null,
                    questions: [],
                    currentQuestionIndex: 0,
                    score: 0,
                    correctAnswers: 0,
                    wrongAnswers: [],
                });
            },

            clearReviewList: () => {
                set({ persistentWrongAnswers: [] });
            },

            clearHistory: () => {
                set({ quizHistory: [] });
            },
        }),
        {
            name: 'quiz-storage',
            partialize: (state) => ({
                persistentWrongAnswers: state.persistentWrongAnswers,
                quizHistory: state.quizHistory,
            }),
        }
    )
);

