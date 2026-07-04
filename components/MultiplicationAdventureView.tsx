'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
    ArrowLeft,
    Award,
    Calculator,
    CheckCircle,
    Flame,
    Heart,
    PlayCircle,
    RefreshCw,
    Rocket,
    Sparkles,
    Star,
    Swords,
    Trophy,
    Zap,
} from 'lucide-react';
import { useSound } from '@/hooks/useSound';
import { BADGES, useQuizStore } from '@/store/useQuizStore';
import {
    AVAILABLE_DANS,
    MULTIPLICATION_PRESETS,
    MultiplicationPresetId,
    MultiplicationQuestion,
    calculateMultiplicationXp,
    clampSelectedDans,
    createMultiplicationQuestion,
} from '@/lib/multiplicationGame';

interface MultiplicationAdventureViewProps {
    onBack: () => void;
}

type GameState = 'ready' | 'playing' | 'result';

interface WrongAttempt {
    question: MultiplicationQuestion;
    selectedAnswer: number;
}

const getLocalVideoSrc = (fileName: string) => encodeURI(`/videos/${fileName}`);

const MULTIPLICATION_VIDEO_MAP = {
    2: {
        title: '2단 구구단 송',
        videoSrc: getLocalVideoSrc('구구단 2단 ｜ 구구단송 ｜ 숫자송 ｜ 숫자노래 ｜ 주니토니 by 키즈캐슬_jd65cGdIB6w.mp4'),
    },
    3: {
        title: '3단 구구단 송',
        videoSrc: getLocalVideoSrc('구구단 3단 ｜ 구구단송 ｜ 숫자송 ｜ 숫자노래 ｜ 주니토니 by 키즈캐슬_RUz-YzGOAZg.mp4'),
    },
    4: {
        title: '4단 구구단 송',
        videoSrc: getLocalVideoSrc('구구단 4단 ｜ 구구단송 ｜ 미이라처럼 불러보세요 ｜ 숫자송 ｜ 숫자노래 ｜ 주니토니 by 키즈캐슬_ZBCnmfM_VHU.mp4'),
    },
    5: {
        title: '5단 구구단 송',
        videoSrc: getLocalVideoSrc('구구단 5단 ｜ 5단 완전정복 ｜ 구구단송 ｜ 숫자송 ｜ 숫자노래 ｜ 주니토니 by 키즈캐슬_dcOJDzim-Vc.mp4'),
    },
    6: {
        title: '6단 구구단 송',
        videoSrc: getLocalVideoSrc('구구단 6단 ｜ 사탕을 여섯개씩 더해 보아요 ｜ 구구단동요 ｜ 구구단송 ｜ 숫자송 ｜ 주니토니 by 키즈캐슬_fuFQhGBm_Lc.mp4'),
    },
    7: {
        title: '7단 구구단 송',
        videoSrc: getLocalVideoSrc('구구단 7단 ｜ 외계인이 나타났다!!! ｜ 위기에 빠진 행성들을 구하고 싶은데... ｜ 구구단동요 ｜ 구구단송 ｜ 숫자송 ｜ 주니토니 by 키즈캐슬_F6SGPx_U_kU.mp4'),
    },
    8: {
        title: '8단 구구단 송',
        videoSrc: getLocalVideoSrc('8단.mp4'),
    },
    9: {
        title: '9단 구구단 송',
        videoSrc: getLocalVideoSrc('9단.mp4'),
    },
} as const;

const PRESET_STYLES: Record<MultiplicationPresetId, {
    hero: string;
    card: string;
    chip: string;
    button: string;
    progress: string;
    ring: string;
}> = {
    warmup: {
        hero: 'from-amber-500/30 via-orange-500/20 to-rose-500/15',
        card: 'border-amber-400/30 bg-amber-500/10',
        chip: 'border-amber-400/40 bg-amber-500/15 text-amber-100',
        button: 'from-amber-500 to-orange-500 border-amber-800',
        progress: 'from-amber-500 to-orange-500',
        ring: 'ring-amber-300/40',
    },
    adventure: {
        hero: 'from-emerald-500/25 via-cyan-500/20 to-sky-500/15',
        card: 'border-emerald-400/30 bg-emerald-500/10',
        chip: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100',
        button: 'from-emerald-500 to-cyan-500 border-emerald-800',
        progress: 'from-emerald-500 to-cyan-500',
        ring: 'ring-emerald-300/40',
    },
    mix: {
        hero: 'from-fuchsia-500/25 via-violet-500/20 to-sky-500/15',
        card: 'border-fuchsia-400/30 bg-fuchsia-500/10',
        chip: 'border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-100',
        button: 'from-fuchsia-500 to-violet-500 border-violet-800',
        progress: 'from-fuchsia-500 to-violet-500',
        ring: 'ring-fuchsia-300/40',
    },
};

