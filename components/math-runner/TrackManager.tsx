import { useFrame } from "@react-three/fiber";
import { useState, useRef, useEffect } from "react";
import { useMathRunnerStore, MathLevel } from "@/store/useMathRunnerStore";
import Track from "./Track";
import Gates from "./Gates";
import EnemyGroup from "./EnemyGroup";
import Obstacle from "./Obstacle";

const SEGMENT_LENGTH = 100;
const VISIBLE_SEGMENTS = 3;

interface EnemyData {
    id: string;
    position: [number, number, number];
    count: number;
}

interface ObstacleData {
    id: string;
    position: [number, number, number];
    type: 'rock' | 'barrier' | 'cone';
    damage: number;
}

interface TrackSegment {
    z: number;
    expression: string;
    answer: number | string;
    wrongAnswer: number | string;
    enemies: EnemyData[];
    obstacles: ObstacleData[];
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

function generateEnemies(segZ: number, level: MathLevel): EnemyData[] {
    const chance = level === 'easy' ? 0.3 : level === 'medium' ? 0.5 : 0.7;
    if (Math.random() > chance) return [];
    const count = level === 'easy'
        ? Math.floor(Math.random() * 3) + 2
        : level === 'medium'
            ? Math.floor(Math.random() * 5) + 3
            : Math.floor(Math.random() * 8) + 5;
    const x = (Math.random() - 0.5) * 6;
    const z = segZ - 15 - Math.random() * 25;
    return [{ id: `e${segZ}-${Math.random()}`, position: [x, 0.5, z], count }];
}

function generateObstacles(segZ: number, level: MathLevel): ObstacleData[] {
    const results: ObstacleData[] = [];
    const numObstacles = level === 'easy' ? 1 : level === 'medium' ? 2 : 3;
    const types: ('rock' | 'barrier' | 'cone')[] = ['rock', 'barrier', 'cone'];
    for (let i = 0; i < numObstacles; i++) {
        if (Math.random() > 0.5) continue;
        const type = types[Math.floor(Math.random() * types.length)];
        const damage = type === 'barrier' ? 5 : type === 'rock' ? 3 : 2;
        const x = (Math.random() - 0.5) * 8;
        const z = segZ - 55 - Math.random() * 35;
        results.push({ id: `o${segZ}-${i}-${Math.random()}`, position: [x, type === 'barrier' ? 0.75 : 0.5, z], type, damage });
    }
    return results;
}

function createSegment(z: number, gameMode: 'math' | 'english', level: MathLevel): TrackSegment {
    const problem = generateProblem(gameMode, level);
    return {
        z,
        ...problem,
        enemies: generateEnemies(z, level),
        obstacles: generateObstacles(z, level),
    };
}

export default function TrackManager() {
    const level = useMathRunnerStore(state => state.level);
    const gameMode = useMathRunnerStore(state => state.gameMode);

    const [segments, setSegments] = useState<TrackSegment[]>(() => {
        const seg1 = createSegment(-SEGMENT_LENGTH, gameMode, level);
        const seg2 = createSegment(-SEGMENT_LENGTH * 2, gameMode, level);
        return [
            { z: 0, expression: "Start", answer: 0, wrongAnswer: 0, enemies: [], obstacles: [] },
            seg1,
            seg2,
        ];
    });
    const lastZ = useRef(-SEGMENT_LENGTH * 2);

    useEffect(() => {
        const store = useMathRunnerStore.getState();
        const seg1 = createSegment(-SEGMENT_LENGTH, store.gameMode, store.level);
        const seg2 = createSegment(-SEGMENT_LENGTH * 2, store.gameMode, store.level);
        setSegments([
            { z: 0, expression: "Start", answer: 0, wrongAnswer: 0, enemies: [], obstacles: [] },
            seg1,
            seg2,
        ]);
        lastZ.current = -SEGMENT_LENGTH * 2;
        useMathRunnerStore.getState().resetGame();
    }, [gameMode]);

    // If level changes significantly, we might want to regenerate upcoming questions,
    // but the simplest approach is just letting new spawned gates use the new level.


    useFrame(() => {
        const playerZ = useMathRunnerStore.getState().playerZ;

        const currentSegmentIndex = Math.floor(playerZ / -SEGMENT_LENGTH);
        const expectedLastSegmentZ = -(currentSegmentIndex + VISIBLE_SEGMENTS - 1) * SEGMENT_LENGTH;

        const upcomingSegmentIndex = currentSegmentIndex + 1;
        const upcomingSegment = segments.find(s => s.z === -upcomingSegmentIndex * SEGMENT_LENGTH);
        if (upcomingSegment) {
            useMathRunnerStore.setState({ pendingQuestion: upcomingSegment.expression || "Run!" });
            const enemyCount = upcomingSegment.enemies.reduce((sum, e) => sum + e.count, 0);
            useMathRunnerStore.setState({ nextEnemyCount: enemyCount });
        }

        if (expectedLastSegmentZ < lastZ.current) {
            lastZ.current = expectedLastSegmentZ;
            setSegments(prev => {
                const store = useMathRunnerStore.getState();
                const newSeg = createSegment(expectedLastSegmentZ, store.gameMode, store.level);
                const newSegs = [...prev, newSeg];
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
                        <>
                            <Gates
                                position={[0, 0, seg.z - Math.floor(SEGMENT_LENGTH / 2)]}
                                mathExpression={seg.expression}
                                answer={seg.answer}
                                wrongAnswer={seg.wrongAnswer}
                            />
                            {seg.enemies.map((enemy) => (
                                <EnemyGroup
                                    key={enemy.id}
                                    position={enemy.position}
                                    count={enemy.count}
                                    onDefeated={() => {}}
                                />
                            ))}
                            {seg.obstacles.map((obs) => (
                                <Obstacle
                                    key={obs.id}
                                    position={obs.position}
                                    type={obs.type}
                                    damage={obs.damage}
                                />
                            ))}
                        </>
                    )}
                </group>
            ))}
        </group>
    );
}
