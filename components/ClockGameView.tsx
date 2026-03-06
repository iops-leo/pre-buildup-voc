'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Zap, Heart, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { useSound } from '@/hooks/useSound';

interface ClockGameViewProps {
    onBack: () => void;
}

type GameState = 'ready' | 'playing' | 'gameover';

interface ClockQuestion {
    hours: number;
    minutes: number;
    display: string;
    level: number;
}

interface WrongAnswer {
    question: ClockQuestion;
    selectedAnswer: string;
}

const LIVES = 3;

const LEVEL_INFO = [
    { level: 1, from: 1, to: 5, label: '정각', color: 'text-emerald-400' },
    { level: 2, from: 6, to: 10, label: '30분', color: 'text-blue-400' },
    { level: 3, from: 11, to: 15, label: '15분/45분', color: 'text-purple-400' },
    { level: 4, from: 16, to: Infinity, label: '5분 단위', color: 'text-rose-400' },
];

function getLevel(questionNum: number): number {
    for (const info of LEVEL_INFO) {
        if (questionNum >= info.from && questionNum <= info.to) return info.level;
    }
    return 4;
}

function formatTime(h: number, m: number): string {
    return `${h}:${m.toString().padStart(2, '0')}`;
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTime(level: number): ClockQuestion {
    const hours = randomInt(1, 12);
    let minutes: number;
    switch (level) {
        case 1: minutes = 0; break;
        case 2: minutes = [0, 30][randomInt(0, 1)]; break;
        case 3: minutes = [0, 15, 30, 45][randomInt(0, 3)]; break;
        default: minutes = randomInt(0, 11) * 5; break;
    }
    return { hours, minutes, display: formatTime(hours, minutes), level };
}

function generateOptions(correct: ClockQuestion, level: number): string[] {
    const options = new Set<string>();
    options.add(correct.display);

    let attempts = 0;
    while (options.size < 4 && attempts < 50) {
        attempts++;
        let h: number, m: number;

        if (level === 1) {
            h = randomInt(1, 12);
            m = 0;
        } else if (level === 2) {
            if (Math.random() < 0.5) {
                h = correct.hours;
                m = correct.minutes === 0 ? 30 : 0;
            } else {
                h = randomInt(1, 12);
                m = [0, 30][randomInt(0, 1)];
            }
        } else if (level === 3) {
            const quarters = [0, 15, 30, 45];
            if (Math.random() < 0.4) {
                h = correct.hours;
                const filtered = quarters.filter(q => q !== correct.minutes);
                m = filtered[randomInt(0, filtered.length - 1)];
            } else {
                h = randomInt(1, 12);
                m = quarters[randomInt(0, 3)];
            }
        } else {
            if (Math.random() < 0.5) {
                h = correct.hours;
                const offsets = [-10, -5, 5, 10, 15, -15];
                const offset = offsets[randomInt(0, offsets.length - 1)];
                m = ((correct.minutes + offset) % 60 + 60) % 60;
            } else {
                h = randomInt(1, 12);
                m = randomInt(0, 11) * 5;
            }
        }

        options.add(formatTime(h, m));
    }

    return [...options].sort(() => Math.random() - 0.5);
}

// ===== SVG Analog Clock =====
const AnalogClock = ({ hours, minutes, size = 240 }: { hours: number; minutes: number; size?: number }) => {
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 10;

    const minuteAngle = minutes * 6;
    const hourAngle = (hours % 12) * 30 + minutes * 0.5;

    const minuteHandLength = radius * 0.75;
    const hourHandLength = radius * 0.52;

    const angleToPoint = (angle: number, length: number) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        return { x: cx + length * Math.cos(rad), y: cy + length * Math.sin(rad) };
    };

    const minuteEnd = angleToPoint(minuteAngle, minuteHandLength);
    const hourEnd = angleToPoint(hourAngle, hourHandLength);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Face */}
            <circle cx={cx} cy={cy} r={radius} fill="#1e293b" stroke="#475569" strokeWidth="3" />

            {/* Minute tick marks */}
            {Array.from({ length: 60 }).map((_, i) => {
                const isHour = i % 5 === 0;
                const outer = angleToPoint(i * 6, radius - 4);
                const inner = angleToPoint(i * 6, radius - (isHour ? 16 : 8));
                return (
                    <line key={`t${i}`}
                        x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                        stroke={isHour ? '#94a3b8' : '#475569'} strokeWidth={isHour ? 2 : 1} strokeLinecap="round"
                    />
                );
            })}

            {/* Hour numbers */}
            {Array.from({ length: 12 }).map((_, i) => {
                const num = i + 1;
                const pos = angleToPoint(num * 30, radius - 30);
                return (
                    <text key={`n${num}`}
                        x={pos.x} y={pos.y}
                        textAnchor="middle" dominantBaseline="central"
                        fill="#e2e8f0" fontSize={size * 0.075} fontWeight="bold"
                        fontFamily="system-ui, sans-serif"
                    >
                        {num}
                    </text>
                );
            })}

            {/* Minute hand */}
            <line x1={cx} y1={cy} x2={minuteEnd.x} y2={minuteEnd.y}
                stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />

            {/* Hour hand */}
            <line x1={cx} y1={cy} x2={hourEnd.x} y2={hourEnd.y}
                stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />

            {/* Center dot */}
            <circle cx={cx} cy={cy} r="5" fill="#f8fafc" />
            <circle cx={cx} cy={cy} r="2" fill="#60a5fa" />
        </svg>
    );
};

