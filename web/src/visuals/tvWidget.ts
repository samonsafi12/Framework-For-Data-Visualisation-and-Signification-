export function mountTradingViewChart(container: HTMLElement, symbol: string) {
  // clear old widget
  container.innerHTML = "";

  // TradingView embed script
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
  script.async = true;

  // Match your dark UI
  const config = {
    autosize: true,
    symbol,
    interval: "5",
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    enable_publishing: false,
    allow_symbol_change: false,
    hide_side_toolbar: true,
    hide_top_toolbar: false, // shows timeframe buttons like Yahoo
    withdateranges: true,
    save_image: false,
    details: false,
    hotlist: false,
    calendar: false,
    support_host: "https://www.tradingview.com"
  };

  script.innerHTML = JSON.stringify(config);
  container.appendChild(script);
}

export function toTvSymbol(key: string) {
  // You can change exchanges if you want
  if (key === "TSLA") return "NASDAQ:TSLA";
  if (key === "AAPL") return "NASDAQ:AAPL";
  if (key === "BTC") return "COINBASE:BTCUSD";
  return "NASDAQ:TSLA";
}