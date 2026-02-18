import type { DataPoint } from "../core/state";

export type DemoKey = "TSLA" | "AAPL" | "BTC";

export const DEMO_DATA: Record<DemoKey, DataPoint[]> = {
  TSLA: makeDemo("2024-08-", 65, 240, 260),
  AAPL: makeDemo("2024-08-", 65, 165, 175),
  BTC: makeDemo("2024-08-", 65, 25000, 29000),
};

function makeDemo(prefix: string, n: number, min: number, max: number): DataPoint[] {
  const out: DataPoint[] = [];
  let v = (min + max) / 2;

  for (let i = 1; i <= n; i++) {
    const drift = (Math.sin(i / 7) * (max - min)) / 180;
    const noise = (Math.random() - 0.5) * ((max - min) / 40);
    v = clamp(v + drift + noise, min, max);

    out.push({
      t: `${prefix}${String(i).padStart(2, "0")}`,
      close: round2(v),
    });
  }

  return out;
}

function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}

function round2(x: number) {
  return Math.round(x * 100) / 100;
}
