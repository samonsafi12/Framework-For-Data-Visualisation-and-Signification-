import "./style.css";
import { initApp } from "./prototype/app";

function showFatal(err: unknown) {
  const msg =
    err instanceof Error ? `${err.name}: ${err.message}\n\n${err.stack ?? ""}` : String(err);

  document.body.innerHTML = `
    <div style="
      padding:24px;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      background:#111; color:#fff; min-height:100vh;">
      <h2 style="margin:0 0 12px 0;">App crashed while starting</h2>
      <pre style="white-space:pre-wrap; opacity:.9; background:#000; padding:12px; border-radius:12px; border:1px solid #333;">${msg}</pre>
      <p style="opacity:.75">Open Safari DevTools → Console to see the same error.</p>
    </div>
  `;
}

try {
  const root = document.querySelector<HTMLDivElement>("#app");
  if (!root) throw new Error('Missing <div id="app"></div> in index.html');

  initApp(root);
} catch (err) {
  console.error(err);
  showFatal(err);
}