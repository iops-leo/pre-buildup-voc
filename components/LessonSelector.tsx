import React from 'react';
import { VOCABULARY_DATA, Unit, Lesson } from '@/data/vocabulary';
import { useQuizStore, QuizHistoryEntry } from '@/store/useQuizStore';
import { BookOpen, Star, RefreshCw, Trophy, ChevronRight, GraduationCap } from 'lucide-react';
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
        <div className="w-full max-w-4xl mx-auto p-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="text-center space-y-4 pt-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-2">
                    <GraduationCap size={14} />
                    Vocabulary Master
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-2 font-display">
                    {VOCABULARY_DATA.book_title}
                </h1>
                <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
                    매일 조금씩 성장하는 나만의 단어장.<br />
                    오늘도 새로운 단어를 정복해보세요!
                </p>
            </header>

            {persistentWrongAnswers.length > 0 && (
                <motion.button
                    whileHover={{ scale: 1.01, backgroundColor: "rgba(249, 115, 22, 0.15)" }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => startReviewQuiz('spelling')}
                    className="w-full relative overflow-hidden group bg-orange-500/10 border border-orange-500/30 p-6 rounded-2xl flex items-center justify-between transition-all shadow-[0_0_40px_-10px_rgba(249,115,22,0.2)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400 ring-1 ring-orange-500/40 shadow-inner">
                            <RefreshCw size={28} className={clsx("transition-transform duration-700", "group-hover:rotate-180")} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-orange-100 mb-1">복습이 필요한 단어</h3>
                            <p className="text-orange-200/70 font-medium">
                                <span className="text-orange-400 font-bold text-lg mr-1">{persistentWrongAnswers.length}</span>
                                개의 단어가 기다리고 있어요
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-orange-400 font-semibold pr-2 group-hover:translate-x-1 transition-transform">
                        <span>복습하기</span>
                        <ChevronRight size={20} />
                    </div>
                </motion.button>
            )}

            <div className="space-y-10">
                {VOCABULARY_DATA.units.map((unit) => (
                    <div key={unit.unit} className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                            <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3 shrink-0">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-400 text-sm font-bold border border-slate-700">
                                    {unit.unit}
                                </span>
                                Unit {unit.unit}
                            </h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

            <footer className="text-center text-slate-600 text-sm pb-8 pt-12">
                Designed for Learning · Pre-Build Up
            </footer>
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="group relative flex flex-col justify-between bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-blue-500/30 hover:shadow-[0_8px_30px_-10px_rgba(59,130,246,0.15)] transition-all duration-300"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                        Lesson {lesson.lesson}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 font-medium">{lesson.vocabulary.length} words</p>
                </div>
                {bestScore !== null ? (
                    <div className={clsx(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border shadow-sm",
                        bestScore >= 90 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            bestScore >= 70 ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                "bg-slate-700/30 text-slate-400 border-slate-600/30"
                    )}>
                        <Trophy size={13} className={bestScore >= 90 ? "fill-amber-400" : ""} />
                        {bestScore}%
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-600">
                        <Star size={16} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2">
                <ModeButton
                    label="한→영"
                    subLabel="객관식"
                    color="blue"
                    onClick={() => onSelect('korean_to_english')}
                />
                <ModeButton
                    label="영→한"
                    subLabel="객관식"
                    color="purple"
                    onClick={() => onSelect('english_to_korean')}
                />
                <ModeButton
                    label="스펠링"
                    subLabel="주관식"
                    color="green"
                    onClick={() => onSelect('spelling')}
                />
            </div>
        </motion.div>
    );
};

const ModeButton = ({ label, subLabel, color, onClick }: { label: string, subLabel: string, color: 'blue' | 'purple' | 'green', onClick: () => void }) => {
    const colorStyles = {
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40",
        green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40"
    };

    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all duration-200",
                colorStyles[color]
            )}
        >
            <span className="text-sm font-bold">{label}</span>
            <span className="text-[10px] opacity-70 mt-0.5">{subLabel}</span>
        </button>
    );
};
