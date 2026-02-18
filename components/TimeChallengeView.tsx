'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import { VOCABULARY_DATA, Vocabulary } from '@/data/vocabulary';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Timer, Trophy, Zap, Heart, CheckCircle, XCircle, Volume2 } from 'lucide-react';
import clsx from 'clsx';
import { useSound } from '@/hooks/useSound';
import { useTTS } from '@/hooks/useTTS';

interface TimeChallengeViewProps {
    onBack: () => void;
}

type GameState = 'ready' | 'playing' | 'gameover';
type Difficulty = 'easy' | 'normal' | 'hard';

const DIFFICULTY_CONFIG = {
    easy: { timePerQuestion: 10, lives: 5, xpMultiplier: 1 },
    normal: { timePerQuestion: 7, lives: 3, xpMultiplier: 1.5 },
    hard: { timePerQuestion: 5, lives: 2, xpMultiplier: 2 },
};

// Helper function to remove parenthetical parts
const cleanWordForDisplay = (word: string): string => {
    return word.replace(/\s*\(.*?\)/g, '');
};

export const TimeChallengeView = ({ onBack }: TimeChallengeViewProps) => {
    const { playCorrect, playWrong, playClick, playLevelUp } = useSound();
    const { speak } = useTTS();
    const { addXp } = useQuizStore();

    const [gameState, setGameState] = useState<GameState>('ready');
    const [difficulty, setDifficulty] = useState<Difficulty>('normal');
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [lives, setLives] = useState(DIFFICULTY_CONFIG.normal.lives);
    const [timeLeft, setTimeLeft] = useState(DIFFICULTY_CONFIG.normal.timePerQuestion);
    const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [answered, setAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [allWords, setAllWords] = useState<Vocabulary[]>([]);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize all words
    useEffect(() => {
        const words: Vocabulary[] = [];
        VOCABULARY_DATA.units.forEach(unit => {
            unit.lessons.forEach(lesson => {
                words.push(...lesson.vocabulary);
            });
        });
        // Remove duplicates by word
        const uniqueWords = Array.from(new Map(words.map(w => [w.word, w])).values());
        setAllWords(uniqueWords);
    }, []);

    const getRandomWord = useCallback(() => {
        if (allWords.length === 0) return null;
        return allWords[Math.floor(Math.random() * allWords.length)];
    }, [allWords]);

    const generateOptions = useCallback((correctWord: Vocabulary) => {
        const wrongOptions = allWords
            .filter(w => w.word !== correctWord.word)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(w => w.meaning);

        return [...wrongOptions, correctWord.meaning].sort(() => Math.random() - 0.5);
    }, [allWords]);

    const startGame = useCallback((diff: Difficulty) => {
        setDifficulty(diff);
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setLives(DIFFICULTY_CONFIG[diff].lives);
        setTimeLeft(DIFFICULTY_CONFIG[diff].timePerQuestion);
        setQuestionsAnswered(0);
        setAnswered(false);
        setGameState('playing');

        const word = getRandomWord();
        if (word) {
            setCurrentWord(word);
            setOptions(generateOptions(word));
        }
    }, [getRandomWord, generateOptions]);

    const nextQuestion = useCallback(() => {
        const word = getRandomWord();
        if (word) {
            setCurrentWord(word);
            setOptions(generateOptions(word));
            setTimeLeft(DIFFICULTY_CONFIG[difficulty].timePerQuestion);
            setAnswered(false);
        }
    }, [getRandomWord, generateOptions, difficulty]);

    const handleAnswer = useCallback((selectedMeaning: string) => {
        if (answered || gameState !== 'playing') return;

        playClick();
        setAnswered(true);
        const correct = currentWord?.meaning === selectedMeaning;
        setIsCorrect(correct);

        if (correct) {
            playCorrect();
            const timeBonus = Math.floor(timeLeft * 10);
            const comboBonus = combo * 5;
            const points = 100 + timeBonus + comboBonus;
            setScore(prev => prev + points);
            setCombo(prev => {
                const newCombo = prev + 1;
                setMaxCombo(max => Math.max(max, newCombo));
                return newCombo;
            });
        } else {
            playWrong();
            setCombo(0);
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setTimeout(() => setGameState('gameover'), 1000);
                }
                return newLives;
            });
        }

        setQuestionsAnswered(prev => prev + 1);

        // Next question after delay
        setTimeout(() => {
            if (lives > 1 || correct) {
                nextQuestion();
            }
        }, correct ? 500 : 1500);
    }, [answered, gameState, currentWord, timeLeft, combo, lives, playClick, playCorrect, playWrong, nextQuestion]);

    const handleTimeout = useCallback(() => {
        if (answered || gameState !== 'playing') return;

        playWrong();
        setAnswered(true);
        setIsCorrect(false);
        setCombo(0);
        setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
                setTimeout(() => setGameState('gameover'), 1000);
            }
            return newLives;
        });
        setQuestionsAnswered(prev => prev + 1);

        setTimeout(() => {
            if (lives > 1) {
                nextQuestion();
            }
        }, 1500);
    }, [answered, gameState, lives, playWrong, nextQuestion]);

    // Timer countdown
    useEffect(() => {
        if (gameState !== 'playing' || answered) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameState, answered, handleTimeout]);

    // Calculate final XP
    const calculateXp = useCallback(() => {
        const baseXp = questionsAnswered * 5;
        const scoreBonus = Math.floor(score / 100);
        const comboBonus = maxCombo * 10;
        const multiplier = DIFFICULTY_CONFIG[difficulty].xpMultiplier;
        return Math.floor((baseXp + scoreBonus + comboBonus) * multiplier);
    }, [questionsAnswered, score, maxCombo, difficulty]);

    const handleGameOver = useCallback(() => {
        playLevelUp();
        const earnedXp = calculateXp();
        addXp(earnedXp);
    }, [playLevelUp, calculateXp, addXp]);

    useEffect(() => {
        if (gameState === 'gameover') {
            handleGameOver();
        }
    }, [gameState, handleGameOver]);

    const config = DIFFICULTY_CONFIG[difficulty];
    const timePercentage = (timeLeft / config.timePerQuestion) * 100;

    if (gameState === 'ready') {
        return (
            <div className="w-full max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { playClick(); onBack(); }}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                            <Timer className="text-rose-500" /> 타이머 챌린지
                        </h1>
                        <p className="text-slate-400 text-sm">시간 내에 최대한 많이 맞춰보세요!</p>
                    </div>
                </div>

                {/* Difficulty Selection */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-300">난이도 선택</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DifficultyCard
                            title="쉬움"
                            emoji="😊"
                            time={10}
                            lives={5}
                            xp="1x"
                            selected={difficulty === 'easy'}
                            onClick={() => setDifficulty('easy')}
                        />
                        <DifficultyCard
                            title="보통"
                            emoji="😤"
                            time={7}
                            lives={3}
                            xp="1.5x"
                            selected={difficulty === 'normal'}
                            onClick={() => setDifficulty('normal')}
                        />
                        <DifficultyCard
                            title="어려움"
                            emoji="🔥"
                            time={5}
                            lives={2}
                            xp="2x"
                            selected={difficulty === 'hard'}
                            onClick={() => setDifficulty('hard')}
                        />
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={() => startGame(difficulty)}
                    className="w-full py-4 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 rounded-xl font-bold text-xl text-white flex items-center justify-center gap-3 border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all"
                >
                    <Zap size={24} />
                    게임 시작
                </button>

                {/* Rules */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <h3 className="font-bold text-white">게임 규칙</h3>
                    <ul className="text-sm text-slate-400 space-y-1">
                        <li>• 영어 단어를 보고 한국어 뜻을 선택하세요</li>
                        <li>• 빠르게 맞출수록 높은 점수를 받아요</li>
                        <li>• 연속 정답 콤보로 보너스 점수!</li>
                        <li>• 목숨이 모두 소진되면 게임 종료</li>
                    </ul>
                </div>
            </div>
        );
    }

    if (gameState === 'gameover') {
        const earnedXp = calculateXp();

        return (
            <div className="w-full max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in zoom-in">
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="text-8xl"
                    >
                        {score >= 5000 ? '🏆' : score >= 2000 ? '🎉' : '💪'}
                    </motion.div>
                    <h1 className="text-3xl font-black text-white">게임 종료!</h1>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="text-center">
                        <p className="text-slate-400 text-sm">최종 점수</p>
                        <p className="text-5xl font-black text-white">{score.toLocaleString()}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                        <div className="text-center">
                            <p className="text-slate-500 text-xs">맞춘 문제</p>
                            <p className="text-xl font-bold text-emerald-400">
                                {questionsAnswered - (DIFFICULTY_CONFIG[difficulty].lives - lives)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-500 text-xs">최대 콤보</p>
                            <p className="text-xl font-bold text-amber-400">{maxCombo}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-500 text-xs">획득 XP</p>
                            <p className="text-xl font-bold text-blue-400">+{earnedXp}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => startGame(difficulty)}
                        className="py-4 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold text-white border-b-4 border-rose-800 active:border-b-0 active:translate-y-1"
                    >
                        다시 하기
                    </button>
                    <button
                        onClick={() => { playClick(); onBack(); }}
                        className="py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-white border-b-4 border-slate-800 active:border-b-0 active:translate-y-1"
                    >
                        나가기
                    </button>
                </div>
            </div>
        );
    }

    // Playing state
    return (
        <div className="w-full h-screen flex flex-col bg-slate-950 overflow-hidden">
            {/* Timer Bar */}
            <div className="w-full h-2 bg-slate-800">
                <motion.div
                    className={clsx(
                        "h-full transition-colors",
                        timePercentage > 50 ? "bg-emerald-500" :
                            timePercentage > 25 ? "bg-yellow-500" : "bg-rose-500"
                    )}
                    style={{ width: `${timePercentage}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>

            {/* Header Stats */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50">
                <div className="flex items-center gap-2">
                    {Array.from({ length: DIFFICULTY_CONFIG[difficulty].lives }).map((_, i) => (
                        <Heart
                            key={i}
                            size={24}
                            className={clsx(
                                "transition-all",
                                i < lives ? "text-rose-500 fill-rose-500" : "text-slate-700"
                            )}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {combo > 1 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 font-bold text-sm flex items-center gap-1"
                        >
                            <Zap size={14} fill="currentColor" /> {combo} Combo
                        </motion.div>
                    )}
                    <div className="text-2xl font-black text-white">{score.toLocaleString()}</div>
                </div>
            </div>

            {/* Question */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {currentWord && (
                        <motion.div
                            key={currentWord.word}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center space-y-4"
                        >
                            <div className="text-6xl font-black text-white flex items-center justify-center gap-4">
                                {cleanWordForDisplay(currentWord.word)}
                                <button
                                    onClick={() => speak(currentWord.word)}
                                    className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400"
                                >
                                    <Volume2 size={24} />
                                </button>
                            </div>
                            <div className="text-xl text-slate-400 font-medium">
                                {currentWord.definition}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Options */}
            <div className="p-4 pb-8 grid grid-cols-2 gap-3">
                {options.map((option, idx) => {
                    const isSelected = answered && option === currentWord?.meaning;
                    const isWrong = answered && !isCorrect && option !== currentWord?.meaning;

                    return (
                        <motion.button
                            key={idx}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAnswer(option)}
                            disabled={answered}
                            className={clsx(
                                "p-4 rounded-xl font-bold text-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all",
                                answered && isSelected && isCorrect
                                    ? "bg-emerald-600 border-emerald-800 text-white"
                                    : answered && isSelected && !isCorrect
                                        ? "bg-rose-600 border-rose-800 text-white"
                                        : answered && option === currentWord?.meaning
                                            ? "bg-emerald-600 border-emerald-800 text-white"
                                            : "bg-slate-800 border-slate-900 text-slate-200 hover:bg-slate-700"
                            )}
                        >
                            {option}
                        </motion.button>
                    );
                })}
            </div>

            {/* Feedback Overlay */}
            <AnimatePresence>
                {answered && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={clsx(
                            "absolute inset-0 pointer-events-none flex items-center justify-center",
                            isCorrect ? "bg-emerald-500/10" : "bg-rose-500/10"
                        )}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={clsx(
                                "rounded-full p-4",
                                isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                            )}
                        >
                            {isCorrect ? <CheckCircle size={64} /> : <XCircle size={64} />}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DifficultyCard = ({ title, emoji, time, lives, xp, selected, onClick }: {
    title: string;
    emoji: string;
    time: number;
    lives: number;
    xp: string;
    selected: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={clsx(
            "p-4 rounded-xl border-2 transition-all text-left",
            selected
                ? "bg-rose-500/20 border-rose-500"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
        )}
    >
        <div className="text-3xl mb-2">{emoji}</div>
        <h3 className="font-bold text-white">{title}</h3>
        <div className="text-xs text-slate-400 space-y-1 mt-2">
            <p>⏱️ {time}초/문제</p>
            <p>❤️ 목숨 {lives}개</p>
            <p>✨ XP {xp}</p>
        </div>
    </button>
);
