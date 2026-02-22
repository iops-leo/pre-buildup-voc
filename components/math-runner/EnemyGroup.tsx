import { useState, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
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

            {/* Enemy stickmen - cap visual at 15 for performance */}
            <EnemyCrowd count={Math.min(count, 15)} />

            {/* Count label above group */}
            <Text
                position={[0, 2.5, 0]}
                fontSize={1.2}
                color="#F44336"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.06}
                outlineColor="#ffffff"
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
                <EnemyStickman key={s.id} position={s.position} />
            ))}
        </group>
    );
}

function EnemyStickman({ position }: { position: THREE.Vector3 }) {
    // Total height ~0.6 units:
    //   head (sphere r=0.12): top at +0.12, center at 0.0 relative to stickman root
    //   body (capsule r=0.1, h=0.25): center at -0.27
    //   legs (cylinder r=0.04, h=0.2): center at -0.52 (left/right offset ±0.07)
    // stickman root sits at y=+0.5 above ring position so feet land near y=0

    const rootY = position.y + 0.5;

    return (
        <group position={[position.x, rootY, position.z]}>
            {/* Head */}
            <mesh position={[0, 0.0, 0]} castShadow>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color="#EF5350" />
            </mesh>

            {/* Body */}
            <mesh position={[0, -0.27, 0]} castShadow>
                <capsuleGeometry args={[0.1, 0.25, 8, 16]} />
                <meshStandardMaterial color="#F44336" />
            </mesh>

            {/* Left leg */}
            <mesh position={[-0.07, -0.52, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
                <meshStandardMaterial color="#C62828" />
            </mesh>

            {/* Right leg */}
            <mesh position={[0.07, -0.52, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
                <meshStandardMaterial color="#C62828" />
            </mesh>
        </group>
    );
}
