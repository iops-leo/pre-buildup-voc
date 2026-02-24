"use client";

import {
    createContext,
    useContext,
    useMemo,
    type ReactNode,
} from "react";
import {
    useMathRunnerStore,
    type MathRunnerQualityPreset,
} from "@/store/useMathRunnerStore";

type ResolvedQualityPreset = Exclude<MathRunnerQualityPreset, "auto">;

interface RuntimeConfig {
    selectedPreset: MathRunnerQualityPreset;
    resolvedPreset: ResolvedQualityPreset;
    maxDpr: number;
    enableShadows: boolean;
    shadowMapSize: number;
    maxPlayerCrowd: number;
    maxEnemyCrowd: number;
    enableParticles: boolean;
    enableAudio: boolean;
    enableCameraShake: boolean;
    textScale: number;
}

const CONFIGS: Record<ResolvedQualityPreset, Omit<RuntimeConfig, "selectedPreset" | "resolvedPreset">> = {
    high: {
        maxDpr: 2,
        enableShadows: true,
        shadowMapSize: 1024,
        maxPlayerCrowd: 30,
        maxEnemyCrowd: 15,
        enableParticles: true,
        enableAudio: true,
        enableCameraShake: true,
        textScale: 1,
    },
    medium: {
        maxDpr: 1.5,
        enableShadows: true,
        shadowMapSize: 768,
        maxPlayerCrowd: 22,
        maxEnemyCrowd: 12,
        enableParticles: true,
        enableAudio: true,
        enableCameraShake: true,
        textScale: 0.92,
    },
    low: {
        maxDpr: 1.2,
        enableShadows: false,
        shadowMapSize: 512,
        maxPlayerCrowd: 14,
        maxEnemyCrowd: 8,
        enableParticles: false,
        enableAudio: false,
        enableCameraShake: false,
        textScale: 0.85,
    },
};

const RuntimeConfigContext = createContext<RuntimeConfig>({
    selectedPreset: "auto",
    resolvedPreset: "medium",
    ...CONFIGS.medium,
});

function detectDevicePreset(): ResolvedQualityPreset {
    if (typeof window === "undefined") return "medium";

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;

    if ((isMobile && cores <= 4) || memory <= 2) return "low";
    if (isMobile || cores <= 6 || memory <= 4) return "medium";
    return "high";
}

export function MathRunnerRuntimeConfigProvider({ children }: { children: ReactNode }) {
    const selectedPreset = useMathRunnerStore((state) => state.qualityPreset);
    const devicePreset = useMemo(() => detectDevicePreset(), []);

    const resolvedPreset: ResolvedQualityPreset =
        selectedPreset === "auto" ? devicePreset : selectedPreset;

    const value = useMemo<RuntimeConfig>(() => {
        return {
            selectedPreset,
            resolvedPreset,
            ...CONFIGS[resolvedPreset],
        };
    }, [selectedPreset, resolvedPreset]);

    return (
        <RuntimeConfigContext.Provider value={value}>
            {children}
        </RuntimeConfigContext.Provider>
    );
}

export function useMathRunnerRuntimeConfig() {
    return useContext(RuntimeConfigContext);
}
