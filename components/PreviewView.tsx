import React, { useState } from 'react';
import { useQuizStore, QuizMode } from '@/store/useQuizStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, BookOpen, Mic, PenTool, Sparkles, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useTTS } from '@/hooks/useTTS';
import { useSound } from '@/hooks/useSound';
import { useAI } from '@/hooks/useAI';

export const PreviewView = () => {
    const store = useQuizStore();
    const { currentUnit, currentLesson, questions, resetQuiz, startQuiz } = store;
    const { speak, isSpeaking } = useTTS();
    const { playClick } = useSound();
    const { ask } = useAI();
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [aiData, setAiData] = useState<Record<number, { examples: { en: string; ko: string }[]; hint: string } | null>>({});
    const [loadingIdx, setLoadingIdx] = useState<number | null>(null);

    const handleBack = () => {
        playClick();
        resetQuiz();
    };

    const handleStartQuiz = (mode: QuizMode) => {
        playClick();
        if (currentUnit && currentLesson) {
            startQuiz(currentUnit, currentLesson, mode);
        }
    };

    const handleAIExpand = async (idx: number, word: { word: string; meaning: string }) => {
        if (expandedIdx === idx) {
            setExpandedIdx(null);
            return;
        }
        setExpandedIdx(idx);
        if (aiData[idx]) return; // Already fetched

        setLoadingIdx(idx);
        const content = await ask('example_sentence', {
            word: word.word,
            meaning: word.meaning,
        });
        setLoadingIdx(null);

        if (content) {
            try {
                // Try to parse JSON response
                const parsed = JSON.parse(content);
                setAiData(prev => ({ ...prev, [idx]: parsed }));
            } catch {
                // If not valid JSON, show as plain text hint
                setAiData(prev => ({ ...prev, [idx]: { examples: [], hint: content } }));
            }
        }
    };

    if (!currentLesson) return null;

    return (
        <div className="w-full min-h-screen flex flex-col bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 p-4 md:p-6">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors active:scale-95 touch-manipulation"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1 text-center">
                        <h1 className="text-lg md:text-xl font-bold text-white">
                            {currentUnit ? `Unit ${currentUnit.unit} - ` : ''}Lesson {currentLesson.lesson}
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500">{questions.length}개 단어</p>
                    </div>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Word List */}
            <main className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-6">
                <div className="space-y-3">
                    {questions.map((word, idx) => (
                        <motion.div
                            key={word.word}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="p-4 md:p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">
                                                {idx + 1}
                                            </span>
                                            <h3 className="text-lg md:text-xl font-bold text-white break-keep">
                                                {word.word}
                                            </h3>
                                        </div>
                                        <p className="text-base md:text-lg text-blue-400 font-medium mb-2 break-keep">
                                            {word.meaning}
                                        </p>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            {word.definition}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            onClick={() => handleAIExpand(idx, word)}
                                            className={clsx(
                                                "p-2.5 rounded-full transition-all duration-150 active:scale-95 touch-manipulation",
                                                expandedIdx === idx
                                                    ? "bg-violet-600 text-white"
                                                    : "bg-slate-800 text-violet-400 hover:bg-violet-900 hover:text-violet-300"
                                            )}
                                        >
                                            {loadingIdx === idx ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                        </button>
                                        <button
                                            onClick={() => speak(word.word)}
                                            className={clsx(
                                                "p-2.5 rounded-full transition-all duration-150 active:scale-95 touch-manipulation shrink-0",
                                                isSpeaking
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                                            )}
                                        >
                                            <Volume2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* AI Enhanced Content */}
                            <AnimatePresence>
                                {expandedIdx === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-4 md:px-5 md:pb-5">
                                            <div className="bg-violet-950/40 border border-violet-800/30 rounded-xl p-4 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles size={14} className="text-violet-400" />
                                                    <span className="text-xs font-bold text-violet-300">AI 학습 도우미</span>
                                                </div>

                                                {!aiData[idx] && loadingIdx === idx && (
                                                    <div className="flex items-center gap-2 text-violet-400/60 text-sm py-2">
                                                        <Loader2 size={14} className="animate-spin" />
                                                        예문과 기억법을 만들고 있어요...
                                                    </div>
                                                )}

                                                {!aiData[idx] && loadingIdx !== idx && (
                                                    <p className="text-sm text-slate-500">AI 데이터를 불러올 수 없어요.</p>
                                                )}

                                                {aiData[idx] && (
                                                    <>
                                                        {aiData[idx]!.examples.length > 0 && (
                                                            <div className="space-y-2">
                                                                <p className="text-xs font-bold text-slate-400">예문</p>
                                                                {aiData[idx]!.examples.map((ex, i) => (
                                                                    <div key={i} className="bg-slate-900/50 rounded-lg p-2.5">
                                                                        <p className="text-sm text-white font-medium">{ex.en}</p>
                                                                        <p className="text-xs text-slate-400 mt-0.5">{ex.ko}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {aiData[idx]!.hint && (
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-400 mb-1">기억법</p>
                                                                <p className="text-sm text-amber-300 bg-amber-950/30 border border-amber-800/30 rounded-lg p-2.5 whitespace-pre-line">
                                                                    {aiData[idx]!.hint}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Footer - Quiz Start Buttons */}
            <footer className="sticky bottom-0 z-20 bg-slate-950/95 backdrop-blur-sm border-t border-slate-800 p-4 md:p-6">
                <div className="max-w-2xl mx-auto space-y-3">
                    <p className="text-center text-sm text-slate-500 font-medium">퀴즈 시작하기</p>
                    <div className="grid grid-cols-5 gap-2">
                        <button
                            onClick={() => handleStartQuiz('korean_to_english')}
                            className="py-3 px-2 rounded-xl font-bold text-sm bg-blue-600 border-b-[4px] border-blue-800 text-white hover:bg-blue-500 active:border-b-0 active:translate-y-[4px] transition-all touch-manipulation"
                        >
                            한→영
                        </button>
                        <button
                            onClick={() => handleStartQuiz('english_to_korean')}
                            className="py-3 px-2 rounded-xl font-bold text-sm bg-purple-600 border-b-[4px] border-purple-800 text-white hover:bg-purple-500 active:border-b-0 active:translate-y-[4px] transition-all touch-manipulation"
                        >
                            영→한
                        </button>
                        <button
                            onClick={() => handleStartQuiz('spelling')}
                            className="py-3 px-2 rounded-xl font-bold text-sm bg-emerald-600 border-b-[4px] border-emerald-800 text-white hover:bg-emerald-500 active:border-b-0 active:translate-y-[4px] transition-all touch-manipulation"
                        >
                            스펠링
                        </button>
                        <button
                            onClick={() => handleStartQuiz('speaking')}
                            className="py-3 px-2 rounded-xl font-bold text-sm bg-rose-600 border-b-[4px] border-rose-800 text-white hover:bg-rose-500 active:border-b-0 active:translate-y-[4px] transition-all touch-manipulation flex items-center justify-center gap-1"
                        >
                            <Mic size={14} />
                            말하기
                        </button>
                        <button
                            onClick={() => handleStartQuiz('writing')}
                            className="py-3 px-2 rounded-xl font-bold text-sm bg-amber-600 border-b-[4px] border-amber-800 text-white hover:bg-amber-500 active:border-b-0 active:translate-y-[4px] transition-all touch-manipulation flex items-center justify-center gap-1"
                        >
                            <PenTool size={14} />
                            셀프시험
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};
