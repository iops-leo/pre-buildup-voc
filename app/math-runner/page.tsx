"use client";

import { Suspense } from "react";
import MathRunnerScene from "@/components/math-runner/Scene";
import { useMathRunnerStore } from "@/store/useMathRunnerStore";

export default function MathRunnerPage() {
    const currentQuestion = useMathRunnerStore(state => state.currentQuestion);
    const playerCount = useMathRunnerStore(state => state.playerCount);

    return (
        <main className="w-full h-screen bg-sky-900 overflow-hidden relative font-sans">
            {/* 3D Canvas goes here */}
            <div className="absolute inset-0">
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white text-2xl">Loading Game...</div>}>
                    <MathRunnerScene />
                </Suspense>
            </div>

            {/* 2D UI Overlay overlay */}
            <div className="absolute top-0 left-0 w-full p-6 flex flex-col items-center pointer-events-none z-10">
                <h1 className="text-4xl font-bold text-white drop-shadow-md mb-2">Math Runner</h1>
                <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 text-white font-bold text-2xl shadow-xl flex gap-6">
                    <span className="flex items-center gap-2">Crowd: <span className="text-green-300">{playerCount}</span></span>
                    <span className="border-l border-white/30 pl-6 flex items-center gap-2">Question: <span className="text-yellow-300">{currentQuestion}</span></span>
                </div>
            </div>
        </main>
    );
}
