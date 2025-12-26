import React from 'react';
import { useQuizStore, QuizMode } from '@/store/useQuizStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, BookOpen, Mic } from 'lucide-react';
import clsx from 'clsx';
import { useTTS } from '@/hooks/useTTS';
import { useSound } from '@/hooks/useSound';

export const PreviewView = () => {
    const store = useQuizStore();
    const { currentUnit, currentLesson, questions, resetQuiz, startQuiz } = store;
    const { speak, isSpeaking } = useTTS();
    const { playClick } = useSound();

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
                            className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 hover:bg-slate-800/50 transition-colors"
                        >
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
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Footer - Quiz Start Buttons */}
            <footer className="sticky bottom-0 z-20 bg-slate-950/95 backdrop-blur-sm border-t border-slate-800 p-4 md:p-6">
                <div className="max-w-2xl mx-auto space-y-3">
                    <p className="text-center text-sm text-slate-500 font-medium">퀴즈 시작하기</p>
                    <div className="grid grid-cols-4 gap-2">
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
                    </div>
                </div>
            </footer>
        </div>
    );
};
