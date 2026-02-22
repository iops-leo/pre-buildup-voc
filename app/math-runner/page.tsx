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
    const gameState = useMathRunnerStore(state => state.gameState);
    const setGameState = useMathRunnerStore(state => state.setGameState);
    const resetGame = useMathRunnerStore(state => state.resetGame);
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
                <h1 className="text-4xl font-bold text-white drop-shadow-md mb-2 mt-4">
                    {gameMode === 'math' ? 'Math Runner' : 'English Runner'}
                </h1>

                {gameState === 'menu' && (
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center mt-10 pointer-events-auto">
                        <div className="text-white text-lg font-bold mb-4">Choose Mode</div>
                        {/* Mode Selection */}
                        <div className="flex gap-2 mb-6 bg-black/30 p-1 rounded-full">
                            <button
                                onClick={() => setGameMode('math')}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${gameMode === 'math'
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'text-slate-300 hover:text-white'
                                    }`}
                            >
                                수학 모드
                            </button>
                            <button
                                onClick={() => setGameMode('english')}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${gameMode === 'english'
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'text-slate-300 hover:text-white'
                                    }`}
                            >
                                영어 모드
                            </button>
                        </div>

                        <div className="text-white text-lg font-bold mb-4">Choose Difficulty</div>
                        {/* Level Selection */}
                        <div className="flex gap-2 mb-8">
                            {levels.map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setLevel(l)}
                                    className={`px-5 py-2 rounded-full text-sm font-bold shadow-md transition-colors capitalize ${level === l
                                        ? 'bg-yellow-400 text-sky-900 border-2 border-yellow-200'
                                        : 'bg-white/20 text-white hover:bg-white/30 border-2 border-transparent'
                                        }`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setGameState('playing')}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-2xl shadow-lg hover:scale-105 transition-transform"
                        >
                            START GAME
                        </button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="bg-black/40 backdrop-blur-md px-8 py-4 rounded-3xl border-2 border-white/20 text-white font-black text-3xl shadow-2xl mt-4">
                        <span className="text-yellow-300 drop-shadow-md">{currentQuestion}</span>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="bg-red-900/80 backdrop-blur-xl p-8 rounded-3xl border-2 border-red-500 shadow-2xl flex flex-col items-center mt-20 pointer-events-auto">
                        <h2 className="text-5xl font-black text-white drop-shadow-lg mb-4">GAME OVER</h2>
                        <div className="text-red-200 text-xl font-bold mb-8">Your crowd was entirely defeated!</div>

                        <div className="flex gap-6 mb-8 text-white text-lg">
                            <div className="flex flex-col items-center bg-black/30 px-6 py-3 rounded-xl">
                                <span className="text-gray-400 text-sm">Mode</span>
                                <span className="font-bold capitalize">{gameMode} - {level}</span>
                            </div>
                            <div className="flex flex-col items-center bg-black/30 px-6 py-3 rounded-xl">
                                <span className="text-gray-400 text-sm">Defeated</span>
                                <span className="font-bold text-yellow-400">{totalEnemiesDefeated} Enemies</span>
                            </div>
                        </div>

                        <button
                            onClick={resetGame}
                            className="px-10 py-4 rounded-xl bg-white text-red-900 font-black text-2xl shadow-lg hover:scale-105 transition-transform"
                        >
                            TRY AGAIN
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom HUD - soldier counts (Only visible while playing) */}
            {gameState === 'playing' && (
                <div className="absolute bottom-0 left-0 w-full p-4 flex justify-between pointer-events-none z-10 animate-fade-in">
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
            )}
        </main>
    );
}
