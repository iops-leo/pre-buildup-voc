import { useFrame, useGraph } from "@react-three/fiber";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import { useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useMathRunnerStore } from "@/store/useMathRunnerStore";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";

export default function Player() {
    const bodyRef = useRef<any>(null);
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
    });

    return (
        <RigidBody ref={bodyRef} position={[0, 1, 0]} colliders={false} lockRotations>
            <CapsuleCollider args={[0.5, 0.5]} />
            <SoldierCrowd count={playerCount} />
        </RigidBody>
    );
}

function SoldierCrowd({ count }: { count: number }) {
    // Generate static local positions based on playerCount (spiral pattern)
    const soldiers = useMemo(() => {
        const arr = [];
        for (let i = 0; i < count; i++) {
            const pos = new THREE.Vector3(0, -0.6, 0); // Offset down so feet touch the floor
            if (i > 0) {
                const angle = i * Math.PI * 0.4;
                const radius = 0.5 * Math.sqrt(i);
                pos.set(Math.cos(angle) * radius, -0.6, Math.sin(angle) * radius);
            }
            arr.push({ id: i, position: pos });
        }
        return arr;
    }, [count]);

    return (
        <group>
            {soldiers.map((s) => (
                <SoldierInstance key={s.id} position={s.position} />
            ))}
        </group>
    );
}

function SoldierInstance({ position }: { position: THREE.Vector3 }) {
    const group = useRef<THREE.Group>(null);
    const { scene, animations } = useGLTF("/models/Soldier.glb");
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes, materials } = useGraph(clone) as any;
    const { actions } = useAnimations(animations, group);

    useEffect(() => {
        // Find the 'Run' animation, or fallback to any animation if 'Run' isn't explicitly named.
        if (actions && actions['Run']) {
            actions['Run'].reset().fadeIn(0.2).play();
        } else if (actions && Object.keys(actions).length > 0) {
            // "Soldier.glb" animation names are often "Run", "Walk", "Idle" 
            const firstAction = Object.keys(actions).find(a => a.toLowerCase().includes('run')) || Object.keys(actions)[0];
            actions[firstAction]?.reset().fadeIn(0.2).play();
        }
    }, [actions]);

    return (
        <group ref={group} position={position} rotation={[0, Math.PI, 0]} dispose={null}>
            <group name="Scene">
                {/* Math.PI is 180 degrees. Rotating to face forward (negative Z), Soldier scale applies here */}
                <group name="Character" rotation={[-Math.PI / 2, 0, 0]} scale={0.8}>
                    <primitive object={nodes.mixamorigHips} />
                    <skinnedMesh castShadow name="vanguard_Mesh" geometry={nodes.vanguard_Mesh.geometry} material={materials.VanguardBodyMat} skeleton={nodes.vanguard_Mesh.skeleton} />
                    <skinnedMesh castShadow name="vanguard_visor" geometry={nodes.vanguard_visor.geometry} material={materials.Vanguard_VisorMat} skeleton={nodes.vanguard_visor.skeleton} />
                </group>
            </group>
        </group>
    );
}

useGLTF.preload('/models/Soldier.glb');
