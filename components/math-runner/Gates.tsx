import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { useState, useMemo, useRef } from "react";
import * as THREE from "three";
import { useMathRunnerStore } from "@/store/useMathRunnerStore";
import { playGateResultSound } from "@/lib/mathRunnerAudio";
import { useMathRunnerRuntimeConfig } from "./RuntimeConfig";

const gateColliderArgs: [number, number, number] = [2.75, 1.75, 0.15];
const gateBoxArgs: [number, number, number] = [5.5, 3.5, 0.15];

export default function Gates({ position, answer, wrongAnswer }: {
    position: [number, number, number],
    answer: number | string,
    wrongAnswer: number | string
}) {
    const runtime = useMathRunnerRuntimeConfig();
    const [passed, setPassed] = useState(false);
    const [hitType, setHitType] = useState<"correct" | "wrong" | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const passedRef = useRef(false);
    const feedbackElapsedRef = useRef(0);
    const feedbackRef = useRef<THREE.Group>(null);
    const isLeftCorrect = useMemo(() => {
        // Deterministic side assignment keeps render pure while still varying per gate.
        const seed = Math.sin(position[2] * 0.173 + String(answer).length * 1.618 + String(wrongAnswer).length * 0.67);
        return seed >= 0;
    }, [position, answer, wrongAnswer]);

    const leftAnswer = isLeftCorrect ? answer : wrongAnswer;
    const rightAnswer = isLeftCorrect ? wrongAnswer : answer;

    const addPlayers = useMathRunnerStore((state) => state.addPlayers);
    const subtractPlayers = useMathRunnerStore((state) => state.subtractPlayers);
    const advanceQuestion = useMathRunnerStore((state) => state.advanceQuestion);

    useFrame((_, delta) => {
        if (!showFeedback || !feedbackRef.current) return;
        feedbackElapsedRef.current += delta;
        feedbackRef.current.position.y = 4 + feedbackElapsedRef.current * 4;
        if (feedbackElapsedRef.current >= 1) {
            setShowFeedback(false);
        }
    });

    const triggerPass = (type: "correct" | "wrong") => {
        if (passedRef.current) return;
        passedRef.current = true;
        setPassed(true);
        setHitType(type);
        feedbackElapsedRef.current = 0;
        setShowFeedback(true);
        if (type === "correct") addPlayers(10);
        else subtractPlayers(10);
        if (runtime.enableAudio) {
            playGateResultSound(type === "correct");
        }
        advanceQuestion();
    };

    const handleCorrect = () => {
        triggerPass("correct");
    };

    const handleWrong = () => {
        triggerPass("wrong");
    };

    const handleMiddle = () => {
        if (passedRef.current) return;
        passedRef.current = true;
        setPassed(true);
        setHitType("wrong");
        feedbackElapsedRef.current = 0;
        setShowFeedback(true);
        subtractPlayers(10);
        if (runtime.enableAudio) {
            playGateResultSound(false);
        }
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
                    fontSize={1.4 * runtime.textScale}
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
                    fontSize={1.4 * runtime.textScale}
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
            {showFeedback && (
                <group ref={feedbackRef} position={[0, 4, 0]}>
                    <Text
                        fontSize={3.5 * runtime.textScale}
                        color={hitType === "correct" ? "#00ff00" : "#ff0000"}
                        outlineWidth={0.15}
                        outlineColor="#000000"
                        material-depthTest={false}
                        fontWeight="black"
                    >
                        {hitType === "correct" ? "+10 명" : "-10 명"}
                    </Text>
                </group>
            )}
        </group>
    );
}
