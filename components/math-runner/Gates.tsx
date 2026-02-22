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
    const [hitType, setHitType] = useState<"correct" | "wrong" | null>(null);
    const [hitTime, setHitTime] = useState<number | null>(null);
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
        setHitType("correct");
        setHitTime(Date.now());
        addPlayers(10);
        advanceQuestion();
    };

    const handleWrong = (e: IntersectionEnterPayload) => {
        if (passed) return;
        setPassed(true);
        setHitType("wrong");
        setHitTime(Date.now());
        subtractPlayers(10);
        advanceQuestion();
    };

    const handleMiddle = (e: IntersectionEnterPayload) => {
        if (passed) return;
        setPassed(true);
        setHitType("wrong");
        setHitTime(Date.now());
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

            {/* Middle Bumper (Penalty for avoiding gates) */}
            <RigidBody type="fixed" sensor onIntersectionEnter={handleMiddle}>
                <CuboidCollider args={[0.5, 2, 0.5]} position={[0, 2, 0]} />
            </RigidBody>

            {/* Floating Feedback Text */}
            {passed && hitTime && Date.now() - hitTime < 1000 && (
                <Text
                    position={[0, 3 + ((Date.now() - hitTime) / 1000) * 3, 0]}
                    fontSize={2}
                    color={hitType === "correct" ? "#00ff00" : "#ff0000"}
                    outlineWidth={0.1}
                    outlineColor="#000000"
                    material-depthTest={false}
                >
                    {hitType === "correct" ? "+10" : "-10"}
                </Text>
            )}
        </group>
    );
}
