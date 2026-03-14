import { describe, expect, it } from 'vitest';
import {
    MULTIPLICATION_PRESETS,
    buildMultiplicationOptions,
    calculateMultiplicationXp,
    clampSelectedDans,
    createMultiplicationQuestion,
    getMultiplierCap,
} from '@/lib/multiplicationGame';

function sequenceRandom(values: number[]) {
    let index = 0;
    return () => {
        const value = values[index] ?? values[values.length - 1] ?? 0;
        index += 1;
        return value;
    };
}

describe('multiplicationGame helpers', () => {
    it('normalizes selected dans and falls back to warmup defaults', () => {
        expect(clampSelectedDans([5, 2, 2, 11, 1])).toEqual([2, 5]);
        expect(clampSelectedDans([])).toEqual(MULTIPLICATION_PRESETS.warmup.recommendedDans);
    });

    it('builds four unique options including the correct answer', () => {
        const options = buildMultiplicationOptions({
            answer: 18,
            dan: 3,
            multiplier: 6,
            random: sequenceRandom([0.1, 0.5, 0.9, 0.3, 0.7]),
        });

        expect(options).toHaveLength(4);
        expect(new Set(options).size).toBe(4);
        expect(options).toContain(18);
        expect(options.every((option) => option > 0)).toBe(true);
    });

    it('creates a question aligned to the selected dan and late-stage multiplier cap', () => {
        const question = createMultiplicationQuestion({
            dans: [3],
            questionIndex: 8,
            totalQuestions: 10,
            random: sequenceRandom([0, 0.99, 0.4, 0.6, 0.2, 0.8]),
        });

        expect(question.dan).toBe(3);
        expect(question.multiplier).toBe(9);
        expect(question.answer).toBe(27);
        expect(question.hint).toContain('3이 9개');
        expect(question.skipSequence).toEqual([3, 6, 9, 12, 15, 18, 21, 24, 27]);
        expect(question.options).toContain(27);
    });

    it('avoids repeating the previous question when another option exists', () => {
        const question = createMultiplicationQuestion({
            dans: [2, 3],
            questionIndex: 0,
            totalQuestions: 8,
            previousKey: '2x1',
            random: sequenceRandom([0, 0, 0.8, 0.6, 0.2, 0.4]),
        });

        expect(question.key).not.toBe('2x1');
    });

    it('increases multiplier cap as the stage progresses', () => {
        expect(getMultiplierCap(0, 10)).toBe(4);
        expect(getMultiplierCap(4, 10)).toBe(6);
        expect(getMultiplierCap(9, 10)).toBe(9);
    });

    it('awards more xp for a cleared, high-combo run and none for zero correct answers', () => {
        const partialXp = calculateMultiplicationXp({
            presetId: 'warmup',
            correctCount: 4,
            maxCombo: 2,
            totalQuestions: 8,
            remainingLives: 1,
            clearedStage: false,
        });

        const clearXp = calculateMultiplicationXp({
            presetId: 'mix',
            correctCount: 12,
            maxCombo: 7,
            totalQuestions: 12,
            remainingLives: 2,
            clearedStage: true,
        });

        const zeroXp = calculateMultiplicationXp({
            presetId: 'warmup',
            correctCount: 0,
            maxCombo: 0,
            totalQuestions: 8,
            remainingLives: 0,
            clearedStage: false,
        });

        expect(clearXp).toBeGreaterThan(partialXp);
        expect(zeroXp).toBe(0);
    });
});
