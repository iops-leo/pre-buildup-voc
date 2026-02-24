"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Physics } from "@react-three/rapier";
import Player from "./Player";
import TrackManager from "./TrackManager";
import { useMathRunnerStore } from "@/store/useMathRunnerStore";
import {
    MathRunnerRuntimeConfigProvider,
    useMathRunnerRuntimeConfig,
} from "./RuntimeConfig";

export default function MathRunnerScene() {
    return (
        <MathRunnerRuntimeConfigProvider>
            <MathRunnerCanvas />
        </MathRunnerRuntimeConfigProvider>
    );
}

function MathRunnerCanvas() {
    const runId = useMathRunnerStore((state) => state.runId);
    const runtime = useMathRunnerRuntimeConfig();

    return (
        <Canvas
            dpr={[1, runtime.maxDpr]}
            shadows={runtime.enableShadows}
            camera={{ position: [0, 12, 18], fov: 60 }}
            className="w-full h-full"
        >
            <color attach="background" args={["#a8e6ff"]} />
            <fog attach="fog" args={["#a8e6ff", 50, 200]} />

            {/* Lighting */}
            <ambientLight intensity={0.8} />
            <directionalLight
                castShadow={runtime.enableShadows}
                position={[10, 20, 10]}
                intensity={1.0}
                shadow-mapSize={[runtime.shadowMapSize, runtime.shadowMapSize]}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
            />
            <directionalLight
                position={[-10, 10, -10]}
                intensity={0.5}
            />

            {/* Physics World */}
            <Suspense fallback={null}>
                <Physics>
                    <TrackManager key={`track-${runId}`} />
                    <Player key={`player-${runId}`} />
                </Physics>
            </Suspense>
        </Canvas>
    );
}
