import { create } from "zustand";

export type MathLevel = "easy" | "medium" | "hard";

interface MathRunnerState {
  gameState: "menu" | "playing" | "gameover";
  gameMode: "math" | "english";
  playerCount: number;
  playerZ: number;
  currentSpeed: number;
  currentQuestion: string;
  level: MathLevel;
  pendingQuestion: string;
  nextEnemyCount: number;
  totalEnemiesDefeated: number;
  setGameState: (state: "menu" | "playing" | "gameover") => void;
  setGameMode: (mode: "math" | "english") => void;
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
  resetGame: () => void;
}

export const useMathRunnerStore = create<MathRunnerState>((set) => ({
  gameState: "menu",
  gameMode: "math",
  playerCount: 1,
  playerZ: 0,
  currentSpeed: 10,
  currentQuestion: "Get Ready!",
  level: "easy",
  pendingQuestion: "",
  nextEnemyCount: 0,
  totalEnemiesDefeated: 0,
  setGameState: (state) => set({ gameState: state }),
  setGameMode: (mode) => set({ gameMode: mode }),
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
  resetGame: () =>
    set({
      gameState: "playing",
      playerCount: 1,
      playerZ: 0,
      currentSpeed: 10,
      currentQuestion: "Get Ready!",
      pendingQuestion: "",
      nextEnemyCount: 0,
      totalEnemiesDefeated: 0,
    }),
}));
