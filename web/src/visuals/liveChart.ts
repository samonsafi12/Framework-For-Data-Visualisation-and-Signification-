import {
  createChart,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
} from "lightweight-charts";

export type LivePoint = { time: number; value: number };

export function mountLiveLineChart(container: HTMLElement) {
  const chart: IChartApi = createChart(container, {
    autoSize: true,
    layout: {
      background: { color: "transparent" },
      textColor: "rgba(255,255,255,0.85)",
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    },
    grid: {
      vertLines: { color: "rgba(255,255,255,0.06)" },
      horzLines: { color: "rgba(255,255,255,0.06)" },
    },
    rightPriceScale: { borderVisible: false },
    timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
  });

  const line: ISeriesApi<"Line"> = chart.addSeries(LineSeries, {
    lineWidth: 2,
    color: "#22c55e",
    // Yahoo-like area fill
    topColor: "rgba(34,197,94,0.22)",
    bottomColor: "rgba(34,197,94,0.00)",
  } as any);

  return { chart, line };
}

export function setSeriesGreenRed(line: ISeriesApi<"Line">, up: boolean) {
  line.applyOptions({
    color: up ? "#22c55e" : "#ef4444",
    topColor: up ? "rgba(34,197,94,0.22)" : "rgba(239,68,68,0.22)",
    bottomColor: up ? "rgba(34,197,94,0.00)" : "rgba(239,68,68,0.00)",
  } as any);
}

export function setInitialData(line: ISeriesApi<"Line">, points: LivePoint[]) {
  const data: LineData[] = points.map((p) => ({ time: p.time as any, value: p.value }));
  line.setData(data);
}

export function updateLivePoint(line: ISeriesApi<"Line">, p: LivePoint) {
  line.update({ time: p.time as any, value: p.value });
}