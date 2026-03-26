/**
 * Lightweight sound effects using Web Audio API with synthesized tones.
 * No audio files needed — all sounds are generated programmatically.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playChord(freqs: number[], duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  freqs.forEach(f => playTone(f, duration, type, volume));
}

export const sfx = {
  correct() {
    playTone(523, 0.1);
    setTimeout(() => playTone(659, 0.1), 80);
    setTimeout(() => playTone(784, 0.15), 160);
  },
  wrong() {
    playTone(311, 0.15, 'square', 0.15);
    setTimeout(() => playTone(233, 0.2, 'square', 0.12), 100);
  },
  xpGain() {
    [523, 587, 659, 784, 880].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.12, 'sine', 0.2), i * 60);
    });
  },
  fanfare() {
    playChord([523, 659, 784], 0.3);
    setTimeout(() => playChord([587, 740, 880], 0.4), 250);
    setTimeout(() => playChord([659, 784, 1047], 0.5), 500);
  },
  tap() {
    playTone(440, 0.05, 'sine', 0.1);
  },
  tick() {
    playTone(800, 0.05, 'square', 0.08);
  },
  gameOver() {
    playChord([392, 494, 587], 0.6, 'triangle', 0.2);
  },
  whoosh() {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  },
  pop() {
    playTone(600, 0.08, 'sine', 0.2);
  },
  streak(count: number) {
    const baseFreq = 440 + count * 40;
    playTone(baseFreq, 0.1);
    setTimeout(() => playTone(baseFreq * 1.25, 0.12), 60);
    if (count >= 5) {
      setTimeout(() => playTone(baseFreq * 1.5, 0.15), 120);
    }
  },
};

export function isSoundEnabled(): boolean {
  try {
    const raw = localStorage.getItem('lv_sound_enabled');
    return raw !== 'false';
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem('lv_sound_enabled', enabled ? 'true' : 'false');
}

export const SFX = new Proxy(sfx, {
  get(target, prop) {
    const fn = target[prop as keyof typeof sfx];
    if (typeof fn !== 'function') return fn;
    return (...args: unknown[]) => {
      if (isSoundEnabled()) return (fn as Function)(...args);
    };
  },
}) as typeof sfx;
