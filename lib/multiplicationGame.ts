export const AVAILABLE_DANS = [2, 3, 4, 5, 6, 7, 8, 9] as const;

export type MultiplicationPresetId = 'warmup' | 'adventure' | 'mix';

export interface MultiplicationPreset {
    id: MultiplicationPresetId;
    title: string;
    description: string;
    mascot: string;
    questionCount: number;
    lives: number;
    xpMultiplier: number;
    recommendedDans: number[];
}

export interface MultiplicationQuestion {
    key: string;
    dan: number;
    multiplier: number;
    answer: number;
    expression: string;
    hint: string;
    skipSequence: number[];
    options: number[];
}

interface BuildOptionsParams {
    answer: number;
    dan: number;
    multiplier: number;
    random?: () => number;
}

interface CreateQuestionParams {
    dans: number[];
    questionIndex: number;
    totalQuestions: number;
    previousKey?: string;
    random?: () => number;
}

interface CalculateXpParams {
    presetId: MultiplicationPresetId;
    correctCount: number;
    maxCombo: number;
    totalQuestions: number;
    remainingLives: number;
    clearedStage: boolean;
}

export const MULTIPLICATION_PRESETS: Record<MultiplicationPresetId, MultiplicationPreset> = {
    warmup: {
        id: 'warmup',
        title: '워밍업 코스',
        description: '2단과 3단으로 자신감을 붙이는 첫 구구단 탐험이에요.',
        mascot: '🐣',
        questionCount: 8,
        lives: 4,
        xpMultiplier: 1,
        recommendedDans: [2, 3],
    },
    adventure: {
        id: 'adventure',
        title: '탐험 코스',
        description: '2단부터 5단까지 넓혀서 규칙을 익히는 연습 코스예요.',
        mascot: '🚀',
        questionCount: 10,
        lives: 3,
        xpMultiplier: 1.2,
        recommendedDans: [2, 3, 4, 5],
    },
    mix: {
        id: 'mix',
        title: '랜덤 MIX',
        description: '2단부터 9단까지 섞어서 실전 감각을 키워요.',
        mascot: '🌈',
        questionCount: 12,
        lives: 3,
        xpMultiplier: 1.45,
        recommendedDans: [...AVAILABLE_DANS],
    },
};

function shuffleArray<T>(items: T[], random: () => number): T[] {
    const copy = [...items];

    for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }

    return copy;
}

function pickRandom<T>(items: T[], random: () => number): T {
    return items[Math.floor(random() * items.length)]!;
}

export function clampSelectedDans(dans: number[]): number[] {
    const normalized = Array.from(
        new Set(
            dans.filter((dan): dan is number =>
                AVAILABLE_DANS.includes(dan as (typeof AVAILABLE_DANS)[number])
            )
        )
    ).sort((left, right) => left - right);

    return normalized.length > 0
        ? normalized
        : [...MULTIPLICATION_PRESETS.warmup.recommendedDans];
}

export function getMultiplierCap(questionIndex: number, totalQuestions: number): number {
    if (totalQuestions <= 4) return 5;

    const progress = questionIndex / Math.max(totalQuestions - 1, 1);

    if (progress < 0.34) return 4;
    if (progress < 0.67) return 6;
    return 9;
}

export function buildMultiplicationOptions({
    answer,
    dan,
    multiplier,
    random = Math.random,
}: BuildOptionsParams): number[] {
    const candidates = new Set<number>();

    const addCandidate = (value: number) => {
        if (value > 0 && value !== answer) {
            candidates.add(value);
        }
    };

    addCandidate(dan * Math.max(1, multiplier - 1));
    addCandidate(dan * Math.min(9, multiplier + 1));
    addCandidate(Math.max(1, dan - 1) * multiplier);
    addCandidate(Math.min(9, dan + 1) * multiplier);
    addCandidate(answer - dan);
    addCandidate(answer + dan);
    addCandidate(answer - multiplier);
    addCandidate(answer + multiplier);
    addCandidate(answer - (dan + multiplier));
    addCandidate(answer + (dan + multiplier));

    for (let attempt = 0; candidates.size < 6 && attempt < 50; attempt += 1) {
        const delta = Math.floor(random() * 8) + 1;
        addCandidate(answer + delta);
        if (candidates.size < 6) {
            addCandidate(answer - delta);
        }
    }

    const distractors = shuffleArray([...candidates], random).slice(0, 3);
    return shuffleArray([...distractors, answer], random);
}

export function createMultiplicationQuestion({
    dans,
    questionIndex,
    totalQuestions,
    previousKey,
    random = Math.random,
}: CreateQuestionParams): MultiplicationQuestion {
    const normalizedDans = clampSelectedDans(dans);
    const multiplierCap = getMultiplierCap(questionIndex, totalQuestions);
    const multipliers = Array.from({ length: multiplierCap }, (_, index) => index + 1);

    let dan = pickRandom(normalizedDans, random);
    let multiplier = pickRandom(multipliers, random);
    let key = `${dan}x${multiplier}`;

    for (let attempt = 0; attempt < 12 && normalizedDans.length * multipliers.length > 1; attempt += 1) {
        if (key !== previousKey) break;
        dan = pickRandom(normalizedDans, random);
        multiplier = pickRandom(multipliers, random);
        key = `${dan}x${multiplier}`;
    }

    const answer = dan * multiplier;
    const skipSequence = Array.from({ length: multiplier }, (_, index) => dan * (index + 1));

    return {
        key,
        dan,
        multiplier,
        answer,
        expression: `${dan} × ${multiplier}`,
        hint: `${dan}이 ${multiplier}개 모이면 얼마일까?`,
        skipSequence,
        options: buildMultiplicationOptions({ answer, dan, multiplier, random }),
    };
}

export function calculateMultiplicationXp({
    presetId,
    correctCount,
    maxCombo,
    totalQuestions,
    remainingLives,
    clearedStage,
}: CalculateXpParams): number {
    if (correctCount <= 0) return 0;

    const preset = MULTIPLICATION_PRESETS[presetId];
    const baseXp = correctCount * 12;
    const comboBonus = maxCombo * 6;
    const stageBonus = clearedStage ? 24 : 0;
    const perfectBonus = correctCount === totalQuestions ? 30 : 0;
    const lifeBonus = remainingLives * 5;

    return Math.round((baseXp + comboBonus + stageBonus + perfectBonus + lifeBonus) * preset.xpMultiplier);
}
