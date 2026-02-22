import { useFrame } from "@react-three/fiber";
import { useState, useRef } from "react";
import { useMathRunnerStore } from "@/store/useMathRunnerStore";
import Track from "./Track";
import Gates from "./Gates";

const SEGMENT_LENGTH = 100;
const VISIBLE_SEGMENTS = 3;

interface TrackSegment {
    z: number;
    expression: string;
    answer: number;
    wrongAnswer: number;
}

function generateProblem() {
    const isAdd = Math.random() > 0.5;
    const val1 = Math.floor(Math.random() * 10) + 1;
    const val2 = Math.floor(Math.random() * 10) + 1;
    let answer, wrongAnswer, expression;

    if (isAdd) {
        answer = val1 + val2;
        wrongAnswer = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
        expression = `${val1} + ${val2} = ?`;
    } else {
        answer = val1 * val2;
        wrongAnswer = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
        expression = `${val1} x ${val2} = ?`;
    }

    return { expression, answer, wrongAnswer };
}

export default function TrackManager() {
    const [segments, setSegments] = useState<TrackSegment[]>([
        { z: 0, expression: "Start", answer: 0, wrongAnswer: 0 },
        { z: -SEGMENT_LENGTH, ...generateProblem() },
        { z: -SEGMENT_LENGTH * 2, ...generateProblem() },
    ]);
    const lastZ = useRef(-SEGMENT_LENGTH * 2);

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
                const newSegs = [...prev, { z: expectedLastSegmentZ, ...generateProblem() }];
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
