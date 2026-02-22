import { create } from 'zustand';

export type MathLevel = 'easy' | 'medium' | 'hard';

interface MathRunnerState {
    gameMode: 'math' | 'english';
    playerCount: number;
    playerZ: number;
    currentQuestion: string;
    level: MathLevel;
    pendingQuestion: string;
    nextEnemyCount: number;
    totalEnemiesDefeated: number;
    setGameMode: (mode: 'math' | 'english') => void;
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
    resetGame: () => void;
}

export const useMathRunnerStore = create<MathRunnerState>((set) => ({
    gameMode: 'math',
    playerCount: 1,
    playerZ: 0,
    currentQuestion: "Get Ready!",
    level: 'easy',
    pendingQuestion: "",
    nextEnemyCount: 0,
    totalEnemiesDefeated: 0,
    setGameMode: (mode) => set({ gameMode: mode }),
    setLevel: (level) => set({ level }),
    setPlayerCount: (count) => set({ playerCount: Math.max(1, count) }),
    setCurrentQuestion: (question) => set({ currentQuestion: question }),
    addPlayers: (amount) => set((state) => ({ playerCount: state.playerCount + amount })),
    multiplyPlayers: (multiplier) => set((state) => ({ playerCount: state.playerCount * multiplier })),
    subtractPlayers: (amount) => set((state) => ({ playerCount: Math.max(1, state.playerCount - amount) })),
    dividePlayers: (divisor) => set((state) => ({ playerCount: Math.max(1, Math.floor(state.playerCount / divisor)) })),
    advanceQuestion: () => set((state) => ({
        currentQuestion: state.pendingQuestion || state.currentQuestion,
        pendingQuestion: "",
    })),
    setNextEnemyCount: (count) => set({ nextEnemyCount: count }),
    addEnemiesDefeated: (count) => set((state) => ({
        totalEnemiesDefeated: state.totalEnemiesDefeated + count,
    })),
    setPendingQuestion: (question) => set({ pendingQuestion: question }),
    resetGame: () => set({
        playerCount: 1,
        playerZ: 0,
        currentQuestion: "Get Ready!",
        pendingQuestion: "",
        nextEnemyCount: 0,
        totalEnemiesDefeated: 0,
    }),
}));
