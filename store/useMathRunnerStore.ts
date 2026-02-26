import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MathLevel = "easy" | "medium" | "hard";
export type MathRunnerQualityPreset = "auto" | "high" | "medium" | "low";

interface MathRunnerState {
  gameState: "menu" | "playing" | "gameover" | "win";
  gameMode: "math" | "english";
  qualityPreset: MathRunnerQualityPreset;
  runId: number;
  playerCount: number;
  playerX: number;
  playerZ: number;
  currentSpeed: number;
  currentQuestion: string;
  level: MathLevel;
  pendingQuestion: string;
  nextEnemyCount: number;
  totalEnemiesDefeated: number;
  bestScore: number;
  setGameState: (state: "menu" | "playing" | "gameover" | "win") => void;
  setGameMode: (mode: "math" | "english") => void;
  setQualityPreset: (preset: MathRunnerQualityPreset) => void;
  setLevel: (level: MathLevel) => void;
  setPlayerCount: (count: number) => void;
  setCurrentQuestion: (question: string) => void;
  addPlayers: (amount: number) => void;
  multiplyPlayers: (multiplier: number) => void;
  subtractPlayers: (amount: number) => void;
  dividePlayers: (divisor: number) => void;
  advanceQuestion: () => void;
  setNextEnemyCount: (count: number) => void;
  addEnemiesDefeated: (count: number) => void;
  setPendingQuestion: (question: string) => void;
  setCurrentSpeed: (speed: number) => void;
  setBestScore: (score: number) => void;
  resetGame: () => void;
}

export const useMathRunnerStore = create<MathRunnerState>()(
  persist(
    (set) => ({
      gameState: "menu",
      gameMode: "math",
      qualityPreset: "auto",
      runId: 0,
      playerCount: 1,
      playerX: 0,
      playerZ: 0,
      currentSpeed: 10,
      currentQuestion: "Get Ready!",
      level: "easy",
      pendingQuestion: "",
      nextEnemyCount: 0,
      totalEnemiesDefeated: 0,
      bestScore: 0,
      setGameState: (state) => set({ gameState: state }),
      setGameMode: (mode) => set({ gameMode: mode }),
      setQualityPreset: (preset) => set({ qualityPreset: preset }),
      setLevel: (level) => set({ level }),
      setPlayerCount: (count) => set({ playerCount: Math.max(0, count) }),
      setCurrentQuestion: (question) => set({ currentQuestion: question }),
      addPlayers: (amount) =>
        set((state) => ({ playerCount: state.playerCount + amount })),
      multiplyPlayers: (multiplier) =>
        set((state) => ({ playerCount: state.playerCount * multiplier })),
      subtractPlayers: (amount) =>
        set((state) => {
          const newCount = Math.max(0, state.playerCount - amount);
          return {
            playerCount: newCount,
            gameState: newCount <= 0 ? "gameover" : state.gameState,
          };
        }),
      dividePlayers: (divisor) =>
        set((state) => {
          const newCount = Math.max(0, Math.floor(state.playerCount / divisor));
          return {
            playerCount: newCount,
            gameState: newCount <= 0 ? "gameover" : state.gameState,
          };
        }),
      advanceQuestion: () =>
        set((state) => ({
          currentQuestion: state.pendingQuestion || state.currentQuestion,
          pendingQuestion: "",
        })),
      setNextEnemyCount: (count) => set({ nextEnemyCount: count }),
      addEnemiesDefeated: (count) =>
        set((state) => ({
          totalEnemiesDefeated: state.totalEnemiesDefeated + count,
        })),
      setPendingQuestion: (question) => set({ pendingQuestion: question }),
      setCurrentSpeed: (speed) => set({ currentSpeed: speed }),
      setBestScore: (score) => set({ bestScore: score }),
      resetGame: () =>
        set((state) => ({
          gameState: "playing",
          runId: state.runId + 1,
          playerCount: 1,
          playerX: 0,
          playerZ: 0,
          currentSpeed: 10,
          currentQuestion: "Get Ready!",
          pendingQuestion: "",
          nextEnemyCount: 0,
          totalEnemiesDefeated: 0,
        })),
    }),
    {
      name: "math-runner-storage",
      partialize: (state) => ({
        bestScore: state.bestScore,
        qualityPreset: state.qualityPreset,
      }),
    }
  )
);
