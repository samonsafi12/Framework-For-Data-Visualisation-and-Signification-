import type { DataPoint } from "../core/state";

export function drawLineChart(canvas: HTMLCanvasElement, series: DataPoint[], index: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // background
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, w, h);

  if (!series.length) return;

  const closes = series.map((d) => d.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const rng = Math.max(1e-9, max - min);

  // grid
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 8; i++) {
    const y = (i / 8) * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // line
  ctx.strokeStyle = "#ff9f1a";
  ctx.lineWidth = 3;
  ctx.beginPath();

  for (let i = 0; i < series.length; i++) {
    const x = (i / (series.length - 1)) * (w - 40) + 20;
    const y = (1 - (series[i].close - min) / rng) * (h - 40) + 20;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // marker for current index
  const i = Math.max(0, Math.min(series.length - 1, index));
  const mx = (i / (series.length - 1)) * (w - 40) + 20;
  const my = (1 - (series[i].close - min) / rng) * (h - 40) + 20;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(mx, my, 5, 0, Math.PI * 2);
  ctx.fill();
}

export function drawSparkline(canvas: HTMLCanvasElement, series: DataPoint[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, w, h);

  if (!series.length) return;

  const closes = series.map((s) => s.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const rng = Math.max(1e-9, max - min);

  ctx.strokeStyle = "#ff9f1a";
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let i = 0; i < series.length; i++) {
    const x = (i / (series.length - 1)) * (w - 20) + 10;
    const y = (1 - (series[i].close - min) / rng) * (h - 20) + 10;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}