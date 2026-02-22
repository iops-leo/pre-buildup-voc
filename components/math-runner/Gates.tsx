import { Text } from "@react-three/drei";
import { RigidBody, CuboidCollider, IntersectionEnterPayload } from "@react-three/rapier";
import { useState } from "react";
import { useMathRunnerStore } from "@/store/useMathRunnerStore";

export default function Gates({ position, mathExpression, answer, wrongAnswer }: {
    position: [number, number, number],
    mathExpression: string,
    answer: number,
    wrongAnswer: number
}) {
    const [passed, setPassed] = useState(false);
    const { addPlayers, subtractPlayers } = useMathRunnerStore((state) => ({
        addPlayers: state.addPlayers,
        subtractPlayers: state.subtractPlayers
    }));

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

    return (
        <group position={position}>
            {/* Left Gate (Answer) */}
            <RigidBody type="fixed" sensor onIntersectionEnter={handleCorrect}>
                <CuboidCollider args={[2, 2, 0.5]} position={[-2.5, 2, 0]} />
                <mesh position={[-2.5, 2, 0]}>
                    <boxGeometry args={[4, 4, 1]} />
                    <meshStandardMaterial color={passed ? "rgba(0, 255, 0, 0.1)" : "rgba(0, 255, 0, 0.3)"} transparent />
                </mesh>
                <Text
                    position={[-2.5, 2, 0.6]}
                    fontSize={1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {answer}
                </Text>
            </RigidBody>

            {/* Right Gate (Wrong) */}
            <RigidBody type="fixed" sensor onIntersectionEnter={handleWrong}>
                <CuboidCollider args={[2, 2, 0.5]} position={[2.5, 2, 0]} />
                <mesh position={[2.5, 2, 0]}>
                    <boxGeometry args={[4, 4, 1]} />
                    <meshStandardMaterial color={passed ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 0, 0, 0.3)"} transparent />
                </mesh>
                <Text
                    position={[2.5, 2, 0.6]}
                    fontSize={1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {wrongAnswer}
                </Text>
            </RigidBody>
        </group>
    );
}
