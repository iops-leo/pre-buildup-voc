import { create } from 'zustand';

export type MathLevel = 'easy' | 'medium' | 'hard';

interface MathRunnerState {
    playerCount: number;
    playerZ: number;
    currentQuestion: string;
    level: MathLevel;
    setLevel: (level: MathLevel) => void;
    setPlayerCount: (count: number) => void;
    setCurrentQuestion: (question: string) => void;
    addPlayers: (amount: number) => void;
    multiplyPlayers: (multiplier: number) => void;
    subtractPlayers: (amount: number) => void;
    dividePlayers: (divisor: number) => void;
}

export const useMathRunnerStore = create<MathRunnerState>((set) => ({
    playerCount: 1,
    playerZ: 0,
    currentQuestion: "Get Ready!",
    level: 'easy',
    setLevel: (level) => set({ level }),
    setPlayerCount: (count) => set({ playerCount: Math.max(1, count) }),
    setCurrentQuestion: (question) => set({ currentQuestion: question }),
    addPlayers: (amount) => set((state) => ({ playerCount: state.playerCount + amount })),
    multiplyPlayers: (multiplier) => set((state) => ({ playerCount: state.playerCount * multiplier })),
    subtractPlayers: (amount) => set((state) => ({ playerCount: Math.max(1, state.playerCount - amount) })),
    dividePlayers: (divisor) => set((state) => ({ playerCount: Math.max(1, Math.floor(state.playerCount / divisor)) })),
}));
