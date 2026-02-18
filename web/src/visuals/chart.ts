import type { DataPoint } from "../core/state";

export function drawLineChart(canvas: HTMLCanvasElement, data: DataPoint[], markerIndex: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // grid
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#1b2438";
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i++) {
    const x = (i / 8) * w;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let i = 1; i < 6; i++) {
    const y = (i / 6) * h;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  if (data.length < 2) return;

  const closes = data.map(d => d.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);

  const padX = 18, padY = 18;
  const xFor = (i: number) => padX + (i / (data.length - 1)) * (w - padX * 2);
  const yFor = (v: number) => padY + (1 - (v - min) / Math.max(1e-9, max - min)) * (h - padY * 2);

  // line
  ctx.strokeStyle = "#ff9a1f";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i < data.length; i++) {
    const x = xFor(i);
    const y = yFor(data[i].close);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // marker
  const mi = Math.max(0, Math.min(markerIndex, data.length - 1));
  const mx = xFor(mi);
  const my = yFor(data[mi].close);

  ctx.fillStyle = "#e7eefc";
  ctx.beginPath();
  ctx.arc(mx, my, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = "#e7eefc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(mx, padY);
  ctx.lineTo(mx, h - padY);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
