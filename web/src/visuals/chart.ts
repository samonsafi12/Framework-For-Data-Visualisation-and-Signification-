import type { DataPoint } from "../core/state";

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return { dpr, w, h };
}

export function drawLineChart(canvas: HTMLCanvasElement, series: DataPoint[], index: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { dpr, w, h } = resizeCanvasToDisplaySize(canvas);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);

  // Padding for axes
  const padL = Math.floor(64 * dpr);
  const padR = Math.floor(18 * dpr);
  const padT = Math.floor(18 * dpr);
  const padB = Math.floor(38 * dpr);

  // Background
  ctx.fillStyle = "rgba(0,0,0,0.10)";
  ctx.fillRect(0, 0, w, h);

  if (!series.length) return;

  const closes = series.map(s => s.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const rng = Math.max(1e-9, max - min);

  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const xFor = (i: number) => padL + (i / Math.max(1, series.length - 1)) * plotW;
  const yFor = (v: number) => padT + (1 - (v - min) / rng) * plotH;

  // Grid
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;

  const yTicks = 5;
  for (let t = 0; t <= yTicks; t++) {
    const y = padT + (t / yTicks) * plotH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();
  }

  const xTicks = 6;
  for (let t = 0; t <= xTicks; t++) {
    const x = padL + (t / xTicks) * plotW;
    ctx.beginPath();
    ctx.moveTo(x, padT);
    ctx.lineTo(x, padT + plotH);
    ctx.stroke();
  }

  // Axes labels
  ctx.fillStyle = "rgba(232,237,245,0.70)";
  ctx.font = `${Math.floor(12 * dpr)}px system-ui`;

  for (let t = 0; t <= yTicks; t++) {
    const v = max - (t / yTicks) * rng;
    const y = padT + (t / yTicks) * plotH;
    const label = v.toFixed(2);
    ctx.fillText(label, Math.floor(10 * dpr), y + Math.floor(4 * dpr));
  }

  for (let t = 0; t <= xTicks; t++) {
    const i = Math.round((t / xTicks) * (series.length - 1));
    const x = xFor(i);
    const txt = series[i]?.t ?? "";
    const measure = ctx.measureText(txt).width;
    ctx.fillText(txt, x - measure / 2, h - Math.floor(14 * dpr));
  }

  // Line
  ctx.strokeStyle = "#ff9b26";
  ctx.lineWidth = Math.max(2, Math.floor(3 * dpr));
  ctx.beginPath();
  for (let i = 0; i < series.length; i++) {
    const x = xFor(i);
    const y = yFor(series[i].close);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Current point + crosshair
  const i = Math.max(0, Math.min(series.length - 1, index | 0));
  const cx = xFor(i);
  const cy = yFor(series[i].close);

  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, padT);
  ctx.lineTo(cx, padT + plotH);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(padL, cy);
  ctx.lineTo(w - padR, cy);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, Math.floor(4 * dpr), 0, Math.PI * 2);
  ctx.fill();

  // Price pill on right
  const priceTxt = series[i].close.toFixed(2);
  ctx.font = `${Math.floor(12 * dpr)}px system-ui`;
  const tw = ctx.measureText(priceTxt).width;
  const pillPadX = Math.floor(10 * dpr);
  const pillH = Math.floor(22 * dpr);
  const pillW = tw + pillPadX * 2;

  const px = w - padR - pillW;
  const py = Math.max(padT, Math.min(padT + plotH - pillH, cy - pillH / 2));

  ctx.fillStyle = "rgba(255,155,38,0.18)";
  ctx.strokeStyle = "rgba(255,155,38,0.45)";
  ctx.lineWidth = 1;

  roundRect(ctx, px, py, pillW, pillH, Math.floor(10 * dpr));
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffcf9a";
  ctx.fillText(priceTxt, px + pillPadX, py + Math.floor(15 * dpr));
}

export function drawSparkline(canvas: HTMLCanvasElement, series: DataPoint[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { dpr, w, h } = resizeCanvasToDisplaySize(canvas);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(0, 0, w, h);

  if (!series.length) return;

  const closes = series.map(s => s.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const rng = Math.max(1e-9, max - min);

  const pad = Math.floor(10 * dpr);

  ctx.strokeStyle = "#ff9b26";
  ctx.lineWidth = Math.max(2, Math.floor(3 * dpr));
  ctx.beginPath();

  for (let i = 0; i < series.length; i++) {
    const x = pad + (i / Math.max(1, series.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (series[i].close - min) / rng) * (h - pad * 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}