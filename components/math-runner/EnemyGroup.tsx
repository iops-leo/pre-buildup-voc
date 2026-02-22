import { useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGraph } from "@react-three/fiber";
import { useGLTF, useAnimations, Text } from "@react-three/drei";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { SkeletonUtils } from "three-stdlib";
import { useMathRunnerStore } from "@/store/useMathRunnerStore";

interface EnemyGroupProps {
    position: [number, number, number];
    count: number;
    onDefeated: () => void;
}

export default function EnemyGroup({ position, count, onDefeated }: EnemyGroupProps) {
    const [defeated, setDefeated] = useState(false);
    const [hitTime, setHitTime] = useState<number | null>(null);

    const handleIntersection = () => {
        if (defeated) return;
        setDefeated(true);
        setHitTime(Date.now());
        useMathRunnerStore.getState().subtractPlayers(count);
        useMathRunnerStore.getState().addEnemiesDefeated(count);
        onDefeated();
    };

    if (defeated) {
        if (hitTime && Date.now() - hitTime < 1000) {
            const progress = (Date.now() - hitTime) / 1000;
            return (
                <Text
                    position={[position[0], position[1] + 2 + progress * 3, position[2]]}
                    fontSize={2}
                    color="#ff0000"
                    outlineWidth={0.1}
                    outlineColor="#000000"
                    material-depthTest={false}
                >
                    -{count}
                </Text>
            );
        }
        return null;
    }

    return (
        <group position={position}>
            {/* Collision sensor */}
            <RigidBody type="fixed" sensor onIntersectionEnter={handleIntersection}>
                <CuboidCollider args={[2, 1.5, 2]} position={[0, 0.5, 0]} />
            </RigidBody>

            {/* Enemy soldiers - cap visual at 15 for performance */}
            <EnemyCrowd count={Math.min(count, 15)} />

            {/* Red count indicator above group */}
            <mesh position={[0, 3.5, 0]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={0.6} />
            </mesh>
            <Text
                position={[0, 4.3, 0]}
                fontSize={0.8}
                color="#ff4444"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.04}
                outlineColor="#000000"
            >
                {count}
            </Text>
        </group>
    );
}

function EnemyCrowd({ count }: { count: number }) {
    const soldiers = useMemo(() => {
        const arr: { id: number; position: THREE.Vector3 }[] = [];
        let placed = 0;
        let ring = 0;
        while (placed < count) {
            if (ring === 0) {
                arr.push({ id: placed, position: new THREE.Vector3(0, -0.5, 0) });
                placed++;
            } else {
                const r = 0.35 * ring;
                const soldiersInRing = 6 * ring;
                for (let j = 0; j < soldiersInRing && placed < count; j++) {
                    const angle = (j / soldiersInRing) * Math.PI * 2;
                    arr.push({
                        id: placed,
                        position: new THREE.Vector3(Math.cos(angle) * r, -0.5, Math.sin(angle) * r),
                    });
                    placed++;
                }
            }
            ring++;
        }
        return arr;
    }, [count]);

    return (
        <group>
            {soldiers.map((s) => (
                <EnemySoldier key={s.id} position={s.position} />
            ))}
        </group>
    );
}

function EnemySoldier({ position }: { position: THREE.Vector3 }) {
    const group = useRef<THREE.Group>(null);
    const { scene, animations } = useGLTF("/models/Soldier.glb");
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes, materials } = useGraph(clone) as any;
    const { actions } = useAnimations(animations, group);

    useEffect(() => {
        const unsub = useMathRunnerStore.subscribe((state) => {
            if (state.gameState !== 'playing') {
                Object.values(actions).forEach(a => { if (a) a.paused = true; });
            } else {
                Object.values(actions).forEach(a => { if (a) a.paused = false; });
            }
        });

        if (!actions) return;
        const idleAction =
            actions["Idle"] ||
            actions[Object.keys(actions).find((k) => k.toLowerCase().includes("idle")) ?? ""] ||
            Object.values(actions)[0];
        idleAction?.reset().fadeIn(0.2).play();

        return () => unsub();
    }, [actions]);

    // Red-tinted material clones
    const redBodyMat = useMemo(() => {
        if (!materials?.VanguardBodyMat) return null;
        const mat = (materials.VanguardBodyMat as THREE.MeshStandardMaterial).clone();
        mat.color.set("#cc2222");
        mat.emissive.set("#440000");
        mat.emissiveIntensity = 0.3;
        return mat;
    }, [materials]);

    const redVisorMat = useMemo(() => {
        if (!materials?.Vanguard_VisorMat) return null;
        const mat = (materials.Vanguard_VisorMat as THREE.MeshStandardMaterial).clone();
        mat.color.set("#ff0000");
        mat.emissive.set("#ff0000");
        mat.emissiveIntensity = 0.5;
        return mat;
    }, [materials]);

    if (!nodes?.mixamorigHips || !nodes?.vanguard_Mesh || !nodes?.vanguard_visor) return null;

    return (
        <group ref={group} position={position} rotation={[0, 0, 0]} dispose={null}>
            <group name="Scene">
                <group name="Character" rotation={[-Math.PI / 2, 0, 0]} scale={0.01}>
                    <primitive object={nodes.mixamorigHips} />
                    <skinnedMesh
                        castShadow
                        name="vanguard_Mesh"
                        geometry={nodes.vanguard_Mesh.geometry}
                        material={redBodyMat ?? materials.VanguardBodyMat}
                        skeleton={nodes.vanguard_Mesh.skeleton}
                    />
                    <skinnedMesh
                        castShadow
                        name="vanguard_visor"
                        geometry={nodes.vanguard_visor.geometry}
                        material={redVisorMat ?? materials.Vanguard_VisorMat}
                        skeleton={nodes.vanguard_visor.skeleton}
                    />
                </group>
            </group>
        </group>
    );
}

useGLTF.preload("/models/Soldier.glb");
