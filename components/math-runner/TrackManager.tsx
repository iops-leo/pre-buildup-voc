import { useFrame } from "@react-three/fiber";
import { useState, useRef, useEffect } from "react";
import { useMathRunnerStore, MathLevel } from "@/store/useMathRunnerStore";
import Track from "./Track";
import Gates from "./Gates";

const SEGMENT_LENGTH = 100;
const VISIBLE_SEGMENTS = 3;

interface TrackSegment {
    z: number;
    expression: string;
    answer: number | string;
    wrongAnswer: number | string;
}

import { VOCABULARY_DATA } from "@/data/vocabulary";

function generateProblem(gameMode: 'math' | 'english', level: MathLevel) {
    if (gameMode === 'english') {
        return generateEnglishProblem();
    }

    let expression = "", answer: number | string = 0, wrongAnswer: number | string = 0;

    if (level === 'easy') {
        const isAdd = Math.random() > 0.5;
        const val1 = Math.floor(Math.random() * 10) + 1;
        const val2 = Math.floor(Math.random() * 10) + 1;
        if (isAdd) {
            answer = val1 + val2;
            wrongAnswer = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
            expression = `${val1} + ${val2} = ?`;
        } else {
            answer = Math.max(val1, val2) - Math.min(val1, val2);
            wrongAnswer = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
            expression = `${Math.max(val1, val2)} - ${Math.min(val1, val2)} = ?`;
        }
    } else if (level === 'medium') {
        const isMultiply = Math.random() > 0.6;
        if (isMultiply) {
            const val1 = Math.floor(Math.random() * 10) + 1;
            const val2 = Math.floor(Math.random() * 10) + 1;
            answer = val1 * val2;
            wrongAnswer = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
            expression = `${val1} x ${val2} = ?`;
        } else {
            const val1 = Math.floor(Math.random() * 40) + 10;
            const val2 = Math.floor(Math.random() * 40) + 10;
            answer = val1 + val2;
            wrongAnswer = answer as number + (Math.random() > 0.5 ? 10 : -10);
            expression = `${val1} + ${val2} = ?`;
        }
    } else { // hard
        const type = Math.random();
        if (type < 0.4) { // 2-digit multiply
            const val1 = Math.floor(Math.random() * 11) + 10;
            const val2 = Math.floor(Math.random() * 10) + 2;
            answer = val1 * val2;
            wrongAnswer = answer as number + (Math.random() > 0.5 ? 10 : -10);
            expression = `${val1} x ${val2} = ?`;
        } else if (type < 0.7) { // division
            const divisor = Math.floor(Math.random() * 9) + 2;
            const answerVal = Math.floor(Math.random() * 12) + 2;
            const val1 = divisor * answerVal;
            answer = answerVal;
            wrongAnswer = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
            expression = `${val1} ÷ ${divisor} = ?`;
        } else { // larger addition
            const val1 = Math.floor(Math.random() * 50) + 50;
            const val2 = Math.floor(Math.random() * 50) + 50;
            answer = val1 + val2;
            wrongAnswer = answer + (Math.random() > 0.5 ? 1 : -1) * 10;
            expression = `${val1} + ${val2} = ?`;
        }
    }

    // Ensure negative answers aren't confusing, clamp to positive or use abs in logic
    if (typeof wrongAnswer === 'number') {
        if (wrongAnswer < 0) wrongAnswer = Math.abs(wrongAnswer) + 2;
        if (wrongAnswer === answer) wrongAnswer = answer + 3; // Prevent identical options
    }

    return { expression, answer, wrongAnswer };
}

function generateEnglishProblem() {
    // Select two random words from the entire vocabulary pool
    const allWords = VOCABULARY_DATA.units.flatMap(u => u.lessons.flatMap(l => l.vocabulary));

    const correctTarget = allWords[Math.floor(Math.random() * allWords.length)];
    let wrongTarget = allWords[Math.floor(Math.random() * allWords.length)];

    // Ensure they are not the same
    while (wrongTarget.word === correctTarget.word) {
        wrongTarget = allWords[Math.floor(Math.random() * allWords.length)];
    }

    return {
        expression: correctTarget.meaning,
        answer: correctTarget.word,
        wrongAnswer: wrongTarget.word
    };
}

export default function TrackManager() {
    const level = useMathRunnerStore(state => state.level);
    const gameMode = useMathRunnerStore(state => state.gameMode);

    // Key on gameMode to force a reset of the segments when toggling modes
    const [segments, setSegments] = useState<TrackSegment[]>([
        { z: 0, expression: "Start", answer: 0, wrongAnswer: 0 },
        { z: -SEGMENT_LENGTH, ...generateProblem(gameMode, level) },
        { z: -SEGMENT_LENGTH * 2, ...generateProblem(gameMode, level) },
    ]);
    const lastZ = useRef(-SEGMENT_LENGTH * 2);

    // Reset track and questions if the game mode changes so words/math are immediate
    useEffect(() => {
        const store = useMathRunnerStore.getState();
        setSegments([
            { z: 0, expression: "Start", answer: 0, wrongAnswer: 0 },
            { z: -SEGMENT_LENGTH, ...generateProblem(store.gameMode, store.level) },
            { z: -SEGMENT_LENGTH * 2, ...generateProblem(store.gameMode, store.level) },
        ]);
        lastZ.current = -SEGMENT_LENGTH * 2;
        useMathRunnerStore.setState({ currentQuestion: "Ready?", playerZ: 0, playerCount: 1 });
    }, [gameMode]);

    // If level changes significantly, we might want to regenerate upcoming questions,
    // but the simplest approach is just letting new spawned gates use the new level.


    useFrame(() => {
        const playerZ = useMathRunnerStore.getState().playerZ;

        const currentSegmentIndex = Math.floor(playerZ / -SEGMENT_LENGTH);
        const expectedLastSegmentZ = -(currentSegmentIndex + VISIBLE_SEGMENTS - 1) * SEGMENT_LENGTH;

        // Determine which segment the player is currently in to show the correct question
        // If player is at -30, they are in segment 0 (0 to -100). The gate they are approaching is for segment 1 (-100).
        const upcomingSegmentIndex = currentSegmentIndex + 1;
        const upcomingSegment = segments.find(s => s.z === -upcomingSegmentIndex * SEGMENT_LENGTH);
        if (upcomingSegment) {
            useMathRunnerStore.setState({ currentQuestion: upcomingSegment.expression || "Run!" });
        }

        if (expectedLastSegmentZ < lastZ.current) {
            lastZ.current = expectedLastSegmentZ;
            setSegments(prev => {
                const store = useMathRunnerStore.getState();
                const newSegs = [...prev, { z: expectedLastSegmentZ, ...generateProblem(store.gameMode, store.level) }];
                return newSegs.filter(seg => seg.z <= -(currentSegmentIndex - 1) * SEGMENT_LENGTH);
            });
        }
    });

    return (
        <group>
            {segments.map((seg) => (
                <group key={seg.z}>
                    <Track position={[0, 0, seg.z]} length={SEGMENT_LENGTH} />
                    {seg.z < 0 && (
                        <Gates
                            position={[0, 0, seg.z - Math.floor(SEGMENT_LENGTH / 2)]}
                            mathExpression={seg.expression}
                            answer={seg.answer}
                            wrongAnswer={seg.wrongAnswer}
                        />
                    )}
                </group>
            ))}
        </group>
    );
}
