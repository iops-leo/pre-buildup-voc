import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, XCircle, Home, Volume2, X } from 'lucide-react';
import clsx from 'clsx';
import { useTTS } from '@/hooks/useTTS';

export const QuizView = () => {
    const store = useQuizStore();
    const currentWord = store.questions[store.currentQuestionIndex];
    const [input, setInput] = useState('');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { speak, isSpeaking, isSupported: ttsSupported } = useTTS();

    const isTypingMode = store.mode === 'spelling' || (store.mode === 'korean_to_english' && !currentWord?.word.includes(' '));
    const [options, setOptions] = useState<string[]>([]);

    // Progress calculation
    const progress = ((store.currentQuestionIndex) / store.questions.length) * 100;

    useEffect(() => {
        if (!currentWord) return;

        const isPhrase = currentWord.word.includes(' ');

        if (store.mode === 'english_to_korean') {
            const wrongAnswers = store.questions
                .filter(q => q.word !== currentWord.word)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(q => q.meaning);
            const alts = [...wrongAnswers, currentWord.meaning].sort(() => Math.random() - 0.5);
            setOptions(alts);
        } else if (isPhrase && store.mode !== 'spelling') {
            const wrongAnswers = store.questions
                .filter(q => q.word !== currentWord.word)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(q => q.word);
            const alts = [...wrongAnswers, currentWord.word].sort(() => Math.random() - 0.5);
            setOptions(alts);
        }
    }, [currentWord, store.mode, store.questions]);

    useEffect(() => {
        if (isTypingMode && !isAnswered) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [store.currentQuestionIndex, isTypingMode, isAnswered]);

    useEffect(() => {
        if (store.mode === 'english_to_korean' && currentWord && ttsSupported) {
            speak(currentWord.word);
        }
    }, [currentWord, store.mode, ttsSupported]);

    const handleSpeak = useCallback(() => {
        if (currentWord) {
            const textToSpeak = store.mode === 'english_to_korean' ? currentWord.word : currentWord.word;
            speak(textToSpeak);
        }
    }, [currentWord, store.mode, speak]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const cleanTarget = currentWord.word.replace(/\s*\(.*\)/, '').toLowerCase();
        const cleanInput = input.trim().toLowerCase();
        const validAnswers = cleanTarget.split('/').map(s => s.trim());
        const correct = validAnswers.includes(cleanInput);

        setIsCorrect(correct);
        setIsAnswered(true);
        store.submitAnswer(correct, currentWord);

        if (!correct && ttsSupported) {
            setTimeout(() => speak(currentWord.word), 300);
        }
    };

    const handleOptionSelect = useCallback((option: string) => {
        if (isAnswered) return;
        setSelectedOption(option);
        const target = store.mode === 'english_to_korean' ? currentWord.meaning : currentWord.word;
        const correct = option === target;
        setIsCorrect(correct);
        setIsAnswered(true);
        store.submitAnswer(correct, currentWord);
    }, [isAnswered, store, currentWord]);

    const handleNext = useCallback(() => {
        if (store.currentQuestionIndex >= store.questions.length - 1) {
            store.endQuiz();
        } else {
            store.nextQuestion();
            setInput('');
            setSelectedOption(null);
            setIsAnswered(false);
            setIsCorrect(false);
        }
    }, [store]);

    const handleExit = useCallback(() => {
        if (confirm('퀴즈를 종료하고 처음으로 돌아갈까요?')) {
            store.resetQuiz();
        }
    }, [store]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleExit();
                return;
            }
            if ((e.key === 'Enter' || e.key === ' ') && isAnswered) {
                e.preventDefault();
                handleNext();
                return;
            }
            if (!isTypingMode && !isAnswered && options.length > 0) {
                const num = parseInt(e.key);
                if (num >= 1 && num <= options.length) {
                    e.preventDefault();
                    handleOptionSelect(options[num - 1]);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAnswered, isTypingMode, options, handleNext, handleOptionSelect, handleExit]);

    if (!currentWord) return null;

    const questionText = (store.mode === 'korean_to_english' || store.mode === 'spelling')
        ? currentWord.meaning
        : currentWord.word;

    return (
        <div className="w-full min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
            {/* Top Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900 z-50">
                <motion.div
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Header */}
            <header className="p-6 flex justify-between items-center z-10">
                <button
                    onClick={handleExit}
                    className="p-2 rounded-full hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                >
                    <X size={24} />
                </button>
                <div className="text-sm font-medium text-slate-500 font-mono">
                    {store.currentQuestionIndex + 1} <span className="text-slate-700">/</span> {store.questions.length}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-2xl mx-auto p-6 flex flex-col items-center justify-center -mt-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentWord.word} // Re-render animation on new word
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full text-center space-y-12"
                    >
                        {/* Question */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-center gap-4">
                                <h2 className="text-4xl md:text-6xl font-black text-slate-100 tracking-tight leading-tight">
                                    {questionText}
                                </h2>
                                {ttsSupported && store.mode === 'english_to_korean' && (
                                    <button
                                        onClick={handleSpeak}
                                        className={clsx(
                                            "p-3 rounded-full transition-all duration-200",
                                            isSpeaking
                                                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110"
                                                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                                        )}
                                    >
                                        <Volume2 size={24} />
                                    </button>
                                )}
                            </div>

                            {(store.mode === 'korean_to_english' || store.mode === 'spelling') && (
                                <p className="text-slate-500 font-medium tracking-wide uppercase text-sm">Designated English Word</p>
                            )}
                        </div>

                        {/* Input / Options */}
                        <div className="w-full max-w-lg mx-auto">
                            {isTypingMode ? (
                                <form onSubmit={handleSubmit} className="relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={isAnswered}
                                        placeholder="Type your answer..."
                                        className={clsx(
                                            "w-full bg-slate-900/50 border-2 rounded-xl text-3xl text-center py-6 px-4 focus:outline-none transition-all duration-300 placeholder:text-slate-700",
                                            isAnswered
                                                ? isCorrect
                                                    ? "border-green-500/50 text-green-400 bg-green-500/5"
                                                    : "border-red-500/50 text-red-400 bg-red-500/5"
                                                : "border-slate-800 focus:border-blue-500 focus:bg-slate-900 focus:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] text-slate-100"
                                        )}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                    />
                                </form>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {options.map((opt, idx) => {
                                        const isSelected = opt === selectedOption;
                                        const isTarget = (store.mode === 'english_to_korean' ? opt === currentWord.meaning : opt === currentWord.word);
                                        const showSuccess = isAnswered && isTarget;
                                        const showFail = isAnswered && isSelected && !isTarget;
                                        const dimmed = isAnswered && !isTarget && !isSelected;

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionSelect(opt)}
                                                disabled={isAnswered}
                                                className={clsx(
                                                    "w-full p-5 rounded-xl border-2 text-lg font-medium transition-all duration-200 text-left flex items-center gap-4 relative overflow-hidden",
                                                    showSuccess ? "bg-green-500/10 border-green-500/50 text-green-400" :
                                                        showFail ? "bg-red-500/10 border-red-500/50 text-red-400" :
                                                            dimmed ? "opacity-40 border-slate-800 bg-slate-900/30 text-slate-500" :
                                                                "bg-slate-800/30 border-slate-800 hover:bg-slate-800 hover:border-slate-600 text-slate-300 hover:text-slate-100"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border transition-colors",
                                                    showSuccess ? "bg-green-500/20 border-green-500/50 text-green-400" :
                                                        showFail ? "bg-red-500/20 border-red-500/50 text-red-400" :
                                                            "bg-slate-800 border-slate-700 text-slate-500"
                                                )}>
                                                    {idx + 1}
                                                </div>
                                                <span className="flex-1">{opt}</span>
                                                {showSuccess && <CheckCircle size={20} className="text-green-500" />}
                                                {showFail && <XCircle size={20} className="text-red-500" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer / Feedback Area */}
            <div className="h-32 w-full flex items-center justify-center bg-slate-950 border-t border-slate-900 z-10">
                <AnimatePresence mode="wait">
                    {isAnswered ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="w-full max-w-2xl px-6 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className={clsx(
                                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2",
                                    isCorrect ? "bg-green-500/10 border-green-500/30 text-green-500" : "bg-red-500/10 border-red-500/30 text-red-500"
                                )}>
                                    {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                </div>
                                <div>
                                    <div className={clsx("font-bold text-lg", isCorrect ? "text-green-400" : "text-red-400")}>
                                        {isCorrect ? "정답입니다!" : "틀렸습니다"}
                                    </div>
                                    {!isCorrect && (
                                        <div className="text-slate-400 flex items-center gap-2">
                                            정답: <span className="text-slate-200 font-semibold">{currentWord.word}</span>
                                            {ttsSupported && (
                                                <button onClick={() => speak(currentWord.word)} className="text-slate-500 hover:text-slate-300 ml-1">
                                                    <Volume2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                className={clsx(
                                    "px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
                                    isCorrect
                                        ? "bg-green-500 text-white shadow-green-500/20 hover:bg-green-400"
                                        : "bg-slate-100 text-slate-900 shadow-slate-200/20 hover:bg-white"
                                )}
                            >
                                다음 <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    ) : (
                        <div className="text-slate-600 text-sm font-medium animate-pulse">
                            문제 푸는 중...
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};


