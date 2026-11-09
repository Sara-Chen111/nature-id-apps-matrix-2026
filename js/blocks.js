/* ============================================================
   图 1 · App 积木塔（3D）
   每块圆角积木 = 1 款 App，正面印类别图标；
   横轴 = 当前维度的档位，高度 = 款数，纵深 = 7 个类别（展开模式）
   切换维度时积木沿弧线"飞"到新位置重新堆叠
   ============================================================ */
(function () {
  'use strict';
  var T = window.THREE, S = window.Stage3D, U = window.U, P = window.PANO;

  var BLOCK = 0.84;           // 积木边长（格距 = 1）
  var GAP_BIN = 0.66;         // 档位间隙
  var GAP_ROW = 1.0;          // 类别排间隙
  var texCache = {};

  function glyphTex(stage, cat, tone) {
    var k = cat + tone;
    if (texCache[k]) return texCache[k];
    var col = tone === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(38,46,38,0.70)';
    var tx = new T.CanvasTexture(window.Glyph.canvas(cat, col, 128));
    tx.anisotropy = stage.renderer.capabilities.getMaxAnisotropy();
    texCache[k] = tx;
    return tx;
  }

  function BlockTowers(host, o) {
    var self = this;
    this.o = o;
    this.dimKey = o.dim || 'year';
    this.merged = o.merged !== false;
    this.colorMode = o.colorMode || 'cat';
    this.flat = false;
    this.focusCat = null;
    this.blocks = [];
    this.stage = new S.Stage(host, {
      tipFor: function (m) { return self._tip(m); },
      onHover: function (m, prev) { self._hover(m, prev); },
      onClick: function (m) { if (o.onOpenApp) o.onOpenApp(m.userData.app.id); },
      onResize: function () { if (self.L && !self.stage.userMoved) self._frame(true); },
      onFirstVisible: function () { self.intro(); }
    });
    this.group = new T.Group();
    this.floor = new T.Group();
    this.stage.scene.add(this.group, this.floor);
    this.setApps(o.apps);
  }

  /* ---------- 建积木 ---------- */
  BlockTowers.prototype.setApps = function (apps) {
    var st = this.stage, self = this;
    this.blocks.forEach(function (m) { self.group.remove(m); m.material.dispose(); m.userData.decal.material.dispose(); });
    this.blocks = [];
    st.pickables = [];
    this.apps = apps.slice();
    var geo = S.roundedBox(BLOCK, BLOCK, BLOCK, 0.13);
    var dgeo = this._dgeo || (this._dgeo = new T.PlaneGeometry(BLOCK * 0.68, BLOCK * 0.68));
    this.apps.forEach(function (a) {
      var col = new T.Color(U.CAT[a.cat].color);
      var m = new T.Mesh(geo, new T.MeshStandardMaterial({ color: col, roughness: 0.6, metalness: 0, emissive: 0x000000 }));
      m.castShadow = true;
      m.receiveShadow = true;
      var decal = new T.Mesh(dgeo, new T.MeshBasicMaterial({ map: glyphTex(st, a.cat, 'light'), transparent: true, depthWrite: false }));
      decal.position.z = BLOCK / 2 + 0.006;
      decal.renderOrder = 2;
      m.add(decal);
      m.userData = { app: a, decal: decal, tone: 'light' };
      self.group.add(m);
      self.blocks.push(m);
      st.pickables.push(m);
    });
    this.relayout(false);
    this.recolor(false);
  };

  /* ---------- 布局计算 ---------- */
  BlockTowers.prototype._effMerged = function () { return this.flat || this.merged || !!this.o.filterCat; };

  BlockTowers.prototype._layout = function () {
    var d = U.DIM[this.dimKey];
    var merged = this._effMerged();
    var rows = merged ? [null] : P.cats.map(function (c) { return c.key; });
    var nB = d.bins.length, nR = rows.length;
    var cells = {}, M = 1;
    this.apps.forEach(function (a) {
      var bi = d.binIndex[a.b[d.key]];
      var ri = merged ? 0 : U.CAT[a.cat].idx;
      var k = bi + '|' + ri;
      (cells[k] = cells[k] || []).push(a);
    });
    Object.keys(cells).forEach(function (k) {
      cells[k].sort(function (x, y) { return U.CAT[x.cat].idx - U.CAT[y.cat].idx || y.iosRatings - x.iosRatings; });
      M = Math.max(M, cells[k].length);
    });
    // 合并（单排）：每格 Fx 块并排往上叠，纵深只有 1 块 —— 3D 与正视同一布局，正视只是换机位；
    // 分板块：7 排矮墙（每格 Fx 块并排、纵深 1 块），墙矮一些，前排才不会挡住后排
    var Fx, Fz = 1;
    if (merged) Fx = Math.min(5, Math.max(1, Math.ceil(M / 14)));
    else Fx = Math.min(4, Math.max(1, Math.ceil(M / 6)));
    var F = Fx;
    var unitY = 1;
    var pX = Fx + GAP_BIN, pZ = Fz + (merged ? GAP_ROW : 1.35);
    var x0 = -(nB - 1) * pX / 2, zc = function (ri) { return (ri - (nR - 1) / 2) * pZ; };
    var targets = {}, tops = [];
    var maxTop = 0;
    for (var bi = 0; bi < nB; bi++) {
      for (var ri = 0; ri < nR; ri++) {
        var list = cells[bi + '|' + ri] || [];
        var per = Fx * Fz;
        list.forEach(function (a, k) {
          var layer = Math.floor(k / per), slot = k % per;
          var sx = slot % Fx, sz = Math.floor(slot / Fx);
          targets[a.id] = {
            x: x0 + bi * pX + (sx - (Fx - 1) / 2),
            z: zc(ri) + (sz - (Fz - 1) / 2),
            y: layer * unitY + BLOCK * unitY / 2 + 0.03,
            sy: unitY
          };
        });
        var top = Math.ceil(list.length / per) * unitY;
        maxTop = Math.max(maxTop, top);
        tops.push({ bi: bi, ri: ri, n: list.length, x: x0 + bi * pX, z: zc(ri), top: top });
      }
    }
    var halfX = (nB - 1) * pX / 2 + Fx / 2, halfZ = (nR - 1) * pZ / 2 + Fz / 2;
    var box = new T.Box3(
      new T.Vector3(-halfX - (merged ? 0.7 : 4.2), this.flat ? -1.7 : -1.1, -halfZ - 0.5),
      new T.Vector3(halfX + 0.7, maxTop + (this.flat ? 1.3 : 1.0), halfZ + (this.flat ? 1.0 : 2.2))
    );
    return { d: d, rows: rows, merged: merged, F: F, Fx: Fx, Fz: Fz, unitY: unitY, pX: pX, pZ: pZ, x0: x0, zc: zc,
      halfX: halfX, halfZ: halfZ, targets: targets, tops: tops, box: box, maxTop: maxTop };
  };

  /* ---------- 地台（浅色底板 / 类别跑道） ---------- */
  BlockTowers.prototype._buildFloor = function (L) {
    var f = this.floor;
    while (f.children.length) { var c = f.children.pop(); c.geometry.dispose(); c.material.dispose(); }
    var w = L.halfX * 2 + 1.1;
    if (L.merged) {
      var g = S.roundedBox(w, 0.06, L.Fz + 0.9, 0.03);
      var m = new T.Mesh(g, new T.MeshStandardMaterial({ color: 0xEDE8DB, roughness: 0.9 }));
      m.position.set(0, 0.0, 0);
      m.receiveShadow = true;
      f.add(m);
    } else {
      L.rows.forEach(function (key, ri) {
        var col = new T.Color('#F2EEE4').lerp(new T.Color(U.CAT[key].color), 0.22);
        var g = S.roundedBox(w, 0.06, L.Fz + 0.55, 0.03);
        var m = new T.Mesh(g, new T.MeshStandardMaterial({ color: col, roughness: 0.9 }));
        m.position.set(0, 0, L.zc(ri));
        m.receiveShadow = true;
        f.add(m);
      });
    }
    // 空档位留一个"凹槽"，让 0 款也看得见
    L.tops.forEach(function (t) {
      if (t.n) return;
      if (!L.merged && t.ri !== 0) return;
      var g = S.roundedBox(L.Fx * 0.9, 0.02, (L.merged ? L.Fz : L.halfZ * 2) * 0.9, 0.01);
      var m = new T.Mesh(g, new T.MeshBasicMaterial({ color: 0xE2DCCB }));
      m.position.set(t.x, 0.045, 0);
      f.add(m);
    });
  };

  /* ---------- 标签（档位名 / 款数 / 类别排名） ---------- */
  BlockTowers.prototype._buildLabels = function (L, delay) {
    var st = this.stage, self = this;
    st.removeLabels('dyn');
    var d = L.d;
    var zFront = L.halfZ + 0.75;
    // 档位名多且长（如 10 倍一级的「$100W-1000W」）时奇偶错开两行，保证每个区间都标得出来（正视时一行放得下，不错开）
    var stagger = !self.flat && d.bins.length >= 8 && d.bins.some(function (b) { return b.label.length >= 8; });
    d.bins.forEach(function (b, bi) {
      var lo = stagger && bi % 2 === 1;
      var lab = st.label('<span>' + U.esc(b.label) + '</span>', 'lbl-bin' + (b.tone === 'na' ? ' na' : '') + (lo ? ' lo' : ''),
        new T.Vector3(L.x0 + bi * L.pX, self.flat ? -0.25 : 0, zFront),
        { anchor: 'top', group: 'dyn', thin: 'x', thinKey: lo ? 'bins-lo' : 'bins', prio: b.tone === 'na' });
      lab.el.style.animationDelay = (delay || 0) + 'ms';
    });
    L.tops.forEach(function (t) {
      if (!t.n || !L.merged) return;   // 分板块时格子太密，数字放进悬浮卡
      var lab = st.label(String(t.n), 'lbl-count',
        new T.Vector3(t.x, t.top + 0.28, t.z), { anchor: 'bottom', group: 'dyn' });
      lab.el.style.animationDelay = ((delay || 0) + 380 + t.bi * 18) + 'ms';
    });
    if (!L.merged) {
      L.rows.forEach(function (key, ri) {
        var c = U.CAT[key];
        var n = self.apps.filter(function (a) { return a.cat === key; }).length;
        var lab = st.label('<span class="cat-chip" style="--c:' + c.color + '">' + window.Glyph.svg(key, 14) + c.label +
          '<em>' + n + '</em></span>', 'lbl-row', new T.Vector3(-L.halfX - 0.45, 0.2, L.zc(ri)),
          { anchor: 'right', group: 'dyn', thin: 'y', thinKey: 'rows', onClick: function () { if (self.o.onOpenCat) self.o.onOpenCat(key); } });
        lab.el.style.animationDelay = (delay || 0) + 'ms';
      });
    }
  };

  /* ---------- 重新布局（带飞行动画） ---------- */
  BlockTowers.prototype.relayout = function (animate) {
    var L = this.L = this._layout();
    var st = this.stage;
    this._buildFloor(L);
    this._buildLabels(L, animate ? 520 : 0);
    var span = (L.box.max.x - L.box.min.x) || 1;
    this.blocks.forEach(function (m) {
      var tg = L.targets[m.userData.app.id];
      var p1 = new T.Vector3(tg.x, tg.y, tg.z);
      if (m.userData.tw) m.userData.tw.dead = true;
      if (!animate) { m.position.copy(p1); m.scale.set(1, tg.sy, 1); return; }
      var p0 = m.position.clone(), s0 = m.scale.y;
      if (p0.distanceTo(p1) < 0.01) return;   // 位置没变（如切正视）就不跳
      var lift = 1.1 + Math.random() * 1.4 + Math.min(4, p0.distanceTo(p1) * 0.12);
      var delay = (tg.x - L.box.min.x) / span * 300 + Math.random() * 140;
      m.userData.tw = st.tween(820, function (e) {
        m.position.lerpVectors(p0, p1, e);
        m.position.y += Math.sin(Math.PI * e) * lift;
        m.scale.y = s0 + (tg.sy - s0) * e;
      }, { delay: delay });
    });
    this._frame(!animate);
  };

  BlockTowers.prototype._frame = function (instant) {
    var L = this.L, az, el;
    if (this.flat) { az = 0; el = 0.05; }
    else if (L.merged) { az = -0.4; el = 0.3; }
    else { az = -0.5; el = 0.6; }
    var v = this.stage.fit(L.box, az, el, this.flat ? 0.06 : 0.04);
    this.stage.setShadowBox(L.box);
    this.stage.flyTo(v, 1050, instant);
    this.stage.userMoved = false;
  };

  /* ---------- 配色：按类别 / 按档位深浅 ---------- */
  BlockTowers.prototype._colorOf = function (a) {
    var d = U.DIM[this.dimKey];
    var c;
    if (this.colorMode === 'cat') c = new T.Color(U.CAT[a.cat].color);
    else {
      var b = d.bins[d.binIndex[a.b[d.key]]];
      c = b.tone === 'na' ? new T.Color(S.NA_COLOR) : b.tone === 'alt' ? new T.Color(S.ALT_COLOR)
        : S.rampColor(d.ramp, d.maxTone ? b.tone / d.maxTone : 0.5);
    }
    return c;
  };
  BlockTowers.prototype.recolor = function (animate) {
    var st = this.stage, self = this, d = U.DIM[this.dimKey];
    this.blocks.forEach(function (m) {
      var a = m.userData.app;
      var c = self._colorOf(a);
      var ghost = self.focusCat && a.cat !== self.focusCat;
      // 「未采集」档：不论哪种配色都画成半透明占位，避免被误读成真实档位
      var na = d.bins[d.binIndex[a.b[d.key]]].tone === 'na';
      if (na && self.colorMode === 'cat') c.lerp(new T.Color(S.NA_COLOR), 0.62);
      if (ghost) c.lerp(new T.Color(S.GHOST), 0.84);
      m.material.transparent = na;
      m.material.opacity = na ? 0.55 : 1;
      m.material.depthWrite = !na;
      m.castShadow = !na;
      var tone = S.luminance(c) < 0.56 ? 'light' : 'dark';
      var dm = m.userData.decal.material;
      if (tone !== m.userData.tone) { dm.map = glyphTex(st, a.cat, tone); dm.needsUpdate = true; m.userData.tone = tone; }
      dm.opacity = ghost ? 0.16 : na ? 0.4 : 1;
      if (!animate) { m.material.color.copy(c); return; }
      var c0 = m.material.color.clone();
      if (m.userData.ctw) m.userData.ctw.dead = true;
      m.userData.ctw = st.tween(420, function (e) { m.material.color.copy(c0).lerp(c, e); });
    });
    this.renderLegend();
  };

  /* ---------- 对外 API ---------- */
  BlockTowers.prototype.setDim = function (k) {
    if (k === this.dimKey) return;
    this.dimKey = k;
    this.relayout(true);
    this.recolor(true);
    this.renderCaveat();
  };
  BlockTowers.prototype.setColorMode = function (m) { this.colorMode = m; this.recolor(true); };
  BlockTowers.prototype.setMerged = function (v) { this.merged = v; if (!this.flat) this.relayout(true); };
  BlockTowers.prototype.setFlat = function (v) {
    this.flat = v;
    this.stage.controls.enableRotate = !v && !this.stage.coarse;
    this.relayout(true);
  };
  BlockTowers.prototype.setFocus = function (cat) {
    if (cat === this.focusCat) return;
    this.focusCat = cat;
    this.recolor(true);
  };
  BlockTowers.prototype.autoRotate = function (on) { this.stage.setAutoRotate(on); };
  BlockTowers.prototype.reframe = function () { this._frame(false); };

  // 开场：积木从空中依次落下堆成塔
  BlockTowers.prototype.intro = function () {
    var st = this.stage, L = this.L;
    var span = (L.box.max.x - L.box.min.x) || 1;
    st.labelLayer.classList.remove('lbl-in');
    void st.labelLayer.offsetWidth;
    st.labelLayer.classList.add('lbl-in');
    this.blocks.forEach(function (m) {
      var tg = L.targets[m.userData.app.id];
      if (m.userData.tw) m.userData.tw.dead = true;
      var y0 = tg.y + 9 + Math.random() * 7;
      m.position.set(tg.x, y0, tg.z);
      m.scale.set(1, tg.sy, 1);
      var delay = (tg.x - L.box.min.x) / span * 700 + (tg.y / (tg.sy || 1)) * 55 + Math.random() * 180;
      m.userData.tw = st.tween(950, function (e) { m.position.y = y0 + (tg.y - y0) * e; }, { delay: delay, ease: S.EASE.outBack });
    });
  };

  /* ---------- 悬停 ---------- */
  BlockTowers.prototype._hover = function (m, prev) {
    if (prev) { prev.material.emissive.setHex(0x000000); prev.scale.x = prev.scale.z = 1; }
    if (m) { m.material.emissive.setHex(0x2a2a22); m.scale.x = m.scale.z = 1.1; }
  };
  BlockTowers.prototype._tip = function (m) {
    var a = m.userData.app, c = U.CAT[a.cat], k = this.dimKey, d = U.DIM[k];
    var bk = a.b[k], binN = 0, cellN = 0;
    this.apps.forEach(function (x) { if (x.b[k] === bk) { binN++; if (x.cat === a.cat) cellN++; } });
    var bin = d.bins[d.binIndex[bk]];
    function row(key, label, val) {
      return '<div class="tip-row' + (key === k ? ' hl' : '') + '"><span>' + label + '</span><b>' + val + '</b></div>';
    }
    var t30 = U.tag('最近30天'), t4 = U.tag('最近4年');
    var gateNote = '';
    if (k === 'gate' || k === 'payev') {
      if (a.stage === '免费') gateNote = '<div class="tip-note">免费 App，无付费内容</div>';
      else if (a.gates && a.gates.length) {
        gateNote = '<div class="tip-note"><b>描述里写明的收费功能：</b>' + a.gates.map(function (g) {
          var gd = U.DIM.gate, b = gd.bins[gd.binIndex[g]]; return U.esc(b ? b.label : g);
        }).join(' · ') + '<br>「' + U.esc((a.gateEv[a.gates[0]] || '').slice(0, 110)) + '…」</div>';
      } else {
        var ev = a.payEv || {};
        gateNote = '<div class="tip-note"><b>描述没写清，其他证据：</b>' + (Object.keys(ev).length
          ? Object.keys(ev).map(function (x) { return '<br>· ' + U.esc(ev[x]); }).join('')
          : '<br>· 四条途径都没找到 —— 需实机点一遍') + '</div>';
      }
    }
    var deep = (window.PANO_RESEARCH.deep || []).some(function (x) { return x.id === a.id; });
    return '<div class="tip-app">' + U.appIcon(a, 44) + '<div><b>' + U.esc(a.short) + '</b><small>' + U.esc(a.name) + '</small></div></div>' +
      '<div class="tip-chips">' + U.catChip(a.cat) + '<span class="mini-chip">' + U.layerName(a.layer) + '</span></div>' +
      '<div class="tip-cell">「' + U.esc(bin.label) + '」这一档共 <b>' + binN + '</b> 款' +
      (this.o.filterCat ? '' : '，其中' + c.label + ' <b>' + cellN + '</b> 款') + '</div>' +
      row('year', '首发', a.debut) +
      row('ratings', 'iOS 评分数', U.fmt(a.iosRatings) + ' · ' + (a.iosScore || '—') + '★') +
      row('android', 'Android 安装数', a.androidInstalls ? U.esc(a.androidInstalls) : '未见安卓版') +
      row('play', 'Google Play 评分数', a.androidInstalls ? U.esc(String(a.playRatings || '—')) + ' · ' + (a.playScore || '—') + '★' : '—') +
      row('price', '付费', U.priceLine(a)) +
      row('dl30', t30 + '下载', U.metricHtml(a, 'dl30')) +
      row('rev30', t30 + '收入', U.metricHtml(a, 'rev30')) +
      row('dl4y', t4 + '下载', U.metricHtml(a, 'dl4y')) +
      row('rev4y', t4 + '收入', U.metricHtml(a, 'rev4y')) +
      row('update', '最近更新', a.lastUpdate) + gateNote +
      '<div class="tip-foot">' + (deep ? '<span class="dot-badge">深度样本</span>' : '') + '点击查看详情 →</div>';
  };

  /* ---------- 图例 & 图内口径 ---------- */
  BlockTowers.prototype.renderLegend = function () {
    var el = this.o.legendEl, self = this;
    if (!el) return;
    var d = U.DIM[this.dimKey];
    var hasNA = d.bins.some(function (b) { return b.tone === 'na'; });
    if (this.colorMode === 'cat' && !this.o.filterCat) {
      el.innerHTML = '<span class="lg-title">类别</span>' + P.cats.map(function (c) {
        var n = self.apps.filter(function (a) { return a.cat === c.key; }).length;
        return '<button class="lg-cat" data-cat="' + c.key + '" style="--c:' + c.color + '">' + window.Glyph.svg(c.key, 15) +
          '<span>' + c.label + '</span><em>' + n + '</em></button>';
      }).join('') + '<span class="lg-hint">悬停聚焦 · 点击进入板块' + (hasNA ? ' · <b>半透明积木 = 该维度无数据</b>（不是档位）' : '') + '</span>';
      el.querySelectorAll('.lg-cat').forEach(function (b) {
        b.addEventListener('mouseenter', function () { self.setFocus(b.dataset.cat); });
        b.addEventListener('mouseleave', function () { self.setFocus(null); });
        b.addEventListener('focus', function () { self.setFocus(b.dataset.cat); });
        b.addEventListener('blur', function () { self.setFocus(null); });
        b.addEventListener('click', function () { if (self.o.onOpenCat) self.o.onOpenCat(b.dataset.cat); });
      });
    } else {
      var counts = {};
      this.apps.forEach(function (a) { var k = a.b[d.key]; counts[k] = (counts[k] || 0) + 1; });
      el.innerHTML = '<span class="lg-title">' + (d.tag ? U.tag(d.tag) : '') + U.esc(d.label) + '（浅 → 深）</span>' + d.bins.map(function (b) {
        var col = b.tone === 'na' ? S.NA_COLOR : b.tone === 'alt' ? S.ALT_COLOR : S.rampCss(d.ramp, d.maxTone ? b.tone / d.maxTone : 0.5);
        return '<span class="lg-tier"><i style="background:' + col + '"></i>' + U.esc(b.label) + '<em>' + (counts[b.key] || 0) + '</em></span>';
      }).join('') + '<span class="lg-hint">积木上的图标仍代表类别</span>';
    }
  };
  BlockTowers.prototype.renderCaveat = function () {
    var el = this.o.caveatEl;
    if (!el) return;
    var d = U.DIM[this.dimKey];
    el.innerHTML = '<span class="cav-tag">口径</span><span>' + U.esc(d.caveat) + '</span>';
    if (this.o.axisEl) this.o.axisEl.textContent = '横轴：' + d.axis + ' · 高度：款数（每块 = 1 款 App）';
  };

  window.BlockTowers = BlockTowers;
})();
