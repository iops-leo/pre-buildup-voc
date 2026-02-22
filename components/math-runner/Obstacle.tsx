import { RigidBody, CuboidCollider, BallCollider } from "@react-three/rapier";
import { useState } from "react";
import { Text } from "@react-three/drei";
import { useMathRunnerStore } from "@/store/useMathRunnerStore";

export default function Obstacle({
    position,
    type,
    damage,
}: {
    position: [number, number, number];
    type: "rock" | "barrier" | "cone";
    damage: number;
}) {
    const [hit, setHit] = useState(false);
    const [hitTime, setHitTime] = useState<number | null>(null);

    const handleHit = () => {
        if (hit) return;
        setHit(true);
        setHitTime(Date.now());
        useMathRunnerStore.getState().subtractPlayers(damage);
    };

    if (hit) {
        if (hitTime && Date.now() - hitTime < 1000) {
            const progress = (Date.now() - hitTime) / 1000;
            return (
                <Text
                    position={[position[0], position[1] + 2 + progress * 3, position[2]]}
                    fontSize={1.5}
                    color="#ff0000"
                    outlineWidth={0.1}
                    outlineColor="#000000"
                >
                    -{damage}
                </Text>
            );
        }
        return null;
    }

    if (type === "rock") {
        return (
            <RigidBody
                type="fixed"
                position={position}
                sensor
                onIntersectionEnter={handleHit}
            >
                <BallCollider args={[0.8]} />
                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[0.8, 16, 16]} />
                    <meshStandardMaterial color="#FF9800" roughness={0.5} />
                </mesh>
            </RigidBody>
        );
    }

    if (type === "barrier") {
        return (
            <RigidBody
                type="fixed"
                position={position}
                sensor
                onIntersectionEnter={handleHit}
            >
                <CuboidCollider args={[2, 0.75, 0.5]} />
                <group>
                    {/* Main horizontal bar */}
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[4, 0.5, 0.4]} />
                        <meshStandardMaterial color="#F44336" />
                    </mesh>
                    {/* White stripe on bar */}
                    <mesh position={[0, 0, 0.21]}>
                        <boxGeometry args={[4, 0.15, 0.01]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                    {/* Left post */}
                    <mesh position={[-1.8, -0.5, 0]}>
                        <boxGeometry args={[0.2, 1.0, 0.2]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                    {/* Right post */}
                    <mesh position={[1.8, -0.5, 0]}>
                        <boxGeometry args={[0.2, 1.0, 0.2]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                </group>
            </RigidBody>
        );
    }

    // cone (traffic cone)
    return (
        <RigidBody
            type="fixed"
            position={position}
            sensor
            onIntersectionEnter={handleHit}
        >
            <CuboidCollider args={[0.5, 0.75, 0.5]} />
            <group>
                {/* Base */}
                <mesh position={[0, -0.6, 0]}>
                    <boxGeometry args={[1.2, 0.2, 1.2]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
                {/* Cone body */}
                <mesh>
                    <coneGeometry args={[0.4, 1.5, 16]} />
                    <meshStandardMaterial color="#FF5722" />
                </mesh>
                {/* White stripe on cone */}
                <mesh position={[0, -0.1, 0]}>
                    <cylinderGeometry args={[0.32, 0.38, 0.15, 16]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
            </group>
        </RigidBody>
    );
}
