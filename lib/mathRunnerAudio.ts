let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;

function ensureAudio() {
  if (typeof window === "undefined") return null;
  const AudioCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;

  if (!audioContext) {
    audioContext = new AudioCtor();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.2;
    masterGain.connect(audioContext.destination);
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return { audioContext, masterGain };
}

function playTone({
  frequency,
  duration,
  volume,
  type,
  frequencyEnd,
}: {
  frequency: number;
  duration: number;
  volume: number;
  type: OscillatorType;
  frequencyEnd?: number;
}) {
  const audio = ensureAudio();
  if (!audio?.masterGain) return;

  const { audioContext: ctx, masterGain: gainBus } = audio;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  if (frequencyEnd) {
    osc.frequency.exponentialRampToValueAtTime(frequencyEnd, ctx.currentTime + duration);
  }

  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(gainBus);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.02);
}

export function playBattleClashSound() {
  playTone({
    frequency: 160,
    frequencyEnd: 95,
    duration: 0.08,
    volume: 0.08,
    type: "square",
  });
}

export function playBattleResultSound(win: boolean) {
  if (win) {
    playTone({ frequency: 520, frequencyEnd: 760, duration: 0.18, volume: 0.09, type: "triangle" });
    return;
  }
  playTone({ frequency: 220, frequencyEnd: 120, duration: 0.2, volume: 0.1, type: "sawtooth" });
}

export function playGateResultSound(correct: boolean) {
  if (correct) {
    playTone({ frequency: 680, frequencyEnd: 920, duration: 0.09, volume: 0.06, type: "triangle" });
    return;
  }
  playTone({ frequency: 240, frequencyEnd: 180, duration: 0.1, volume: 0.07, type: "square" });
}

export function playObstacleHitSound() {
  playTone({ frequency: 180, frequencyEnd: 110, duration: 0.12, volume: 0.08, type: "sawtooth" });
}
