import { useFrame } from "@react-three/fiber";
import { RigidBody, CapsuleCollider, RapierRigidBody } from "@react-three/rapier";
import { useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useMathRunnerStore } from "@/store/useMathRunnerStore";
import { Text } from "@react-three/drei";
import { useMathRunnerRuntimeConfig } from "./RuntimeConfig";
import { consumeCameraShake } from "@/lib/mathRunnerCameraShake";

export default function Player() {
    const bodyRef = useRef<RapierRigidBody>(null);
    const playerCount = useMathRunnerStore((state) => state.playerCount);
    const runtime = useMathRunnerRuntimeConfig();

    const [laneIndex, setLaneIndex] = useState(0);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") setLaneIndex((prev) => Math.max(prev - 1, -2));
            if (e.key === "ArrowRight") setLaneIndex((prev) => Math.min(prev + 1, 2));
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Touch/swipe controls for mobile
    const touchStartX = useRef<number | null>(null);
    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            touchStartX.current = e.touches[0].clientX;
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (touchStartX.current === null) return;
            const dx = e.touches[0].clientX - touchStartX.current;
            if (Math.abs(dx) > 30) {
                if (dx > 0) setLaneIndex((prev) => Math.min(prev + 1, 2));
                else setLaneIndex((prev) => Math.max(prev - 1, -2));
                touchStartX.current = e.touches[0].clientX;
            }
        };
        const handleTouchEnd = () => {
            touchStartX.current = null;
        };
        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchmove", handleTouchMove, { passive: true });
        window.addEventListener("touchend", handleTouchEnd);
        return () => {
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, []);

    useFrame((state, delta) => {
        if (!bodyRef.current) return;

        const gameState = useMathRunnerStore.getState().gameState;
        if (gameState !== 'playing') return;

        const currentTranslation = bodyRef.current.translation();

        // Win Condition Check
        if (currentTranslation.z <= -1500) {
            useMathRunnerStore.setState({ gameState: 'win' });
            return;
        }

        // Constant forward movement, increasing speed gradually
        const baseSpeed = useMathRunnerStore.getState().currentSpeed;
        const activeSpeed = Math.min(28, baseSpeed + Math.abs(currentTranslation.z) * 0.005);

        // Lane-based steering with damped interpolation to remove side-move jitter.
        const targetX = laneIndex * 2;
        const newX = THREE.MathUtils.damp(currentTranslation.x, targetX, 14, delta);
        const newZ = currentTranslation.z - activeSpeed * delta;

        bodyRef.current.setNextKinematicTranslation({ x: newX, y: 0.5, z: newZ });

        // Update store with playerZ without triggering component re-render
        useMathRunnerStore.setState({ playerZ: newZ });

        // Smooth camera follow avoids visual stutter while changing lanes.
        const baseCamX = THREE.MathUtils.damp(state.camera.position.x, newX, 6, delta);
        const baseCamY = THREE.MathUtils.damp(state.camera.position.y, 12, 6, delta);
        const baseCamZ = THREE.MathUtils.damp(state.camera.position.z, newZ + 16, 6, delta);

        const shakePower = runtime.enableCameraShake ? consumeCameraShake(delta) : 0;
        const t = state.clock.elapsedTime;
        const shakeX = Math.sin(t * 47) * shakePower * 0.28;
        const shakeY = Math.sin(t * 61) * shakePower * 0.16;
        const shakeZ = Math.cos(t * 53) * shakePower * 0.2;

        state.camera.position.x = baseCamX + shakeX;
        state.camera.position.y = baseCamY + shakeY;
        state.camera.position.z = baseCamZ + shakeZ;
        state.camera.lookAt(newX, shakeY * 0.3, newZ - 5);
    });

    return (
        <RigidBody
            ref={bodyRef}
            type="kinematicPosition"
            position={[0, 0.5, 0]}
            colliders={false}
            lockRotations
        >
            <CapsuleCollider args={[0.3, 0.2]} />
            <SoldierCrowd count={Math.min(playerCount, runtime.maxPlayerCrowd)} />
            <Text
                position={[0, 2.5, 0]}
                fontSize={1.5 * runtime.textScale}
                color="#2196F3"
                fontWeight="bold"
                outlineWidth={0.08}
                outlineColor="#ffffff"
            >
                {playerCount}
            </Text>
        </RigidBody>
    );
}

function SoldierCrowd({ count }: { count: number }) {
    const soldiers = useMemo(() => {
        const arr: { id: number; position: THREE.Vector3 }[] = [];

        for (let i = 0; i < count; i++) {
            if (i === 0) {
                arr.push({ id: i, position: new THREE.Vector3(0, -0.5, 0) });
            } else {
                // Determine a pseudo-random angle based on the ID, but spiraling outwards
                const golden_ratio = (1 + Math.sqrt(5)) / 2;
                const theta = 2 * Math.PI * i / golden_ratio;

                // Deterministic jitter keeps layout stable between renders.
                const hash = Math.sin(i * 12.9898) * 43758.5453;
                const jitter = (hash - Math.floor(hash)) * 0.1 - 0.05;
                const r = 0.4 * Math.sqrt(i) + jitter;

                // Limit the width so the crowd doesn't overflow the track easily.
                // Squeeze X coordinates slightly.
                const xOffset = Math.cos(theta) * r * 0.8;
                const zOffset = Math.sin(theta) * r;

                arr.push({
                    id: i,
                    position: new THREE.Vector3(xOffset, -0.5, zOffset),
                });
            }
        }
        return arr;
    }, [count]);

    return (
        <group>
            {soldiers.map((s) => (
                <Stickman key={s.id} position={s.position} id={s.id} />
            ))}
        </group>
    );
}

function Stickman({ position, id }: { position: THREE.Vector3; id: number }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        // Simple bobbing animation with per-stickman phase offset
        const t = state.clock.elapsedTime;
        const phaseOffset = id * 0.4;
        groupRef.current.position.y = position.y + Math.sin(t * 6 + phaseOffset) * 0.04;
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Head - sphere */}
            <mesh position={[0, 0.52, 0]} castShadow>
                <sphereGeometry args={[0.12, 12, 12]} />
                <meshStandardMaterial color="#4FC3F7" />
            </mesh>

            {/* Body - capsule */}
            <mesh position={[0, 0.22, 0]} castShadow>
                <capsuleGeometry args={[0.1, 0.25, 8, 16]} />
                <meshStandardMaterial color="#2196F3" />
            </mesh>

            {/* Left leg */}
            <mesh position={[-0.07, -0.12, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
                <meshStandardMaterial color="#1976D2" />
            </mesh>

            {/* Right leg */}
            <mesh position={[0.07, -0.12, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
                <meshStandardMaterial color="#1976D2" />
            </mesh>
        </group>
    );
}
