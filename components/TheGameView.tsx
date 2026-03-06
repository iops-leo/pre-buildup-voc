'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import { THE_WORDS, TheWord } from '@/data/the-words';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Zap, Heart, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import clsx from 'clsx';
import { useSound } from '@/hooks/useSound';
import { useTTS } from '@/hooks/useTTS';

interface TheGameViewProps {
    onBack: () => void;
}

type GameState = 'ready' | 'playing' | 'gameover';

const LIVES = 3;

export const TheGameView = ({ onBack }: TheGameViewProps) => {
    const { playCorrect, playWrong, playClick, playLevelUp } = useSound();
    const { speak } = useTTS();
    const { addXp } = useQuizStore();

    const [gameState, setGameState] = useState<GameState>('ready');
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [lives, setLives] = useState(LIVES);
    const [currentWord, setCurrentWord] = useState<TheWord | null>(null);
    const [answered, setAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [shuffledWords, setShuffledWords] = useState<TheWord[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showNote, setShowNote] = useState(false);
    const [wrongWords, setWrongWords] = useState<TheWord[]>([]);

    const nextWord = useCallback((words: TheWord[], idx: number) => {
        let nextIdx = idx + 1;
        let list = words;
        if (nextIdx >= list.length) {
            list = [...THE_WORDS].sort(() => Math.random() - 0.5);
            setShuffledWords(list);
            nextIdx = 0;
        }
        setCurrentIndex(nextIdx);
        setCurrentWord(list[nextIdx]);
        setAnswered(false);
        setSelectedAnswer(null);
        setShowNote(false);
    }, []);

    const startGame = useCallback(() => {
        const shuffled = [...THE_WORDS].sort(() => Math.random() - 0.5);
        setShuffledWords(shuffled);
        setCurrentIndex(0);
        setCurrentWord(shuffled[0]);
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setLives(LIVES);
        setQuestionsAnswered(0);
        setCorrectCount(0);
        setAnswered(false);
        setSelectedAnswer(null);
        setShowNote(false);
        setWrongWords([]);
        setGameState('playing');
    }, []);

    const handleAnswer = useCallback((choseVowel: boolean) => {
        if (answered || gameState !== 'playing' || !currentWord) return;

        playClick();
        setAnswered(true);
        setSelectedAnswer(choseVowel);
        const correct = choseVowel === currentWord.vowelSound;
        setIsCorrect(correct);

        if (correct) {
            playCorrect();
            const comboBonus = combo * 10;
            setScore(prev => prev + 100 + comboBonus);
            setCombo(prev => {
                const newCombo = prev + 1;
                setMaxCombo(max => Math.max(max, newCombo));
                return newCombo;
            });
            setCorrectCount(prev => prev + 1);
        } else {
            playWrong();
            setCombo(0);
            setWrongWords(prev => [...prev, currentWord]);
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setTimeout(() => setGameState('gameover'), 2500);
                }
                return newLives;
            });
        }

        setQuestionsAnswered(prev => prev + 1);

        if (currentWord.note) {
            setShowNote(true);
        }

        // TTS: speak "the [word]"
        speak(`the ${currentWord.word}`);

        // Next question after delay
        const delay = currentWord.note ? 3000 : correct ? 1200 : 2000;
        setTimeout(() => {
            if (lives > 1 || correct) {
                nextWord(shuffledWords, currentIndex);
            }
        }, delay);
    }, [answered, gameState, currentWord, combo, lives, shuffledWords, currentIndex, playClick, playCorrect, playWrong, speak, nextWord]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== 'playing' || answered) return;
            if (e.key === '1' || e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
                handleAnswer(true); // 디
            } else if (e.key === '2' || e.key === 'b' || e.key === 'B' || e.key === 'ArrowRight') {
                handleAnswer(false); // 더
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, answered, handleAnswer]);

    // XP on gameover
    const calculateXp = useCallback(() => {
        const baseXp = correctCount * 8;
        const scoreBonus = Math.floor(score / 100);
        const comboBonus = maxCombo * 5;
        return baseXp + scoreBonus + comboBonus;
    }, [correctCount, score, maxCombo]);

    useEffect(() => {
        if (gameState === 'gameover') {
            playLevelUp();
            const xp = calculateXp();
            addXp(xp);
        }
    }, [gameState, playLevelUp, calculateXp, addXp]);

    // === READY SCREEN ===
    if (gameState === 'ready') {
        return (
            <div className="w-full max-w-2xl mx-auto p-6 space-y-6 animate-in fade-in">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { playClick(); onBack(); }}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                            <Volume2 className="text-teal-500" /> The 발음 게임
                        </h1>
                        <p className="text-slate-400 text-sm">&quot;the&quot;를 정확하게 발음해보자!</p>
                    </div>
                </div>

                {/* Rules */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="font-bold text-white text-lg">규칙 알아보기</h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-teal-950/50 border border-teal-800/40 rounded-xl p-4 space-y-2">
                            <div className="text-2xl font-black text-teal-400">디 (thee)</div>
                            <p className="text-xs text-slate-400">모음 소리 앞에서</p>
                            <div className="space-y-1 text-sm text-slate-300">
                                <p>the <span className="text-teal-300 font-bold">a</span>pple</p>
                                <p>the <span className="text-teal-300 font-bold">e</span>gg</p>
                                <p>the <span className="text-teal-300 font-bold">o</span>range</p>
                            </div>
                        </div>
                        <div className="bg-indigo-950/50 border border-indigo-800/40 rounded-xl p-4 space-y-2">
                            <div className="text-2xl font-black text-indigo-400">더 (thuh)</div>
                            <p className="text-xs text-slate-400">자음 소리 앞에서</p>
                            <div className="space-y-1 text-sm text-slate-300">
                                <p>the <span className="text-indigo-300 font-bold">d</span>og</p>
                                <p>the <span className="text-indigo-300 font-bold">c</span>at</p>
                                <p>the <span className="text-indigo-300 font-bold">b</span>ook</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-3 flex items-start gap-2">
                        <Lightbulb size={18} className="text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-200">
                            <span className="font-bold">주의!</span> 글자가 아니라 <span className="font-bold">소리</span>가 중요해요!
                            <br />
                            <span className="text-amber-300">the hour → &quot;디&quot;</span> (h가 묵음!)
                            <br />
                            <span className="text-amber-300">the university → &quot;더&quot;</span> (유~ 소리!)
                        </div>
                    </div>
                </div>

                {/* Start */}
                <button
                    onClick={startGame}
                    className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-xl font-bold text-xl text-white flex items-center justify-center gap-3 border-b-4 border-teal-800 active:border-b-0 active:translate-y-1 transition-all"
                >
                    <Zap size={24} />
                    게임 시작
                </button>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <h3 className="font-bold text-white">게임 방법</h3>
                    <ul className="text-sm text-slate-400 space-y-1">
                        <li>• 단어를 보고 &quot;디&quot; 또는 &quot;더&quot;를 선택하세요</li>
                        <li>• 연속 정답으로 콤보 보너스!</li>
                        <li>• 목숨 {LIVES}개, 모두 잃으면 게임 종료</li>
                        <li>• 틀려도 괜찮아요, 배우는 게 중요!</li>
                    </ul>
                </div>
            </div>
        );
    }

    // === GAMEOVER SCREEN ===
    if (gameState === 'gameover') {
        const earnedXp = calculateXp();

        return (
            <div className="w-full max-w-2xl mx-auto p-6 space-y-6 animate-in fade-in zoom-in overflow-y-auto max-h-screen pb-20">
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="text-8xl"
                    >
                        {score >= 3000 ? '🏆' : score >= 1500 ? '🎉' : '💪'}
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
                            <p className="text-xl font-bold text-emerald-400">{correctCount}/{questionsAnswered}</p>
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

                {/* Wrong answers review */}
                {wrongWords.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                        <h3 className="font-bold text-amber-400 flex items-center gap-2">
                            <Lightbulb size={16} /> 틀린 단어 복습
                        </h3>
                        <div className="space-y-2">
                            {wrongWords.map((w, i) => (
                                <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-800 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">the {w.word}</span>
                                        <button
                                            onClick={() => speak(`the ${w.word}`)}
                                            className="p-1 rounded-full text-slate-500 hover:text-white"
                                        >
                                            <Volume2 size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={clsx(
                                            "font-bold",
                                            w.vowelSound ? "text-teal-400" : "text-indigo-400"
                                        )}>
                                            → {w.vowelSound ? "디" : "더"}
                                        </span>
                                        {w.note && (
                                            <span className="text-amber-400/70 text-xs">💡</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={startGame}
                        className="py-4 bg-teal-600 hover:bg-teal-500 rounded-xl font-bold text-white border-b-4 border-teal-800 active:border-b-0 active:translate-y-1"
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

    // === PLAYING SCREEN ===
    return (
        <div className="w-full h-screen flex flex-col bg-slate-950 overflow-hidden">
            {/* Header Stats */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50">
                <div className="flex items-center gap-2">
                    {Array.from({ length: LIVES }).map((_, i) => (
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
                            key={currentWord.word + currentIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center space-y-4"
                        >
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-4xl md:text-5xl font-black text-slate-500">the</span>
                                <span className="text-4xl md:text-5xl font-black text-white">{currentWord.word}</span>
                            </div>
                            <p className="text-lg text-slate-400">({currentWord.koreanHint})</p>
                            <button
                                onClick={() => speak(`the ${currentWord.word}`)}
                                className="mx-auto p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            >
                                <Volume2 size={22} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Feedback after answer */}
                <AnimatePresence>
                    {answered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-6 text-center space-y-2"
                        >
                            <div className={clsx(
                                "inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold",
                                isCorrect
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-rose-500/20 text-rose-400"
                            )}>
                                {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                {isCorrect ? "정답!" : "틀렸어요!"}
                                <span className="ml-1">
                                    {currentWord?.vowelSound
                                        ? <span className="text-teal-400">&quot;디&quot; {currentWord?.word}</span>
                                        : <span className="text-indigo-400">&quot;더&quot; {currentWord?.word}</span>
                                    }
                                </span>
                            </div>

                            {showNote && currentWord?.note && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full"
                                >
                                    <Lightbulb size={16} className="text-amber-400" />
                                    <span className="text-sm text-amber-200 font-medium">{currentWord.note}</span>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Answer Buttons */}
            <div className="p-4 pb-8 grid grid-cols-2 gap-4">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAnswer(true)}
                    disabled={answered}
                    className={clsx(
                        "py-8 rounded-2xl font-bold text-center border-b-4 active:border-b-0 active:translate-y-1 transition-all",
                        answered && currentWord?.vowelSound === true
                            ? "bg-emerald-600 border-emerald-800 text-white ring-4 ring-emerald-400/50"
                            : answered && selectedAnswer === true && !isCorrect
                                ? "bg-rose-600 border-rose-800 text-white"
                                : "bg-teal-600 border-teal-800 text-white hover:bg-teal-500"
                    )}
                >
                    <div className="text-3xl font-black mb-1">디</div>
                    <div className="text-sm opacity-80">(thee) 모음 소리</div>
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAnswer(false)}
                    disabled={answered}
                    className={clsx(
                        "py-8 rounded-2xl font-bold text-center border-b-4 active:border-b-0 active:translate-y-1 transition-all",
                        answered && currentWord?.vowelSound === false
                            ? "bg-emerald-600 border-emerald-800 text-white ring-4 ring-emerald-400/50"
                            : answered && selectedAnswer === false && !isCorrect
                                ? "bg-rose-600 border-rose-800 text-white"
                                : "bg-indigo-600 border-indigo-800 text-white hover:bg-indigo-500"
                    )}
                >
                    <div className="text-3xl font-black mb-1">더</div>
                    <div className="text-sm opacity-80">(thuh) 자음 소리</div>
                </motion.button>
            </div>
        </div>
    );
};
