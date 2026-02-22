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

    const handleCorrect = (e: IntersectionEnterPayload) => {
        if (passed) return;
        setPassed(true);
        console.log("Passed correct gate!");
        addPlayers(10);
    };

    const handleWrong = (e: IntersectionEnterPayload) => {
        if (passed) return;
        setPassed(true);
        console.log("Passed wrong gate!");
        subtractPlayers(10);
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
                    <meshStandardMaterial color={passed ? (isLeftCorrect ? "rgba(0, 255, 0, 0.1)" : "rgba(255, 0, 0, 0.1)") : "rgba(255, 255, 255, 0.2)"} transparent />
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
                    <meshStandardMaterial color={passed ? (!isLeftCorrect ? "rgba(0, 255, 0, 0.1)" : "rgba(255, 0, 0, 0.1)") : "rgba(255, 255, 255, 0.2)"} transparent />
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
