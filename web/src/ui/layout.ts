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
          <input id="librarySearch" class="search-input" placeholder="Search assets..." />
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
      <!-- Topbar -->
      <header class="topbar panel">
        <div class="actions">
          <button id="btnUpload" class="btn" type="button">⬆ Upload</button>
          <input id="fileUpload" type="file" accept=".csv" style="display:none" />

          <button id="btnPlay" class="btn" type="button">▶ Play</button>
          <button id="btnSound" class="btn ghost" type="button">Sound: Off</button>
        </div>

        <div class="meta">
          <div class="meta-row">
            <span class="meta-k">Dataset</span>
            <span id="datasetName" class="meta-v">TSLA (live)</span>
          </div>
          <div class="meta-row">
            <span class="meta-k">Mapping</span>
            <span id="mappingName" class="meta-v">Close → Pitch</span>
          </div>
        </div>
      </header>

      <!-- KPI row -->
      <section class="kpi-row">
        <div class="panel kpi">
          <div class="kpi-k">Price</div>
          <div id="kpiPrice" class="kpi-v">—</div>
          <div class="kpi-sub">Latest</div>
        </div>

        <div class="panel kpi">
          <div class="kpi-k">Change</div>
          <div id="kpiChange" class="kpi-v">—</div>
          <div id="kpiChangeSub" class="kpi-sub">vs previous close</div>
        </div>

        <div class="panel kpi">
          <div class="kpi-k">Market Cap</div>
          <div id="kpiMcap" class="kpi-v">—</div>
          <div class="kpi-sub">Estimated</div>
        </div>

        <div class="panel kpi">
          <div class="kpi-k">Revenue</div>
          <div id="kpiRevenue" class="kpi-v">—</div>
          <div class="kpi-sub">Annual (demo)</div>
        </div>

        <div class="panel kpi">
          <div class="kpi-k">Employees</div>
          <div id="kpiEmployees" class="kpi-v">—</div>
          <div class="kpi-sub">Headcount (demo)</div>
        </div>
      </section>

      <!-- Chart panel -->
      <section class="panel chart-panel">
        <div class="chart-head">
          <div>
            <div class="chart-title">Price</div>
            <div class="chart-sub"><span id="seriesLabel">TSLA</span></div>
          </div>

          <div class="mini-actions">
            <button id="btnPrev" class="iconbtn" type="button" title="Prev">⟨</button>
            <button id="btnPlayInline" class="iconbtn play" type="button" title="Play">▶</button>
            <button id="btnNext" class="iconbtn" type="button" title="Next">⟩</button>
          </div>
        </div>

        <!-- ✅ Timeframe buttons (IDs match app.ts) -->
        <div class="tf-row" role="tablist" aria-label="Time range">
          <button id="btn1D" class="tfbtn" type="button">1D</button>
          <button id="btn5D" class="tfbtn active" type="button">5D</button>
          <button id="btn1M" class="tfbtn" type="button">1M</button>
          <button id="btn6M" class="tfbtn" type="button">6M</button>
          <button id="btnYTD" class="tfbtn" type="button">YTD</button>
          <button id="btn1Y" class="tfbtn" type="button">1Y</button>
          <button id="btn5Y" class="tfbtn" type="button">5Y</button>
        </div>

        <div class="chart-wrap">
          <!-- ✅ TradingView live chart renders here -->
          <div id="tvChart" class="tvChart"></div>
        </div>
      </section>

      <!-- Bottom dashboard section -->
      <section class="dash-row">
        <div class="panel dash-card">
          <div class="dash-title">Company Overview</div>
          <div class="dash-grid">
            <div class="dash-item">
              <div class="dash-k">Name</div>
              <div id="infoName" class="dash-v">—</div>
            </div>
            <div class="dash-item">
              <div class="dash-k">Sector</div>
              <div id="infoSector" class="dash-v">—</div>
            </div>
            <div class="dash-item">
              <div class="dash-k">Industry</div>
              <div id="infoIndustry" class="dash-v">—</div>
            </div>
            <div class="dash-item">
              <div class="dash-k">Country</div>
              <div id="infoCountry" class="dash-v">—</div>
            </div>
          </div>

          <div class="dash-note">
            Live chart powered by TradingView widget (Yahoo-like).
          </div>
        </div>

        <div class="panel dash-card">
          <div class="dash-title">Signals</div>
          <div class="signal-list">
            <div class="signal">
              <div class="signal-k">Trend</div>
              <div id="sigTrend" class="signal-v">—</div>
            </div>
            <div class="signal">
              <div class="signal-k">Volatility</div>
              <div id="sigVol" class="signal-v">—</div>
            </div>
            <div class="signal">
              <div class="signal-k">Momentum</div>
              <div id="sigMom" class="signal-v">—</div>
            </div>
          </div>
          <div class="dash-note">Computed from your loaded series.</div>
        </div>
      </section>
    </main>

    <!-- Right Sidebar -->
    <aside class="panel rightbar">
      <div class="section-title">Watchlist</div>
      <div id="watchlist" class="watchlist"></div>
    </aside>
  </div>
  `;
}