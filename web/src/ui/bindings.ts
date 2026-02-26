import type { AppState } from "../core/state";
import type { DemoKey } from "../io/demoData";
import { DEMO_DATA } from "../io/demoData";
import { parseCsvToSeries } from "../io/csv";

type AppSymbol = "TSLA" | "AAPL" | "BTC";

type QuoteSummary = {
  symbol: AppSymbol;
  name: string;
  ccy: string;
  price: number;
  delta: number;
  pct: number;
  up: boolean;
};

function formatNumber(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatCurrency(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n >= 1000 ? 0 : 2,
  });
}

function formatPct(n: number) {
  if (!Number.isFinite(n)) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${formatNumber(n)}%`;
}

function watchItemHTML(q: QuoteSummary) {
  return `
    <div class="wl-item">
      <div class="wl-left">
        <div class="wl-name">${q.name}</div>
        <div class="wl-sub">${q.symbol} <span style="opacity:.7">${q.ccy}</span></div>
      </div>
      <div class="wl-right">
        <div class="wl-price">${formatCurrency(q.price)}</div>
        <div class="wl-change ${q.up ? "up" : "down"}">${formatPct(q.pct)}</div>
      </div>
    </div>
  `;
}

function trendCardHTML(q: QuoteSummary) {
  return `
    <div class="trend">
      <div class="trend-top">
        <div class="trend-name">${q.name}</div>
        <div class="trend-price">${formatCurrency(q.price)}</div>
      </div>
      <div class="trend-mid">
        <div>${q.symbol} <span style="opacity:.7">${q.ccy}</span></div>
        <div class="trend-change ${q.up ? "up" : "down"}">${formatPct(q.pct)}</div>
      </div>
    </div>
  `;
}

export function bindUI(root: HTMLElement, state: AppState, onSeriesChange: () => void) {
  const el = {
    uploadBtn: root.querySelector<HTMLButtonElement>("#btnUpload") ?? null,
    uploadInput: root.querySelector<HTMLInputElement>("#fileUpload") ?? null,

    playBtn: root.querySelector<HTMLButtonElement>("#btnPlay") ?? null,
    playBtnInline: root.querySelector<HTMLButtonElement>("#btnPlayInline") ?? null,

    timeline: root.querySelector<HTMLInputElement>("#timeline") ?? null,

    datasetName: root.querySelector<HTMLSpanElement>("#datasetName") ?? null,
    mappingName: root.querySelector<HTMLSpanElement>("#mappingName") ?? null,
    seriesLabel: root.querySelector<HTMLSpanElement>("#seriesLabel") ?? null,

    canvas: root.querySelector<HTMLCanvasElement>("#chart") ?? null,
    spark: root.querySelector<HTMLCanvasElement>("#spark") ?? null,

    // ✅ optional: you might not have trendingList anymore
    trending: root.querySelector<HTMLDivElement>("#trendingList") ?? null,

    // ✅ watchlist is what you show in the right sidebar now
    watchlist: root.querySelector<HTMLDivElement>("#watchlist") ?? null,

    status: root.querySelector<HTMLDivElement>("#status") ?? null,

    librarySearch: root.querySelector<HTMLInputElement>("#librarySearch") ?? null,
    libraryList: root.querySelector<HTMLDivElement>("#libraryList") ?? null,

    // ✅ sound button
    soundBtn: root.querySelector<HTMLButtonElement>("#btnSound") ?? null,

    // KPI / dashboard elements
    kpiPrice: root.querySelector<HTMLDivElement>("#kpiPrice") ?? null,
    kpiChange: root.querySelector<HTMLDivElement>("#kpiChange") ?? null,
    kpiChangeSub: root.querySelector<HTMLDivElement>("#kpiChangeSub") ?? null,
    kpiMcap: root.querySelector<HTMLDivElement>("#kpiMcap") ?? null,
    kpiRevenue: root.querySelector<HTMLDivElement>("#kpiRevenue") ?? null,
    kpiEmployees: root.querySelector<HTMLDivElement>("#kpiEmployees") ?? null,

    infoName: root.querySelector<HTMLDivElement>("#infoName") ?? null,
    infoSector: root.querySelector<HTMLDivElement>("#infoSector") ?? null,
    infoIndustry: root.querySelector<HTMLDivElement>("#infoIndustry") ?? null,
    infoCountry: root.querySelector<HTMLDivElement>("#infoCountry") ?? null,

    sigTrend: root.querySelector<HTMLDivElement>("#sigTrend") ?? null,
    sigVol: root.querySelector<HTMLDivElement>("#sigVol") ?? null,
    sigMom: root.querySelector<HTMLDivElement>("#sigMom") ?? null,
  };

  const setStatus = (msg: string) => {
    if (el.status) el.status.textContent = msg;
  };

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
        : state.seriesName.replace(" (live)", "");
    }
  }

  function updateDashboardFromState() {
    const s = state.series;
    if (!s.length) return;

    const i = Math.max(0, Math.min(s.length - 1, state.index));
    const cur = s[i];
    const prev = s[Math.max(0, i - 1)];

    if (el.kpiPrice) el.kpiPrice.textContent = formatCurrency(cur.close);

    const delta = cur.close - prev.close;
    const pct = prev.close ? (delta / prev.close) * 100 : 0;
    const sign = delta >= 0 ? "+" : "";

    if (el.kpiChange) el.kpiChange.textContent = `${sign}${formatNumber(delta)} (${sign}${formatNumber(pct)}%)`;
    if (el.kpiChangeSub) el.kpiChangeSub.textContent = "vs previous";

    const name =
      state.seriesName.includes("TSLA") ? "Tesla, Inc." :
      state.seriesName.includes("AAPL") ? "Apple Inc." :
      state.seriesName.includes("BTC") ? "Bitcoin" :
      "Custom dataset";

    const sector = state.seriesName.includes("BTC") ? "Crypto" : "Technology";

    const industry =
      state.seriesName.includes("TSLA") ? "Automotive / EV" :
      state.seriesName.includes("AAPL") ? "Consumer Electronics" :
      state.seriesName.includes("BTC") ? "Digital Asset" :
      "—";

    const country = state.seriesName.includes("BTC") ? "Global" : "United States";

    if (el.infoName) el.infoName.textContent = name;
    if (el.infoSector) el.infoSector.textContent = sector;
    if (el.infoIndustry) el.infoIndustry.textContent = industry;
    if (el.infoCountry) el.infoCountry.textContent = country;

    const first = s[0].close;
    const last = s[s.length - 1].close;
    if (el.sigTrend) el.sigTrend.textContent = last >= first ? "Uptrend" : "Downtrend";

    const mean = s.reduce((a, p) => a + p.close, 0) / s.length;
    const variance = s.reduce((a, p) => a + Math.pow(p.close - mean, 2), 0) / s.length;
    const std = Math.sqrt(variance);
    const cv = mean ? std / mean : 0;
    if (el.sigVol) el.sigVol.textContent = `${formatNumber(cv * 100)}% (CV)`;

    const mom = last - first;
    const momPct = first ? (mom / first) * 100 : 0;
    const momSign = mom >= 0 ? "+" : "";
    if (el.sigMom) el.sigMom.textContent = `${momSign}${formatNumber(mom)} (${momSign}${formatNumber(momPct)}%)`;
  }

  // ✅ LIVE: update watchlist + trending from app.ts
  function updateWatchlist(summaries: QuoteSummary[]) {
    if (!el.watchlist) return;
    el.watchlist.innerHTML = summaries.map(watchItemHTML).join("");
  }

  function updateTrending(summaries: QuoteSummary[]) {
    if (!el.trending) return;
    el.trending.innerHTML = summaries.map(trendCardHTML).join("");
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
    updateMeta();
    onSeriesChange();
  }

  function loadDemo(key: DemoKey) {
    state.series = DEMO_DATA[key];
    state.seriesName = `${key} (demo)`;
    state.index = 0;

    setStatus(`Loaded ${state.seriesName}`);
    updateMeta();
    onSeriesChange();
  }

  // Search
  el.librarySearch?.addEventListener("input", () => renderLibrary(el.librarySearch?.value ?? ""));

  // ✅ IMPORTANT:
  // No library click handler here — app.ts handles LIVE symbol switching.

  renderLibrary();
  updateMeta();
  updateDashboardFromState();
  setStatus("Ready.");

  return {
    el,
    setStatus,
    updateMeta,
    updateDashboardFromState,
    updateWatchlist,
    updateTrending,
    loadCsv,
    loadDemo,
  };
}