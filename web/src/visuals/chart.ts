import type { DataPoint } from "../core/state";

function setupCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas not supported");

  // Make canvas crisp on retina displays
  const dpr = window.devicePixelRatio || 1;

  // Use the element’s rendered size
  const rect = canvas.getBoundingClientRect();
  const cssW = Math.max(1, Math.floor(rect.width));
  const cssH = Math.max(1, Math.floor(rect.height));

  // If layout gives 0px (rare), fallback
  const w = cssW || 800;
  const h = cssH || 300;

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
  return { ctx, w, h };
}

function getMinMax(series: DataPoint[]) {
  if (!series.length) return { min: 0, max: 1 };
  let min = series[0].close;
  let max = series[0].close;
  for (const p of series) {
    if (p.close < min) min = p.close;
    if (p.close > max) max = p.close;
  }
  // avoid flatline division by zero
  if (min === max) {
    min -= 1;
    max += 1;
  }
  return { min, max };
}

export function drawLineChart(
  canvas: HTMLCanvasElement,
  series: DataPoint[],
  index: number
) {
  const { ctx, w, h } = setupCanvas(canvas);

  // Clear
  ctx.clearRect(0, 0, w, h);

  if (!series.length) {
    ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("No data loaded", 16, 24);
    return;
  }

  const padL = 44;
  const padR = 18;
  const padT = 18;
  const padB = 34;

  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const { min, max } = getMinMax(series);

  const xAt = (i: number) =>
    padL + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);

  const yAt = (v: number) =>
    padT + (1 - (v - min) / (max - min)) * innerH;

  // Axes baseline
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;

  // Light grid lines (3)
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  for (let g = 0; g <= 3; g++) {
    const y = padT + (g / 3) * innerH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + innerW, y);
    ctx.stroke();
  }

  // Price line
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  series.forEach((p, i) => {
    const x = xAt(i);
    const y = yAt(p.close);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Highlight current point
  const clamped = Math.max(0, Math.min(series.length - 1, index));
  const cur = series[clamped];
  const cx = xAt(clamped);
  const cy = yAt(cur.close);

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();

  // Small label
  ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  const label = `${cur.t}  •  ${cur.close.toFixed(2)}`;
  ctx.fillText(label, padL, h - 12);
}

export function drawSparkline(canvas: HTMLCanvasElement, series: DataPoint[]) {
  const { ctx, w, h } = setupCanvas(canvas);

  ctx.clearRect(0, 0, w, h);
  if (!series.length) return;

  const pad = 6;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;

  const { min, max } = getMinMax(series);

  const xAt = (i: number) =>
    pad + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);

  const yAt = (v: number) =>
    pad + (1 - (v - min) / (max - min)) * innerH;

  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  series.forEach((p, i) => {
    const x = xAt(i);
    const y = yAt(p.close);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}