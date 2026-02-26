export type FinnhubQuote = {
  c: number;  // current
  d: number;  // change
  dp: number; // percent change
  h: number;
  l: number;
  o: number;
  pc: number; // previous close
  t: number;  // timestamp (unix seconds)
};

export type FinnhubCandle = {
  c: number[]; // close
  h: number[];
  l: number[];
  o: number[];
  s: "ok" | "no_data";
  t: number[]; // timestamps (unix seconds)
  v: number[]; // volume
};

function assertOk(res: Response, label: string) {
  if (!res.ok) throw new Error(`${label} failed (${res.status})`);
}

export async function fetchLatestQuote(symbol: string, apiKey: string): Promise<FinnhubQuote> {
  const url =
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  assertOk(res, "Finnhub quote");
  return res.json();
}

export async function fetchCandles(
  symbol: string,
  apiKey: string,
  resolution: "1" | "5" | "15" | "30" | "60" | "D" | "W" | "M",
  fromSec: number,
  toSec: number
): Promise<FinnhubCandle> {
  const url =
    `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}` +
    `&resolution=${resolution}&from=${fromSec}&to=${toSec}&token=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url);
  assertOk(res, "Finnhub candle");
  return res.json();
}