import "./style.css";
import { initApp } from "./prototype/app";

const root = document.querySelector<HTMLDivElement>("#app");

if (!root) {
  document.body.innerHTML = `<pre style="padding:24px;color:red;">#app not found in index.html</pre>`;
} else {
  try {
    initApp(root);
  } catch (err) {
    console.error(err);
    root.innerHTML = `
      <div style="padding:24px;color:#fff;background:#111;font-family:system-ui;">
        <h2 style="margin:0 0 12px;">App crashed</h2>
        <pre style="white-space:pre-wrap;color:#ff6b6b;">${String(err?.stack ?? err)}</pre>
      </div>
    `;
  }
}