import { layoutHtml } from "../ui/layout";
import { createInitialState } from "../core/state";
import { DEMO_DATA } from "../io/demoData";
import { bindUI } from "../ui/bindings";

import { fetchLatestQuote } from "../io/livePrice";
import { mountTradingViewChart, type TvRange } from "../visuals/tradingViewWidget";

// ✅ Sonification (optional)
import { Sonifier } from "../audio/sonifier";

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

const SYMBOL_META: Record<AppSymbol, { name: string; ccy: string }> = {
  TSLA: { name: "Tesla Inc.", ccy: "USD" },
  AAPL: { name: "Apple Inc.", ccy: "USD" },
  BTC: { name: "Bitcoin", ccy: "USD" },
};

function finnhubSymbolFor(appSymbol: AppSymbol): string {
  // Finnhub quote endpoint symbols
  switch (appSymbol) {
    case "TSLA":
      return "TSLA";
    case "AAPL":
      return "AAPL";
    case "BTC":
      // commonly works for crypto quotes
      return "BINANCE:BTCUSDT";
    default:
      return appSymbol;
  }
}

function fmtMoney(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n >= 1000 ? 0 : 2,
  });
}

function fmtNum(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function initApp(root: HTMLDivElement) {
  root.innerHTML = layoutHtml();

  const state = createInitialState(DEMO_DATA.TSLA, "TSLA (live)");

  const ui = bindUI(root, state, () => {
    ui.updateMeta();
    ui.updateDashboardFromState();
  });

  const chartHost = root.querySelector<HTMLDivElement>("#tvChart");
  if (!chartHost) throw new Error("Missing required element: #tvChart (check layout.ts)");

  const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY as string | undefined;

  let currentSymbol: AppSymbol = "TSLA";
  let currentRange: TvRange = "5D";
  let quoteTimer: number | null = null;

  // ✅ Sonification
  const sonifier = new Sonifier({ mode: "delta", volume: 0.06 });
  let soundOn = false;

  // last price per symbol (for up/down + sound delta)
  const lastPriceBySymbol: Record<AppSymbol, number | null> = {
    TSLA: null,
    AAPL: null,
    BTC: null,
  };

  // --- Sound button ---
  ui.el.soundBtn?.addEventListener("click", async () => {
    soundOn = !soundOn;
    if (soundOn) {
      await sonifier.enable();
      ui.el.soundBtn!.textContent = "🔊 Sound: On";
      ui.setStatus("Sonification enabled.");
    } else {
      sonifier.disable();
      ui.el.soundBtn!.textContent = "🔊 Sound: Off";
      ui.setStatus("Sonification disabled.");
    }
  });

  function setActiveTfButton(activeId: string) {
    const ids = ["btn1D", "btn5D", "btn1M", "btn6M", "btnYTD", "btn1Y", "btn5Y"];
    ids.forEach((id) => {
      const b = root.querySelector<HTMLButtonElement>(`#${id}`);
      if (!b) return;
      b.classList.toggle("active", id === activeId);
    });
  }

  function renderChart() {
    mountTradingViewChart(chartHost, currentSymbol, currentRange);
    ui.setStatus(`Live chart loaded: ${currentSymbol} (${currentRange})`);
  }

  function buildSummary(symbol: AppSymbol, price: number, prevClose: number): QuoteSummary {
    const delta = price - prevClose;
    const pct = prevClose ? (delta / prevClose) * 100 : 0;
    const up = delta >= 0;

    return {
      symbol,
      name: SYMBOL_META[symbol].name,
      ccy: SYMBOL_META[symbol].ccy,
      price,
      delta,
      pct,
      up,
    };
  }

  // ✅ Fetch + update ALL quotes (Watchlist + Trending) each cycle
  async function refreshAllQuotesOnce() {
    if (!FINNHUB_KEY) {
      ui.setStatus("Missing VITE_FINNHUB_KEY in web/.env (Finnhub API key).");
      return;
    }

    try {
      const symbols: AppSymbol[] = ["TSLA", "AAPL", "BTC"];
      const summaries: QuoteSummary[] = [];

      // sequential requests (gentler on rate limits)
      for (const sym of symbols) {
        const q = await fetchLatestQuote(finnhubSymbolFor(sym), FINNHUB_KEY);

        const price = q.c;
        const prevClose = q.pc;

        if (!Number.isFinite(price) || !Number.isFinite(prevClose)) continue;

        const s = buildSummary(sym, price, prevClose);
        summaries.push(s);

        // store last price for sonification delta
        const last = lastPriceBySymbol[sym];
        if (soundOn && sym === currentSymbol) {
          // only sonify the currently selected symbol (cleaner)
          sonifier.tick(price, last);
        }
        lastPriceBySymbol[sym] = price;
      }

      // Update Watchlist + Trending UI
      ui.updateWatchlist?.(summaries);
      ui.updateTrending?.(summaries);

      // Update main KPI/signal area using CURRENT symbol’s summary
      const cur = summaries.find((x) => x.symbol === currentSymbol);
      if (cur) {
        if (ui.el.kpiPrice) ui.el.kpiPrice.textContent = fmtMoney(cur.price);

        const sign = cur.delta >= 0 ? "+" : "";
        if (ui.el.kpiChange) {
          ui.el.kpiChange.textContent = `${sign}${fmtNum(cur.delta)} (${sign}${fmtNum(cur.pct)}%)`;
        }

        // Signals (live-ish)
        if (ui.el.sigTrend) ui.el.sigTrend.textContent = cur.up ? "Uptrend" : "Downtrend";
        if (ui.el.sigMom) ui.el.sigMom.textContent = `${sign}${fmtNum(cur.delta)} (${sign}${fmtNum(cur.pct)}%)`;
      }

      // Update dataset label/meta
      state.seriesName = `${currentSymbol} (live)`;
      ui.updateMeta();

      if (cur) {
        ui.setStatus(`Live ${cur.symbol}: ${cur.price.toFixed(2)} (${cur.up ? "+" : ""}${fmtNum(cur.pct)}%)`);
      } else {
        ui.setStatus("Live quotes updated.");
      }
    } catch (e) {
      console.error(e);
      ui.setStatus("Quote error (rate limit / key). Try again in 30–60s.");
    }
  }

  function startQuotePolling() {
    if (quoteTimer !== null) window.clearInterval(quoteTimer);

    // ✅ 15s is usually safe for free Finnhub keys
    quoteTimer = window.setInterval(refreshAllQuotesOnce, 15000);
    void refreshAllQuotesOnce();
  }

  function setSymbol(sym: AppSymbol) {
    currentSymbol = sym;

    if (ui.el.seriesLabel) ui.el.seriesLabel.textContent = sym;

    state.seriesName = `${sym} (live)`;
    ui.updateMeta();
    ui.updateDashboardFromState();

    renderChart();
    startQuotePolling();
  }

  function setRange(range: TvRange, btnId: string) {
    currentRange = range;
    setActiveTfButton(btnId);
    renderChart();
  }

  // --- Timeframe buttons ---
  root.querySelector("#btn1D")?.addEventListener("click", () => setRange("1D", "btn1D"));
  root.querySelector("#btn5D")?.addEventListener("click", () => setRange("5D", "btn5D"));
  root.querySelector("#btn1M")?.addEventListener("click", () => setRange("1M", "btn1M"));
  root.querySelector("#btn6M")?.addEventListener("click", () => setRange("6M", "btn6M"));
  root.querySelector("#btnYTD")?.addEventListener("click", () => setRange("YTD", "btnYTD"));
  root.querySelector("#btn1Y")?.addEventListener("click", () => setRange("1Y", "btn1Y"));
  root.querySelector("#btn5Y")?.addEventListener("click", () => setRange("5Y", "btn5Y"));

  // --- Library clicks (TSLA/AAPL/BTC) ---
  ui.el.libraryList?.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-demo]");
    if (!btn) return;
    const key = btn.getAttribute("data-demo") as AppSymbol;
    if (!key) return;
    setSymbol(key);
  });

  // Upload still works (CSV mode)
  ui.el.uploadBtn?.addEventListener("click", () => ui.el.uploadInput?.click());
  ui.el.uploadInput?.addEventListener("change", async () => {
    const f = ui.el.uploadInput?.files?.[0];
    if (!f) return;
    await ui.loadCsv(f);
    ui.el.uploadInput.value = "";
  });

  // Disable old playback buttons
  ui.el.playBtn?.addEventListener("click", () => ui.setStatus("Play disabled in Live mode."));
  ui.el.playBtnInline?.addEventListener("click", () => ui.setStatus("Play disabled in Live mode."));
  root.querySelector("#btnPrev")?.addEventListener("click", () => ui.setStatus("Prev disabled in Live mode."));
  root.querySelector("#btnNext")?.addEventListener("click", () => ui.setStatus("Next disabled in Live mode."));

  // ✅ Initial
  setActiveTfButton("btn5D");
  setSymbol("TSLA");
}