import { Text } from "@react-three/drei";
import { RigidBody, CuboidCollider, IntersectionEnterPayload } from "@react-three/rapier";
import { useState, useMemo } from "react";
import { useMathRunnerStore } from "@/store/useMathRunnerStore";

const gateColliderArgs: [number, number, number] = [2, 2, 0.5];
const gateBoxArgs: [number, number, number] = [4, 4, 1];

export default function Gates({ position, mathExpression, answer, wrongAnswer }: {
    position: [number, number, number],
    mathExpression: string,
    answer: number | string,
    wrongAnswer: number | string
}) {
    const [passed, setPassed] = useState(false);
    // Randomize whether the left gate is the correct answer. We use useMemo to only set once when spawned.
    const isLeftCorrect = useMemo(() => Math.random() > 0.5, []);

    // Assign answers and handlers based on randomization
    const leftAnswer = isLeftCorrect ? answer : wrongAnswer;
    const rightAnswer = isLeftCorrect ? wrongAnswer : answer;

    const addPlayers = useMathRunnerStore((state) => state.addPlayers);
    const subtractPlayers = useMathRunnerStore((state) => state.subtractPlayers);
    const advanceQuestion = useMathRunnerStore((state) => state.advanceQuestion);

    const handleCorrect = (e: IntersectionEnterPayload) => {
        if (passed) return;
        setPassed(true);
        addPlayers(10);
        advanceQuestion();
    };

    const handleWrong = (e: IntersectionEnterPayload) => {
        if (passed) return;
        setPassed(true);
        subtractPlayers(10);
        advanceQuestion();
    };

    const leftHandler = isLeftCorrect ? handleCorrect : handleWrong;
    const rightHandler = isLeftCorrect ? handleWrong : handleCorrect;

    return (
        <group position={position}>
            {/* Left Gate */}
            <RigidBody type="fixed" sensor onIntersectionEnter={leftHandler}>
                <CuboidCollider args={gateColliderArgs} position={[-2.5, 2, 0]} />
                <mesh position={[-2.5, 2, 0]}>
                    <boxGeometry args={gateBoxArgs} />
                    <meshStandardMaterial
                        color={passed ? (isLeftCorrect ? "#00ff00" : "#ff0000") : "#4488ff"}
                        transparent
                        opacity={passed ? 0.3 : 0.6}
                    />
                </mesh>
                <Text
                    position={[-2.5, 2, 0.6]}
                    fontSize={1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={3}
                    textAlign="center"
                >
                    {leftAnswer}
                </Text>
            </RigidBody>

            {/* Right Gate */}
            <RigidBody type="fixed" sensor onIntersectionEnter={rightHandler}>
                <CuboidCollider args={gateColliderArgs} position={[2.5, 2, 0]} />
                <mesh position={[2.5, 2, 0]}>
                    <boxGeometry args={gateBoxArgs} />
                    <meshStandardMaterial
                        color={passed ? (!isLeftCorrect ? "#00ff00" : "#ff0000") : "#4488ff"}
                        transparent
                        opacity={passed ? 0.3 : 0.6}
                    />
                </mesh>
                <Text
                    position={[2.5, 2, 0.6]}
                    fontSize={1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={3}
                    textAlign="center"
                >
                    {rightAnswer}
                </Text>
            </RigidBody>
        </group>
    );
}
