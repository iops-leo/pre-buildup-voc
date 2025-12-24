import React, { useEffect, useState } from 'react';
import { useQuizStore, QuizHistoryEntry, getLevelTitle } from '@/store/useQuizStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, RefreshCw, Trophy, Clock, Target, TrendingUp, Award, Share2, Volume2, Crown } from 'lucide-react';
import clsx from 'clsx';
import { useTTS } from '@/hooks/useTTS';
import { useSound } from '@/hooks/useSound';

export const ResultView = () => {
    const store = useQuizStore();
    const { retryQuiz, resetQuiz, quizHistory, level, xp } = store;
    const { playLevelUp, playClick } = useSound();
    const [showCertificate, setShowCertificate] = useState(false);

    // The latest history entry is the current result
    const result = quizHistory[0];
    const currentTitle = getLevelTitle(level);

    // Play sound on mount
    useEffect(() => {
        if (result) {
            if (result.percentage >= 80) {
                setTimeout(() => playLevelUp(), 500);
            }
            if (result.percentage === 100) {
                setTimeout(() => setShowCertificate(true), 1500);
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
        <div className="w-full max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in zoom-in duration-500 pb-20 relative">
            {/* Master Certificate Overlay */}
            <AnimatePresence>
                {showCertificate && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowCertificate(false)}
                    >
                        <div className="bg-slate-50 border-8 border-double border-amber-500 rounded-lg p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Crown size={150} className="text-amber-500" />
                            </div>

                            <h2 className="text-4xl font-serif font-black text-amber-600 mb-2 uppercase tracking-widest">Certificate</h2>
                            <p className="text-slate-500 font-serif italic mb-6">of Mastery</p>

                            <div className="mb-6">
                                <p className="text-slate-600 mb-2">This certifies that</p>
                                <div className="text-2xl font-bold text-slate-900 border-b-2 border-slate-300 pb-1 mb-2">
                                    Level {level} {currentTitle.title}
                                </div>
                                <p className="text-slate-600">has achieved a perfect score!</p>
                            </div>

                            <div className="flex justify-center mb-8">
                                <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-amber-300">
                                    <span className="text-3xl font-black">100</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowCertificate(false)}
                                className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors shadow-lg"
                            >
                                Close & Collect
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Score Card with Gamification Header */}
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

                {/* XP & Level Badge (Floating) */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-4 right-4 flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 shadow-md"
                >
                    <span className="text-2xl">{currentTitle.icon}</span>
                    <div className="w-px h-3 bg-slate-600" />
                    <span className="text-yellow-400 font-bold">+{result.xpGained} XP</span>
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
                            icon={<Crown className="text-amber-400" size={20} />}
                            label="Rank"
                            value={currentTitle.title}
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
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800 shadow-sm">
                        {store.wrongAnswers.map((word, idx) => (
                            <div key={idx} className="p-4 flex items-center justify-between group hover:bg-slate-800 transition-colors">
                                <div>
                                    <div className="text-lg font-bold text-slate-200">{word.word}</div>
                                    <div className="text-sm text-slate-500">{word.meaning}</div>
                                </div>
                                <button
                                    onClick={() => speak(word.word)}
                                    className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
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
                    className="py-4 rounded-xl font-bold transition-all border-b-[4px] active:border-b-0 active:translate-y-[4px] active:shadow-none bg-slate-800 border-slate-900 text-slate-200 hover:bg-slate-700 hover:border-slate-800 flex items-center justify-center gap-2 shadow-sm"
                >
                    <RefreshCw size={20} /> Retry
                </button>
                <button
                    onClick={handleDashboard}
                    className="py-4 rounded-xl font-bold transition-all border-b-[4px] active:border-b-0 active:translate-y-[4px] active:shadow-none bg-blue-600 border-blue-800 text-white hover:bg-blue-500 hover:border-blue-700 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
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
        className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col justify-center"
    >
        <div className="flex items-center gap-2 mb-1 opacity-80">
            {icon}
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-lg font-bold text-slate-200">{value}</div>
    </motion.div>
);
