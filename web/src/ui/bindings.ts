import type { AppState } from "../core/state.ts";
import type { DemoKey } from "../io/demoData.ts";
import { DEMO_DATA } from "../io/demoData.ts";
import { parseCsvToSeries } from "../io/csv.ts";
import { trendRow } from "./layout.ts";

export function bindUI(root: HTMLElement, state: AppState) {
  const el = {
    uploadBtn: root.querySelector<HTMLButtonElement>("#btnUpload")!,
    uploadInput: root.querySelector<HTMLInputElement>("#fileUpload")!,
    playBtn: root.querySelector<HTMLButtonElement>("#btnPlay")!,
    timeline: root.querySelector<HTMLInputElement>("#timeline")!,
    datasetName: root.querySelector<HTMLSpanElement>("#datasetName")!,
    mappingName: root.querySelector<HTMLSpanElement>("#mappingName")!,
    canvas: root.querySelector<HTMLCanvasElement>("#chart")!,
    libraryItems: root.querySelectorAll<HTMLButtonElement>("[data-demo]"),
    trending: root.querySelector<HTMLDivElement>("#trendingList")!,
    status: root.querySelector<HTMLDivElement>("#status")!,
  };

  const setStatus = (msg: string) => {
    el.status.textContent = msg;
  };

  function updateTrending() {
    el.trending.innerHTML = `
      ${trendRow("Tesla Inc.", "TSLA", "USD", "250.19", "+0.54%")}
      ${trendRow("Apple Inc.", "AAPL", "USD", "169.22", "-0.41%")}
      ${trendRow("Bitcoin", "BTC", "USD", "26,946.24", "+2.10%")}
    `;
  }

  function updateMeta() {
    el.datasetName.textContent = state.seriesName;
    el.mappingName.textContent = "Close → Pitch";
  }

  async function loadCsv(file: File) {
    setStatus("Parsing CSV…");

    const parsed = await parseCsvToSeries(file);

    if (parsed.length < 2) {
      setStatus("CSV loaded, but no usable Close column found.");
      return;
    }

    state.series = parsed;
    state.seriesName = file.name;
    state.index = 0;

    setStatus("CSV loaded ✅");
  }

  function loadDemo(key: DemoKey) {
    state.series = DEMO_DATA[key];
    state.seriesName = `${key} (demo)`;
    state.index = 0;

    setStatus(`Loaded ${state.seriesName}`);
  }

  updateTrending();
  updateMeta();
  setStatus("Loaded TSLA demo — Upload CSV to replace.");

  return { el, setStatus, updateMeta, loadCsv, loadDemo };
}