interface BattleMonster {
    emoji: string;
    name: string;
    title: string;
    hpBar: string;
    glow: string;
    accent: string;
    aura: string;
}

const BATTLE_MONSTERS: BattleMonster[] = [
    {
        emoji: '🐉',
        name: '곱셈 드래곤',
        title: '불을 뿜는 구구단 수호룡',
        hpBar: 'from-emerald-500 to-lime-400',
        glow: 'bg-emerald-500/20',
        accent: 'text-emerald-300',
        aura: 'shadow-emerald-500/30',
    },
    {
        emoji: '👾',
        name: '숫자 몬스터',
        title: '틀린 답을 먹고 자라는 괴물',
        hpBar: 'from-violet-500 to-fuchsia-400',
        glow: 'bg-violet-500/20',
        accent: 'text-violet-300',
        aura: 'shadow-violet-500/30',
    },
    {
        emoji: '🦖',
        name: '구구공룡',
        title: '쿵쿵 발소리로 겁주는 공룡',
        hpBar: 'from-lime-500 to-emerald-400',
        glow: 'bg-lime-500/20',
        accent: 'text-lime-300',
        aura: 'shadow-lime-500/30',
    },
    {
        emoji: '👹',
        name: '계산 도깨비',
        title: '헷갈리게 만드는 장난꾸러기',
        hpBar: 'from-rose-500 to-orange-400',
        glow: 'bg-rose-500/20',
        accent: 'text-rose-300',
        aura: 'shadow-rose-500/30',
    },
    {
        emoji: '🤖',
        name: '곱셈 로봇',
        title: '정답만 인정하는 냉정한 로봇',
        hpBar: 'from-sky-500 to-cyan-400',
        glow: 'bg-sky-500/20',
        accent: 'text-sky-300',
        aura: 'shadow-sky-500/30',
    },
    {
        emoji: '🐙',
        name: '문어 마왕',
        title: '여덟 개 팔로 문제를 던지는 마왕',
        hpBar: 'from-fuchsia-500 to-pink-400',
        glow: 'bg-fuchsia-500/20',
        accent: 'text-fuchsia-300',
        aura: 'shadow-fuchsia-500/30',
    },
];

function getDanSummary(selectedDans: number[]): string {
    if (selectedDans.length === AVAILABLE_DANS.length) {
        return '2단부터 9단까지 전체';
    }

    return selectedDans.map((dan) => `${dan}단`).join(' · ');
}

function getBuddyMessage(params: {
    gameState: GameState;
    answered: boolean;
    isCorrect: boolean;
    combo: number;
    lives: number;
    question: MultiplicationQuestion | null;
    clearedStage: boolean;
    wrongCount: number;
}): string {
    const { gameState, answered, isCorrect, combo, lives, question, clearedStage, wrongCount } = params;

    if (gameState === 'ready') {
        return '막 시작하는 아이는 2단, 3단부터 소리 내서 읽으면서 풀면 좋아요.';
    }

    if (gameState === 'result') {
        if (clearedStage) {
            return wrongCount === 0
                ? '완벽해요. 이제 같은 단을 한 번 더 빠르게 말해보면 더 오래 기억나요.'
                : '완주했어요. 틀린 문제만 한 번 더 보면 금방 자기 것이 됩니다.';
        }

        return '하트가 다 닳았어도 괜찮아요. 방금 헷갈린 문제부터 다시 보면 실력이 붙어요.';
    }

    if (!question) return '천천히 생각해도 괜찮아요.';

    if (!answered) {
        if (combo >= 5) return '우와, 이제 곱셈 리듬이 붙었어요!';
        if (combo >= 3) return '좋아요. 같은 단의 규칙을 잡아가고 있어요.';
        if (lives === 1) return '마지막 하트예요. 이번 문제만 차분히 풀어봐요.';
        return `${question.dan}단은 건너뛰기 셈으로 생각하면 쉬워요.`;
    }

    return isCorrect
        ? combo >= 4
            ? '연속 정답! 거의 외우기 모드로 들어갔어요.'
            : '정답! 방금 문제를 소리 내어 한 번 더 읽어보면 더 잘 남아요.'
        : `정답은 ${question.answer}. ${question.dan}이 ${question.multiplier}개인 걸 떠올려봐요.`;
}

function getResultTitle(clearedStage: boolean, wrongCount: number): string {
    if (!clearedStage) return '다음 판에서 바로 만회할 수 있어요';
    if (wrongCount === 0) return '완벽한 구구단 탐험 성공';
    return '구구단 탐험 완주';
}

