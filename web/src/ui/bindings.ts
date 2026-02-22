import type { AppState } from "../core/state";
import type { DemoKey } from "../io/demoData";
import { DEMO_DATA } from "../io/demoData";
import { parseCsvToSeries } from "../io/csv";

function trendCard(name: string, symbol: string, ccy: string, price: string, change: string) {
  const up = change.trim().startsWith("+");
  return `
    <div class="trend">
      <div class="trend-top">
        <div class="trend-name">${name}</div>
        <div class="trend-price">${price}</div>
      </div>
      <div class="trend-mid">
        <div>${symbol} <span style="opacity:.7">${ccy}</span></div>
        <div class="trend-change ${up ? "up" : "down"}">${change}</div>
      </div>
    </div>
  `;
}

export function bindUI(root: HTMLElement, state: AppState) {
  const el = {
    uploadBtn: root.querySelector<HTMLButtonElement>("#btnUpload"),
    uploadInput: root.querySelector<HTMLInputElement>("#fileUpload"),

    playBtn: root.querySelector<HTMLButtonElement>("#btnPlay"),
    playBtnInline: root.querySelector<HTMLButtonElement>("#btnPlayInline"),

    timeline: root.querySelector<HTMLInputElement>("#timeline"),

    datasetName: root.querySelector<HTMLSpanElement>("#datasetName"),
    mappingName: root.querySelector<HTMLSpanElement>("#mappingName"),
    seriesLabel: root.querySelector<HTMLSpanElement>("#seriesLabel"),

    canvas: root.querySelector<HTMLCanvasElement>("#chart"),
    spark: root.querySelector<HTMLCanvasElement>("#spark"),

    trending: root.querySelector<HTMLDivElement>("#trendingList"),
    status: root.querySelector<HTMLDivElement>("#status"),

    librarySearch: root.querySelector<HTMLInputElement>("#librarySearch"),
    libraryList: root.querySelector<HTMLDivElement>("#libraryList"),
  };

  // Hard requirements (if missing, show a helpful error instead of white screen)
  if (!el.canvas || !el.timeline) {
    const missing = [
      !el.canvas ? "#chart" : null,
      !el.timeline ? "#timeline" : null,
    ].filter(Boolean);

    throw new Error(`Missing required element(s): ${missing.join(", ")}. Check layoutHtml() IDs.`);
  }

  const setStatus = (msg: string) => {
    if (el.status) el.status.textContent = msg;
  };

  function updateTrending() {
    if (!el.trending) return;
    el.trending.innerHTML = `
      ${trendCard("Tesla Inc.", "TSLA", "USD", "250.19", "+0.54%")}
      ${trendCard("Apple Inc.", "AAPL", "USD", "169.22", "-0.41%")}
      ${trendCard("Bitcoin", "BTC", "USD", "26,946.24", "+2.10%")}
    `;
  }

  function renderLibrary(filter = "") {
    if (!el.libraryList) return;

    const items: { key: DemoKey; name: string; sub: string }[] = [
      { key: "TSLA", name: "Tesla", sub: "Equity • USD" },
      { key: "AAPL", name: "Apple", sub: "Equity • USD" },
      { key: "BTC", name: "Bitcoin", sub: "Crypto • USD" },
    ];

    const q = filter.trim().toLowerCase();
    const filtered = q
      ? items.filter((x) => x.key.toLowerCase().includes(q) || x.name.toLowerCase().includes(q))
      : items;

    el.libraryList.innerHTML = filtered
      .map(
        (x) => `
        <button class="lib-item" type="button" data-demo="${x.key}">
          <div class="lib-left">
            <div class="lib-code">${x.key}</div>
            <div class="lib-sub">${x.name} • ${x.sub}</div>
          </div>
          <div style="opacity:.65">›</div>
        </button>
      `
      )
      .join("");
  }

  function updateMeta() {
    if (el.datasetName) el.datasetName.textContent = state.seriesName;
    if (el.mappingName) el.mappingName.textContent = "Close → Pitch";
    if (el.seriesLabel) {
      el.seriesLabel.textContent = state.seriesName.includes("(demo)")
        ? state.seriesName.replace(" (demo)", "")
        : state.seriesName;
    }
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

  el.librarySearch?.addEventListener("input", () => renderLibrary(el.librarySearch?.value ?? ""));
  el.libraryList?.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-demo]");
    if (!btn) return;
    const key = btn.getAttribute("data-demo") as DemoKey;
    loadDemo(key);
    updateMeta();
  });

  updateTrending();
  renderLibrary();
  updateMeta();
  setStatus("Loaded TSLA demo — Upload CSV to replace.");

  return { el, setStatus, updateMeta, loadCsv, loadDemo };
}