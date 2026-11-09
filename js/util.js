/* ============================================================
   通用小工具 + 数据索引（所有页面脚本共用）
   ============================================================ */
(function () {
  'use strict';
  var P = window.PANO;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(n) { return n == null ? '—' : Number(n).toLocaleString('en-US'); }
  function fmtW(n) {               // 中文量级：1,121,944 → 112.2 万
    if (n == null) return '—';
    if (n >= 1e4) return (n / 1e4).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, '') + ' 万';
    return fmt(n);
  }
  function pct(a, b, d) { return b ? (a / b * 100).toFixed(d == null ? 0 : d) + '%' : '—'; }
  function money(v) { return v == null ? '—' : '$' + (Number.isInteger(v) ? v : v.toFixed(2)); }
  function moneyList(arr) { return arr && arr.length ? arr.map(money).join(' / ') : '—'; }

  // 索引
  var CAT = {}, APP = {}, DIM = {};
  P.cats.forEach(function (c, i) { c.idx = i; CAT[c.key] = c; });
  P.apps.forEach(function (a) { APP[a.id] = a; });
  P.special.forEach(function (s) { s.special = true; APP[s.id] = s; });
  P.dims.concat(P.payDims || []).forEach(function (d) {
    DIM[d.key] = d;
    d.binIndex = {};
    d.maxTone = 0;
    d.bins.forEach(function (b, i) { d.binIndex[b.key] = i; if (typeof b.tone === 'number') d.maxTone = Math.max(d.maxTone, b.tone); });
  });

  function appIcon(a, size) {
    var s = size || 40;
    if (a.icon) return '<img class="app-icon" src="assets/icons/' + a.id + '.png" width="' + s + '" height="' + s + '" alt="" loading="lazy">';
    var c = CAT[a.cat];
    return '<span class="app-icon glyph-tile" style="--c:' + c.color + ';width:' + s + 'px;height:' + s + 'px">' + window.Glyph.svg(a.cat, Math.round(s * 0.56)) + '</span>';
  }
  function catChip(key, extra) {
    var c = CAT[key];
    return '<span class="cat-chip" style="--c:' + c.color + '">' + window.Glyph.svg(key, 14) + c.label + (extra || '') + '</span>';
  }
  function layerName(l) { return l === 'B' ? 'B 层 · 相邻' : l === 'A-新增' ? 'A 层 · 新增' : 'A 层 · 核心'; }
  function priceLine(a) {
    if (a.stage === '免费') return '免费';
    if (a.stage === '买断') return '买断';
    if (a.yearMin != null) return '年付起步 ' + money(a.yearMin);
    if (a.weekly && a.weekly.length) return '收费 · 周付 ' + money(Math.min.apply(null, a.weekly)) + ' 起';
    if (a.monthly && a.monthly.length) return '收费 · 月付 ' + money(Math.min.apply(null, a.monthly)) + ' 起';
    return '收费 · 未列年付';
  }
  function rankInCat(a) {
    var c = CAT[a.cat];
    var i = c.top.indexOf(a.id);
    return i < 0 ? null : i + 1;
  }
  // 某款在某维度落在哪一档（取该维度的档位名，保证与图上一致）
  function binLabel(a, key) {
    var d = DIM[key];
    if (!d || !a.b) return '—';
    var b = d.bins[d.binIndex[a.b[key]]];
    return b ? b.label : '—';
  }
  // 时间口径小标签：最近30天 = 陶土 / 最近4年 = 雾蓝
  function tag(span) { return '<i class="tg ' + (span === '最近4年' ? 'tg-all' : 'tg-30') + '">' + esc(span) + '</i>'; }
  // 数字超过 1 万改用「万 / 亿」：8,532 → 8,532；45,800 → 4.6 万；1,235,000 → 124 万；568,478,320 → 5.68 亿
  function fmtWan(n) {
    if (n == null) return '—';
    var trim = function (s) { return s.indexOf('.') >= 0 ? s.replace(/\.?0+$/, '') : s; };
    if (n >= 1e8) return trim((n / 1e8).toFixed(n >= 1e10 ? 0 : 2)) + ' 亿';
    if (n >= 1e4) return trim((n / 1e4).toFixed(n >= 1e6 ? 0 : 1)) + ' 万';
    return fmt(Math.round(n));
  }
  // 下载 / 收入：有校准估算值 → 显示 ≈ 真实数字（悬停可见口径）；没有 → 所在区间 +「下限」标记
  function metricNum(a, key) {
    var v = a.mNum && a.mNum[key];
    if (v == null) return null;
    if (!v) return key.indexOf('rev') === 0 ? '$0' : '0';
    return (key.indexOf('rev') === 0 ? '≈$' : '≈') + fmtWan(v);
  }
  function metricHtml(a, key) {
    var n = metricNum(a, key);
    if (n != null) return '<span title="七麦 iPhone 估算 × 校准系数，约值仅供参考">' + esc(n) + '</span>';
    return '<span title="无七麦估算：按第三方档位下限归档，真实值可能高一级">' + esc(binLabel(a, key)) +
      (a.m && a.m[key] === 'band' ? '<small class="lb">下限</small>' : '') + '</span>';
  }
  function metricText(a, key) {
    return binLabel(a, key) + (a.m && a.m[key] === 'band' ? '（下限）' : '');
  }

  window.U = {
    esc: esc, fmt: fmt, fmtW: fmtW, pct: pct, money: money, moneyList: moneyList,
    CAT: CAT, APP: APP, DIM: DIM,
    appIcon: appIcon, catChip: catChip, layerName: layerName, priceLine: priceLine, rankInCat: rankInCat,
    binLabel: binLabel, tag: tag, fmtWan: fmtWan, metricNum: metricNum, metricHtml: metricHtml, metricText: metricText
  };
})();
