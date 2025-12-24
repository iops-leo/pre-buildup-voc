import React from 'react';
import { VOCABULARY_DATA, Unit, Lesson } from '@/data/vocabulary';
import { useQuizStore, QuizHistoryEntry, BADGES } from '@/store/useQuizStore';
import { BookOpen, Star, RefreshCw, Trophy, ChevronRight, GraduationCap, Flame, Medal, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useSound } from '@/hooks/useSound';

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

    // SFX
    const { playClick } = useSound();

    // Get best score for a specific unit/lesson
    const getBestScore = (unitNum: number, lessonNum: number): number | null => {
        const relevant = quizHistory.filter(
            (h: QuizHistoryEntry) => h.unitNumber === unitNum && h.lessonNumber === lessonNum
        );
        if (relevant.length === 0) return null;
        return Math.max(...relevant.map((h: QuizHistoryEntry) => h.percentage));
    };

    // Calculate XP progress for next level
    const xpForNextLevel = level * 1000;
    const currentLevelXp = xp - ((level - 1) * 1000);
    const xpProgress = Math.min((currentLevelXp / 1000) * 100, 100);

    const handleModeSelect = (unit: Unit, lesson: Lesson, mode: 'korean_to_english' | 'english_to_korean' | 'spelling' | 'speaking') => {
        playClick();
        startQuiz(unit, lesson, mode);
    };

    const handleReviewClick = () => {
        playClick();
        startReviewQuiz('spelling');
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-3 md:p-6 space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Gamification Dashboard - Compact for Mobile/Tablet */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {/* Profile / Level Card */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-700 rounded-2xl p-4 md:p-6 relative overflow-hidden flex items-center gap-4 shadow-sm">
                    <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                        <Trophy size={100} className="text-yellow-500" />
                    </div>

                    <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center text-white border-4 border-slate-800 z-10">
                        <span className="text-[10px] md:text-xs font-bold opacity-80">LEVEL</span>
                        <span className="text-2xl md:text-3xl font-black leading-none">{level}</span>
                    </div>

                    <div className="flex-1 space-y-1.5 md:space-y-2 z-10">
                        <div className="flex justify-between items-end">
                            <h2 className="text-lg md:text-xl font-bold text-white">Learning Progress</h2>
                            <span className="text-xs md:text-sm font-mono text-blue-400 font-bold">{Math.floor(xp)} XP</span>
                        </div>
                        <div className="w-full h-2.5 md:h-3 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={false}
                                animate={{ width: `${xpProgress}%` }}
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-400"
                            />
                        </div>
                        <p className="text-[10px] md:text-xs text-slate-500 text-right">Next: {1000 - Math.floor(currentLevelXp)} XP to go</p>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 md:p-6 flex flex-row md:flex-col items-center justify-between md:justify-center relative overflow-hidden group shadow-sm">
                    <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors" />
                    <div className="flex items-center gap-4 md:block md:text-center z-10">
                        <div className={clsx(
                            "p-3 md:p-4 rounded-full transition-all duration-300 shrink-0",
                            streak > 0 ? "bg-orange-500/20 text-orange-500 shadow-sm" : "bg-slate-800 text-slate-600"
                        )}>
                            <Flame size={24} className="w-6 h-6 md:w-8 md:h-8" fill={streak > 0 ? "currentColor" : "none"} />
                        </div>
                        <div className="text-left md:text-center">
                            <div className="text-2xl md:text-3xl font-black text-white leading-none">{streak}</div>
                            <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Day Streak</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Section (Compact) */}
            {earnedBadges.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-4 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2 min-w-max">
                        {BADGES.filter(b => earnedBadges.includes(b.id)).map(badge => (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 shrink-0"
                            >
                                <span className="text-lg">{badge.icon}</span>
                                <span className="text-[10px] md:text-xs font-bold text-slate-300">{badge.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Header */}
            <header className="text-center space-y-1 md:space-y-2 pt-2 md:pt-4">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white font-display">
                    {VOCABULARY_DATA.book_title}
                </h1>
                <p className="text-slate-400 text-sm md:text-base">
                    Choose a lesson to assist your journey.
                </p>
            </header>

            {/* Review Button */}
            {persistentWrongAnswers.length > 0 && (
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReviewClick}
                    className="w-full relative overflow-hidden group bg-orange-600 overflow-hidden border-b-[4px] border-orange-800 active:border-b-0 active:translate-y-[4px] p-4 rounded-xl flex items-center justify-between transition-all shadow-md active:shadow-none"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-3 z-10">
                        <div className="p-2.5 bg-black/20 rounded-lg text-white">
                            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                        </div>
                        <div className="text-left text-white">
                            <h3 className="text-base md:text-lg font-bold">Review Waiting</h3>
                            <p className="opacity-90 text-xs md:text-sm">
                                <span className="font-extrabold mr-1 bg-white text-orange-600 px-1.5 rounded-md">{persistentWrongAnswers.length}</span>
                                words
                            </p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-white z-10" />
                </motion.button>
            )}

            {/* Lesson Grid */}
            <div className="space-y-6 md:space-y-8 pb-10">
                {VOCABULARY_DATA.units.map((unit) => (
                    <div key={unit.unit} className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="h-px flex-1 bg-slate-800" />
                            <h2 className="text-base md:text-lg font-bold text-slate-300">Unit {unit.unit}</h2>
                            <div className="h-px flex-1 bg-slate-800" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                            {unit.lessons.map((lesson) => (
                                <LessonCard
                                    key={lesson.lesson}
                                    unit={unit}
                                    lesson={lesson}
                                    bestScore={getBestScore(unit.unit, lesson.lesson)}
                                    onSelect={(mode) => handleModeSelect(unit, lesson, mode)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="h-6" /> {/* Bottom spacer for scrolling */}
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
        <div className="group relative flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 hover:bg-slate-800 transition-colors duration-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-base md:text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                        Lesson {lesson.lesson}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 mt-0.5 font-medium">{lesson.vocabulary.length} words</p>
                </div>
                {bestScore !== null ? (
                    <div className={clsx(
                        "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] md:text-xs font-bold border",
                        bestScore >= 90 ? "bg-amber-900/40 text-amber-400 border-amber-500/20" :
                            bestScore >= 70 ? "bg-blue-900/40 text-blue-400 border-blue-500/20" :
                                "bg-slate-800/80 text-slate-400 border-slate-700"
                    )}>
                        <Trophy size={11} className={bestScore >= 90 ? "fill-amber-400" : ""} />
                        {bestScore}%
                    </div>
                ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
                        <Star size={14} />
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
                    subLabel="발음"
                    color="rose"
                    icon={<Mic size={13} />}
                    onClick={() => onSelect('speaking')}
                />
            </div>
        </div>
    );
};

const ModeButton = ({ label, subLabel, color, icon, onClick }: { label: string, subLabel: string, color: 'blue' | 'purple' | 'green' | 'rose', icon?: React.ReactNode, onClick: () => void }) => {
    const colorStyles = {
        blue: "bg-blue-600 border-blue-800 hover:bg-blue-500 text-white",
        purple: "bg-purple-600 border-purple-800 hover:bg-purple-500 text-white",
        green: "bg-emerald-600 border-emerald-800 hover:bg-emerald-500 text-white",
        rose: "bg-rose-600 border-rose-800 hover:bg-rose-500 text-white"
    };

    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex flex-col items-center justify-center py-2 px-1.5 rounded-lg border-b-[4px] transition-all duration-150 active:border-b-0 active:translate-y-[4px] active:shadow-none touch-manipulation",
                colorStyles[color]
            )}
        >
            <span className="text-xs md:text-sm font-bold flex items-center gap-1 drop-shadow-sm">
                {icon}
                {label}
            </span>
            <span className="text-[9px] md:text-[10px] opacity-90 mt-px font-medium">{subLabel}</span>
        </button>
    );
};
