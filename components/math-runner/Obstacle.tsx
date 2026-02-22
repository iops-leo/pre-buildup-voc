import { RigidBody, CuboidCollider, BallCollider } from "@react-three/rapier";
import { useState } from "react";
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

    const handleHit = () => {
        if (hit) return;
        setHit(true);
        useMathRunnerStore.getState().subtractPlayers(damage);
    };

    if (hit) return null;

    if (type === "rock") {
        return (
            <RigidBody
                type="fixed"
                position={position}
                sensor
                onIntersectionEnter={handleHit}
            >
                <BallCollider args={[0.8]} />
                <mesh>
                    <sphereGeometry args={[0.8, 8, 8]} />
                    <meshStandardMaterial color="#888888" roughness={0.9} />
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
                <CuboidCollider args={[1.5, 0.75, 0.25]} />
                <mesh>
                    <boxGeometry args={[3, 1.5, 0.5]} />
                    <meshStandardMaterial color="#ff8800" />
                </mesh>
            </RigidBody>
        );
    }

    // cone
    return (
        <RigidBody
            type="fixed"
            position={position}
            sensor
            onIntersectionEnter={handleHit}
        >
            <CuboidCollider args={[0.5, 0.75, 0.5]} />
            <mesh>
                <coneGeometry args={[0.5, 1.5, 8]} />
                <meshStandardMaterial color="#ffcc00" />
            </mesh>
        </RigidBody>
    );
}
