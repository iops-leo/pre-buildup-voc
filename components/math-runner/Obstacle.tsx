import { RigidBody, CuboidCollider, BallCollider } from "@react-three/rapier";
import { useState, useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMathRunnerStore } from "@/store/useMathRunnerStore";
import { useMathRunnerRuntimeConfig } from "./RuntimeConfig";
import { addCameraShake } from "@/lib/mathRunnerCameraShake";
import { playObstacleHitSound } from "@/lib/mathRunnerAudio";

export default function Obstacle({
    position,
    type,
    damage,
}: {
    position: [number, number, number];
    type: "rock" | "barrier" | "cone";
    damage: number;
}) {
    const runtime = useMathRunnerRuntimeConfig();
    const [hit, setHit] = useState(false);
    const [showDamage, setShowDamage] = useState(false);
    const damageElapsedRef = useRef(0);
    const damageRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (!showDamage || !damageRef.current) return;
        damageElapsedRef.current += delta;
        damageRef.current.position.y = position[1] + 2 + damageElapsedRef.current * 3;
        if (damageElapsedRef.current >= 1) {
            setShowDamage(false);
        }
    });

    const handleHit = () => {
        if (hit) return;
        setHit(true);
        setShowDamage(true);
        damageElapsedRef.current = 0;
        useMathRunnerStore.getState().subtractPlayers(damage);
        if (runtime.enableCameraShake) {
            addCameraShake(0.12);
        }
        if (runtime.enableAudio) {
            playObstacleHitSound();
        }
    };

    if (hit) {
        if (!showDamage) return null;
        return (
            <group ref={damageRef} position={[position[0], position[1] + 2, position[2]]}>
                <Text
                    fontSize={1.5 * runtime.textScale}
                    color="#ff0000"
                    outlineWidth={0.1}
                    outlineColor="#000000"
                >
                    -{damage}
                </Text>
            </group>
        );
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
