"use client";

import MathRunnerScene from "@/components/math-runner/Scene";
import { useMathRunnerStore, MathLevel } from "@/store/useMathRunnerStore";

export default function MathRunnerPage() {
    const currentQuestion = useMathRunnerStore(state => state.currentQuestion);
    const playerCount = useMathRunnerStore(state => state.playerCount);
    const level = useMathRunnerStore(state => state.level);
    const gameMode = useMathRunnerStore(state => state.gameMode);
    const setLevel = useMathRunnerStore(state => state.setLevel);
    const setGameMode = useMathRunnerStore(state => state.setGameMode);
    const nextEnemyCount = useMathRunnerStore(state => state.nextEnemyCount);
    const totalEnemiesDefeated = useMathRunnerStore(state => state.totalEnemiesDefeated);

    const levels: MathLevel[] = ['easy', 'medium', 'hard'];

    return (
        <main className="w-full h-screen bg-sky-900 overflow-hidden relative font-sans">
            {/* 3D Canvas goes here */}
            <div className="absolute inset-0">
                <MathRunnerScene />
            </div>

            {/* 2D UI Overlay overlay */}
            <div className="absolute top-0 left-0 w-full p-6 flex flex-col items-center pointer-events-none z-10">
                <h1 className="text-4xl font-bold text-white drop-shadow-md mb-2">
                    {gameMode === 'math' ? 'Math Runner' : 'English Runner'}
                </h1>

                {/* Mode Selection */}
                <div className="flex gap-2 mb-2 pointer-events-auto bg-black/30 p-1 rounded-full backdrop-blur-md">
                    <button
                        onClick={() => setGameMode('math')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${gameMode === 'math'
                            ? 'bg-amber-500 text-white shadow-md'
                            : 'text-slate-300 hover:text-white'
                            }`}
                    >
                        수학 모드
                    </button>
                    <button
                        onClick={() => setGameMode('english')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${gameMode === 'english'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'text-slate-300 hover:text-white'
                            }`}
                    >
                        영어 모드
                    </button>
                </div>

                {/* Level Selection */}
                <div className="flex gap-2 mb-4 pointer-events-auto">
                    {levels.map((l) => (
                        <button
                            key={l}
                            onClick={() => setLevel(l)}
                            className={`px-4 py-1 rounded-full text-sm font-bold shadow-md transition-colors capitalize ${level === l
                                ? 'bg-yellow-400 text-sky-900'
                                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
                                }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 text-white font-bold text-2xl shadow-xl">
                    <span className="text-yellow-300">{currentQuestion}</span>
                </div>
            </div>

            {/* Bottom HUD - soldier counts */}
            <div className="absolute bottom-0 left-0 w-full p-4 flex justify-between pointer-events-none z-10">
                <div className="bg-blue-600/80 backdrop-blur-md px-4 py-2 rounded-xl border border-blue-400/40 text-white font-bold shadow-lg flex items-center gap-2">
                    <span className="text-sm">내 병사</span>
                    <span className="text-2xl text-blue-200">{playerCount}</span>
                </div>
                <div className="bg-red-600/80 backdrop-blur-md px-4 py-2 rounded-xl border border-red-400/40 text-white font-bold shadow-lg flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <span className="text-sm">다음 적</span>
                        <span className="text-2xl text-red-200">{nextEnemyCount}</span>
                    </div>
                    <div className="border-l border-red-400/40 pl-3 flex items-center gap-1">
                        <span className="text-sm">처치</span>
                        <span className="text-lg text-red-200">{totalEnemiesDefeated}</span>
                    </div>
                </div>
            </div>
        </main>
    );
}
