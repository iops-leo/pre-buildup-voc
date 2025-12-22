import React from 'react';
import { VOCABULARY_DATA, Unit, Lesson } from '@/data/vocabulary';
import { useQuizStore, QuizHistoryEntry } from '@/store/useQuizStore';
import { BookOpen, Star, RefreshCw, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export const LessonSelector = () => {
    const { startQuiz, startReviewQuiz, persistentWrongAnswers, quizHistory } = useQuizStore();

    // Get best score for a specific unit/lesson
    const getBestScore = (unitNum: number, lessonNum: number): number | null => {
        const relevant = quizHistory.filter(
            (h: QuizHistoryEntry) => h.unitNumber === unitNum && h.lessonNumber === lessonNum
        );
        if (relevant.length === 0) return null;
        return Math.max(...relevant.map((h: QuizHistoryEntry) => h.percentage));
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 space-y-8">
            <header className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    {VOCABULARY_DATA.book_title}
                </h1>
                <p className="text-slate-400">매일 단어를 마스터하세요</p>
            </header>

            {persistentWrongAnswers.length > 0 && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startReviewQuiz('spelling')}
                    className="w-full bg-orange-500/10 border border-orange-500/50 hover:bg-orange-500/20 p-4 rounded-xl flex items-center justify-between group cursor-pointer transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400 group-hover:text-orange-300">
                            <RefreshCw size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-orange-100">오답 복습</h3>
                            <p className="text-sm text-orange-300/80">{persistentWrongAnswers.length}개 단어 복습 필요</p>
                        </div>
                    </div>
                    <span className="text-orange-400 text-sm font-medium">시작 →</span>
                </motion.button>
            )}

            <div className="space-y-6">
                {VOCABULARY_DATA.units.map((unit) => (
                    <div key={unit.unit} className="space-y-4">
                        <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                            <BookOpen size={20} className="text-blue-400" />
                            Unit {unit.unit}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {unit.lessons.map((lesson) => (
                                <LessonCard
                                    key={lesson.lesson}
                                    unit={unit}
                                    lesson={lesson}
                                    bestScore={getBestScore(unit.unit, lesson.lesson)}
                                    onSelect={(mode) => startQuiz(unit, lesson, mode)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface LessonCardProps {
    unit: Unit;
    lesson: Lesson;
    bestScore: number | null;
    onSelect: (mode: 'korean_to_english' | 'english_to_korean' | 'spelling') => void;
}

const LessonCard = ({ unit, lesson, bestScore, onSelect }: LessonCardProps) => {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-colors group"
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-medium text-slate-200">Lesson {lesson.lesson}</h3>
                    <p className="text-sm text-slate-400">{lesson.vocabulary.length}개 단어</p>
                </div>
                {bestScore !== null ? (
                    <div className={clsx(
                        "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                        bestScore >= 80 ? "bg-green-500/20 text-green-300" :
                            bestScore >= 50 ? "bg-blue-500/20 text-blue-300" :
                                "bg-orange-500/20 text-orange-300"
                    )}>
                        <Trophy size={12} />
                        {bestScore}%
                    </div>
                ) : (
                    <Star size={16} className="text-slate-600 group-hover:text-yellow-400 transition-colors" />
                )}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
                <button
                    onClick={() => onSelect('korean_to_english')}
                    className="text-xs py-2 px-2 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors"
                >
                    한→영
                </button>
                <button
                    onClick={() => onSelect('english_to_korean')}
                    className="text-xs py-2 px-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors"
                >
                    영→한
                </button>
                <button
                    onClick={() => onSelect('spelling')}
                    className="text-xs py-2 px-2 rounded-lg bg-green-500/10 text-green-300 hover:bg-green-500/20 transition-colors"
                >
                    스펠링
                </button>
            </div>
        </motion.div>
    );
};
