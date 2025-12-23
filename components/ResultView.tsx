import React, { useState } from 'react';
import { useQuizStore, QuizHistoryEntry } from '@/store/useQuizStore';
import { motion } from 'framer-motion';
import { RefreshCcw, Home, Clock, History, ChevronDown, ChevronUp, Volume2, Trophy, Target, Award } from 'lucide-react';
import clsx from 'clsx';
import { useTTS } from '@/hooks/useTTS';

// Helper function to remove parenthetical parts (v., adj., n., pron., etc.) from word display
const cleanWordForDisplay = (word: string): string => {
    return word.replace(/\s*\(.*?\)/g, '');
};

export const ResultView = () => {
    const store = useQuizStore();
    const [showHistory, setShowHistory] = useState(false);
    const { speak, isSupported: ttsSupported } = useTTS();

    // Stats
    const durationCount = (Date.now() - store.startTime) / 1000;
    const minutes = Math.floor(durationCount / 60);
    const seconds = Math.floor(durationCount % 60);
    const timeString = `${minutes}분 ${seconds}초`;
    const percentage = Math.round((store.correctAnswers / store.questions.length) * 100) || 0;

    // Donut Chart Params
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const formatHistoryTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getModeLabel = (mode: string) => {
        switch (mode) {
            case 'korean_to_english': return '한→영';
            case 'english_to_korean': return '영→한';
            case 'spelling': return '스펠링';
            default: return mode;
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in zoom-in duration-700">
            {/* Header Text */}
            <div className="text-center pt-8 space-y-2">
                <span className="text-blue-500 font-bold uppercase tracking-wider text-sm">Lesson Complete</span>
                <h2 className="text-4xl font-black text-white">학습 결과</h2>
            </div>

            {/* Main Score Card */}
            <div className="relative bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Donut Chart */}
                    <div className="relative w-40 h-40 shrink-0">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                            {/* Background Circle */}
                            <circle
                                cx="60" cy="60" r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-slate-800"
                            />
                            {/* Progress Circle */}
                            <motion.circle
                                cx="60" cy="60" r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeLinecap="round"
                                className={clsx(
                                    percentage >= 80 ? "text-green-500" :
                                        percentage >= 50 ? "text-blue-500" :
                                            "text-orange-500"
                                )}
                                initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-white">{percentage}%</span>
                            <span className="text-xs text-slate-500 uppercase font-semibold">Score</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                        <StatBox icon={<Target size={18} />} label="정답 수" value={`${store.correctAnswers} / ${store.questions.length}`} color="blue" />
                        <StatBox icon={<Clock size={18} />} label="소요 시간" value={timeString} color="purple" />
                        <StatBox icon={<Trophy size={18} />} label="획득 점수" value={`${store.correctAnswers * 10} XP`} color="amber" />
                        <StatBox icon={<Award size={18} />} label="등급" value={percentage >= 90 ? 'S' : percentage >= 80 ? 'A' : percentage >= 60 ? 'B' : 'C'} color="green" />
                    </div>
                </div>
            </div>

            {/* Wrong Answers */}
            {store.wrongAnswers.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-red-500 rounded-full" />
                        틀린 단어 복습
                    </h3>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden">
                        {store.wrongAnswers.map((item, idx) => (
                            <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-sm font-bold">
                                        !
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-200 flex items-center gap-2">
                                            {cleanWordForDisplay(item.word)}
                                            {ttsSupported && (
                                                <button
                                                    onClick={() => speak(item.word)}
                                                    className="p-1 rounded-full hover:bg-slate-700 text-slate-500 hover:text-slate-300"
                                                >
                                                    <Volume2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-sm text-slate-500">{item.meaning}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                    onClick={store.resetQuiz}
                    className="flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all"
                >
                    <Home size={20} />
                    처음으로
                </button>
                <button
                    onClick={store.retryQuiz}
                    className="flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all"
                >
                    <RefreshCcw size={20} />
                    다시 풀기
                </button>
            </div>

            {/* Quiz History Section */}
            {store.quizHistory.length > 0 && (
                <div className="pt-8 border-t border-slate-800">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full flex items-center justify-between py-2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <History size={18} />
                            <span className="font-semibold">최근 학습 기록</span>
                            <span className="bg-slate-800 px-2 py-0.5 rounded-full text-xs">{store.quizHistory.length}</span>
                        </div>
                        {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    <motion.div
                        initial={false}
                        animate={{ height: showHistory ? 'auto' : 0, opacity: showHistory ? 1 : 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 space-y-2">
                            {store.quizHistory.slice(0, 5).map((entry: QuizHistoryEntry) => (
                                <div key={entry.id} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 flex justify-between items-center text-sm">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {entry.unitNumber && entry.lessonNumber ? (
                                                <span className="text-slate-200 font-medium">
                                                    Unit {entry.unitNumber} - Lesson {entry.lessonNumber}
                                                </span>
                                            ) : (
                                                <span className="text-orange-400 font-medium">오답 복습</span>
                                            )}
                                            <span className="px-2 py-0.5 text-[10px] rounded bg-slate-700 text-slate-400 uppercase tracking-wide">
                                                {getModeLabel(entry.mode)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {formatDate(entry.date)} · {formatHistoryTime(entry.durationSeconds)}
                                        </div>
                                    </div>
                                    <div className={clsx(
                                        "text-lg font-bold w-12 text-right",
                                        entry.percentage >= 80 ? "text-green-400" :
                                            entry.percentage >= 50 ? "text-blue-400" :
                                                "text-orange-400"
                                    )}>
                                        {entry.percentage}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

const StatBox = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: 'blue' | 'purple' | 'amber' | 'green' }) => {
    const colorStyles = {
        blue: "bg-blue-500/10 text-blue-400",
        purple: "bg-purple-500/10 text-purple-400",
        amber: "bg-amber-500/10 text-amber-400",
        green: "bg-emerald-500/10 text-emerald-400"
    };

    return (
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center text-center">
            <div className={clsx("p-2 rounded-lg mb-2", colorStyles[color])}>
                {icon}
            </div>
            <div className="text-slate-500 text-xs mb-0.5">{label}</div>
            <div className="text-slate-200 font-bold whitespace-nowrap">{value}</div>
        </div>
    );
};
