import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, XCircle, Timer, Home, Volume2 } from 'lucide-react';
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

    // Spelling mode: always typing, Korean->English: typing for single words only
    const isTypingMode = store.mode === 'spelling' || (store.mode === 'korean_to_english' && !currentWord?.word.includes(' '));

    // Generate options for Multiple Choice
    const [options, setOptions] = useState<string[]>([]);

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

    // Focus input on load and new question
    useEffect(() => {
        if (isTypingMode) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [store.currentQuestionIndex, isTypingMode]);

    // Auto-speak English word when question changes (for english_to_korean mode)
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

        // Speak correct answer if wrong
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

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Escape to exit
            if (e.key === 'Escape') {
                handleExit();
                return;
            }

            // Enter/Space to go next when answered
            if ((e.key === 'Enter' || e.key === ' ') && isAnswered) {
                e.preventDefault();
                handleNext();
                return;
            }

            // Number keys for multiple choice (when not in typing mode and not answered)
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

    // Determine which word to show as question
    const questionText = (store.mode === 'korean_to_english' || store.mode === 'spelling')
        ? currentWord.meaning
        : currentWord.word;

    return (
        <div className="w-full max-w-xl mx-auto p-6 min-h-[60vh] flex flex-col justify-center">

            {/* Header / Progress */}
            <div className="flex justify-between items-center mb-12 text-slate-400">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExit}
                        className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-colors"
                        title="처음으로 (ESC)"
                    >
                        <Home size={18} />
                    </button>
                    <span className="bg-slate-800 px-3 py-1 rounded-full text-sm font-medium border border-slate-700">
                        {store.currentQuestionIndex + 1} / {store.questions.length}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Timer size={16} />
                    <span>
                        {store.mode === 'spelling' ? '스펠링' : store.mode === 'korean_to_english' ? '한→영' : '영→한'}
                    </span>
                </div>
            </div>

            {/* Question Card */}
            <div className="text-center space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <motion.h2
                            key={currentWord.word}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold text-slate-100"
                        >
                            {questionText}
                        </motion.h2>
                        {ttsSupported && store.mode === 'english_to_korean' && (
                            <button
                                onClick={handleSpeak}
                                className={clsx(
                                    "p-2 rounded-full transition-colors",
                                    isSpeaking
                                        ? "bg-blue-500/30 text-blue-300"
                                        : "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                                )}
                                title="발음 듣기"
                            >
                                <Volume2 size={24} />
                            </button>
                        )}
                    </div>

                    {/* Hint */}
                    {(store.mode === 'korean_to_english' || store.mode === 'spelling') && (
                        <p className="text-slate-500 italic">
                            영어 단어를 입력하세요
                        </p>
                    )}
                    {store.mode === 'english_to_korean' && (
                        <p className="text-slate-500 italic">
                            뜻을 선택하세요 (1-4)
                        </p>
                    )}
                </div>

                {/* Input Area */}
                <div className="w-full">
                    {isTypingMode ? (
                        <form onSubmit={handleSubmit} className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isAnswered}
                                placeholder="정답 입력..."
                                className={clsx(
                                    "w-full bg-transparent border-b-2 text-3xl text-center py-4 focus:outline-none transition-colors",
                                    isAnswered
                                        ? isCorrect ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
                                        : "border-slate-600 focus:border-blue-500 text-slate-200"
                                )}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                            />
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(opt)}
                                    disabled={isAnswered}
                                    className={clsx(
                                        "p-4 rounded-xl border text-lg transition-all text-left flex items-center gap-3",
                                        isAnswered
                                            ? (store.mode === 'english_to_korean' ? opt === currentWord.meaning : opt === currentWord.word)
                                                ? "bg-green-500/20 border-green-500/50 text-green-300"
                                                : opt === selectedOption
                                                    ? "bg-red-500/20 border-red-500/50 text-red-300"
                                                    : "bg-slate-800/50 border-slate-700/50 text-slate-500 opacity-50"
                                            : "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-blue-500/50 text-slate-200"
                                    )}
                                >
                                    <span className="w-7 h-7 rounded-md bg-slate-700/50 flex items-center justify-center text-sm font-mono">
                                        {idx + 1}
                                    </span>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Feedback / Next Button Area */}
                <div className="h-24 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {isAnswered && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full"
                            >
                                <div className={clsx(
                                    "mb-4 flex items-center justify-center gap-2",
                                    isCorrect ? "text-green-400" : "text-red-400"
                                )}>
                                    {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                    <span className="text-lg font-medium">
                                        {isCorrect ? "정답!" : `오답! 정답: ${currentWord.word}`}
                                    </span>
                                    {!isCorrect && ttsSupported && (
                                        <button
                                            onClick={() => speak(currentWord.word)}
                                            className="p-1 rounded-full hover:bg-slate-700 text-slate-400"
                                            title="발음 듣기"
                                        >
                                            <Volume2 size={18} />
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="bg-slate-100 text-slate-900 px-8 py-3 rounded-full font-semibold hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 mx-auto"
                                >
                                    다음 <ArrowRight size={18} />
                                </button>
                                <p className="text-xs text-slate-500 mt-2">Enter 또는 Space</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

