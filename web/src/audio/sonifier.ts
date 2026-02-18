import * as Tone from "tone";

export class Sonifier {
  private synth: Tone.Synth | null = null;
  private started = false;

  async ensureStarted() {
    if (this.started) return;
    await Tone.start();
    this.synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.005, decay: 0.08, sustain: 0.0, release: 0.05 },
    }).toDestination();
    this.started = true;
  }

  trigger(close: number, min: number, max: number) {
    if (!this.synth) return;
    const norm = (close - min) / Math.max(1e-9, max - min);
    const hz = 180 + norm * 720; // 180..900Hz
    this.synth.triggerAttackRelease(Tone.Frequency(hz, "hz"), "16n");
  }
}
