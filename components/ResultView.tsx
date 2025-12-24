import React, { useEffect } from 'react';
import { useQuizStore, QuizHistoryEntry } from '@/store/useQuizStore';
import { motion } from 'framer-motion';
import { Home, RefreshCw, Trophy, Clock, Target, TrendingUp, Award, Share2 } from 'lucide-react';
import clsx from 'clsx';
import { useTTS } from '@/hooks/useTTS';
import { useSound } from '@/hooks/useSound';

export const ResultView = () => {
    const store = useQuizStore();
    const { retryQuiz, resetQuiz, quizHistory, level, xp } = store;
    const { playLevelUp, playCorrect, playClick } = useSound();

    // The latest history entry is the current result
    const result = quizHistory[0];

    // Play sound on mount
    useEffect(() => {
        if (result) {
            if (result.percentage >= 80) {
                setTimeout(() => playLevelUp(), 500); // Delay slightly for animation
            } else {
                // playCorrect(); // Optional: play standard sound? Maybe silence is better if score low
            }
        }
    }, [result, playLevelUp]);

    // If no result (shouldn't happen directly), fallback
    if (!result) return null;

    const { speak } = useTTS();

    // Calculate level progress for visualization
    const currentLevelXp = xp - ((level - 1) * 1000);
    const xpProgress = Math.min((currentLevelXp / 1000) * 100, 100);

    const handleRetry = () => {
        playClick();
        retryQuiz();
    };

    const handleDashboard = () => {
        playClick();
        resetQuiz();
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in zoom-in duration-700 pb-20">
            {/* Main Score Card with Gamification Header */}
            <div className="relative bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

                {/* XP & Level Badge (Floating) */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-4 right-4 flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 shadow-lg"
                >
                    <span className="text-yellow-400 font-bold">+{result.xpGained || ((result.correctAnswers * 10) + (result.percentage === 100 ? 50 : 0))} XP</span>
                    <div className="w-px h-3 bg-slate-600" />
                    <span className="text-blue-400 font-bold text-xs">LV.{level}</span>
                </motion.div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 mt-4">
                    {/* Donut Chart */}
                    <div className="relative w-40 h-40 shrink-0">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                            <circle
                                cx="60"
                                cy="60"
                                r="54"
                                fill="none"
                                className="stroke-slate-800"
                                strokeWidth="8"
                            />
                            <motion.circle
                                cx="60"
                                cy="60"
                                r="54"
                                fill="none"
                                className={clsx(
                                    "stroke-current drop-shadow-lg",
                                    result.percentage >= 90 ? "text-amber-400" :
                                        result.percentage >= 70 ? "text-blue-500" : "text-slate-400"
                                )}
                                strokeWidth="8"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: result.percentage / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="text-3xl font-bold text-white"
                            >
                                {result.percentage}%
                            </motion.span>
                            <span className="text-xs text-slate-500 uppercase font-semibold">Score</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                        <StatBox
                            icon={<Target className="text-emerald-400" size={20} />}
                            label="Correct"
                            value={`${result.correctAnswers} / ${result.totalQuestions}`}
                            delay={0.1}
                        />
                        <StatBox
                            icon={<Clock className="text-blue-400" size={20} />}
                            label="Time"
                            value={`${result.durationSeconds}s`}
                            delay={0.2}
                        />
                        <StatBox
                            icon={<TrendingUp className="text-purple-400" size={20} />}
                            label="Streak"
                            value={`${store.streak} Days`}
                            delay={0.3}
                        />
                        <StatBox
                            icon={<Trophy className="text-amber-400" size={20} />}
                            label="XP Gained"
                            value={`+${result.xpGained || 0}`}
                            delay={0.4}
                        />
                    </div>
                </div>
            </div>

            {/* Wrong Answers Review */}
            {result.totalQuestions - result.correctAnswers > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-300 px-2 flex items-center gap-2">
                        <RefreshCw size={18} className="text-orange-400" /> Review Incorrect Answers
                    </h3>
                    <div className="bg-slate-900/40 rounded-2xl border border-slate-800 divide-y divide-slate-800/50">
                        {store.wrongAnswers.map((word, idx) => (
                            <div key={idx} className="p-4 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
                                <div>
                                    <div className="text-lg font-bold text-slate-200">{word.word}</div>
                                    <div className="text-sm text-slate-500">{word.meaning}</div>
                                </div>
                                <button
                                    onClick={() => speak(word.word)}
                                    className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-blue-500 hover:text-white transition-all active:scale-95"
                                >
                                    <Volume2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={handleRetry}
                    className="py-4 rounded-xl font-bold transition-all border-b-[4px] active:border-b-0 active:translate-y-[4px] bg-slate-800 border-slate-900 text-slate-200 hover:bg-slate-700 hover:border-slate-800 flex items-center justify-center gap-2"
                >
                    <RefreshCw size={20} /> Retry
                </button>
                <button
                    onClick={handleDashboard}
                    className="py-4 rounded-xl font-bold transition-all border-b-[4px] active:border-b-0 active:translate-y-[4px] bg-blue-600 border-blue-800 text-white hover:bg-blue-500 hover:border-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                    <Home size={20} /> Dashboard
                </button>
            </div>

        </div>
    );
};

const StatBox = ({ icon, label, value, delay }: { icon: React.ReactNode, label: string, value: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50 flex flex-col justify-center"
    >
        <div className="flex items-center gap-2 mb-1 opacity-80">
            {icon}
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-lg font-bold text-slate-200">{value}</div>
    </motion.div>
);
