import { layoutHtml } from "../ui/layout";
import { createInitialState } from "../core/state";
import { DEMO_DATA } from "../io/demoData";
import { bindUI } from "../ui/bindings";
import { createPlayer } from "../core/player";
import { drawLineChart, drawSparkline } from "../visuals/chart";

export function initApp(root: HTMLDivElement) {
  root.innerHTML = layoutHtml();

  const state = createInitialState(DEMO_DATA.TSLA, "TSLA (demo)");
  const ui = bindUI(root, state);

  const player = createPlayer(state, ui.el.canvas!, ui.el.timeline!, ui.setStatus);

  const render = () => {
    drawLineChart(ui.el.canvas!, state.series, state.index);
    if (ui.el.spark) drawSparkline(ui.el.spark, state.series);
    ui.updateMeta();
    player.update();
  };

  render();

  ui.el.uploadBtn?.addEventListener("click", () => ui.el.uploadInput?.click());

  ui.el.uploadInput?.addEventListener("change", async () => {
    const f = ui.el.uploadInput?.files?.[0];
    if (!f) return;

    player.stop();
    await ui.loadCsv(f);
    state.index = 0;

    render();

    ui.el.uploadInput.value = "";
    ui.el.playBtn && (ui.el.playBtn.textContent = "▶ Play");
    ui.el.playBtnInline && (ui.el.playBtnInline.textContent = "▶");
  });

  const togglePlay = async () => {
    if (state.isPlaying) {
      player.stop();
      ui.el.playBtn && (ui.el.playBtn.textContent = "▶ Play");
      ui.el.playBtnInline && (ui.el.playBtnInline.textContent = "▶");
    } else {
      await player.start();
      ui.el.playBtn && (ui.el.playBtn.textContent = "⏸ Pause");
      ui.el.playBtnInline && (ui.el.playBtnInline.textContent = "⏸");
    }
  };

  ui.el.playBtn?.addEventListener("click", togglePlay);
  ui.el.playBtnInline?.addEventListener("click", togglePlay);

  ui.el.timeline?.addEventListener("input", () => {
    state.index = Number(ui.el.timeline?.value) || 0;
    drawLineChart(ui.el.canvas!, state.series, state.index);
  });

  const prev = root.querySelector<HTMLButtonElement>("#btnPrev");
  const next = root.querySelector<HTMLButtonElement>("#btnNext");

  prev?.addEventListener("click", () => {
    state.index = Math.max(0, state.index - 1);
    ui.el.timeline && (ui.el.timeline.value = String(state.index));
    drawLineChart(ui.el.canvas!, state.series, state.index);
  });

  next?.addEventListener("click", () => {
    state.index = Math.min(state.series.length - 1, state.index + 1);
    ui.el.timeline && (ui.el.timeline.value = String(state.index));
    drawLineChart(ui.el.canvas!, state.series, state.index);
  });
}