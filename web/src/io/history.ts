export type FinnhubCandles = {
  c: number[]; // close
  t: number[]; // timestamps (unix seconds)
  s: string;   // "ok" | "no_data"
};

export type Timeframe = "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y";

function startOfYearUnixSec() {
  const d = new Date();
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function nowUnixSec() {
  return Math.floor(Date.now() / 1000);
}

function seconds(days: number) {
  return days * 24 * 60 * 60;
}

export function timeframeToQuery(tf: Timeframe): { resolution: number | "D"; from: number; to: number } {
  const to = nowUnixSec();

  switch (tf) {
    case "1D":
      return { resolution: 5, from: to - seconds(1), to };      // 5-min intraday
    case "5D":
      return { resolution: 15, from: to - seconds(5), to };     // 15-min intraday
    case "1M":
      return { resolution: 60, from: to - seconds(30), to };    // hourly
    case "6M":
      return { resolution: "D", from: to - seconds(183), to };  // daily
    case "YTD":
      return { resolution: "D", from: startOfYearUnixSec(), to };
    case "1Y":
      return { resolution: "D", from: to - seconds(365), to };
    case "5Y":
      return { resolution: "D", from: to - seconds(365 * 5), to };
  }
}

export async function fetchCandles(
  symbol: string,
  apiKey: string,
  resolution: number | "D",
  fromSec: number,
  toSec: number
) {
  const url =
    `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}` +
    `&resolution=${resolution}&from=${fromSec}&to=${toSec}&token=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Candles failed (${res.status})`);

  return (await res.json()) as FinnhubCandles;
}