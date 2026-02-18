'use client';

import React, { useMemo } from 'react';
import { useQuizStore, QuizHistoryEntry, getLevelTitle, BADGES } from '@/store/useQuizStore';
import { motion } from 'framer-motion';
import {
    ArrowLeft, TrendingUp, Target, Clock, Calendar, Award, Flame,
    BookOpen, BarChart3, Zap, Trophy
} from 'lucide-react';
import clsx from 'clsx';
import { useSound } from '@/hooks/useSound';

interface StatsViewProps {
    onBack: () => void;
}

export const StatsView = ({ onBack }: StatsViewProps) => {
    const { playClick } = useSound();
    const {
        quizHistory,
        level,
        xp,
        streak,
        earnedBadges,
        persistentWrongAnswers,
        lessonProgress
    } = useQuizStore();

    const currentTitle = getLevelTitle(level);

    // Calculate statistics
    const stats = useMemo(() => {
        const totalQuizzes = quizHistory.length;
        const totalQuestions = quizHistory.reduce((acc, h) => acc + h.totalQuestions, 0);
        const totalCorrect = quizHistory.reduce((acc, h) => acc + h.correctAnswers, 0);
        const totalTime = quizHistory.reduce((acc, h) => acc + h.durationSeconds, 0);
        const avgScore = totalQuizzes > 0
            ? Math.round(quizHistory.reduce((acc, h) => acc + h.percentage, 0) / totalQuizzes)
            : 0;
        const perfectScores = quizHistory.filter(h => h.percentage === 100).length;

        // Weekly stats (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyHistory = quizHistory.filter(h => new Date(h.date) >= weekAgo);
        const weeklyQuizzes = weeklyHistory.length;
        const weeklyXp = weeklyHistory.reduce((acc, h) => acc + (h.xpGained || 0), 0);

        // Daily activity for chart (last 7 days)
        const dailyActivity: { date: string; count: number; xp: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            const dayHistory = quizHistory.filter(h => new Date(h.date).toDateString() === dateStr);
            dailyActivity.push({
                date: date.toLocaleDateString('ko-KR', { weekday: 'short' }),
                count: dayHistory.length,
                xp: dayHistory.reduce((acc, h) => acc + (h.xpGained || 0), 0),
            });
        }

        // Mode distribution
        const modeStats = {
            korean_to_english: quizHistory.filter(h => h.mode === 'korean_to_english').length,
            english_to_korean: quizHistory.filter(h => h.mode === 'english_to_korean').length,
            spelling: quizHistory.filter(h => h.mode === 'spelling').length,
            speaking: quizHistory.filter(h => h.mode === 'speaking').length,
            writing: quizHistory.filter(h => h.mode === 'writing').length,
        };

        // Lessons completed (with any score)
        const lessonsCompleted = Object.keys(lessonProgress).length;

        return {
            totalQuizzes,
            totalQuestions,
            totalCorrect,
            totalTime,
            avgScore,
            perfectScores,
            weeklyQuizzes,
            weeklyXp,
            dailyActivity,
            modeStats,
            lessonsCompleted,
        };
    }, [quizHistory, lessonProgress]);

    const maxDailyXp = Math.max(...stats.dailyActivity.map(d => d.xp), 1);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => { playClick(); onBack(); }}
                    className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white">학습 통계</h1>
                    <p className="text-slate-400 text-sm">나의 학습 현황을 확인하세요</p>
                </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="text-9xl">{currentTitle.icon}</span>
                </div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-600">
                        <span className="text-5xl">{currentTitle.icon}</span>
                    </div>
                    <div className="flex-1">
                        <h2 className={clsx("text-2xl font-black", currentTitle.color)}>{currentTitle.title}</h2>
                        <p className="text-slate-400">Level {level}</p>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-blue-400 font-bold">{xp.toLocaleString()} XP</span>
                            <span className="text-orange-400 font-bold flex items-center gap-1">
                                <Flame size={16} fill="currentColor" /> {streak}일 스트릭
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                    icon={<BarChart3 className="text-blue-400" />}
                    label="총 퀴즈"
                    value={stats.totalQuizzes}
                    suffix="회"
                />
                <StatCard
                    icon={<Target className="text-emerald-400" />}
                    label="평균 점수"
                    value={stats.avgScore}
                    suffix="%"
                />
                <StatCard
                    icon={<Trophy className="text-amber-400" />}
                    label="만점 횟수"
                    value={stats.perfectScores}
                    suffix="회"
                />
                <StatCard
                    icon={<Clock className="text-purple-400" />}
                    label="총 학습시간"
                    value={Math.floor(stats.totalTime / 60)}
                    suffix="분"
                />
            </div>

            {/* Weekly Activity Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Calendar size={18} className="text-slate-400" />
                        주간 학습 현황
                    </h3>
                    <span className="text-sm text-blue-400 font-bold">
                        이번 주 +{stats.weeklyXp} XP
                    </span>
                </div>
                <div className="flex items-end justify-between gap-2 h-32">
                    {stats.dailyActivity.map((day, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(day.xp / maxDailyXp) * 100}%` }}
                                transition={{ delay: idx * 0.05, duration: 0.3 }}
                                className={clsx(
                                    "w-full rounded-t-md min-h-[4px]",
                                    day.xp > 0 ? "bg-gradient-to-t from-blue-600 to-blue-400" : "bg-slate-800"
                                )}
                            />
                            <span className="text-[10px] text-slate-500 font-medium">{day.date}</span>
                            {day.xp > 0 && (
                                <span className="text-[10px] text-blue-400 font-bold">+{day.xp}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Mode Distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                    <BookOpen size={18} className="text-slate-400" />
                    모드별 학습
                </h3>
                <div className="space-y-3">
                    <ModeBar label="한→영" count={stats.modeStats.korean_to_english} total={stats.totalQuizzes} color="blue" />
                    <ModeBar label="영→한" count={stats.modeStats.english_to_korean} total={stats.totalQuizzes} color="purple" />
                    <ModeBar label="스펠링" count={stats.modeStats.spelling} total={stats.totalQuizzes} color="green" />
                    <ModeBar label="말하기" count={stats.modeStats.speaking} total={stats.totalQuizzes} color="rose" />
                    <ModeBar label="셀프시험" count={stats.modeStats.writing} total={stats.totalQuizzes} color="amber" />
                </div>
            </div>

            {/* Achievements */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                    <Award size={18} className="text-slate-400" />
                    획득한 배지 ({earnedBadges.length}/{BADGES.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {BADGES.map(badge => {
                        const earned = earnedBadges.includes(badge.id);
                        return (
                            <div
                                key={badge.id}
                                className={clsx(
                                    "p-3 rounded-xl border flex items-center gap-3",
                                    earned
                                        ? "bg-slate-800 border-slate-700"
                                        : "bg-slate-900/50 border-slate-800 opacity-40"
                                )}
                            >
                                <span className="text-2xl">{earned ? badge.icon : '🔒'}</span>
                                <div>
                                    <p className="font-bold text-sm text-white">{badge.name}</p>
                                    <p className="text-[10px] text-slate-400">{badge.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Weak Words */}
            {persistentWrongAnswers.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                        <Zap size={18} className="text-orange-400" />
                        복습 필요 단어 ({persistentWrongAnswers.length}개)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {persistentWrongAnswers.slice(0, 20).map((word, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-sm text-orange-300"
                            >
                                {word.word}
                            </span>
                        ))}
                        {persistentWrongAnswers.length > 20 && (
                            <span className="px-3 py-1.5 text-sm text-slate-500">
                                +{persistentWrongAnswers.length - 20}개 더
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className="h-10" />
        </div>
    );
};

const StatCard = ({ icon, label, value, suffix }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    suffix: string;
}) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="text-xs text-slate-500 font-medium">{label}</span>
        </div>
        <div className="text-2xl font-black text-white">
            {value.toLocaleString()}<span className="text-sm text-slate-400 ml-1">{suffix}</span>
        </div>
    </div>
);

const ModeBar = ({ label, count, total, color }: {
    label: string;
    count: number;
    total: number;
    color: 'blue' | 'purple' | 'green' | 'rose' | 'amber';
}) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const colorClasses = {
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        green: 'bg-emerald-500',
        rose: 'bg-rose-500',
        amber: 'bg-amber-500',
    };

    return (
        <div className="flex items-center gap-3">
            <span className="w-16 text-sm text-slate-400">{label}</span>
            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                    className={clsx("h-full rounded-full", colorClasses[color])}
                />
            </div>
            <span className="w-12 text-right text-sm text-slate-300 font-bold">{count}회</span>
        </div>
    );
};
