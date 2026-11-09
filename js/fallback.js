/* ============================================================
   降级版：浏览器没有 WebGL（关了硬件加速 / 远程桌面）时，
   用 ECharts 平面图替代两张 3D 图 —— 数据、口径、切换按钮都不变
   ============================================================ */
(function () {
  'use strict';
  var U = window.U, P = window.PANO, S = window.Stage3D;

  function mount(host) {
    host.classList.add('fb');
    var div = document.createElement('div');
    div.className = 'fb-chart';
    host.appendChild(div);
    var n = document.createElement('div');
    n.className = 'fallback-note';
    n.textContent = '当前浏览器未开启 3D 加速，已自动切换为平面版（数据与口径不变）';
    host.appendChild(n);
    var ec = window.echarts.init(div, null, { renderer: 'canvas' });
    if ('ResizeObserver' in window) new ResizeObserver(function () { ec.resize(); }).observe(host);
    return ec;
  }
  function tierCss(d, b) {
    return b.tone === 'na' ? S.NA_COLOR : b.tone === 'alt' ? S.ALT_COLOR : S.rampCss(d.ramp, d.maxTone ? b.tone / d.maxTone : 0.5);
  }
  var AXIS = { axisLine: { lineStyle: { color: '#CFC8B6' } }, axisTick: { show: false }, axisLabel: { color: '#5A645A', fontSize: 12 } };
  var NOOP = function () {};

  function blocks(host, o) {
    var ec = mount(host);
    var api = { o: o, dimKey: o.dim || 'year', colorMode: o.colorMode || 'cat', apps: o.apps.slice(), focusCat: null, fallback: true };
    api.render = function () {
      var d = U.DIM[api.dimKey];
      var cats = o.filterCat ? [U.CAT[o.filterCat]] : P.cats;
      var series = api.colorMode === 'cat'
        ? cats.map(function (c) {
          return { name: c.label, type: 'bar', stack: 's', barMaxWidth: 42, itemStyle: { color: c.color, borderRadius: 2 },
            data: d.bins.map(function (b) {
              var v = api.apps.filter(function (a) { return a.cat === c.key && a.b[d.key] === b.key; }).length;
              return b.tone === 'na' ? { value: v, itemStyle: { opacity: 0.3 } } : v;   // 未采集 = 半透明占位
            }) };
        })
        : [{ type: 'bar', barMaxWidth: 42, label: { show: true, position: 'top', color: '#2E362E' },
          data: d.bins.map(function (b) {
            return { value: api.apps.filter(function (a) { return a.b[d.key] === b.key; }).length, itemStyle: { color: tierCss(d, b), borderRadius: [6, 6, 0, 0] } };
          }) }];
      ec.setOption({
        grid: { left: 48, right: 24, top: 36, bottom: 64 }, tooltip: { trigger: 'axis' },
        xAxis: Object.assign({ type: 'category', data: d.bins.map(function (b) { return b.label; }) }, AXIS),
        yAxis: { type: 'value', name: '款数', splitLine: { lineStyle: { color: '#ECE6D8' } }, axisLabel: { color: '#8E968C' } },
        series: series
      }, true);
    };
    ec.on('click', function (p) {
      var c = P.cats.filter(function (x) { return x.label === p.seriesName; })[0];
      if (c && o.onOpenCat && !o.filterCat) o.onOpenCat(c.key);
    });
    api.renderLegend = window.BlockTowers.prototype.renderLegend.bind(api);
    api.renderCaveat = function () {
      window.BlockTowers.prototype.renderCaveat.call(api);
      if (o.axisEl) o.axisEl.textContent = '横轴：' + U.DIM[api.dimKey].axis + ' · 纵轴：款数（平面版）';
    };
    api.setDim = function (k) { api.dimKey = k; api.render(); api.renderLegend(); api.renderCaveat(); };
    api.setColorMode = function (m) { api.colorMode = m; api.render(); api.renderLegend(); };
    api.setApps = function (apps) { api.apps = apps.slice(); api.render(); api.renderLegend(); };
    api.setFocus = NOOP; api.setMerged = NOOP; api.setFlat = NOOP; api.autoRotate = NOOP; api.intro = NOOP; api.reframe = NOOP;
    api.stage = { zoomBy: NOOP };
    api.render(); api.renderLegend(); api.renderCaveat();
    return api;
  }

  function board(host, o) {
    var ec = mount(host);
    var api = { o: o, mode: 'matrix', fallback: true };
    var rows = [{ key: 'all', label: '全部', n: P.meta.n }].concat(P.cats);
    api.render = function () {
      if (api.mode === 'matrix') {
        var data = [];
        rows.forEach(function (r, ri) {
          P.features.forEach(function (f, fi) {
            var k = r.key === 'all' ? f.n : r.feat[fi];
            data.push([fi, ri, Math.round(k / r.n * 100)]);
          });
        });
        ec.setOption({
          grid: { left: 96, right: 20, top: 16, bottom: 90 }, tooltip: { formatter: function (p) { return rows[p.value[1]].label + ' × ' + P.features[p.value[0]].name + '：' + p.value[2] + '%'; } },
          xAxis: Object.assign({ type: 'category', data: P.features.map(function (f) { return f.name; }), axisLabel: { rotate: 40, color: '#5A645A' } }, { axisLine: AXIS.axisLine, axisTick: AXIS.axisTick }),
          yAxis: Object.assign({ type: 'category', inverse: true, data: rows.map(function (r) { return r.label; }) }, AXIS),
          visualMap: { show: false, min: 0, max: 100, inRange: { color: S.RAMPS.ocean } },
          series: [{ type: 'heatmap', data: data, label: { show: true, fontSize: 11 }, itemStyle: { borderColor: '#FAF8F2', borderWidth: 3, borderRadius: 6 } }]
        }, true);
      } else {
        var series = [];
        [['rev30', 'rev30', '最近30天收入'], ['dl30', 'dl30', '最近30天下载'], ['price', 'price', '价格']].forEach(function (ln) {
          var d = U.DIM[ln[0]];
          d.bins.forEach(function (b) {
            series.push({
              name: ln[2] + '·' + b.label, type: 'bar', stack: ln[0], barMaxWidth: 26, itemStyle: { color: tierCss(d, b) },
              data: P.cats.map(function (c) { return Math.round(((c[ln[1]] && c[ln[1]][b.key]) || 0) / c.n * 1000) / 10; })
            });
          });
        });
        ec.setOption({
          grid: { left: 48, right: 20, top: 20, bottom: 50 }, tooltip: { trigger: 'item', formatter: function (p) { return p.name + ' · ' + p.seriesName + '：' + p.value + '%'; } },
          xAxis: Object.assign({ type: 'category', data: P.cats.map(function (c) { return c.label; }) }, AXIS),
          yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%', color: '#8E968C' }, splitLine: { lineStyle: { color: '#ECE6D8' } } },
          series: series
        }, true);
      }
    };
    ec.on('click', function (p) {
      var c = P.cats.filter(function (x) { return x.label === p.name || x.label === (rows[p.value && p.value[1]] || {}).label; })[0];
      if (c && o.onOpenCat) o.onOpenCat(c.key);
    });
    api.renderLegend = function () {
      window.Board.prototype.renderLegend.call({ mode: api.mode, flat: api.mode === 'matrix', valueColor: true, o: o });
    };
    api.setMode = function (m) { api.mode = m; api.render(); api.renderLegend(); };
    api.setFlat = NOOP; api.setValueColor = NOOP; api.autoRotate = NOOP; api.reframe = NOOP;
    api.stage = { zoomBy: NOOP };
    api.render(); api.renderLegend();
    return api;
  }

  window.Fallback = { blocks: blocks, board: board };
})();
