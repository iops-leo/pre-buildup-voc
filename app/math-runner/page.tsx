"use client";
import { useEffect } from "react";

import MathRunnerScene from "@/components/math-runner/Scene";
import {
    useMathRunnerStore,
    MathLevel,
    MathRunnerQualityPreset,
} from "@/store/useMathRunnerStore";

export default function MathRunnerPage() {
    const currentQuestion = useMathRunnerStore(state => state.currentQuestion);
    const playerCount = useMathRunnerStore(state => state.playerCount);
    const level = useMathRunnerStore(state => state.level);
    const gameMode = useMathRunnerStore(state => state.gameMode);
    const qualityPreset = useMathRunnerStore(state => state.qualityPreset);
    const setLevel = useMathRunnerStore(state => state.setLevel);
    const setGameMode = useMathRunnerStore(state => state.setGameMode);
    const setQualityPreset = useMathRunnerStore(state => state.setQualityPreset);
    const gameState = useMathRunnerStore(state => state.gameState);
    const setGameState = useMathRunnerStore(state => state.setGameState);
    const resetGame = useMathRunnerStore(state => state.resetGame);
    const nextEnemyCount = useMathRunnerStore(state => state.nextEnemyCount);
    const totalEnemiesDefeated = useMathRunnerStore(state => state.totalEnemiesDefeated);
    const bestScore = useMathRunnerStore(state => state.bestScore);
    const setBestScore = useMathRunnerStore(state => state.setBestScore);

    const levels: MathLevel[] = ['easy', 'medium', 'hard'];
    const qualityOptions: MathRunnerQualityPreset[] = ["auto", "high", "medium", "low"];
    const playerZ = useMathRunnerStore(state => state.playerZ);

    // 진행도 0~100%
    const GOAL_Z = -1500;
    const progressPct = Math.min(100, Math.max(0, (playerZ / GOAL_Z) * 100));

    // Handle high score updates when winning
    useEffect(() => {
        if (gameState === 'win' && playerCount > bestScore) {
            setBestScore(playerCount);
        }
    }, [gameState, playerCount, bestScore, setBestScore]);

    return (
        <main className="w-full h-screen bg-sky-200 overflow-hidden relative font-sans">
            {/* 3D Canvas - Hidden/obscured during menu */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${gameState === 'menu' ? 'opacity-0' : 'opacity-100'}`}>
                <MathRunnerScene />
            </div>

            {/* 2D UI Overlay */}
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center pointer-events-none z-10">
                {gameState === 'menu' && (
                    <div className="w-full h-full bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto">
                        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-lg mb-4">
                            런닝 퀴즈
                        </h1>
                        <p className="text-slate-300 mb-12 text-xl font-bold">달리면서 푸는 짜릿한 두뇌 게임!</p>

                        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center w-full max-w-md">
                            <div className="text-white text-xl font-bold mb-6">모드 선택</div>
                            {/* Mode Selection */}
                            <div className="flex gap-4 mb-8 bg-black/30 p-2 rounded-2xl w-full">
                                <button
                                    onClick={() => setGameMode('math')}
                                    className={`flex-1 py-3 rounded-xl text-lg font-bold transition-all ${gameMode === 'math'
                                        ? 'bg-amber-500 text-white shadow-md'
                                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    수학 모드
                                </button>
                                <button
                                    onClick={() => setGameMode('english')}
                                    className={`flex-1 py-3 rounded-xl text-lg font-bold transition-all ${gameMode === 'english'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    영어 모드
                                </button>
                            </div>

                            <div className="text-white text-xl font-bold mb-6">난이도 선택</div>
                            {/* Level Selection */}
                            <div className="flex gap-3 mb-10 w-full justify-center">
                                {levels.map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => setLevel(l)}
                                        className={`flex-1 py-3 rounded-xl text-lg font-bold shadow-md transition-colors capitalize ${level === l
                                            ? 'bg-yellow-400 text-sky-900 border-2 border-yellow-200'
                                            : 'bg-white/20 text-white hover:bg-white/30 border-2 border-transparent'
                                            }`}
                                    >
                                        {l === 'easy' ? '쉬움' : l === 'medium' ? '보통' : '어려움'}
                                    </button>
                                ))}
                            </div>

                            <div className="text-white text-lg font-bold mb-4">그래픽 품질</div>
                            <div className="grid grid-cols-2 gap-2 mb-10 w-full">
                                {qualityOptions.map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => setQualityPreset(preset)}
                                        className={`py-2 rounded-lg text-sm font-bold transition-colors ${qualityPreset === preset
                                            ? "bg-cyan-400 text-slate-900 border border-cyan-200"
                                            : "bg-white/15 text-slate-200 hover:bg-white/25 border border-transparent"
                                            }`}
                                    >
                                        {preset === "auto" ? "자동(권장)" : preset === "high" ? "높음" : preset === "medium" ? "중간" : "낮음"}
                                    </button>
                                ))}
                            </div>

                            {/* 모바일 조작 힌트 */}
                            <p className="text-slate-400 text-sm mt-4">← 스와이프 → 로 이동 &nbsp;|&nbsp; PC: 방향키</p>

                            <button
                                onClick={() => resetGame()}
                                className="w-full py-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-3xl shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-105 transition-transform"
                            >
                                게임 시작
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="absolute top-0 w-full flex flex-col items-center">
                        {/* 진행도 바 */}
                        <div className="w-full h-2 bg-black/30">
                            <div
                                className="h-2 bg-gradient-to-r from-cyan-400 to-green-400 transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        {/* 문제 표시 */}
                        <div className="mt-4 bg-black/40 backdrop-blur-md px-8 py-4 rounded-3xl border-2 border-white/20 text-white font-black text-3xl shadow-2xl">
                            <span className="text-yellow-300 drop-shadow-md">{currentQuestion}</span>
                        </div>
                        {/* 진행 거리 */}
                        <div className="mt-1 text-white/70 text-sm font-bold">
                            {Math.round(Math.abs(playerZ))}m / 1500m
                        </div>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="bg-red-900/80 backdrop-blur-xl p-8 rounded-3xl border-2 border-red-500 shadow-2xl flex flex-col items-center mt-20 pointer-events-auto">
                        <h2 className="text-5xl font-black text-white drop-shadow-lg mb-4">GAME OVER</h2>
                        <div className="text-red-200 text-xl font-bold mb-8">모든 병사가 전멸했습니다!</div>

                        <div className="flex gap-4 mb-8 text-white text-lg">
                            <div className="flex flex-col items-center bg-black/30 px-6 py-3 rounded-xl">
                                <span className="text-gray-400 text-sm">모드</span>
                                <span className="font-bold">{gameMode === 'math' ? '수학' : '영어'} - {level === 'easy' ? '쉬움' : level === 'medium' ? '보통' : '어려움'}</span>
                            </div>
                            <div className="flex flex-col items-center bg-black/30 px-6 py-3 rounded-xl">
                                <span className="text-gray-400 text-sm">처치한 적</span>
                                <span className="font-bold text-yellow-400">{totalEnemiesDefeated}명</span>
                            </div>
                            <div className="flex flex-col items-center bg-black/30 px-6 py-3 rounded-xl">
                                <span className="text-gray-400 text-sm">최고 기록</span>
                                <span className="font-bold text-cyan-300">{bestScore}명</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setGameState('menu')}
                                className="px-8 py-4 rounded-xl bg-white/20 text-white font-bold text-xl shadow-lg hover:scale-105 transition-transform border border-white/30"
                            >
                                홈으로
                            </button>
                            <button
                                onClick={resetGame}
                                className="px-10 py-4 rounded-xl bg-white text-red-900 font-black text-2xl shadow-lg hover:scale-105 transition-transform"
                            >
                                다시하기
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'win' && (
                    <div className="bg-emerald-900/90 backdrop-blur-xl p-8 rounded-3xl border-2 border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.5)] flex flex-col items-center mt-20 pointer-events-auto relative">

                        {/* New Record Animation */}
                        {playerCount >= bestScore && bestScore > 0 && (
                            <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-br from-yellow-300 to-orange-500 text-red-900 font-black text-sm px-6 py-2 rotate-12 shadow-lg animate-pulse border-2 border-white rounded-xl">
                                NEW RECORD!
                            </div>
                        )}

                        <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-300 drop-shadow-lg mb-4">YOU WIN!</h2>
                        <div className="text-emerald-100 text-xl font-bold mb-8">기지를 성공적으로 지켜냈습니다!</div>

                        <div className="flex gap-4 mb-8 text-white text-lg w-full justify-center">
                            <div className="flex flex-col items-center bg-black/40 px-5 py-4 rounded-2xl border border-white/10 flex-1">
                                <span className="text-gray-400 text-sm mb-1">통과한 난이도</span>
                                <span className="font-bold capitalize text-xl">{gameMode} - {level}</span>
                            </div>
                            <div className="flex flex-col items-center bg-black/40 px-5 py-4 rounded-2xl border border-emerald-500/50 flex-1 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                <span className="text-emerald-300 text-sm mb-1 font-bold">내 최고 점수</span>
                                <span className="font-black text-3xl text-yellow-400">{Math.max(playerCount, bestScore)} 명</span>
                            </div>
                            <div className="flex flex-col items-center bg-black/40 px-5 py-4 rounded-2xl border border-white/10 flex-1">
                                <span className="text-gray-400 text-sm mb-1">이번 기록</span>
                                <span className="font-black text-3xl text-emerald-400">{playerCount} 명</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setGameState('menu')}
                                className="px-8 py-5 rounded-2xl bg-white/20 text-white font-bold text-xl shadow-lg hover:scale-105 transition-transform border border-white/30"
                            >
                                홈으로
                            </button>
                            <button
                                onClick={resetGame}
                                className="px-12 py-5 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-black text-2xl shadow-xl hover:scale-105 transition-transform"
                            >
                                다시 플레이
                            </button>
                        </div>
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
