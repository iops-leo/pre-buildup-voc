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
            // Show floating text effect for 1 second instead of disappearing instantly
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
                <BallCollider args={[1]} />
                <mesh position={[0, 0, 0]}>
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="#444444" roughness={0.9} />
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
                {/* Spiky wooden barricade */}
                <group>
                    <mesh position={[0, -0.25, 0]}>
                        <boxGeometry args={[4, 0.5, 0.5]} />
                        <meshStandardMaterial color="#6b4423" />
                    </mesh>
                    {[-1.5, -0.5, 0.5, 1.5].map((x) => (
                        <mesh key={x} position={[x, 0.5, 0]} rotation={[-Math.PI / 8, 0, 0]}>
                            <coneGeometry args={[0.2, 1.5, 4]} />
                            <meshStandardMaterial color="#8b5a2b" />
                        </mesh>
                    ))}
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
                <mesh position={[0, -0.6, 0]}>
                    <boxGeometry args={[1.2, 0.2, 1.2]} />
                    <meshStandardMaterial color="#ff4400" />
                </mesh>
                <mesh>
                    <coneGeometry args={[0.4, 1.5, 16]} />
                    <meshStandardMaterial color="#ff6600" />
                </mesh>
            </group>
        </RigidBody>
    );
}
