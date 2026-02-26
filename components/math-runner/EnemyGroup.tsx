import { useState, useMemo, useRef } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { useMathRunnerStore } from "@/store/useMathRunnerStore";
import { addCameraShake } from "@/lib/mathRunnerCameraShake";
import { playBattleClashSound, playBattleResultSound } from "@/lib/mathRunnerAudio";
import { useMathRunnerRuntimeConfig } from "./RuntimeConfig";

interface EnemyGroupProps {
    position: [number, number, number];
    count: number;
}

const CLASH_INTERVAL = 0.1;

interface BattleParticle {
    id: number;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    life: number;
}

export default function EnemyGroup({ position, count }: EnemyGroupProps) {
    const runtime = useMathRunnerRuntimeConfig();
    const [battleActive, setBattleActive] = useState(false);
    const [cleared, setCleared] = useState(false);
    const [enemyRemaining, setEnemyRemaining] = useState(count);
    const [showBattleText, setShowBattleText] = useState(false);
    const enemyRemainingRef = useRef(count);
    const battleElapsedRef = useRef(0);
    const clashAccumulatorRef = useRef(0);
    const battleTextRef = useRef<THREE.Group>(null);
    const shockwaveRef = useRef<THREE.Mesh>(null);
    const shockwavePowerRef = useRef(0);
    const particleIdRef = useRef(0);
    const [particles, setParticles] = useState<BattleParticle[]>([]);

    const spawnImpactParticles = () => {
        if (!runtime.enableParticles) return;

        const newParticles: BattleParticle[] = [];
        for (let i = 0; i < 6; i++) {
            const spread = Math.random() * 0.45;
            const angle = Math.random() * Math.PI * 2;
            const yOffset = 0.2 + Math.random() * 0.45;
            newParticles.push({
                id: particleIdRef.current++,
                x: Math.cos(angle) * spread,
                y: yOffset,
                z: Math.sin(angle) * spread,
                vx: Math.cos(angle) * (1.8 + Math.random() * 0.8),
                vy: 2.2 + Math.random() * 1.4,
                vz: Math.sin(angle) * (1.8 + Math.random() * 0.8),
                life: 0.35 + Math.random() * 0.2,
            });
        }
        setParticles((prev) => [...prev, ...newParticles].slice(-36));
    };

    const finishBattle = (didClear: boolean) => {
        setCleared(didClear);
        setBattleActive(false);
        setShowBattleText(true);
        battleElapsedRef.current = 0;
        if (runtime.enableAudio) {
            playBattleResultSound(didClear);
        }
    };

    const clashOnce = () => {
        const store = useMathRunnerStore.getState();
        const currentPlayerCount = store.playerCount;
        const currentEnemyCount = enemyRemainingRef.current;

        if (currentEnemyCount <= 0) {
            finishBattle(true);
            return;
        }
        if (currentPlayerCount <= 0) {
            finishBattle(false);
            return;
        }

        // 한 번 충돌: 병사 1명 vs 적 1명 상쇄
        enemyRemainingRef.current -= 1;
        setEnemyRemaining(enemyRemainingRef.current);
        store.subtractPlayers(1);
        store.addEnemiesDefeated(1);
        shockwavePowerRef.current = 1;
        spawnImpactParticles();
        if (runtime.enableCameraShake) {
            addCameraShake(0.18);
        }
        if (runtime.enableAudio) {
            playBattleClashSound();
        }

        // subtractPlayers 직후 store는 비동기 반영이므로 직접 계산
        const newPlayerCount = currentPlayerCount - 1;
        if (enemyRemainingRef.current <= 0) {
            finishBattle(true);
            return;
        }
        if (newPlayerCount <= 0) {
            finishBattle(false);
        }
    };

    const handleIntersection = () => {
        if (battleActive || cleared) return;
        setBattleActive(true);
        clashAccumulatorRef.current = 0;
        battleElapsedRef.current = 0;
    };

    useFrame((_, delta) => {
        if (!battleActive && !cleared) {
            const store = useMathRunnerStore.getState();
            if (store.gameState === "playing") {
                const dx = Math.abs(store.playerX - position[0]);
                const dz = Math.abs(store.playerZ - position[2]);
                if (dx <= 2.2 && dz <= 2.4) {
                    handleIntersection();
                }
            }
        }

        if (battleActive) {
            clashAccumulatorRef.current += delta;
            if (clashAccumulatorRef.current >= CLASH_INTERVAL) {
                clashAccumulatorRef.current -= CLASH_INTERVAL;
                clashOnce();
            }
        }

        if (showBattleText && battleTextRef.current) {
            battleElapsedRef.current += delta;
            battleTextRef.current.position.y = 2.2 + battleElapsedRef.current * 2.2;
            if (battleElapsedRef.current >= 1.2) {
                setShowBattleText(false);
            }
        }

        if (shockwaveRef.current) {
            shockwavePowerRef.current = Math.max(0, shockwavePowerRef.current - delta * 3.2);
            const scale = 1 + shockwavePowerRef.current * 1.2;
            shockwaveRef.current.scale.set(scale, 1, scale);
            const material = shockwaveRef.current.material as THREE.MeshStandardMaterial;
            material.opacity = 0.2 + shockwavePowerRef.current * 0.5;
        }

        if (runtime.enableParticles) {
            setParticles((prev) => {
                if (prev.length === 0) return prev;
                const next: BattleParticle[] = [];
                for (const particle of prev) {
                    const life = particle.life - delta;
                    if (life <= 0) continue;
                    const vy = particle.vy - 6 * delta;
                    next.push({
                        ...particle,
                        x: particle.x + particle.vx * delta,
                        y: particle.y + vy * delta,
                        z: particle.z + particle.vz * delta,
                        vy,
                        life,
                    });
                }
                return next;
            });
        }
    });

    if (cleared && !showBattleText) return null;

    return (
        <group position={position}>
            {/* Collision sensor */}
            <RigidBody type="fixed" sensor onIntersectionEnter={handleIntersection}>
                <CuboidCollider args={[2, 1.5, 2]} position={[0, 0.5, 0]} />
            </RigidBody>

            {/* Enemy stickmen - as battle progresses enemies disappear one-by-one */}
            <EnemyCrowd count={Math.min(enemyRemaining, runtime.maxEnemyCrowd)} />

            {/* Count label above group */}
            <Text
                position={[0, 2.5, 0]}
                fontSize={1.2 * runtime.textScale}
                color="#F44336"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.06}
                outlineColor="#ffffff"
            >
                {enemyRemaining}
            </Text>

            {battleActive && (
                <Text
                    position={[0, 3.4, 0]}
                    fontSize={0.8 * runtime.textScale}
                    color="#FFEE58"
                    outlineWidth={0.05}
                    outlineColor="#3E2723"
                    material-depthTest={false}
                >
                    BATTLE!
                </Text>
            )}

            <mesh ref={shockwaveRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[0.8, 1.1, 24]} />
                <meshStandardMaterial color="#FF8A65" transparent opacity={0.2} />
            </mesh>

            {runtime.enableParticles && particles.map((particle) => (
                <mesh key={particle.id} position={[particle.x, particle.y + 0.2, particle.z]}>
                    <sphereGeometry args={[0.07, 8, 8]} />
                    <meshStandardMaterial color="#FFC107" emissive="#FF9800" emissiveIntensity={0.6} />
                </mesh>
            ))}

            {showBattleText && (
                <group ref={battleTextRef} position={[0, 2.2, 0]}>
                    <Text
                        fontSize={1.4 * runtime.textScale}
                        color={cleared ? "#66BB6A" : "#EF5350"}
                        outlineWidth={0.08}
                        outlineColor="#000000"
                        material-depthTest={false}
                    >
                        {cleared ? "WIN" : "LOST"}
                    </Text>
                </group>
            )}
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
    const rootY = position.y + 0.5;

    return (
        <group position={[position.x, rootY, position.z]}>
            <mesh position={[0, 0.0, 0]} castShadow>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color="#EF5350" />
            </mesh>

            <mesh position={[0, -0.27, 0]} castShadow>
                <capsuleGeometry args={[0.1, 0.25, 8, 16]} />
                <meshStandardMaterial color="#F44336" />
            </mesh>

            <mesh position={[-0.07, -0.52, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
                <meshStandardMaterial color="#C62828" />
            </mesh>

            <mesh position={[0.07, -0.52, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
                <meshStandardMaterial color="#C62828" />
            </mesh>
        </group>
    );
}
