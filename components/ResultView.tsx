import React, { useState } from 'react';
import { useQuizStore, QuizHistoryEntry } from '@/store/useQuizStore';
import { motion } from 'framer-motion';
import { RefreshCcw, Home, Clock, History, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import clsx from 'clsx';
import { useTTS } from '@/hooks/useTTS';

export const ResultView = () => {
    const store = useQuizStore();
    const [showHistory, setShowHistory] = useState(false);
    const { speak, isSupported: ttsSupported } = useTTS();
    const duration = (Date.now() - store.startTime) / 1000;

    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    const timeString = `${minutes}분 ${seconds}초`;

    const percentage = Math.round((store.correctAnswers / store.questions.length) * 100) || 0;

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
        <div className="w-full max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">결과</h2>
                <div className="flex items-center justify-center gap-2 text-slate-400">
                    <Clock size={16} />
                    <span>소요 시간: {timeString}</span>
                </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center space-y-4">
                <div className={clsx(
                    "text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br",
                    percentage >= 80 ? "from-green-400 to-emerald-400" :
                        percentage >= 50 ? "from-blue-400 to-cyan-400" :
                            "from-orange-400 to-red-400"
                )}>
                    {percentage}%
                </div>
                <p className="text-slate-400">
                    <span className="text-white font-bold">{store.questions.length}</span>문제 중{' '}
                    <span className="text-white font-bold">{store.correctAnswers}</span>개 정답
                </p>
            </div>

            {store.wrongAnswers.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-300">틀린 단어</h3>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl divide-y divide-red-500/20">
                        {store.wrongAnswers.map((item, idx) => (
                            <div key={idx} className="p-4 flex justify-between items-center text-red-200">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{item.word}</span>
                                    {ttsSupported && (
                                        <button
                                            onClick={() => speak(item.word)}
                                            className="p-1 rounded-full hover:bg-red-500/20 text-red-300"
                                            title="발음 듣기"
                                        >
                                            <Volume2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="text-right text-sm opacity-80">
                                    {item.meaning}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                    onClick={store.resetQuiz}
                    className="flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-700 text-slate-200 font-semibold hover:bg-slate-600 transition-colors"
                >
                    <Home size={20} />
                    처음으로
                </button>
                <button
                    onClick={store.retryQuiz}
                    className="flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
                >
                    <RefreshCcw size={20} />
                    다시 풀기
                </button>
            </div>

            {/* Quiz History Section */}
            {store.quizHistory.length > 0 && (
                <div className="pt-4">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <History size={18} />
                            <span>최근 학습 기록 ({store.quizHistory.length})</span>
                        </div>
                        {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {showHistory && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden"
                        >
                            <div className="divide-y divide-slate-700/50 max-h-64 overflow-y-auto">
                                {store.quizHistory.slice(0, 10).map((entry: QuizHistoryEntry) => (
                                    <div key={entry.id} className="p-3 flex justify-between items-center text-sm">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                {entry.unitNumber && entry.lessonNumber ? (
                                                    <span className="text-slate-300">
                                                        Unit {entry.unitNumber} - Lesson {entry.lessonNumber}
                                                    </span>
                                                ) : (
                                                    <span className="text-orange-300">오답 복습</span>
                                                )}
                                                <span className="px-2 py-0.5 text-xs rounded bg-slate-700 text-slate-400">
                                                    {getModeLabel(entry.mode)}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {formatDate(entry.date)} · {formatHistoryTime(entry.durationSeconds)}
                                            </div>
                                        </div>
                                        <div className={clsx(
                                            "text-lg font-bold",
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
                    )}
                </div>
            )}
        </div>
    );
};

