// web/src/audio/sonifier.ts
export type SonifyMode = "price" | "delta";

export type SonifierOptions = {
  baseFreq?: number;      // Hz
  span?: number;          // how wide the pitch range is
  volume?: number;        // 0..1
  mode?: SonifyMode;      // "price" maps price->pitch, "delta" maps change->pitch
};

export class Sonifier {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;

  private enabled = false;

  private baseFreq: number;
  private span: number;
  private volume: number;
  private mode: SonifyMode;

  // for mapping
  private min = Number.POSITIVE_INFINITY;
  private max = Number.NEGATIVE_INFINITY;

  constructor(opts: SonifierOptions = {}) {
    this.baseFreq = opts.baseFreq ?? 220;
    this.span = opts.span ?? 700;
    this.volume = opts.volume ?? 0.06;
    this.mode = opts.mode ?? "delta";
  }

  isEnabled() {
    return this.enabled;
  }

  async enable() {
    if (this.enabled) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    await this.ctx.resume();

    this.osc = this.ctx.createOscillator();
    this.gain = this.ctx.createGain();

    this.osc.type = "sine";
    this.gain.gain.value = 0; // start silent

    this.osc.connect(this.gain);
    this.gain.connect(this.ctx.destination);
    this.osc.start();

    this.enabled = true;
  }

  disable() {
    this.enabled = false;
    try {
      this.osc?.stop();
    } catch {}
    this.osc = null;
    this.gain = null;
    this.ctx?.close();
    this.ctx = null;
  }

  setMode(mode: SonifyMode) {
    this.mode = mode;
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
  }

  // Call this whenever a new tick arrives
  tick(value: number, prevValue: number | null) {
    if (!this.enabled || !this.ctx || !this.osc || !this.gain) return;

    const x =
      this.mode === "delta"
        ? prevValue === null
          ? 0
          : value - prevValue
        : value;

    // update running range
    this.min = Math.min(this.min, x);
    this.max = Math.max(this.max, x);
    const range = this.max - this.min || 1;

    // normalize 0..1
    const t = (x - this.min) / range;

    // map to frequency
    const freq = this.baseFreq + t * this.span;

    // green/up = slightly brighter; red/down = slightly darker
    const up = prevValue === null ? true : value >= prevValue;
    const targetGain = up ? this.volume : this.volume * 0.85;

    const now = this.ctx.currentTime;

    // smooth pitch changes
    this.osc.frequency.setTargetAtTime(freq, now, 0.02);

    // short beep envelope per tick
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(0, now);
    this.gain.gain.linearRampToValueAtTime(targetGain, now + 0.01);
    this.gain.gain.linearRampToValueAtTime(0, now + 0.12);
  }
}