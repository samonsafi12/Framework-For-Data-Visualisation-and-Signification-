import { layoutHtml } from "../ui/layout.ts";
import { createInitialState } from "../core/state.ts";
import { DEMO_DATA } from "../io/demoData.ts";
import { bindUI } from "../ui/bindings.ts";
import { createPlayer } from "../core/player.ts";
import { drawLineChart } from "../visuals/chart.ts";

export function initApp(root: HTMLDivElement) {
  root.innerHTML = layoutHtml();

  const state = createInitialState(DEMO_DATA.TSLA, "TSLA (demo)");
  const ui = bindUI(root, state);

  const player = createPlayer(state, ui.el.canvas, ui.el.timeline, ui.setStatus);

  // initial render
  drawLineChart(ui.el.canvas, state.series, state.index);
  player.update();

  // events
  ui.el.uploadBtn.addEventListener("click", () => ui.el.uploadInput.click());

  ui.el.uploadInput.addEventListener("change", async () => {
    const f = ui.el.uploadInput.files?.[0];
    if (!f) return;

    player.stop();
    await ui.loadCsv(f);
    ui.updateMeta();
    player.update();
    drawLineChart(ui.el.canvas, state.series, state.index);

    ui.el.uploadInput.value = "";
  });

  ui.el.playBtn.addEventListener("click", async () => {
    if (state.isPlaying) {
      player.stop();
      ui.el.playBtn.textContent = "▶ Play";
    } else {
      await player.start();
      ui.el.playBtn.textContent = "⏸ Pause";
    }
  });

  ui.el.timeline.addEventListener("input", () => {
    state.index = Number(ui.el.timeline.value) || 0;
    drawLineChart(ui.el.canvas, state.series, state.index);
  });

  ui.el.libraryItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-demo") as any;
      player.stop();
      ui.loadDemo(key);
      ui.updateMeta();
      player.update();
      drawLineChart(ui.el.canvas, state.series, state.index);
      ui.el.playBtn.textContent = "▶ Play";
    });
  });
}
