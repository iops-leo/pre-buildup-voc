import { useFrame } from "@react-three/fiber";
import { useState, useRef, useEffect } from "react";
import { useMathRunnerStore, MathLevel } from "@/store/useMathRunnerStore";
import Track from "./Track";
import Gates from "./Gates";
import EnemyGroup from "./EnemyGroup";
import Obstacle from "./Obstacle";

const SEGMENT_LENGTH = 100;
const VISIBLE_SEGMENTS = 3;
const GOAL_Z = -3000; // Finish line distance

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
    isFinishLine?: boolean;
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
    // Always spawn enemies, count scales with difficulty
    const count = Math.floor(Math.random() * 6) + 8; // 8~13
    const x = (Math.random() - 0.5) * 6;
    const z = segZ - 15 - Math.random() * 25;
    return [{ id: `e${segZ}-${Math.random()}`, position: [x, 0.5, z], count }];
}

function generateObstacles(segZ: number, level: MathLevel): ObstacleData[] {
    const results: ObstacleData[] = [];
    const numObstacles = 2;
    const types: ('rock' | 'barrier' | 'cone')[] = ['rock', 'barrier', 'cone'];
    for (let i = 0; i < numObstacles; i++) {
        if (Math.random() > 0.6) continue;
        const type = types[Math.floor(Math.random() * types.length)];
        const damage = type === 'barrier' ? 8 : type === 'rock' ? 5 : 3;
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

function buildInitialSegments(gameMode: 'math' | 'english', level: MathLevel): TrackSegment[] {
    return [
        { z: 0, expression: "Start", answer: 0, wrongAnswer: 0, enemies: [], obstacles: [] },
        createSegment(-SEGMENT_LENGTH, gameMode, level),
        createSegment(-SEGMENT_LENGTH * 2, gameMode, level),
    ];
}

export default function TrackManager() {
    const level = useMathRunnerStore(state => state.level);
    const gameMode = useMathRunnerStore(state => state.gameMode);
    const gameState = useMathRunnerStore(state => state.gameState);

    const [segments, setSegments] = useState<TrackSegment[]>(() =>
        buildInitialSegments(gameMode, level)
    );
    const lastZ = useRef(-SEGMENT_LENGTH * 2);

    // Reset segments when game starts or restarts
    useEffect(() => {
        if (gameState === 'playing') {
            const store = useMathRunnerStore.getState();
            const newSegments = buildInitialSegments(store.gameMode, store.level);
            setSegments(newSegments);
            lastZ.current = -SEGMENT_LENGTH * 2;
            // Set the first question immediately so it doesn't stay on "Get Ready!"
            const firstProblem = newSegments[1];
            if (firstProblem) {
                useMathRunnerStore.setState({
                    currentQuestion: firstProblem.expression,
                    pendingQuestion: firstProblem.expression,
                });
            }
        }
    }, [gameState]);

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

                let newSeg: TrackSegment;

                if (expectedLastSegmentZ <= GOAL_Z) {
                    // Spawn the finish line instead of a normal problem segment
                    // Only do this once
                    const alreadyHasFinish = prev.some(s => s.isFinishLine);
                    if (alreadyHasFinish) {
                        return prev.filter(seg => seg.z <= -(currentSegmentIndex - 1) * SEGMENT_LENGTH);
                    }
                    newSeg = {
                        z: GOAL_Z,
                        expression: "FINISH!",
                        answer: 0,
                        wrongAnswer: 0,
                        enemies: [],
                        obstacles: [],
                        isFinishLine: true
                    };
                } else {
                    newSeg = createSegment(expectedLastSegmentZ, store.gameMode, store.level);
                }

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
                                    onDefeated={() => { }}
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
                            {seg.isFinishLine && (
                                <group position={[0, 0, seg.z]}>
                                    <mesh position={[0, 0, 0]}>
                                        <boxGeometry args={[10, 0.2, 2]} />
                                        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
                                    </mesh>
                                    <mesh position={[-5, 4, 0]}>
                                        <cylinderGeometry args={[0.2, 0.2, 8]} />
                                        <meshStandardMaterial color="#888888" />
                                    </mesh>
                                    <mesh position={[5, 4, 0]}>
                                        <cylinderGeometry args={[0.2, 0.2, 8]} />
                                        <meshStandardMaterial color="#888888" />
                                    </mesh>
                                    <mesh position={[0, 7, 0]}>
                                        <boxGeometry args={[10, 2, 0.2]} />
                                        <meshStandardMaterial color="#FF0000" />
                                    </mesh>
                                </group>
                            )}
                        </>
                    )}
                </group>
            ))}
        </group>
    );
}
