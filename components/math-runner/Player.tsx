import { useFrame } from "@react-three/fiber";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useMathRunnerStore } from "@/store/useMathRunnerStore";

export default function Player() {
    const bodyRef = useRef<any>(null);
    const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
    const playerCount = useMathRunnerStore((state) => state.playerCount);

    // Basic movement controls
    const [targetX, setTargetX] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") setTargetX((prev) => Math.max(prev - 2, -4));
            if (e.key === "ArrowRight") setTargetX((prev) => Math.min(prev + 2, 4));
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useFrame((state, delta) => {
        if (!bodyRef.current) return;

        // Constant forward movement
        const currentTranslation = bodyRef.current.translation();

        // Smoothly interpolate X position towards targetX
        const newX = THREE.MathUtils.lerp(currentTranslation.x, targetX, 10 * delta);
        const newZ = currentTranslation.z - 10 * delta;

        bodyRef.current.setTranslation({ x: newX, y: currentTranslation.y, z: newZ }, true);

        // Update store with playerZ without triggering component re-render
        useMathRunnerStore.setState({ playerZ: newZ });

        // Make camera follow the player loosely
        state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, newX, 2 * delta);
        state.camera.position.z = newZ + 10;
        state.camera.lookAt(newX, 0, newZ - 10);

        // Update instance matrices for InstancedMesh
        if (instancedMeshRef.current) {
            const dummy = new THREE.Object3D();

            // Generate positions based on playerCount (spiral pattern)
            for (let i = 0; i < playerCount; i++) {
                if (i === 0) {
                    dummy.position.set(0, 0, 0);
                } else {
                    const angle = i * Math.PI * 0.4;
                    const radius = 0.5 * Math.sqrt(i);
                    dummy.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
                }
                dummy.updateMatrix();
                instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
            }
            instancedMeshRef.current.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <RigidBody ref={bodyRef} position={[0, 1, 0]} colliders={false} lockRotations>
            <CapsuleCollider args={[0.5, 0.5]} />
            <instancedMesh ref={instancedMeshRef} args={[null as any, null as any, playerCount]} castShadow>
                <capsuleGeometry args={[0.2, 0.6, 4, 16]} />
                <meshStandardMaterial color="blue" />
            </instancedMesh>
        </RigidBody>
    );
}
