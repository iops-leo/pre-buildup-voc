import { Text } from "@react-three/drei";
import { RigidBody, CuboidCollider, IntersectionEnterPayload } from "@react-three/rapier";
import { useState, useMemo } from "react";
import { useMathRunnerStore } from "@/store/useMathRunnerStore";

const gateColliderArgs: [number, number, number] = [2.75, 1.75, 0.15];
const gateBoxArgs: [number, number, number] = [5.5, 3.5, 0.15];

export default function Gates({ position, mathExpression, answer, wrongAnswer }: {
    position: [number, number, number],
    mathExpression: string,
    answer: number | string,
    wrongAnswer: number | string
}) {
    const [passed, setPassed] = useState(false);
    const [hitType, setHitType] = useState<"correct" | "wrong" | null>(null);
    const [hitTime, setHitTime] = useState<number | null>(null);
    const isLeftCorrect = useMemo(() => Math.random() > 0.5, []);

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

    const leftColor = passed
        ? (isLeftCorrect ? "#4CAF50" : "#F44336")
        : "#42A5F5";
    const rightColor = passed
        ? (!isLeftCorrect ? "#4CAF50" : "#F44336")
        : "#42A5F5";

    return (
        <group position={position}>
            {/* Left Gate */}
            <RigidBody type="fixed" sensor onIntersectionEnter={leftHandler}>
                <CuboidCollider args={gateColliderArgs} position={[-3, 1.75, 0]} />
                <mesh position={[-3, 1.75, 0]}>
                    <boxGeometry args={gateBoxArgs} />
                    <meshStandardMaterial
                        color={leftColor}
                        transparent
                        opacity={passed ? 0.5 : 0.85}
                    />
                </mesh>
                <Text
                    position={[-3, 1.75, 0.12]}
                    fontSize={1.4}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={4}
                    textAlign="center"
                    fontWeight="bold"
                >
                    {String(leftAnswer)}
                </Text>
            </RigidBody>

            {/* Right Gate */}
            <RigidBody type="fixed" sensor onIntersectionEnter={rightHandler}>
                <CuboidCollider args={gateColliderArgs} position={[3, 1.75, 0]} />
                <mesh position={[3, 1.75, 0]}>
                    <boxGeometry args={gateBoxArgs} />
                    <meshStandardMaterial
                        color={rightColor}
                        transparent
                        opacity={passed ? 0.5 : 0.85}
                    />
                </mesh>
                <Text
                    position={[3, 1.75, 0.12]}
                    fontSize={1.4}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={4}
                    textAlign="center"
                    fontWeight="bold"
                >
                    {String(rightAnswer)}
                </Text>
            </RigidBody>

            {/* Middle Bumper (Penalty for avoiding gates) */}
            <RigidBody type="fixed" sensor onIntersectionEnter={handleMiddle}>
                <CuboidCollider args={[0.5, 1.75, 0.5]} position={[0, 1.75, 0]} />
            </RigidBody>

            {/* Thin divider pole between the two gates */}
            <mesh position={[0, 1.75, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 3.5, 8]} />
                <meshStandardMaterial color="#78909C" />
            </mesh>

            {/* Floating Feedback Text */}
            {passed && hitTime && Date.now() - hitTime < 1000 && (
                <Text
                    position={[0, 4 + ((Date.now() - hitTime) / 1000) * 4, 0]}
                    fontSize={3.5}
                    color={hitType === "correct" ? "#00ff00" : "#ff0000"}
                    outlineWidth={0.15}
                    outlineColor="#000000"
                    material-depthTest={false}
                    fontWeight="black"
                >
                    {hitType === "correct" ? "+10 명" : "-10 명"}
                </Text>
            )}
        </group>
    );
}
