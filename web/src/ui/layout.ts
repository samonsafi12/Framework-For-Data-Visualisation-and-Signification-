export function layoutHtml() {
  return `
  <div class="app-shell">
    <!-- Left Sidebar -->
    <aside class="panel sidebar">
      <div class="brand">
        <div class="brand-title">Financial Visualisation</div>
        <div class="brand-sub">Prototype UI</div>
      </div>

      <div class="section">
        <div class="section-title">Library</div>
        <div class="search">
          <span class="search-icon">⌕</span>
          <input id="librarySearch" class="search-input" placeholder="Search" />
        </div>

        <div id="libraryList" class="library-list"></div>

        <button class="btn ghost full" type="button">+ Add</button>
      </div>

      <div class="section">
        <div class="section-title">Status</div>
        <div id="status" class="status">Loading…</div>
      </div>
    </aside>

    <!-- Main -->
    <main class="main">
      <!-- Top actions -->
      <header class="topbar panel">
        <div class="actions">
          <button id="btnUpload" class="btn" type="button">⬆ Upload</button>
          <input id="fileUpload" type="file" accept=".csv" style="display:none" />

          <button id="btnPlay" class="btn" type="button">▶ Play</button>

          <button class="btn ghost" type="button">☰ Timeline</button>
        </div>

        <div class="meta">
          <div class="meta-row">
            <span class="meta-k">Dataset</span>
            <span id="datasetName" class="meta-v">TSLA (demo)</span>
          </div>
          <div class="meta-row">
            <span class="meta-k">Mapping</span>
            <span id="mappingName" class="meta-v">Close → Pitch</span>
          </div>
        </div>
      </header>

      <!-- Chart + controls -->
      <section class="panel chart-panel">
        <div class="chart-head">
          <div>
            <div class="chart-title">Closing Price</div>
            <div class="chart-sub"><span id="seriesLabel">TSLA</span></div>
          </div>

          <div class="mini-actions">
            <button id="btnPrev" class="iconbtn" type="button">⟨</button>
            <button id="btnPlayInline" class="iconbtn play" type="button">▶</button>
            <button id="btnNext" class="iconbtn" type="button">⟩</button>
          </div>
        </div>

        <div class="chart-wrap">
          <canvas id="chart"></canvas>
        </div>

        <div class="timeline-wrap">
          <input id="timeline" type="range" min="0" max="100" value="0" />
        </div>

        <div class="spark-wrap">
          <canvas id="spark"></canvas>
        </div>
      </section>
    </main>

    <!-- Right Sidebar -->
    <aside class="panel rightbar">
      <div class="section-title">Trending</div>
      <div id="trendingList" class="trending"></div>
    </aside>
  </div>
  `;
}