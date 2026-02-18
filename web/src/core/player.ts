import type { AppState } from "./state";
import { Sonifier } from "../audio/sonifier";
import { drawLineChart } from "../visuals/chart";

export function createPlayer(
  state: AppState,
  canvas: HTMLCanvasElement,
  timeline: HTMLInputElement,
  setStatus: (msg: string) => void
) {
  const sonifier = new Sonifier();
  let timer: number | null = null;

  function update() {
    timeline.max = String(Math.max(0, state.series.length - 1));
    timeline.value = String(state.index);
    drawLineChart(canvas, state.series, state.index);
  }

  function tick() {
    if (!state.series.length) return;

    const closes = state.series.map(d => d.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);

    state.index = (state.index + 1) % state.series.length;
    timeline.value = String(state.index);
    drawLineChart(canvas, state.series, state.index);
    sonifier.trigger(state.series[state.index].close, min, max);
  }

  async function start() {
    if (state.isPlaying || !state.series.length) return;
    await sonifier.ensureStarted();
    state.isPlaying = true;
    setStatus("Playing (Close → Pitch)");
    timer = window.setInterval(tick, 300);
  }

  function stop() {
    if (!state.isPlaying) return;
    state.isPlaying = false;
    setStatus("Paused");
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  return { start, stop, update, tick };
}
