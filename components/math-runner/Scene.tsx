"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Physics } from "@react-three/rapier";
import { Sky, Environment } from "@react-three/drei";
import Player from "./Player";
import TrackManager from "./TrackManager";

export default function MathRunnerScene() {
    return (
        <Canvas
            shadows
            camera={{ position: [0, 12, 18], fov: 60 }}
            className="w-full h-full"
        >
            <color attach="background" args={["#87CEEB"]} />

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight
                castShadow
                position={[10, 20, 10]}
                intensity={1.5}
                shadow-mapSize={[1024, 1024]}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
            />

            {/* Environment */}
            <Sky sunPosition={[100, 20, 100]} />
            <Environment preset="city" />

            {/* Physics World */}
            <Suspense fallback={null}>
                <Physics>
                    <TrackManager />
                    <Player />
                </Physics>
            </Suspense>
        </Canvas>
    );
}