// ===== Main Component =====
export const ClockGameView = ({ onBack }: ClockGameViewProps) => {
    const { playCorrect, playWrong, playClick, playLevelUp } = useSound();
    const { addXp } = useQuizStore();

    const [gameState, setGameState] = useState<GameState>('ready');
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [lives, setLives] = useState(LIVES);
    const [currentQuestion, setCurrentQuestion] = useState<ClockQuestion | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [answered, setAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);

    const startGame = useCallback(() => {
        const question = generateTime(1);
        setGameState('playing');
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setLives(LIVES);
        setQuestionsAnswered(0);
        setCorrectCount(0);
        setCurrentLevel(1);
        setCurrentQuestion(question);
        setOptions(generateOptions(question, 1));
        setAnswered(false);
        setSelectedAnswer(null);
        setWrongAnswers([]);
    }, []);

    const nextQuestion = useCallback(() => {
        const nextNum = questionsAnswered + 2;
        const level = getLevel(nextNum);
        setCurrentLevel(level);
        const question = generateTime(level);
        setCurrentQuestion(question);
        setOptions(generateOptions(question, level));
        setAnswered(false);
        setSelectedAnswer(null);
    }, [questionsAnswered]);

    const handleAnswer = useCallback((selected: string) => {
        if (answered || gameState !== 'playing' || !currentQuestion) return;

        playClick();
        setAnswered(true);
        setSelectedAnswer(selected);
        const correct = selected === currentQuestion.display;
        setIsCorrect(correct);
        setQuestionsAnswered(prev => prev + 1);

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
            setWrongAnswers(prev => [...prev, { question: currentQuestion, selectedAnswer: selected }]);
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setTimeout(() => setGameState('gameover'), 1500);
                }
                return newLives;
            });
        }

        const delay = correct ? 1200 : 2000;
        setTimeout(() => {
            if (lives > 1 || correct) {
                nextQuestion();
            }
        }, delay);
    }, [answered, gameState, currentQuestion, combo, lives, playClick, playCorrect, playWrong, nextQuestion]);

    // Keyboard shortcuts: 1-4
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== 'playing' || answered) return;
            const idx = parseInt(e.key) - 1;
            if (idx >= 0 && idx < options.length) {
                handleAnswer(options[idx]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, answered, options, handleAnswer]);

    const calculateXp = useCallback(() => {
        const baseXp = correctCount * 8;
        const scoreBonus = Math.floor(score / 100);
        const comboBonus = maxCombo * 5;
        return baseXp + scoreBonus + comboBonus;
    }, [correctCount, score, maxCombo]);

    useEffect(() => {
        if (gameState === 'gameover') {
            playLevelUp();
            addXp(calculateXp());
        }
    }, [gameState, playLevelUp, calculateXp, addXp]);

    const levelInfo = LEVEL_INFO.find(l => l.level === currentLevel) || LEVEL_INFO[0];

    // ===== READY SCREEN =====
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
                            <Clock className="text-sky-500" /> 시계 읽기 게임
                        </h1>
                        <p className="text-slate-400 text-sm">아날로그 시계를 읽어보세요!</p>
                    </div>
                </div>

                {/* Demo Clock */}
                <div className="flex justify-center">
                    <AnalogClock hours={3} minutes={0} size={160} />
                </div>

                {/* Level Explanation */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 className="font-bold text-white text-lg">단계별 난이도</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {LEVEL_INFO.map(info => (
                            <div key={info.level} className="bg-slate-800/50 rounded-lg p-3">
                                <span className={clsx("font-bold text-sm", info.color)}>
                                    Level {info.level}
                                </span>
                                <p className="text-xs text-slate-400 mt-0.5">{info.label}</p>
                                <p className="text-xs text-slate-600">{info.from}~{info.to === Infinity ? '∞' : info.to}번째</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={startGame}
                    className="w-full py-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 rounded-xl font-bold text-xl text-white flex items-center justify-center gap-3 border-b-4 border-sky-800 active:border-b-0 active:translate-y-1 transition-all"
                >
                    <Zap size={24} />
                    게임 시작
                </button>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <h3 className="font-bold text-white">게임 방법</h3>
                    <ul className="text-sm text-slate-400 space-y-1">
                        <li>• 시계를 보고 맞는 시간을 골라주세요</li>
                        <li>• 맞출수록 난이도가 올라가요</li>
                        <li>• 시간 제한 없이 천천히 생각해도 돼요</li>
                        <li>• 목숨 {LIVES}개, 모두 잃으면 게임 종료</li>
                    </ul>
                </div>
            </div>
        );
    }

    // ===== GAMEOVER SCREEN =====
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

                {/* Wrong Answers Review with mini clocks */}
                {wrongAnswers.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                        <h3 className="font-bold text-amber-400 flex items-center gap-2">
                            <Clock size={16} /> 틀린 문제 복습
                        </h3>
                        <div className="space-y-3">
                            {wrongAnswers.map((wa, i) => (
                                <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-800 last:border-0">
                                    <AnalogClock hours={wa.question.hours} minutes={wa.question.minutes} size={72} />
                                    <div className="flex-1">
                                        <p className="text-emerald-400 font-bold">정답: {wa.question.display}</p>
                                        <p className="text-rose-400 text-sm">내 답: {wa.selectedAnswer}</p>
                                        <p className="text-slate-600 text-xs">Level {wa.question.level}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={startGame}
                        className="py-4 bg-sky-600 hover:bg-sky-500 rounded-xl font-bold text-white border-b-4 border-sky-800 active:border-b-0 active:translate-y-1 transition-all"
                    >
                        다시 하기
                    </button>
                    <button
                        onClick={() => { playClick(); onBack(); }}
                        className="py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-white border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 transition-all"
                    >
                        나가기
                    </button>
                </div>
            </div>
        );
    }

    // ===== PLAYING SCREEN =====
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
                <div className="flex items-center gap-3">
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

            {/* Level Badge + Question Count */}
            <div className="flex items-center justify-center gap-3 py-2">
                <span className={clsx("px-3 py-1 rounded-full text-xs font-bold bg-slate-800", levelInfo.color)}>
                    Level {currentLevel} - {levelInfo.label}
                </span>
                <span className="text-xs text-slate-600">{questionsAnswered + 1}번째</span>
            </div>

            {/* Clock Display */}
            <div className="flex-1 flex items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    {currentQuestion && (
                        <motion.div
                            key={`${currentQuestion.hours}-${currentQuestion.minutes}-${questionsAnswered}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', duration: 0.4 }}
                        >
                            <AnalogClock hours={currentQuestion.hours} minutes={currentQuestion.minutes} size={240} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Feedback */}
            <AnimatePresence>
                {answered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-center pb-2"
                    >
                        <div className={clsx(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold",
                            isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                        )}>
                            {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                            {isCorrect ? '정답!' : `오답! 정답은 ${currentQuestion?.display}`}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Options - 2x2 Grid */}
            <div className="p-4 pb-8 grid grid-cols-2 gap-3">
                {options.map((option, idx) => (
                    <motion.button
                        key={option}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAnswer(option)}
                        disabled={answered}
                        className={clsx(
                            "py-5 rounded-2xl font-bold text-xl text-center border-b-4 active:border-b-0 active:translate-y-1 transition-all",
                            answered && option === currentQuestion?.display
                                ? "bg-emerald-600 border-emerald-800 text-white ring-4 ring-emerald-400/50"
                                : answered && option === selectedAnswer && !isCorrect
                                    ? "bg-rose-600 border-rose-800 text-white"
                                    : "bg-slate-800 border-slate-900 text-slate-200 hover:bg-slate-700"
                        )}
                    >
                        <span className="text-xs text-slate-500 block mb-1">{idx + 1}</span>
                        {option}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
