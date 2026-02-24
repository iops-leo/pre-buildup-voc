import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { useMathRunnerStore } from "@/store/useMathRunnerStore";

function resetMathRunnerState() {
  useMathRunnerStore.setState({
    gameState: "menu",
    gameMode: "math",
    qualityPreset: "auto",
    runId: 0,
    playerCount: 1,
    playerZ: 0,
    currentSpeed: 10,
    currentQuestion: "Get Ready!",
    level: "easy",
    pendingQuestion: "",
    nextEnemyCount: 0,
    totalEnemiesDefeated: 0,
    bestScore: 0,
  });
}

describe("useMathRunnerStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMathRunnerState();
  });

  it("resetGame starts a new run and keeps best score", () => {
    useMathRunnerStore.setState({
      runId: 3,
      playerCount: 19,
      playerZ: -420,
      currentQuestion: "old",
      pendingQuestion: "next",
      qualityPreset: "low",
      bestScore: 88,
      gameState: "menu",
    });

    useMathRunnerStore.getState().resetGame();

    const state = useMathRunnerStore.getState();
    expect(state.gameState).toBe("playing");
    expect(state.runId).toBe(4);
    expect(state.playerCount).toBe(1);
    expect(state.playerZ).toBe(0);
    expect(state.currentQuestion).toBe("Get Ready!");
    expect(state.pendingQuestion).toBe("");
    expect(state.qualityPreset).toBe("low");
    expect(state.bestScore).toBe(88);
  });

  it("subtractPlayers drives gameover at zero", () => {
    useMathRunnerStore.setState({ gameState: "playing", playerCount: 3 });

    useMathRunnerStore.getState().subtractPlayers(2);
    let state = useMathRunnerStore.getState();
    expect(state.playerCount).toBe(1);
    expect(state.gameState).toBe("playing");

    useMathRunnerStore.getState().subtractPlayers(1);
    state = useMathRunnerStore.getState();
    expect(state.playerCount).toBe(0);
    expect(state.gameState).toBe("gameover");
  });

  it("dividePlayers floors values and triggers gameover", () => {
    useMathRunnerStore.setState({ gameState: "playing", playerCount: 5 });

    useMathRunnerStore.getState().dividePlayers(3);
    let state = useMathRunnerStore.getState();
    expect(state.playerCount).toBe(1);
    expect(state.gameState).toBe("playing");

    useMathRunnerStore.getState().dividePlayers(2);
    state = useMathRunnerStore.getState();
    expect(state.playerCount).toBe(0);
    expect(state.gameState).toBe("gameover");
  });

  it("advanceQuestion swaps pending question safely", () => {
    useMathRunnerStore.setState({
      currentQuestion: "A",
      pendingQuestion: "B",
    });

    useMathRunnerStore.getState().advanceQuestion();
    let state = useMathRunnerStore.getState();
    expect(state.currentQuestion).toBe("B");
    expect(state.pendingQuestion).toBe("");

    useMathRunnerStore.getState().advanceQuestion();
    state = useMathRunnerStore.getState();
    expect(state.currentQuestion).toBe("B");
    expect(state.pendingQuestion).toBe("");
  });

  it("persists bestScore and qualityPreset only", () => {
    useMathRunnerStore.getState().setBestScore(77);
    useMathRunnerStore.getState().setQualityPreset("high");

    const setItemMock = window.localStorage.setItem as unknown as Mock;
    expect(setItemMock).toHaveBeenCalled();
    const lastCall = setItemMock.mock.calls.at(-1);
    expect(lastCall).toBeTruthy();

    const payload = JSON.parse(String(lastCall?.[1]));
    expect(payload.state.bestScore).toBe(77);
    expect(payload.state.qualityPreset).toBe("high");
    expect(Object.keys(payload.state).sort()).toEqual(["bestScore", "qualityPreset"]);
  });
});
