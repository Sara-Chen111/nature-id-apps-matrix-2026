/* ============================================================
   图 2 · 板块对比（3D）
   A「功能 × 板块」：14 功能位（按普及度从高到低）× 7 类 + 全部，柱高 = 覆盖率
   B「板块经营对比」：每类 3 根分层圆柱并排 —— 收入档 / 下载档 / 年付起步价档，
     每层 = 一个档位的款数占比（浅 → 深 = 低档 → 高档；半透明虚层 = 未采集 / 未列年付）
   ============================================================ */
(function () {
  'use strict';
  var T = window.THREE, S = window.Stage3D, U = window.U, P = window.PANO;

  var H = 6;                       // 矩阵：100% 对应的柱高
  var HC = 8;                      // 经营对比：100% 对应的柱高
  var ALL_COLOR = '#9AA197';

  function Board(host, o) {
    var self = this;
    this.o = o;
    this.mode = 'matrix';
    this.flat = false;
    this.valueColor = false;
    this.stage = new S.Stage(host, {
      tipFor: function (m) { return self._tip(m); },
      onHover: function (m, prev) {
        if (prev) prev.material.emissive.setHex(0x000000);
        if (m) m.material.emissive.setHex(0x26261f);
      },
      onClick: function (m) { var k = m.userData.cat; if (k && k !== 'all' && o.onOpenCat) o.onOpenCat(k); },
      onResize: function () { if (self.box && !self.stage.userMoved) self._frame(true); },
      onFirstVisible: function () { self.grow(self.mode === 'matrix' ? self.gM : self.gC, 0); }
    });
    this.gM = new T.Group();
    this.gC = new T.Group();
    this.stage.scene.add(this.gM, this.gC);
    this._buildMatrix();
    this._buildComp();
    this.setMode('matrix', true);
  }

  /* ================= A 功能 × 板块 ================= */
  Board.prototype._buildMatrix = function () {
    var g = this.gM, self = this;
    var rows = [{ key: 'all', label: '全部', n: P.meta.n, color: ALL_COLOR }].concat(P.cats);
    // 列按「全部 110 款」的普及度从高到低 —— 一眼看出哪些功能人人都做、哪些几乎没人做
    var order = P.features.map(function (f, i) { return i; }).sort(function (a, b) { return P.features[b].n - P.features[a].n; });
    var pX = 1.42, pZ = 1.75;
    var nF = order.length, nR = rows.length;
    var x0 = -(nF - 1) * pX / 2;
    var zOf = function (ri) { return (ri - (nR - 1) / 2) * pZ; };   // 「全部」在最后排，做背景参照
    this.M = { rows: rows, order: order, pX: pX, pZ: pZ, x0: x0, zOf: zOf, nF: nF, nR: nR, cols: [] };
    var floorW = nF * pX + 0.4, floorD = nR * pZ + 0.4;
    var base = new T.Mesh(S.roundedBox(floorW, 0.06, floorD, 0.04), new T.MeshStandardMaterial({ color: 0xEDE8DB, roughness: 0.9 }));
    base.receiveShadow = true;
    g.add(base);
    var strip = new T.Mesh(S.roundedBox(floorW - 0.2, 0.065, pZ - 0.2, 0.04), new T.MeshStandardMaterial({ color: 0xE3DECF, roughness: 0.9 }));
    strip.position.z = zOf(0);
    g.add(strip);
    rows.forEach(function (r, ri) {
      order.forEach(function (fi, ci) {
        var f = P.features[fi];
        var k = r.key === 'all' ? f.n : r.feat[fi];
        var p = k / r.n;
        var h = Math.max(0.06, p * H);
        var m = new T.Mesh(S.roundedBox(0.78, h, 0.78, 0.09),
          new T.MeshStandardMaterial({ color: new T.Color(r.color), roughness: 0.58, metalness: 0, emissive: 0x000000 }));
        m.castShadow = true;
        m.receiveShadow = true;
        m.position.set(x0 + ci * pX, h / 2 + 0.03, zOf(ri));
        m.userData = { kind: 'm', cat: r.key, row: r, f: f, fi: fi, ci: ci, ri: ri, k: k, p: p, h: h };
        g.add(m);
        self.M.cols.push(m);
      });
    });
    var hx = nF * pX / 2, hz = nR * pZ / 2;
    this.M.box = new T.Box3(new T.Vector3(-hx - 2.6, -0.6, -hz - 0.2), new T.Vector3(hx + 0.3, H * 0.9, hz + 2.2));
    this.M.boxFlat = new T.Box3(new T.Vector3(-hx - 3.0, 0, -hz - 0.4), new T.Vector3(hx + 0.4, 0.1, hz + 3.0));
  };

  Board.prototype._matrixLabels = function () {
    var st = this.stage, M = this.M, self = this;
    var zFront = M.zOf(M.nR - 1) + M.pZ / 2 + 0.3;
    M.order.forEach(function (fi, ci) {
      var f = P.features[fi];
      st.label('<span>' + U.esc(f.name) + '</span><em>' + Math.round(f.pct * 100) + '%</em>', 'lbl-feat',
        new T.Vector3(M.x0 + ci * M.pX, 0, zFront), { anchor: 'top', group: 'dyn', thin: 'x', thinKey: 'feat' });
    });
    M.rows.forEach(function (r, ri) {
      var html = r.key === 'all'
        ? '<span class="cat-chip all">全部<em>' + r.n + '</em></span>'
        : '<span class="cat-chip" style="--c:' + r.color + '">' + window.Glyph.svg(r.key, 14) + r.label + '<em>' + r.n + '</em></span>';
      st.label(html, 'lbl-row', new T.Vector3(M.x0 - M.pX * 0.62, 0.1, M.zOf(ri)),
        { anchor: 'right', group: 'dyn', thin: 'y', thinKey: 'mrows',
          onClick: r.key === 'all' ? null : function () { if (self.o.onOpenCat) self.o.onOpenCat(r.key); } });
    });
    if (this.flat) {
      M.cols.forEach(function (m) {
        var u = m.userData;
        st.label(Math.round(u.p * 100) + '', 'lbl-val' + (u.p >= 0.5 ? ' inv' : ''), new T.Vector3(m.position.x, TILE + 0.05, m.position.z), { anchor: 'center', group: 'dyn' });
      });
    }
  };

  // 俯视热力格：柱子压成薄瓷砖、铺满格子（透视下高柱会"歪倒"，所以必须压平）
  var TILE = 0.14;
  function matrixTarget(u, flat) {
    return flat ? { sy: TILE / u.h, sx: 1.6, sz: 1.95, y: TILE / 2 + 0.03 } : { sy: 1, sx: 1, sz: 1, y: u.h / 2 + 0.03 };
  }
  Board.prototype._matrixShape = function (animate) {
    var st = this.stage, flat = this.flat;
    this.M.cols.forEach(function (m) {
      var u = m.userData, t = matrixTarget(u, flat);
      m.castShadow = !flat;
      if (!animate) { m.scale.set(t.sx, t.sy, t.sz); m.position.y = t.y; return; }
      var s0 = m.scale.clone(), y0 = m.position.y;
      st.tween(700, function (e) {
        m.scale.set(s0.x + (t.sx - s0.x) * e, s0.y + (t.sy - s0.y) * e, s0.z + (t.sz - s0.z) * e);
        m.position.y = y0 + (t.y - y0) * e;
      }, { delay: u.ci * 18 });
    });
  };

  Board.prototype._matrixColors = function (animate) {
    var st = this.stage, byValue = this.valueColor || this.flat;
    this.M.cols.forEach(function (m) {
      var u = m.userData;
      var c = byValue ? S.rampColor('ocean', u.p) : new T.Color(u.row.color);
      if (!animate) { m.material.color.copy(c); return; }
      var c0 = m.material.color.clone();
      st.tween(420, function (e) { m.material.color.copy(c0).lerp(c, e); });
    });
  };

  /* ================= B 板块经营对比 ================= */
  // 收/下 两根柱 = 最近30天收入 / 下载（10 倍一级；有七麦截图的款用校准估算，其余按档位下限）
  var LANES = [
    { key: 'rev30', cnt: 'rev30', tag: '收', label: '最近30天收入' },
    { key: 'dl30', cnt: 'dl30', tag: '下', label: '最近30天下载' },
    { key: 'price', cnt: 'price', tag: '价', label: '年付起步价' }
  ];
  function tierRank(b) { return b.tone === 'na' ? 99 : b.tone === 'alt' ? 50 : b.tone; }

  function laneSegments(c, lane) {
    var d = U.DIM[lane];
    var cnt = LANES.filter(function (l) { return l.key === lane; })[0].cnt;
    var segs = [];
    d.bins.forEach(function (b) { segs.push({ b: b, k: (c[cnt] && c[cnt][b.key]) || 0 }); });
    segs.sort(function (x, y) { return tierRank(x.b) - tierRank(y.b); });   // 低档在下、缺口在顶
    return segs.filter(function (s) { return s.k > 0; });
  }
  function segColor(lane, b) {
    var d = U.DIM[lane];
    if (b.tone === 'na') return new T.Color(S.NA_COLOR);
    if (b.tone === 'alt') return new T.Color(S.ALT_COLOR);
    return S.rampColor(d.ramp, d.maxTone ? b.tone / d.maxTone : 0.5);
  }

  Board.prototype._buildComp = function () {
    var g = this.gC, self = this;
    var cats = P.cats, nC = cats.length;
    var gx = 5.3, lx = 1.48;
    var x0 = -(nC - 1) * gx / 2;
    this.C = { towers: [], segs: [], gx: gx, lx: lx, x0: x0 };
    var w = (nC - 1) * gx + 3 * lx + 0.8;
    var base = new T.Mesh(S.roundedBox(w, 0.06, 2.0, 0.03), new T.MeshStandardMaterial({ color: 0xEDE8DB, roughness: 0.9 }));
    base.receiveShadow = true;
    g.add(base);
    cats.forEach(function (c, ci) {
      LANES.forEach(function (ln, li) {
        var tower = new T.Group();
        tower.position.set(x0 + ci * gx + (li - 1) * lx, 0, 0);
        tower.userData = { ci: ci, li: li, cat: c, lane: ln };
        var y = 0.04;
        laneSegments(c, ln.key).forEach(function (s) {
          var h = s.k / c.n * HC;
          var hh = Math.max(0.05, h - 0.035);
          var geo = new T.CylinderGeometry(0.6, 0.6, hh, 44, 1);
          geo.translate(0, hh / 2, 0);
          var ghost = s.b.tone === 'na';
          var mat = new T.MeshStandardMaterial({ color: segColor(ln.key, s.b), roughness: 0.55, metalness: 0, emissive: 0x000000,
            transparent: ghost, opacity: ghost ? 0.42 : 1, depthWrite: !ghost });
          var m = new T.Mesh(geo, mat);
          m.castShadow = !ghost;
          m.receiveShadow = true;
          m.position.y = y;
          m.userData = { kind: 'c', cat: c.key, c: c, lane: ln, bin: s.b, k: s.k, y0: y, h: hh, ghost: ghost };
          tower.add(m);
          self.C.segs.push(m);
          y += h;
        });
        tower.userData.top = y;
        g.add(tower);
        self.C.towers.push(tower);
      });
    });
    var hx = w / 2;
    this.C.box = new T.Box3(new T.Vector3(-hx - 0.3, -2.0, -1.0), new T.Vector3(hx + 0.3, HC + 0.7, 2.6));
    this.C.boxFlat = new T.Box3(new T.Vector3(-hx - 0.3, -2.2, -0.7), new T.Vector3(hx + 0.3, HC + 0.6, 0.7));
  };

  Board.prototype._compLabels = function () {
    var st = this.stage, C = this.C, self = this, flat = this.flat;
    P.cats.forEach(function (c, ci) {
      var x = C.x0 + ci * C.gx;
      var lab = st.label('<span class="cat-chip" style="--c:' + c.color + '">' + window.Glyph.svg(c.key, 14) + c.label + '<em>' + c.n + '</em></span>' +
        '<small>最近30天</small>',
        'lbl-catx', new T.Vector3(x, -1.0, flat ? 0.4 : 1.7), { anchor: 'top', group: 'dyn', onClick: function () { if (self.o.onOpenCat) self.o.onOpenCat(c.key); } });
      lab.el.style.animationDelay = ci * 40 + 'ms';
    });
    C.towers.forEach(function (tw) {
      var u = tw.userData, x = tw.position.x;
      st.label(u.lane.tag, 'lbl-lanetag lane-' + u.lane.key, new T.Vector3(x, -0.05, 0.72), { anchor: 'top', group: 'dyn' });
      if (!flat) return;
      tw.children.forEach(function (m) {
        var s = m.userData;
        if (s.h < 0.5) return;
        st.label(Math.round(s.k / s.c.n * 100) + '%', 'lbl-seg' + (!s.ghost && S.luminance(m.material.color) < 0.5 ? ' inv' : '') + (s.ghost ? ' ghost' : ''),
          new T.Vector3(x, s.y0 + s.h / 2, 0.62), { anchor: 'center', group: 'dyn' });
      });
    });
  };

  /* ================= 模式切换 / 读数 ================= */
  Board.prototype.grow = function (g, delay) {
    var st = this.stage, flat = this.flat;
    var items = g === this.gM ? this.M.cols : this.C.segs;
    items.forEach(function (m) {
      var u = m.userData;
      var dl = (delay || 0) + (u.kind === 'm' ? u.ci * 34 + u.ri * 26 : u.c.idx * 70 + LANES.indexOf(u.lane) * 30);
      var t = u.kind === 'm' ? matrixTarget(u, flat) : null;
      if (t) { m.scale.set(t.sx, 0.001, t.sz); m.position.y = 0.03; }
      else { m.scale.y = 0.001; m.position.y = 0.04; }
      st.tween(780, function (e) {
        if (t) { m.scale.y = Math.max(0.001, t.sy * e); m.position.y = 0.03 + (t.y - 0.03) * e; }
        else { m.scale.y = Math.max(0.001, e); m.position.y = 0.04 + (u.y0 - 0.04) * e; }
      }, { delay: dl, ease: S.EASE.out });
    });
  };

  Board.prototype.setMode = function (mode, instant) {
    this.mode = mode;
    var showM = mode === 'matrix';
    this.gM.visible = showM;
    this.gC.visible = !showM;
    this.stage.pickables = showM ? this.M.cols.slice() : this.C.segs.slice();
    this.stage.hideTip();
    this._refreshLabels();
    if (showM) { this._matrixColors(false); this._matrixShape(false); }
    if (!instant) this.grow(showM ? this.gM : this.gC, 120);
    this._frame(instant);
    this.renderLegend();
  };

  Board.prototype._refreshLabels = function () {
    this.stage.removeLabels('dyn');
    var ll = this.stage.labelLayer;
    ll.classList.remove('lbl-in'); void ll.offsetWidth; ll.classList.add('lbl-in');
    if (this.mode === 'matrix') this._matrixLabels(); else this._compLabels();
  };

  Board.prototype._frame = function (instant) {
    var box, az, el;
    if (this.mode === 'matrix') {
      box = this.flat ? this.M.boxFlat : this.M.box;
      az = this.flat ? 0 : -0.26; el = this.flat ? 1.553 : 0.72;
    } else {
      box = this.flat ? this.C.boxFlat : this.C.box;
      az = this.flat ? 0 : -0.32; el = this.flat ? 0.04 : 0.32;
    }
    this.box = box;
    var v = this.stage.fit(box, az, el, 0.04);
    this.stage.setShadowBox(box);
    this.stage.flyTo(v, 1000, instant);
    this.stage.userMoved = false;
  };

  Board.prototype.setFlat = function (v) {
    this.flat = v;
    this.stage.controls.enableRotate = !v && !this.stage.coarse;
    if (this.mode === 'matrix') { this._matrixColors(true); this._matrixShape(true); }
    this._refreshLabels();
    this._frame(false);
    this.renderLegend();
  };
  Board.prototype.setValueColor = function (v) { this.valueColor = v; this._matrixColors(true); this.renderLegend(); };
  Board.prototype.autoRotate = function (on) { this.stage.setAutoRotate(on); };
  Board.prototype.reframe = function () { this._frame(false); };

  /* ================= 悬浮卡 ================= */
  Board.prototype._tip = function (m) {
    var u = m.userData;
    if (u.kind === 'm') {
      var who = u.cat === 'all' ? '全部 ' + P.meta.n + ' 款' : U.catChip(u.cat);
      var allP = u.f.pct;
      var diff = u.cat === 'all' ? '' : '<div class="tip-row"><span>对比全部</span><b>' + U.pct(u.f.n, P.meta.n, 1) + '（' +
        (u.p - allP >= 0 ? '+' : '') + Math.round((u.p - allP) * 100) + ' 个百分点）</b></div>';
      return '<div class="tip-h">' + who + ' <span class="x">×</span> <b>' + U.esc(u.f.name) + '</b></div>' +
        '<div class="tip-big">' + U.pct(u.k, u.row.n, 1) + '<small>' + u.k + ' / ' + u.row.n + ' 款宣称具备</small></div>' + diff +
        (u.f.note ? '<div class="tip-note">' + U.esc(u.f.note) + '</div>' : '') +
        (u.cat !== 'all' ? '<div class="tip-foot">点击进入「' + U.CAT[u.cat].label + '」板块 →</div>' : '');
    }
    var c = u.c, st = u.lane.key !== 'price';
    return '<div class="tip-h">' + U.catChip(c.key) + ' · ' + (st ? U.tag('最近30天') : '') + '<b>' + u.lane.label + '</b></div>' +
      '<div class="tip-big">' + U.esc(u.bin.label) + '<small>' + u.k + ' 款</small></div>' +
      '<div class="tip-row"><span>占该类</span><b>' + U.pct(u.k, c.n, 0) + '（' + u.k + '/' + c.n + '）</b></div>' +
      '<div class="tip-note">' + (st ? '10 倍一级：有七麦截图的款用校准估算，其余按档位下限归档；只看量级' : '按官方页最低年付价分档；价格 ≠ 成交') + '</div>' +
      '<div class="tip-foot">点击进入「' + c.label + '」板块 →</div>';
  };

  /* ================= 图例 & 口径 ================= */
  Board.prototype.renderLegend = function () {
    var el = this.o.legendEl, n = P.meta.n;
    if (!el) return;
    if (this.mode === 'matrix') {
      var byValue = this.valueColor || this.flat;
      el.innerHTML = byValue
        ? '<span class="lg-title">覆盖率</span><span class="lg-rampbox"><span class="lg-ramp" style="background:linear-gradient(90deg,' +
          S.RAMPS.ocean.join(',') + ')"></span><span class="lg-ends"><em>0%</em><em>100%</em></span></span><span class="lg-hint">' +
          (this.flat ? '俯视热力格 · 数字 = 覆盖率 %' : '柱高与颜色都代表覆盖率') + ' · 列按全部 ' + n + ' 款的普及度从高到低</span>'
        : '<span class="lg-title">柱色 = 类别 · 柱高 = 覆盖率</span>' + P.cats.map(function (c) {
          return '<span class="lg-dot" style="--c:' + c.color + '">' + window.Glyph.svg(c.key, 13) + c.label + '</span>';
        }).join('') + '<span class="lg-dot all">全部（最后排）</span><span class="lg-hint">列按全部 ' + n + ' 款的普及度从高到低排 —— 左边人人都做，右边几乎没人做</span>';
    } else {
      el.innerHTML = LANES.map(function (ln) {
        var d = U.DIM[ln.key];
        var order = d.bins.slice().sort(function (x, y) { return tierRank(x) - tierRank(y); });
        return '<span class="lg-lane"><i class="lane-tag lane-' + ln.key + '">' + ln.tag + '</i><b>' + ln.label + '</b>' + order.map(function (b) {
          var col = '#' + segColor(ln.key, b).getHexString();
          return '<span class="lg-tier"><i' + (b.tone === 'na' ? ' class="ghost"' : '') + ' style="background:' + col + '"></i>' + U.esc(b.label) + '</span>';
        }).join('') + '</span>';
      }).join('');
    }
    var cav = this.o.caveatEl;
    if (cav) {
      var kid = (P.features.filter(function (f) { return f.name === '儿童可用'; })[0] || {}).n || 0;
      cav.innerHTML = '<span class="cav-tag">口径</span><span>' + (this.mode === 'matrix'
        ? '功能位 = 对 ' + n + ' 款商店描述原文做正则匹配，命中即算「宣称具备」≠ 实测可用；覆盖率 = 宣称款数 ÷ 该类款数。「儿童可用」全库仅 ' + kid + '/' + n + ' 款明示。'
        : '收 / 下两根柱 = 最近30天收入 / 下载（10 倍一级；有七麦截图的款用校准估算，其余按档位下限）；价 = 官方页最低年付价。柱高 = 该类全部款数（100%），沙色层 = 免费 App，半透明虚层 = 无数据 / 未列年付。') + '</span>';
    }
  };

  window.Board = Board;
})();
