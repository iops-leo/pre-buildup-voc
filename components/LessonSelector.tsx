import React from 'react';
import { VOCABULARY_DATA, Unit, Lesson } from '@/data/vocabulary';
import { useQuizStore, QuizHistoryEntry, BADGES } from '@/store/useQuizStore';
import { BookOpen, Star, RefreshCw, Trophy, ChevronRight, GraduationCap, Flame, Medal, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export const LessonSelector = () => {
    const {
        startQuiz,
        startReviewQuiz,
        persistentWrongAnswers,
        quizHistory,
        level,
        xp,
        streak,
        earnedBadges
    } = useQuizStore();

    // Get best score for a specific unit/lesson
    const getBestScore = (unitNum: number, lessonNum: number): number | null => {
        const relevant = quizHistory.filter(
            (h: QuizHistoryEntry) => h.unitNumber === unitNum && h.lessonNumber === lessonNum
        );
        if (relevant.length === 0) return null;
        return Math.max(...relevant.map((h: QuizHistoryEntry) => h.percentage));
    };

    // Calculate XP progress for next level (assuming 1000 XP per level)
    const xpForNextLevel = level * 1000;
    const currentLevelXp = xp - ((level - 1) * 1000);
    const xpProgress = Math.min((currentLevelXp / 1000) * 100, 100);

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Gamification Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Profile / Level Card */}
                <div className="md:col-span-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Trophy size={120} className="text-yellow-500" />
                    </div>
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center text-white shadow-xl shadow-blue-500/20 border-4 border-slate-900">
                            <span className="text-xs font-bold opacity-80">LEVEL</span>
                            <span className="text-3xl font-black leading-none">{level}</span>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-end">
                                <h2 className="text-xl font-bold text-white">Learning Progress</h2>
                                <span className="text-sm font-mono text-blue-400 font-bold">{Math.floor(xp)} XP</span>
                            </div>
                            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${xpProgress}%` }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-400"
                                />
                            </div>
                            <p className="text-xs text-slate-500 text-right">Next level: {1000 - Math.floor(currentLevelXp)} XP needed</p>
                        </div>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors" />
                    <div className="relative z-10 text-center space-y-2">
                        <div className={clsx(
                            "mx-auto p-4 rounded-full transition-all duration-500",
                            streak > 0 ? "bg-orange-500/20 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] scale-110" : "bg-slate-800 text-slate-600"
                        )}>
                            <Flame size={32} fill={streak > 0 ? "currentColor" : "none"} />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-white">{streak}</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Day Streak</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            {earnedBadges.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 overflow-x-auto">
                    <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
                        <Medal size={16} /> Recent Achievements
                    </h3>
                    <div className="flex gap-3">
                        {BADGES.filter(b => earnedBadges.includes(b.id)).map(badge => (
                            <motion.div
                                key={badge.id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700 shrink-0"
                            >
                                <span className="text-xl">{badge.icon}</span>
                                <span className="text-xs font-bold text-slate-200">{badge.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Header */}
            <header className="text-center space-y-4 pt-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 font-display">
                    {VOCABULARY_DATA.book_title}
                </h1>
                <p className="text-slate-400 text-base max-w-lg mx-auto">
                    Choose a lesson to assist your journey.
                </p>
            </header>

            {/* Review Button */}
            {persistentWrongAnswers.length > 0 && (
                <motion.button
                    whileHover={{ scale: 1.01, backgroundColor: "rgba(249, 115, 22, 0.15)" }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => startReviewQuiz('spelling')}
                    className="w-full relative overflow-hidden group bg-orange-500/10 border border-orange-500/30 p-5 rounded-2xl flex items-center justify-between transition-all shadow-lg"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
                            <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-700" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-orange-100">Review Required</h3>
                            <p className="text-orange-200/70 text-sm">
                                <span className="text-orange-400 font-bold mr-1">{persistentWrongAnswers.length}</span>
                                words are waiting for you
                            </p>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-orange-400" />
                </motion.button>
            )}

            {/* Lesson Grid */}
            <div className="space-y-10">
                {VOCABULARY_DATA.units.map((unit) => (
                    <div key={unit.unit} className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="h-px flex-1 bg-slate-800" />
                            <h2 className="text-lg font-bold text-slate-300">Unit {unit.unit}</h2>
                            <div className="h-px flex-1 bg-slate-800" />
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

            <footer className="text-center text-slate-600 text-xs pb-8">
                Designed for Learning · Pre-Build Up
            </footer>
        </div>
    );
};

interface LessonCardProps {
    unit: Unit;
    lesson: Lesson;
    bestScore: number | null;
    onSelect: (mode: 'korean_to_english' | 'english_to_korean' | 'spelling' | 'speaking') => void;
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

            <div className="grid grid-cols-2 gap-2">
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
                    subLabel="타이핑"
                    color="green"
                    onClick={() => onSelect('spelling')}
                />
                <ModeButton
                    label="말하기"
                    subLabel="발음 연습"
                    color="rose"
                    icon={<Mic size={14} />}
                    onClick={() => onSelect('speaking')}
                />
            </div>
        </motion.div>
    );
};

const ModeButton = ({ label, subLabel, color, icon, onClick }: { label: string, subLabel: string, color: 'blue' | 'purple' | 'green' | 'rose', icon?: React.ReactNode, onClick: () => void }) => {
    const colorStyles = {
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40",
        green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40",
        rose: "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40"
    };

    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition-all duration-200",
                colorStyles[color]
            )}
        >
            <span className="text-sm font-bold flex items-center gap-1.5">
                {icon}
                {label}
            </span>
            <span className="text-[10px] opacity-70 mt-0.5">{subLabel}</span>
        </button>
    );
};