export const MultiplicationAdventureView = ({ onBack }: MultiplicationAdventureViewProps) => {
    const { recordMultiplicationResult } = useQuizStore();
    const { playClick, playCorrect, playWrong, playLevelUp } = useSound();

    const [gameState, setGameState] = useState<GameState>('ready');
    const [selectedPresetId, setSelectedPresetId] = useState<MultiplicationPresetId>('warmup');
    const [selectedDans, setSelectedDans] = useState<number[]>([...MULTIPLICATION_PRESETS.warmup.recommendedDans]);
    const [currentQuestion, setCurrentQuestion] = useState<MultiplicationQuestion | null>(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [lives, setLives] = useState(MULTIPLICATION_PRESETS.warmup.lives);
    const [answered, setAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [wrongAttempts, setWrongAttempts] = useState<WrongAttempt[]>([]);
    const [earnedXp, setEarnedXp] = useState(0);
    const [clearedStage, setClearedStage] = useState(false);
    const [newlyEarnedBadgeIds, setNewlyEarnedBadgeIds] = useState<string[]>([]);
    const [requestedVideoDan, setRequestedVideoDan] = useState<number>(2);
    const [bossIndex, setBossIndex] = useState(0);

    const advanceTimeoutRef = useRef<number | null>(null);

    const activePreset = MULTIPLICATION_PRESETS[selectedPresetId];
    const presetStyle = PRESET_STYLES[selectedPresetId];
    const normalizedDans = useMemo(() => clampSelectedDans(selectedDans), [selectedDans]);
    const activeVideoDan = MULTIPLICATION_VIDEO_MAP[requestedVideoDan as keyof typeof MULTIPLICATION_VIDEO_MAP]
        ? requestedVideoDan
        : 2;
    const activeVideo = MULTIPLICATION_VIDEO_MAP[activeVideoDan as keyof typeof MULTIPLICATION_VIDEO_MAP];
    const buddyMessage = getBuddyMessage({
        gameState,
        answered,
        isCorrect,
        combo,
        lives,
        question: currentQuestion,
        clearedStage,
        wrongCount: wrongAttempts.length,
    });

    const boss = BATTLE_MONSTERS[bossIndex] ?? BATTLE_MONSTERS[0];
    const bossMaxHp = activePreset.questionCount;
    const bossHitsLanded = questionIndex + (answered ? 1 : 0);
    const bossHp = Math.max(bossMaxHp - bossHitsLanded, 0);
    const bossHpPct = Math.max((bossHp / bossMaxHp) * 100, 0);
    const bossDefeated = bossHp <= 0;
    const isFever = combo >= 5;
    const isSpecialReady = combo >= 3;
    const hitDamage = isCorrect ? 10 + combo * 2 : 0;
    const battlePhase: 'idle' | 'hit' | 'hurt' = !answered ? 'idle' : isCorrect ? 'hit' : 'hurt';

    const clearAdvanceTimeout = useCallback(() => {
        if (advanceTimeoutRef.current !== null) {
            window.clearTimeout(advanceTimeoutRef.current);
            advanceTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => clearAdvanceTimeout, [clearAdvanceTimeout]);

    const launchQuestion = useCallback((nextQuestionIndex: number, previousKey?: string) => {
        const question = createMultiplicationQuestion({
            dans: normalizedDans,
            questionIndex: nextQuestionIndex,
            totalQuestions: activePreset.questionCount,
            previousKey,
        });

        setQuestionIndex(nextQuestionIndex);
        setCurrentQuestion(question);
        setAnswered(false);
        setSelectedAnswer(null);
        setIsCorrect(false);
    }, [activePreset.questionCount, normalizedDans]);

    const startGame = useCallback(() => {
        clearAdvanceTimeout();
        setGameState('playing');
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setCorrectCount(0);
        setLives(activePreset.lives);
        setWrongAttempts([]);
        setEarnedXp(0);
        setClearedStage(false);
        setNewlyEarnedBadgeIds([]);
        setBossIndex(Math.floor(Math.random() * BATTLE_MONSTERS.length));
        launchQuestion(0);
    }, [activePreset.lives, clearAdvanceTimeout, launchQuestion]);

    const finishGame = useCallback((params: {
        nextCorrectCount: number;
        nextMaxCombo: number;
        nextLives: number;
        didClearStage: boolean;
    }) => {
        const xp = calculateMultiplicationXp({
            presetId: activePreset.id,
            correctCount: params.nextCorrectCount,
            maxCombo: params.nextMaxCombo,
            totalQuestions: activePreset.questionCount,
            remainingLives: Math.max(params.nextLives, 0),
            clearedStage: params.didClearStage,
        });

        const newlyEarned = recordMultiplicationResult({
            selectedDans: normalizedDans,
            xpGained: xp,
            maxCombo: params.nextMaxCombo,
            clearedStage: params.didClearStage,
            perfectClear: params.didClearStage && wrongAttempts.length === 0,
        });

        playLevelUp();
        setEarnedXp(xp);
        setClearedStage(params.didClearStage);
        setNewlyEarnedBadgeIds(newlyEarned);
        setGameState('result');
    }, [activePreset.id, activePreset.questionCount, normalizedDans, playLevelUp, recordMultiplicationResult, wrongAttempts.length]);

    const handleLeave = useCallback(() => {
        playClick();

        if (gameState === 'playing' && !window.confirm('구구단 탐험을 멈추고 홈으로 돌아갈까요?')) {
            return;
        }

        clearAdvanceTimeout();
        onBack();
    }, [clearAdvanceTimeout, gameState, onBack, playClick]);

    const handlePresetSelect = useCallback((presetId: MultiplicationPresetId) => {
        playClick();
        setSelectedPresetId(presetId);
        setSelectedDans([...MULTIPLICATION_PRESETS[presetId].recommendedDans]);
    }, [playClick]);

    const toggleDan = useCallback((dan: number) => {
        playClick();
        setSelectedDans((current) => {
            if (current.includes(dan)) {
                const next = current.filter((value) => value !== dan);
                return next.length > 0 ? next : current;
            }

            return [...current, dan].sort((left, right) => left - right);
        });
    }, [playClick]);

    const selectVideoDan = useCallback((dan: number) => {
        playClick();
        setRequestedVideoDan(dan);
    }, [playClick]);

    const handleAnswer = useCallback((option: number) => {
        if (!currentQuestion || answered || gameState !== 'playing') return;

        clearAdvanceTimeout();
        playClick();

        const correct = option === currentQuestion.answer;
        const nextCombo = correct ? combo + 1 : 0;
        const nextMaxCombo = correct ? Math.max(maxCombo, nextCombo) : maxCombo;
        const nextCorrectCount = correct ? correctCount + 1 : correctCount;
        const nextLives = correct ? lives : lives - 1;
        const nextScore = correct ? score + 100 + combo * 15 + currentQuestion.multiplier * 4 : score;
        const nextWrongAttempts = correct
            ? wrongAttempts
            : [...wrongAttempts, { question: currentQuestion, selectedAnswer: option }];

        setAnswered(true);
        setSelectedAnswer(option);
        setIsCorrect(correct);
        setCombo(nextCombo);
        setMaxCombo(nextMaxCombo);
        setCorrectCount(nextCorrectCount);
        setLives(nextLives);
        setScore(nextScore);
        setWrongAttempts(nextWrongAttempts);

        if (correct) {
            playCorrect();
        } else {
            playWrong();
        }

        const nextQuestionIndex = questionIndex + 1;
        const didClearStage = nextQuestionIndex >= activePreset.questionCount && nextLives > 0;
        const shouldFinish = didClearStage || nextLives <= 0;

        advanceTimeoutRef.current = window.setTimeout(() => {
            if (shouldFinish) {
                finishGame({
                    nextCorrectCount,
                    nextMaxCombo,
                    nextLives,
                    didClearStage,
                });
                return;
            }

            launchQuestion(nextQuestionIndex, currentQuestion.key);
        }, correct ? 900 : 1250);
    }, [
        activePreset.questionCount,
        answered,
        clearAdvanceTimeout,
        combo,
        correctCount,
        currentQuestion,
        finishGame,
        gameState,
        launchQuestion,
        lives,
        maxCombo,
        playClick,
        playCorrect,
        playWrong,
        questionIndex,
        score,
        wrongAttempts,
    ]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleLeave();
                return;
            }

            if (gameState !== 'playing' || answered || !currentQuestion) return;

            const optionIndex = Number.parseInt(event.key, 10) - 1;
            if (Number.isNaN(optionIndex) || optionIndex < 0 || optionIndex >= currentQuestion.options.length) return;

            event.preventDefault();
            handleAnswer(currentQuestion.options[optionIndex]);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [answered, currentQuestion, gameState, handleAnswer, handleLeave]);

    if (gameState === 'ready') {
        return (
            <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLeave}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
                        aria-label="뒤로 가기"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                            <Calculator className="text-amber-400" /> 구구단 탐험
                        </h1>
                        <p className="text-slate-400 text-sm">작게 시작해서 반복하며 외우는 곱셈 놀이예요.</p>
                    </div>
                </div>

                <section className={clsx('relative overflow-hidden rounded-[28px] border p-6 md:p-8', presetStyle.card)}>
                    <div className={clsx('absolute inset-0 bg-gradient-to-br', presetStyle.hero)} />
                    <div className="absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative z-10 space-y-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-3">
                                <div className={clsx('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold', presetStyle.chip)}>
                                    <Sparkles size={14} />
                                    오늘의 구구단 미션
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black text-white">
                                        {activePreset.mascot} {activePreset.title}
                                    </h2>
                                    <p className="mt-2 max-w-2xl text-sm md:text-base text-slate-100/85">
                                        {activePreset.description}
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0 rounded-3xl border border-white/15 bg-slate-950/40 px-5 py-4 text-center">
                                <div className="text-4xl">{activePreset.mascot}</div>
                                <div className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-300/80">
                                    Memorize With Rhythm
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            {Object.values(MULTIPLICATION_PRESETS).map((preset) => {
                                const selected = preset.id === selectedPresetId;

                                return (
                                    <button
                                        key={preset.id}
                                        onClick={() => handlePresetSelect(preset.id)}
                                        className={clsx(
                                            'rounded-3xl border p-4 text-left transition-all duration-200',
                                            selected
                                                ? 'border-white/25 bg-slate-950/55 ring-2 ring-white/20'
                                                : 'border-slate-700/60 bg-slate-950/35 hover:border-slate-500/60 hover:bg-slate-900/55'
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-2xl">{preset.mascot}</div>
                                                <h3 className="mt-2 text-lg font-black text-white">{preset.title}</h3>
                                            </div>
                                            <div className={clsx(
                                                'rounded-full px-2.5 py-1 text-[11px] font-bold',
                                                selected ? 'bg-white text-slate-950' : 'bg-slate-800 text-slate-300'
                                            )}>
                                                {preset.questionCount}문제
                                            </div>
                                        </div>
                                        <p className="mt-3 text-sm text-slate-300/85">{preset.description}</p>
                                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                                            <span className="rounded-full border border-slate-600 bg-slate-900/60 px-2.5 py-1">
                                                하트 {preset.lives}
                                            </span>
                                            <span className="rounded-full border border-slate-600 bg-slate-900/60 px-2.5 py-1">
                                                추천 {preset.recommendedDans[0]}단~{preset.recommendedDans[preset.recommendedDans.length - 1]}단
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 md:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-black text-white">오늘 집중할 단</h3>
                                <p className="text-sm text-slate-400">막 시작하면 2단, 3단만 골라도 충분해요.</p>
                            </div>
                            <div className={clsx('hidden rounded-full border px-3 py-1 text-xs font-bold md:inline-flex', presetStyle.chip)}>
                                {getDanSummary(normalizedDans)}
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                            {AVAILABLE_DANS.map((dan) => {
                                const selected = normalizedDans.includes(dan);
                                return (
                                    <button
                                        key={dan}
                                        onClick={() => toggleDan(dan)}
                                        className={clsx(
                                            'rounded-2xl border px-4 py-3 text-sm font-black transition-all duration-200',
                                            selected
                                                ? `bg-slate-100 text-slate-950 ${presetStyle.ring} ring-2`
                                                : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 hover:text-white'
                                        )}
                                    >
                                        {dan}단
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                            <p className="text-sm text-slate-300">
                                선택된 범위:
                                <span className="ml-2 font-bold text-white">{getDanSummary(normalizedDans)}</span>
                            </p>
                            <p className="mt-2 text-sm text-slate-400">
                                힌트 문장과 건너뛰기 셈을 같이 보여줘서, 외우기 시작하는 아이도 규칙을 눈으로 같이 익힐 수 있게 했어요.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 md:p-6">
                        <h3 className="text-lg font-black text-white">미션 요약</h3>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                            <SummaryStat icon={<Star size={18} className="text-amber-300" />} label="문제 수" value={`${activePreset.questionCount}개`} />
                            <SummaryStat icon={<Heart size={18} className="text-rose-300" />} label="하트" value={`${activePreset.lives}개`} />
                            <SummaryStat icon={<Rocket size={18} className="text-sky-300" />} label="XP 배수" value={`${activePreset.xpMultiplier.toFixed(2)}x`} />
                        </div>
                        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                            <p className="font-bold text-white">응원 한마디</p>
                            <p className="mt-2 leading-relaxed text-slate-400">{buddyMessage}</p>
                        </div>
                        <button
                            onClick={() => {
                                playClick();
                                startGame();
                            }}
                            className={clsx(
                                'mt-5 w-full rounded-2xl border-b-[4px] bg-gradient-to-r py-4 text-lg font-black text-white transition-all active:translate-y-1 active:border-b-0',
                                presetStyle.button
                            )}
                        >
                            탐험 시작
                        </button>
                    </div>
                </section>

                <section className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-5 md:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className={clsx('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold', presetStyle.chip)}>
                                <PlayCircle size={14} />
                                단수별 구구단 송
                            </div>
                            <h3 className="mt-3 text-xl md:text-2xl font-black text-white">같은 화면에서 바로 보고 따라 외우기</h3>
                            <p className="mt-2 text-sm text-slate-400">
                                아래 단수를 누르면 이 화면 안에서 바로 재생됩니다. 선택한 단은 미션 단수와 별개로 자유롭게 볼 수 있어요.
                            </p>
                        </div>
                        <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm font-bold text-slate-200">
                            지금 보기: {activeVideoDan}단
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                        {AVAILABLE_DANS.map((dan) => {
                            const isSelected = activeVideoDan === dan;
                            const isInMission = normalizedDans.includes(dan);

                            return (
                                <button
                                    key={`video-${dan}`}
                                    onClick={() => selectVideoDan(dan)}
                                    className={clsx(
                                        'rounded-2xl border px-4 py-3 text-sm font-black transition-all duration-200',
                                        isSelected
                                            ? `bg-slate-100 text-slate-950 ${presetStyle.ring} ring-2`
                                            : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 hover:text-white'
                                    )}
                                >
                                    <span>{dan}단</span>
                                    {isInMission && (
                                        <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                                            오늘 미션
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-black shadow-2xl shadow-black/20">
                            <div className="aspect-video">
                                <video
                                    key={activeVideoDan}
                                    src={activeVideo.videoSrc}
                                    title={activeVideo.title}
                                    className="h-full w-full"
                                    controls
                                    playsInline
                                    preload="metadata"
                                    controlsList="nodownload noremoteplayback"
                                    disablePictureInPicture
                                />
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-800 bg-slate-950/80 p-5">
                            <div className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Now Playing</div>
                            <h4 className="mt-3 text-2xl font-black text-white">{activeVideo.title}</h4>
                            <p className="mt-3 text-sm leading-relaxed text-slate-400">
                                구구단을 막 시작할 때는 영상을 한 번 보고, 바로 아래 미션에서 같은 단만 골라 3~5문제씩 짧게 반복하는 흐름이 가장 부담이 적습니다.
                            </p>
                            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                                <p className="text-sm font-bold text-white">추천 루틴</p>
                                <p className="mt-2 text-sm text-slate-400">
                                    {activeVideoDan}단 노래 보기 → {activeVideoDan}단만 선택 → 워밍업 코스로 짧게 풀기
                                </p>
                            </div>
                            <p className="mt-4 text-xs leading-relaxed text-slate-500">
                                업로드한 mp4를 직접 재생하므로 새 화면으로 나가지 않고 이 화면 안에서 바로 볼 수 있습니다.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (gameState === 'result') {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLeave}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
                        aria-label="뒤로 가기"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                            {clearedStage ? <Trophy className="text-amber-400" /> : <RefreshCw className="text-sky-400" />}
                            {getResultTitle(clearedStage, wrongAttempts.length)}
                        </h1>
                        <p className="text-slate-400 text-sm">{buddyMessage}</p>
                    </div>
                </div>

                <section className={clsx('rounded-[28px] border p-6 md:p-8', presetStyle.card)}>
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="text-5xl">{clearedStage ? activePreset.mascot : '💪'}</div>
                            <h2 className="mt-3 text-3xl font-black text-white">
                                {clearedStage ? '오늘의 미션 완료' : '다시 도전하면 더 잘할 수 있어요'}
                            </h2>
                            <p className="mt-2 text-slate-200/85">
                                {wrongAttempts.length === 0
                                    ? '틀린 문제 없이 아주 깔끔하게 끝냈어요.'
                                    : `헷갈린 문제 ${wrongAttempts.length}개만 다시 보면 훨씬 단단해집니다.`}
                            </p>
                        </div>
                        <div className="rounded-3xl border border-white/15 bg-slate-950/50 p-5 text-center">
                            <div className="text-sm font-bold uppercase tracking-[0.28em] text-slate-400">earned xp</div>
                            <div className="mt-2 text-4xl font-black text-white">+{earnedXp}</div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-3 md:grid-cols-4">
                    <SummaryStat icon={<CheckCircle size={18} className="text-emerald-300" />} label="정답" value={`${correctCount}/${activePreset.questionCount}`} />
                    <SummaryStat icon={<Flame size={18} className="text-orange-300" />} label="최대 콤보" value={`${maxCombo}콤보`} />
                    <SummaryStat icon={<Star size={18} className="text-amber-300" />} label="점수" value={`${score}점`} />
                    <SummaryStat icon={<Heart size={18} className="text-rose-300" />} label="남은 하트" value={`${Math.max(lives, 0)}개`} />
                </section>

                {newlyEarnedBadgeIds.length > 0 && (
                    <section className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-5 md:p-6">
                        <div className="flex items-center gap-2 text-amber-100">
                            <Award size={20} />
                            <h3 className="text-lg font-black">새 구구단 뱃지 획득</h3>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {newlyEarnedBadgeIds.map((badgeId) => {
                                const badge = BADGES.find((item) => item.id === badgeId);
                                if (!badge) return null;

                                return (
                                    <div
                                        key={badge.id}
                                        className="rounded-2xl border border-amber-300/20 bg-slate-950/70 p-4"
                                    >
                                        <div className="text-3xl">{badge.icon}</div>
                                        <div className="mt-2 text-base font-black text-white">{badge.name}</div>
                                        <p className="mt-1 text-sm text-slate-400">{badge.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {wrongAttempts.length > 0 && (
                    <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 md:p-6">
                        <h3 className="text-lg font-black text-white">다시 보면 좋은 문제</h3>
                        <div className="mt-4 space-y-3">
                            {wrongAttempts.map((attempt) => (
                                <div
                                    key={`${attempt.question.key}-${attempt.selectedAnswer}`}
                                    className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <div className="text-lg font-black text-white">
                                                {attempt.question.expression} = {attempt.question.answer}
                                            </div>
                                            <p className="mt-1 text-sm text-slate-400">
                                                {attempt.question.hint} 선택한 답: {attempt.selectedAnswer}
                                            </p>
                                        </div>
                                        <div className="rounded-full bg-rose-500/10 px-3 py-1 text-sm font-bold text-rose-200">
                                            {attempt.question.dan}단 복습
                                        </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {attempt.question.skipSequence.map((value, index) => (
                                            <span
                                                key={`${attempt.question.key}-${value}`}
                                                className={clsx(
                                                    'rounded-full border px-3 py-1 text-xs font-bold',
                                                    index === attempt.question.skipSequence.length - 1
                                                        ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100'
                                                        : 'border-slate-700 bg-slate-900 text-slate-300'
                                                )}
                                            >
                                                {value}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="flex flex-col gap-3 md:flex-row">
                    <button
                        onClick={() => {
                            playClick();
                            startGame();
                        }}
                        className={clsx(
                            'flex-1 rounded-2xl border-b-[4px] bg-gradient-to-r py-4 text-lg font-black text-white transition-all active:translate-y-1 active:border-b-0',
                            presetStyle.button
                        )}
                    >
                        같은 미션 다시 하기
                    </button>
                    <button
                        onClick={handleLeave}
                        className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 py-4 text-lg font-black text-slate-200 transition-colors hover:bg-slate-800"
                    >
                        홈으로
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto p-4 md:p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between gap-3 rounded-[24px] border border-slate-800 bg-slate-900/90 p-3 md:p-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleLeave}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
                        aria-label="뒤로 가기"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-rose-300/90">
                            <Swords size={13} /> Boss Battle
                        </div>
                        <h1 className="text-lg md:text-xl font-black text-white">
                            {activePreset.mascot} {activePreset.title}
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm font-bold text-slate-200">
                        {questionIndex + 1} / {activePreset.questionCount}
                    </div>
                    <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm font-bold text-amber-200">
                        ⭐ {score}
                    </div>
                </div>
            </div>

            <motion.div
                animate={battlePhase === 'hurt' ? { x: [0, -12, 12, -8, 8, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className={clsx(
                    'relative overflow-hidden rounded-[32px] border p-6 md:p-8 transition-colors duration-500',
                    isFever ? 'border-orange-400/50 bg-indigo-950' : 'border-slate-800 bg-slate-900/90'
                )}
            >
                <div className={clsx('pointer-events-none absolute left-1/2 top-4 h-44 w-44 -translate-x-1/2 rounded-full blur-3xl', boss.glow)} />

                <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className={clsx('text-sm font-black', boss.accent)}>{boss.name}</span>
                            <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                                Lv.{activePreset.questionCount}
                            </span>
                        </div>
                        <span className="text-xs font-bold text-slate-400">HP {bossHp} / {bossMaxHp}</span>
                    </div>
                    <div className="mt-2 h-4 overflow-hidden rounded-full border border-slate-700 bg-slate-950">
                        <motion.div
                            className={clsx('h-full bg-gradient-to-r', boss.hpBar)}
                            animate={{ width: `${bossHpPct}%` }}
                            transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                        />
                    </div>
                </div>

                <div className="relative z-10 mt-5 flex flex-col items-center">
                    <motion.div
                        key={`boss-${questionIndex}-${answered}`}
                        animate={
                            battlePhase === 'hit'
                                ? { scale: [1, 1.15, 0.9, 1], rotate: [0, -6, 6, 0], filter: ['brightness(1)', 'brightness(2.2)', 'brightness(1)'] }
                                : battlePhase === 'hurt'
                                    ? { scale: [1, 1.2, 1], y: [0, 10, 0] }
                                    : { y: [0, -8, 0] }
                        }
                        transition={
                            battlePhase === 'idle'
                                ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                                : { duration: 0.5 }
                        }
                        className={clsx('text-7xl md:text-8xl drop-shadow-2xl', boss.aura)}
                    >
                        {bossDefeated ? '💥' : boss.emoji}
                    </motion.div>
                    <p className="mt-2 text-xs text-slate-400">{boss.title}</p>

                    <AnimatePresence>
                        {answered && (
                            <motion.div
                                key={`fx-${questionIndex}`}
                                initial={{ opacity: 0, y: 12, scale: 0.6 }}
                                animate={{ opacity: 1, y: -36, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className={clsx(
                                    'absolute top-2 text-3xl md:text-4xl font-black drop-shadow',
                                    isCorrect ? 'text-amber-300' : 'text-rose-400'
                                )}
                            >
                                {isCorrect ? `-${hitDamage}` : '반격!'}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative z-10 mt-6 text-center">
                    <div className="text-[11px] font-bold uppercase tracking-[0.36em] text-slate-500">공격 주문</div>
                    <div className="mt-2 text-5xl md:text-6xl font-black text-white">
                        {currentQuestion?.expression}
                        <span className="text-amber-300"> = ?</span>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {currentQuestion?.skipSequence.slice(0, -1).map((value, index) => (
                            <span
                                key={`${currentQuestion.key}-seq-${index}`}
                                className="rounded-full border border-slate-700 bg-slate-950/80 px-2.5 py-1 text-xs font-bold text-slate-300"
                            >
                                {value}
                            </span>
                        ))}
                        <span
                            className={clsx(
                                'rounded-full border px-2.5 py-1 text-xs font-black transition-colors',
                                answered
                                    ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100'
                                    : 'border-amber-400/50 bg-amber-500/10 text-amber-200'
                            )}
                        >
                            {answered ? currentQuestion?.answer : '?'}
                        </span>
                    </div>
                </div>
            </motion.div>

            <div className="flex flex-col gap-3 rounded-[24px] border border-slate-800 bg-slate-900/90 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <span className="mr-1 text-xs font-bold text-slate-400">내 하트</span>
                    {Array.from({ length: activePreset.lives }).map((_, index) => (
                        <Heart
                            key={`life-${index}`}
                            size={22}
                            className={clsx(index < lives ? 'text-rose-400 fill-rose-400' : 'text-slate-700')}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <span className={clsx('flex items-center gap-1 text-xs font-black', isFever ? 'text-orange-300' : 'text-slate-400')}>
                        {isFever ? (
                            <>🔥 필살기 발동!</>
                        ) : isSpecialReady ? (
                            <><Zap size={13} /> 필살기 준비</>
                        ) : (
                            <>콤보 {combo}</>
                        )}
                    </span>
                    <div className="h-3 w-32 overflow-hidden rounded-full border border-slate-700 bg-slate-950">
                        <motion.div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
                            animate={{ width: `${Math.min((combo / 5) * 100, 100)}%` }}
                            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                        />
                    </div>
                </div>
            </div>

            <div className={clsx('rounded-[28px] border p-5 transition-colors duration-500', isFever ? 'border-orange-400/40 bg-indigo-950/60' : 'border-slate-800 bg-slate-900/90')}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black text-white">공격 카드를 골라!</h2>
                        <p className="text-sm text-slate-400">숫자 키 1~4로도 공격할 수 있어요.</p>
                    </div>
                    {answered && (
                        <div className={clsx(
                            'rounded-full px-3 py-1 text-sm font-bold',
                            isCorrect ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'
                        )}>
                            {isCorrect ? (combo >= 4 ? '필살기 명중!' : '명중!') : '빗나감!'}
                        </div>
                    )}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    {currentQuestion?.options.map((option, index) => {
                        const isSelected = option === selectedAnswer;
                        const isAnswer = option === currentQuestion.answer;

                        return (
                            <button
                                key={`${currentQuestion.key}-${option}`}
                                onClick={() => handleAnswer(option)}
                                disabled={answered}
                                className={clsx(
                                    'rounded-3xl border px-4 py-5 text-center transition-all duration-200',
                                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950',
                                    answered && isAnswer && 'border-emerald-400 bg-emerald-500/15 text-emerald-100',
                                    answered && isSelected && !isAnswer && 'border-rose-400 bg-rose-500/15 text-rose-100',
                                    answered && !isAnswer && !isSelected && 'border-slate-800 bg-slate-950/60 text-slate-500',
                                    !answered && 'border-slate-700 bg-slate-950 text-white hover:-translate-y-1 hover:border-amber-400/60 hover:bg-slate-800 active:translate-y-0'
                                )}
                            >
                                <div className="text-[11px] font-bold text-slate-500">{index + 1}번 공격</div>
                                <div className="mt-2 text-3xl font-black">{option}</div>
                            </button>
                        );
                    })}
                </div>

                <p className="mt-4 text-center text-xs text-slate-500">{buddyMessage}</p>
            </div>
        </div>
    );
};

const SummaryStat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="flex items-center gap-2 text-slate-300">
                {icon}
                <span className="text-sm font-bold">{label}</span>
            </div>
            <div className="mt-3 text-2xl font-black text-white">{value}</div>
        </div>
    );
};
