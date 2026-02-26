type TVInterval = "1" | "5" | "15" | "30" | "60" | "240" | "D" | "W" | "M";

export type TvRange = "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y";

export function tvSymbolFor(appSymbol: string): string {
  // ✅ TradingView symbols (these matter for the widget to render)
  switch (appSymbol) {
    case "TSLA":
      return "NASDAQ:TSLA";
    case "AAPL":
      return "NASDAQ:AAPL";
    case "BTC":
      return "COINBASE:BTCUSD"; // You can swap to: "BINANCE:BTCUSDT"
    default:
      return appSymbol;
  }
}

export function intervalForRange(range: TvRange): TVInterval {
  // Yahoo-like feel: more granular for short ranges
  switch (range) {
    case "1D":
      return "5";
    case "5D":
      return "15";
    case "1M":
      return "60";
    case "6M":
      return "240";
    case "YTD":
      return "D";
    case "1Y":
      return "D";
    case "5Y":
      return "W";
    default:
      return "D";
  }
}

/**
 * Cleanly (re)mount TradingView Advanced Chart widget.
 * This avoids the "blank chart" issue when switching symbol/range.
 */
export function mountTradingViewChart(host: HTMLElement, symbol: string, range: TvRange) {
  host.innerHTML = "";

  const containerId = "tv_chart_container";
  const container = document.createElement("div");
  container.id = containerId;
  container.style.width = "100%";
  container.style.height = "100%";
  host.appendChild(container);

  // TradingView script will render into containerId
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.src = "https://s3.tradingview.com/tv.js";

  script.onload = () => {
    const tv = (window as any).TradingView;
    if (!tv) return;

    const tvSymbol = tvSymbolFor(symbol);
    const interval = intervalForRange(range);

    // NOTE: This uses the official widget. No Finnhub rate-limits for the chart.
    new tv.widget({
      autosize: true,
      symbol: tvSymbol,
      interval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      hide_side_toolbar: false,
      allow_symbol_change: false,
      details: false,
      hotlist: false,
      calendar: false,
      withdateranges: true,
      container_id: containerId,
    });
  };

  document.body.appendChild(script);
}