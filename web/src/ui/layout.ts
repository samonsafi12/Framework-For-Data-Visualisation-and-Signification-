export function layoutHtml() {
  return `
  <div class="fv-app">
    <header class="fv-topbar">
      <div class="fv-title">Financial Visualisation</div>
      <div class="fv-actions">
        <button class="fv-btn" id="btnUpload">⬆ Upload</button>
        <input id="fileUpload" type="file" accept=".csv" style="display:none" />
        <button class="fv-btn" id="btnPlay">▶ Play</button>
        <button class="fv-btn ghost" id="btnTimeline">☰ Timeline</button>
      </div>
    </header>

    <main class="fv-grid">
      <section class="fv-card fv-left">
        <div class="fv-card-title">Library</div>
        <div class="fv-search">
          <span class="fv-search-icon">⌕</span>
          <input class="fv-search-input" placeholder="Search" />
        </div>
        <div class="fv-lib">
          <button class="fv-lib-item" data-demo="TSLA"><span>TSLA</span><span class="muted">TSLA</span></button>
          <button class="fv-lib-item" data-demo="AAPL"><span>AAPL</span><span class="muted">AAPL</span></button>
          <button class="fv-lib-item" data-demo="BTC"><span>BTC</span><span class="muted">BTC</span></button>
          <div class="fv-lib-add">+ Add</div>
        </div>
      </section>

      <section class="fv-card fv-center">
        <div class="fv-card-title">Closing Price</div>
        <div class="fv-chartWrap">
          <canvas id="chart" width="980" height="420"></canvas>
        </div>

        <div class="fv-player">
          <div class="fv-player-left">
            <div class="fv-transport">
              <span class="fv-ico">⏮</span>
              <span class="fv-ico big">●</span>
              <span class="fv-ico">⏭</span>
            </div>
          </div>

          <div class="fv-player-mid">
            <input id="timeline" class="fv-slider" type="range" min="0" max="0" value="0" />
            <div class="fv-meta">
              <div><span class="label">Dataset</span> <span id="datasetName" class="value"></span></div>
              <div><span class="label">Mapping</span> <span id="mappingName" class="value"></span></div>
            </div>
          </div>

          <div class="fv-player-right">
            <div class="fv-pill">Pitch</div>
          </div>
        </div>

        <div id="status" class="fv-status"></div>
        <div class="fv-mini"><div class="fv-mini-line"></div></div>
      </section>

      <section class="fv-card fv-right">
        <div class="fv-card-title">Trending</div>
        <div id="trendingList" class="fv-trending"></div>
      </section>
    </main>
  </div>
  `;
}

export function trendRow(name: string, sym: string, ccy: string, price: string, change: string) {
  const changeClass = change.startsWith("-") ? "neg" : "pos";
  return `
    <div class="fv-trendRow">
      <div>
        <div class="name">${name}</div>
        <div class="sub">${sym} ${ccy}</div>
      </div>
      <div class="right">
        <div class="price">${price}</div>
        <div class="chg ${changeClass}">${change}</div>
      </div>
    </div>
  `;
}
