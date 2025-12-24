import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, XCircle, Volume2, X, Mic, MicOff, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useTTS } from '@/hooks/useTTS';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSound } from '@/hooks/useSound';

// Helper function to remove parenthetical parts
const cleanWordForDisplay = (word: string): string => {
    return word.replace(/\s*\(.*?\)/g, '');
};

export const QuizView = () => {
    const store = useQuizStore();
    const currentWord = store.questions[store.currentQuestionIndex];
    const [input, setInput] = useState('');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Hooks
    const { speak, isSpeaking: isTtsSpeaking, isSupported: ttsSupported } = useTTS();
    const { playCorrect, playWrong, playClick } = useSound();
    const {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        error: speechError
    } = useSpeechRecognition();

    const isTypingMode = store.mode === 'spelling' || (store.mode === 'korean_to_english' && !currentWord?.word.includes(' '));
    const isSpeakingMode = store.mode === 'speaking';

    const [options, setOptions] = useState<string[]>([]);
    const progress = ((store.currentQuestionIndex) / store.questions.length) * 100;

    // Reset voice transcript when question changes
    useEffect(() => {
        resetTranscript();
    }, [store.currentQuestionIndex, isSpeakingMode, resetTranscript]);

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
        } else if (isPhrase && !isSpeakingMode && store.mode !== 'spelling') {
            const wrongAnswers = store.questions
                .filter(q => q.word !== currentWord.word)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(q => q.word);
            const alts = [...wrongAnswers, currentWord.word].sort(() => Math.random() - 0.5);
            setOptions(alts);
        }
    }, [currentWord, store.mode, store.questions, isSpeakingMode]);

    // Auto-focus for typing
    useEffect(() => {
        if (isTypingMode && !isAnswered && !isSpeakingMode) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [store.currentQuestionIndex, isTypingMode, isAnswered, isSpeakingMode]);

    // TTS for E->K mode
    useEffect(() => {
        if (store.mode === 'english_to_korean' && currentWord && ttsSupported) {
            speak(currentWord.word);
        }
    }, [currentWord, store.mode, ttsSupported]);

    // Voice Answer Checking
    useEffect(() => {
        if (isSpeakingMode && transcript && !isAnswered) {
            const cleanTarget = currentWord.word.replace(/\s*\(.*\)/, '').toLowerCase();
            const cleanTranscript = transcript.toLowerCase();

            if (cleanTranscript.includes(cleanTarget) || cleanTarget === cleanTranscript) {
                stopListening();
                handleVoiceSubmit(true);
            }
        }
    }, [transcript, isSpeakingMode, isAnswered, currentWord, stopListening]);

    const handleSpeak = useCallback(() => {
        if (currentWord) {
            speak(currentWord.word);
        }
    }, [currentWord, speak]);

    const toggleListening = () => {
        playClick();
        if (isListening) {
            stopListening();
        } else {
            resetTranscript();
            startListening();
        }
    };

    const handleVoiceSubmit = (success: boolean) => {
        if (success) playCorrect();
        else playWrong();

        setIsCorrect(success);
        setIsAnswered(true);
        store.submitAnswer(success, currentWord);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const cleanTarget = currentWord.word.replace(/\s*\(.*\)/, '').toLowerCase();
        const cleanInput = input.trim().toLowerCase();
        const validAnswers = cleanTarget.split('/').map(s => s.trim());
        const correct = validAnswers.includes(cleanInput);

        if (correct) playCorrect();
        else playWrong();

        setIsCorrect(correct);
        setIsAnswered(true);
        store.submitAnswer(correct, currentWord);

        if (!correct && ttsSupported) {
            setTimeout(() => speak(currentWord.word), 300);
        }
    };

    const handleOptionSelect = useCallback((option: string) => {
        if (isAnswered) return;
        playClick(); // Click sound immediately

        setSelectedOption(option);
        const target = store.mode === 'english_to_korean' ? currentWord.meaning : currentWord.word;
        const correct = option === target;

        setTimeout(() => {
            if (correct) playCorrect();
            else playWrong();
        }, 100);

        setIsCorrect(correct);
        setIsAnswered(true);
        store.submitAnswer(correct, currentWord);
    }, [isAnswered, store, currentWord, playClick, playCorrect, playWrong]);

    const handleNext = useCallback(() => {
        playClick();
        if (store.currentQuestionIndex >= store.questions.length - 1) {
            store.endQuiz();
        } else {
            store.nextQuestion();
            setInput('');
            setSelectedOption(null);
            setIsAnswered(false);
            setIsCorrect(false);
            resetTranscript();
        }
    }, [store, resetTranscript, playClick]);

    const handleExit = useCallback(() => {
        playClick();
        if (confirm('Exit quiz?')) {
            stopListening();
            store.resetQuiz();
        }
    }, [store, stopListening, playClick]);

    // Keyboard shortcuts
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
            if (!isTypingMode && !isSpeakingMode && !isAnswered && options.length > 0) {
                const num = parseInt(e.key);
                if (num >= 1 && num <= options.length) {
                    e.preventDefault();
                    handleOptionSelect(options[num - 1]);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAnswered, isTypingMode, isSpeakingMode, options, handleNext, handleOptionSelect, handleExit]);

    if (!currentWord) return null;

    const questionText = (store.mode === 'korean_to_english' || store.mode === 'spelling' || store.mode === 'speaking')
        ? currentWord.meaning
        : cleanWordForDisplay(currentWord.word);

    return (
        <div className="w-full min-h-screen bg-slate-950 flex flex-col relative overflow-hidden select-none">
            {/* Top Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900 z-50">
                <motion.div
                    className="h-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Header */}
            <header className="p-6 flex justify-between items-center z-10">
                <button
                    onClick={handleExit}
                    className="p-2 rounded-full hover:bg-slate-800 text-slate-500 transition-transform active:scale-95 touch-manipulation"
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
                        key={currentWord.word}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full text-center space-y-12"
                    >
                        {/* Question */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-center gap-4">
                                <h2 className="text-4xl md:text-6xl font-black text-slate-100 tracking-tight leading-tight drop-shadow-md">
                                    {questionText}
                                </h2>
                                {ttsSupported && store.mode === 'english_to_korean' && (
                                    <button
                                        onClick={handleSpeak}
                                        className={clsx(
                                            "p-3 rounded-full transition-all duration-150 active:scale-95 touch-manipulation",
                                            isTtsSpeaking ? "bg-blue-600 text-white scale-110 shadow-md" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                        )}
                                    >
                                        <Volume2 size={24} />
                                    </button>
                                )}
                            </div>

                            {isSpeakingMode && (
                                <p className="text-blue-400 font-medium tracking-wide uppercase text-sm animate-pulse">
                                    Speak the English word!
                                </p>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="w-full max-w-lg mx-auto min-h-[120px] flex flex-col items-center justify-center">
                            {isSpeakingMode ? (
                                <div className="space-y-6 w-full">
                                    {/* Mic Button (Raised 3D) */}
                                    <button
                                        onClick={toggleListening}
                                        disabled={isAnswered}
                                        className={clsx(
                                            "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-150 mx-auto border-b-[6px] active:border-b-0 active:translate-y-[6px] touch-manipulation",
                                            isListening
                                                ? "bg-rose-500 border-rose-700 text-white shadow-rose-500/40"
                                                : "bg-slate-700 border-slate-800 text-slate-400 hover:bg-slate-600 hover:text-white",
                                            isAnswered && "opacity-50 cursor-not-allowed border-b-0 translate-y-[6px]"
                                        )}
                                    >
                                        {isListening ? <Mic size={40} className="animate-bounce" /> : <MicOff size={32} />}
                                    </button>

                                    {/* Live Caption */}
                                    <div className="h-12 flex items-center justify-center">
                                        {isListening ? (
                                            <div className="text-slate-300 text-lg font-medium flex items-center gap-2">
                                                <Loader2 size={16} className="animate-spin text-rose-500" />
                                                <span>{interimTranscript || "Listening..."}</span>
                                            </div>
                                        ) : transcript ? (
                                            <div className="text-slate-100 text-xl font-bold">"{transcript}"</div>
                                        ) : (
                                            <div className="text-slate-600 text-sm">Click mic and speak</div>
                                        )}
                                    </div>

                                    {speechError && (
                                        <div className="text-rose-500 text-xs font-mono bg-rose-500/10 py-1 px-3 rounded-md inline-block">
                                            {speechError} (Confirm mic permissions)
                                        </div>
                                    )}
                                </div>
                            ) : isTypingMode ? (
                                <form onSubmit={handleSubmit} className="relative w-full">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={isAnswered}
                                        placeholder="Type answer..."
                                        className={clsx(
                                            "w-full bg-slate-900 border-2 rounded-xl text-3xl text-center py-6 px-4 focus:outline-none transition-all duration-300 placeholder:text-slate-700 shadow-inner",
                                            isAnswered
                                                ? isCorrect ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
                                                : "border-slate-800 focus:border-blue-500 focus:bg-slate-900 text-slate-100"
                                        )}
                                        autoComplete="off"
                                    />
                                </form>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 w-full">
                                    {options.map((opt, idx) => {
                                        const isSelected = opt === selectedOption;
                                        const isTarget = (store.mode === 'english_to_korean' ? opt === currentWord.meaning : opt === currentWord.word);
                                        const showSuccess = isAnswered && isTarget;
                                        const showFail = isAnswered && isSelected && !isTarget;

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionSelect(opt)}
                                                disabled={isAnswered}
                                                className={clsx(
                                                    "w-full p-4 rounded-xl text-lg font-bold transition-all duration-100 text-left flex items-center gap-4 border-b-[4px] active:border-b-0 active:translate-y-[4px] touch-manipulation",
                                                    showSuccess ? "bg-green-600 border-green-800 text-white" :
                                                        showFail ? "bg-red-600 border-red-800 text-white" :
                                                            "bg-slate-800 border-slate-900 text-slate-300 hover:bg-slate-700 hover:border-slate-800 hover:text-white"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm",
                                                    showSuccess || showFail ? "bg-black/20 text-white" : "bg-slate-900 text-slate-500"
                                                )}>
                                                    {idx + 1}
                                                </div>
                                                <span className="flex-1 drop-shadow-sm">{opt}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer / Feedback */}
            <div className="h-32 w-full flex items-center justify-center bg-slate-950 border-t border-slate-900 z-10">
                <AnimatePresence mode="wait">
                    {isAnswered ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-2xl px-6 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-sm", isCorrect ? "border-green-600 text-green-500 bg-green-900/20" : "border-red-600 text-red-500 bg-red-900/20")}>
                                    {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                </div>
                                <div>
                                    <div className={clsx("font-bold text-lg", isCorrect ? "text-green-400" : "text-red-400")}>
                                        {isCorrect ? "Correct!" : "Incorrect"}
                                    </div>
                                    {!isCorrect && (
                                        <div className="text-slate-400 flex items-center gap-2">
                                            Answer: <span className="text-slate-200 font-semibold">{cleanWordForDisplay(currentWord.word)}</span>
                                            <button onClick={() => speak(currentWord.word)}>
                                                <Volume2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleNext}
                                className={clsx(
                                    "px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-150 border-b-[4px] active:border-b-0 active:translate-y-[4px] touch-manipulation",
                                    isCorrect
                                        ? "bg-green-600 border-green-800 text-white hover:bg-green-500"
                                        : "bg-slate-200 border-slate-400 text-slate-900 hover:bg-white"
                                )}
                            >
                                Next <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    ) : (
                        <div className="text-slate-600 text-sm font-medium">Problem {store.currentQuestionIndex + 1} of {store.questions.length}</div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
