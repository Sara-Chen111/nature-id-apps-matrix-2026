/* ============================================================
   路由 + 三层页面（总览 / 板块详情 / 单款 App 详情）
   hash 路由：#overview  #cat/<key>  #app/<id>
   ============================================================ */
(function () {
  'use strict';
  var U = window.U, P = window.PANO, R0 = window.PANO_RESEARCH;

  var Router = {
    views: {}, current: null,
    register: function (k, v) { this.views[k] = v; },
    go: function (h, noScroll) {
      if (location.hash === h && this.current) return;
      if (location.hash !== h) { this.pendingScroll = !noScroll; location.hash = h; }
      else this._show(h);
    },
    _fromHash: function () {
      var h = (location.hash || '#overview').slice(1);
      var m = h.match(/^app\/([\w]+)$/);
      if (m) return { v: 'app', id: m[1] };
      m = h.match(/^cat\/([\w-]+)$/);
      if (m) return { v: 'cat', key: m[1] };
      return { v: 'overview' };
    },
    _show: function () {
      var r = this._fromHash();
      var key = r.v === 'app' ? 'app' : r.v;
      Object.keys(this.views).forEach(function (k) { document.getElementById('view-' + k).classList.toggle('active', k === key); });
      if (this.current && this.current.stop) this.current.stop();
      Zoom.hide();
      this.current = this.views[key];
      this.current.show(r);
      var sc = this.pendingScroll !== false;
      var target = this.pendingTarget;
      this.pendingTarget = null;
      requestAnimationFrame(function () {
        if (target) Nav.scrollTo(target);
        else if (sc) window.scrollTo({ top: 0 });
        Nav.sync(r);
      });
      this.pendingScroll = undefined;
    },
    start: function () {
      var self = this;
      window.addEventListener('hashchange', function () { self._show(); });
      this._show();
    }
  };

  function isDeep(id) { return R0.deep.some(function (d) { return d.id === id; }); }
  function kidCount() { return (P.features.filter(function (f) { return f.name === '儿童可用'; })[0] || {}).n || 0; }
  function dotList(items) {
    return '<ul class="dot-list">' + items.map(function (x) { return '<li>' + U.esc(x) + '</li>'; }).join('') + '</ul>';
  }

  /* ---------------- 维度按钮：时间口径标签 + 覆盖徽标 ---------------- */
  function dimButtons(dims, cur) {
    return dims.map(function (d) {
      return '<button data-dim="' + d.key + '"' + (d.key === cur ? ' class="on"' : '') + '>' + (d.tag ? U.tag(d.tag) : '') + d.label +
        (d.partial ? '<em>' + d.partial + '</em>' : '') + '</button>';
    }).join('');
  }

  /* ---------------- 面包屑 ---------------- */
  function crumb(r) {
    var el = document.getElementById('crumb');
    var html = '<button data-nav="#overview">总览</button>';
    if (r.v === 'cat') html += '<i>›</i><b>' + U.CAT[r.key].label + '</b>';
    if (r.v === 'app') {
      var a = U.APP[r.id];
      html += '<i>›</i>' + (a ? '<button data-nav="#cat/' + a.cat + '">' + U.CAT[a.cat].label + '</button><i>›</i><b>' + U.esc(a.short) + '</b>' : '<b>…</b>');
    }
    el.innerHTML = html;
    el.querySelectorAll('[data-nav]').forEach(function (b) {
      b.addEventListener('click', function () { Router.go(b.dataset.nav); });
    });
  }

  /* ---------------- 折叠块：标题按钮切换（默认收起） ---------------- */
  function bindFolds() {
    document.querySelectorAll('.fold-h').forEach(function (b) {
      if (b._bound) return;
      b._bound = true;
      b.addEventListener('click', function () {
        var body = document.getElementById(b.dataset.fold);
        var open = body.hidden;
        body.hidden = !open;
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
        b.closest('.fold').classList.toggle('open', open);
        b.querySelector('.fold-arrow').textContent = open ? '收起' : '展开';
      });
    });
  }

  /* ================================================================
     视图 1 · 总览
     ================================================================ */
  var Overview = {
    towers: null, board: null, dim: 'year', colorMode: 'cat', merged: true,
    show: function () {
      crumb({ v: 'overview' });
      document.title = '识别类APP竞品矩阵分析';
      if (this._init) return;
      this._init = true;

      var self = this;
      var m = P.meta;
      var has3D = window.Stage3D.hasWebGL();
      var MK = function (id) { return document.getElementById(id); };

      /* ---- 页眉数字 ---- */
      var SHORT = { plant: '植物', bird: '鸟', fish: '鱼钓', rock: '岩矿', multi: '综合', insect: '昆虫', fungi: '真菌' };
      var catLine = P.cats.slice().sort(function (a, b) { return b.n - a.n; }).map(function (c) { return SHORT[c.key] + ' ' + c.n; }).join(' · ');
      MK('hero-stats').innerHTML = [
        [String(m.n), '款竞品样本', 'A 层核心 ' + m.nA + ' + B 层相邻 ' + m.nB + '（含 ' + m.nNew + ' 款新增）'],
        [String(P.cats.length), '个识别板块', catLine],
        [String(m.nPaid), '款在收费', m.paid + ' 订阅 + ' + m.buyout + ' 买断；年付起步价中位数 ' + U.money(Math.round(m.yearMedian * 100) / 100) + '（' + m.yearN + ' 款有年付档）']
      ].map(function (s) {
        return '<div class="stat"><b>' + s[0] + '</b><span>' + s[1] + '</span><small>' + s[2] + '</small></div>';
      }).join('');

      /* ---- 一 · 积木塔 ---- */
      var tHost = MK('towers-host'), tOpts = {
        dim: this.dim, merged: this.merged, colorMode: this.colorMode, apps: P.apps, compact: true,
        legendEl: MK('towers-legend'), caveatEl: MK('towers-caveat'), axisEl: MK('towers-axis'),
        onOpenApp: function (id) { Router.go('#app/' + id); },
        onOpenCat: function (k) { Router.go('#cat/' + k); }
      };
      if (has3D) this.towers = new window.BlockTowers(tHost, tOpts);
      else this.towers = window.Fallback.blocks(tHost, tOpts);

      // 维度切换（「最近30天」「最近4年」两种时间口径用不同颜色的小标签区分）
      var dimBox = MK('dim-switch');
      dimBox.innerHTML = dimButtons(P.dims, self.dim);
      dimBox.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          dimBox.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          self.dim = b.dataset.dim;
          self.towers.setDim(self.dim);
        });
      });
      // 配色切换 + 视角工具
      var cmBox = MK('cm-switch');
      function paintCM() {
        cmBox.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x.dataset.cm === self.colorMode); });
      }
      cmBox.innerHTML = '<button data-cm="cat" class="on">按类别配色</button><button data-cm="tier">按档位深浅</button>';
      cmBox.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () { self.colorMode = b.dataset.cm; paintCM(); self.towers.setColorMode(self.colorMode); });
      });
      var tools = MK('towers-tools');
      tools.innerHTML =
        '<button id="tw-merge" class="tool on" title="展开 / 合并 7 个板块">' + window.Glyph.svg('multi', 15) + '分板块</button>' +
        '<button id="tw-flat" class="tool" title="切到正面平视，像平面图一样精确读数">☰ 正视读数</button>' +
        '<button id="tw-replay" class="tool" title="重播积木落塔动画">↻ 重播</button>' +
        '<button id="tw-fit" class="tool" title="恢复默认视角">⤢ 复位</button>';
      tools.querySelector('#tw-merge').addEventListener('click', function () {
        self.merged = !self.merged;
        this.classList.toggle('on', self.merged);
        self.towers.setMerged(self.merged);
      });
      tools.querySelector('#tw-flat').addEventListener('click', function () {
        var on = this.classList.toggle('on');
        this.innerHTML = on ? '↩ 退出正视' : '☰ 正视读数';
        self.towers.setFlat(on);
      });
      tools.querySelector('#tw-replay').addEventListener('click', function () { self.towers.intro(); });
      tools.querySelector('#tw-fit').addEventListener('click', function () { self.towers.reframe(); });
      this.towers.renderCaveat();
      this.towers.renderLegend();

      /* ---- 二 · 功能对比 ---- */
      var bHost = MK('board-host'), bOpts = {
        legendEl: MK('board-legend'), caveatEl: MK('board-caveat'),
        onOpenCat: function (k) { Router.go('#cat/' + k); }
      };
      if (has3D) this.board = new window.Board(bHost, bOpts);
      else this.board = window.Fallback.board(bHost, bOpts);
      var bTabs = MK('board-tabs');
      bTabs.innerHTML = '<button data-m="matrix" class="on">功能 × 板块</button><button data-m="comp">板块经营对比</button>';
      var bTools = MK('board-tools');
      bTools.innerHTML = '<button id="bd-flat" class="tool">☰ 正视读数</button><button id="bd-val" class="tool">◑ 覆盖率上色</button><button id="bd-fit" class="tool">⤢ 复位</button>';
      bTabs.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          bTabs.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          self.board.setMode(b.dataset.m);
          document.getElementById('board-val-note').textContent = b.dataset.m === 'matrix' ? '' : '三组柱同刻度：柱高 = 款数占比（合计 100%）';
          bTools.querySelector('#bd-val').style.display = b.dataset.m === 'matrix' ? '' : 'none';
        });
      });
      bTools.querySelector('#bd-flat').addEventListener('click', function () {
        var on = this.classList.toggle('on');
        this.innerHTML = on ? '↩ 退出正视' : '☰ 正视读数';
        self.board.setFlat(on);
      });
      bTools.querySelector('#bd-val').addEventListener('click', function () {
        var on = this.classList.toggle('on');
        self.board.setValueColor(on);
      });
      bTools.querySelector('#bd-fit').addEventListener('click', function () { self.board.reframe(); });
      document.getElementById('board-val-note').textContent = '';

      /* ---- 三 · 收费业务分析（同积木塔形式：先看「收费功能」，再看「怎么收费」）---- */
      this.payDim = 'gate';
      var pHost = MK('pay-host'), pOpts = {
        dim: this.payDim, merged: true, colorMode: 'tier', apps: P.apps,
        legendEl: MK('pay-legend'), caveatEl: MK('pay-caveat'), axisEl: MK('pay-axis'),
        onOpenApp: function (id) { Router.go('#app/' + id); },
        onOpenCat: function (k) { Router.go('#cat/' + k); }
      };
      this.pay = has3D ? new window.BlockTowers(pHost, pOpts) : window.Fallback.blocks(pHost, pOpts);
      var paySw = MK('pay-switch');
      paySw.innerHTML = P.payDims.map(function (d) {
        return '<button data-dim="' + d.key + '"' + (d.key === self.payDim ? ' class="on"' : '') + '>' + d.label + '</button>';
      }).join('');
      paySw.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          paySw.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          self.pay.setDim(b.dataset.dim);
        });
      });
      var payCm = MK('pay-cm');
      payCm.innerHTML = '<button data-cm="tier" class="on">按档位深浅</button><button data-cm="cat">按类别配色</button>';
      payCm.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          payCm.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
          self.pay.setColorMode(b.dataset.cm);
        });
      });
      var payTools = MK('pay-tools');
      payTools.innerHTML = '<button class="tool" data-t="flat">☰ 正视读数</button><button class="tool" data-t="replay">↻ 重播</button><button class="tool" data-t="fit">⤢ 复位</button>';
      payTools.querySelector('[data-t="flat"]').addEventListener('click', function () {
        var on = this.classList.toggle('on');
        this.innerHTML = on ? '↩ 退出正视' : '☰ 正视读数';
        self.pay.setFlat(on);
      });
      payTools.querySelector('[data-t="replay"]').addEventListener('click', function () { self.pay.intro(); });
      payTools.querySelector('[data-t="fit"]').addEventListener('click', function () { self.pay.reframe(); });
      this.pay.renderCaveat();
      this.pay.renderLegend();

      // 「描述没写清」的收费款，按能找到的最强证据分层（回答：未明示的还能从哪查）
      function evBar() {
        var e = m.payEv || {}, d = U.DIM.payev, order = ['desc', 'review', 'store', 'android', 'iap', 'none'];
        var tot = order.reduce(function (s, k) { return s + (e[k] || 0); }, 0) || 1;
        var col = function (k) { var b = d.bins[d.binIndex[k]]; return b.tone === 'na' ? window.Stage3D.NA_COLOR : b.tone === 'alt' ? window.Stage3D.ALT_COLOR : window.Stage3D.rampCss(d.ramp, b.tone / d.maxTone); };
        return '<div class="ev-head"><b>「描述没写清」还能从哪查</b><small>收费 ' + m.nPaid + ' 款按最强证据分层 · 切到上方「收费证据」维度可逐款看</small></div>' +
          '<div class="ev-bar">' + order.map(function (k) {
            return e[k] ? '<i style="width:' + (e[k] / tot * 100).toFixed(1) + '%;background:' + col(k) + '" title="' + U.esc(d.bins[d.binIndex[k]].label) + ' ' + e[k] + ' 款"></i>' : '';
          }).join('') + '</div><div class="ev-legend">' + order.map(function (k) {
            return '<span><i style="background:' + col(k) + '"></i>' + U.esc(d.bins[d.binIndex[k]].label) + ' <b>' + (e[k] || 0) + '</b></span>';
          }).join('') + '</div>';
      }
      // 配套：① 描述里「付费能得到什么」的提及次数 ② 实拍截图确认的真实锁点
      var gr = P.gateRank, gmax = gr.length ? gr[0].n : 1;
      MK('featpay').innerHTML =
        '<div class="fp-cols"><div><div class="fp-head"><b>付费最常卖什么</b><small>' + P.gateAny + ' / ' + m.nPaid +
        ' 款收费 App 的商店描述写明了付费权益；一款可提多项，条长 = 提及款数</small></div><div class="fp-rows">' +
        gr.map(function (r) {
          return '<div class="fp-row g"><span>' + U.esc(r.label) + '</span><i style="--w:' + (r.n / gmax * 100).toFixed(1) + '%"></i><b>' + r.n + '</b></div>';
        }).join('') + '</div>' + evBar() + '</div>' +
        '<div><div class="fp-head"><b>实拍确认的锁点</b><small>描述没写≠没有墙：逐屏截图里真实看到的付费位置</small></div><div class="lock-list">' +
        R0.summary.locks.map(function (L) {
          return '<button class="lock-row" data-app="' + L.app + '"><b>' + U.esc(L.name) + '</b><span>' +
            L.locks.map(function (x) { return '<em>' + U.esc(x) + '</em>'; }).join('') + '</span></button>';
        }).join('') + '</div></div></div>';
      MK('featpay').querySelectorAll('.lock-row').forEach(function (b) {
        b.addEventListener('click', function () { Router.go('#app/' + b.dataset.app); });
      });

      /* ---- 七大识别板块 ---- */
      var strip = MK('cat-strip');
      strip.innerHTML = P.cats.map(function (c) {
        var top = U.APP[c.top[0]];
        return '<button class="cat-card" data-cat="' + c.key + '" style="--c:' + c.color + '">' +
          '<span class="cc-head">' + window.Glyph.svg(c.key, 22) + '<b>' + c.label + '</b><em>' + c.n + ' 款</em></span>' +
          '<span class="cc-line">A 层 ' + c.nA + (c.nB ? ' · B 层 ' + c.nB : '') + ' · 收费 ' + c.paid + '/' + c.n + '</span>' +
          '<span class="cc-line">Top1 ' + U.esc(top ? top.short : '—') + '（' + U.fmtW(top ? top.iosRatings : 0) + ' 评分）</span>' +
          '<span class="cc-go">进入板块 ›</span></button>';
      }).join('');
      strip.querySelectorAll('.cat-card').forEach(function (b) {
        b.addEventListener('click', function () { Router.go('#cat/' + b.dataset.cat); });
      });

      /* ---- 深度样本交互分析（6 款，Sara 定的顺序与副标题）---- */
      var deep = MK('deep-strip');
      deep.innerHTML = R0.deep.map(function (d) {
        var a = U.APP[d.id], ch = R0.chains[d.id], sh = window.PANO_SHOTS && window.PANO_SHOTS[d.id];
        var tags = (ch ? '<em class="dt chain">链路 ' + ch.steps.length + ' 步</em>' : '') + (sh && sh.length ? '<em class="dt">截图 ' + sh.length + ' 张</em>' : '');
        return '<button class="deep-card" data-app="' + d.id + '">' + U.appIcon(a, 46) +
          '<b>' + U.esc(d.name) + '</b><span>' + U.esc(d.sub) + '</span><span class="dt-row">' + tags + '</span></button>';
      }).join('');
      deep.querySelectorAll('.deep-card').forEach(function (b) {
        b.addEventListener('click', function () { Router.go('#app/' + b.dataset.app); });
      });

      /* ---- 总结 ---- */
      this.renderOverall();
      this.renderCatalog();
      this.renderInsight();

      /* ---- 数据底账（数据源说明，默认收起）---- */
      var nShots = Object.keys(window.PANO_SHOTS || {}).reduce(function (s, k) { return s + window.PANO_SHOTS[k].length; }, 0);
      var kc = m.kcoef || {};
      var rows = [
        ['竞品矩阵 ' + m.n + ' 款：类别 / 年份 / 评分 / 付费 / 安卓 / 价格', '10-数据基准与底表/前期调研_D1_交付/xlsx-1_竞品矩阵_基本信息与商业模式_V3｜最终版.xlsx'],
        ['下载 / 收入（页面统一叫「最近30天 / 最近4年」）：有七麦截图的款（下载 ' + m.nCalDl + ' 款、收入 ' + m.nCal + ' 款）= 七麦 iPhone 估算 × 校准系数（收入 ' +
          (kc.rev || 0).toFixed(3) + ' / 下载 ' + (kc.dl || 0).toFixed(3) + '，以点点为准拟合）；其余款用点点档位、按档位下限归档（标「下限」）',
          '同上 V3 表 AM–AY 列 + 新增数据_类目TOP3【zcode】/点点档位_109款_美区AppStore_20261107.csv'],
        ['功能位 14 项（含原文证据）', '同目录 xlsx-2_功能位对照_14项含证据.xlsx'],
        ['价格结构：试用 / 入门周期 / 入门价带', '同目录 xlsx-4_付费墙与弹窗清单.xlsx「官方价格档」'],
        ['官方怎么证明认得准：商店描述原文 + 科研机构关系 + 深度样本实拍', '90-原始数据/前期调研_D1_数据/_work/feat_scan/descs.json · xlsx-9（只取科研机构）'],
        ['公司档案 · 活动 · 社群', '02-板块二_母公司档案 / 03-板块三_运营层解剖 / 00-汇报框架/07'],
        ['实拍交互截图（7 款 ' + nShots + ' 张）', '11-交互截图素材/'],
        ['启示 · 开放数据与合作机构 / 成人版硬件（2026-11-07 联网核实，附来源链接）', '本页 docs/ 两份核查'],
        ['数据抓取时间', '商店字段 2026-11-02 · 七麦 / 点点 2026-11-07']
      ];
      MK('baseline').innerHTML = rows.map(function (r) {
        return '<div class="bl-row"><span>' + U.esc(r[0]) + '</span><code>' + U.esc(r[1]) + '</code></div>';
      }).join('');
      bindFolds();
    },

    /* ---------- 总结 1 · 整体APP情况：一句话 + 四个支撑数 ---------- */
    renderOverall: function () {
      var m = P.meta, C = P.conc, r4 = C.rev4y, plant = U.CAT.plant;
      var pc = function (x) { return Math.round(x * 100) + '%'; };
      var kids = P.apps.filter(function (a) { return a.f[P.features.map(function (f) { return f.name; }).indexOf('儿童可用')]; });
      var kidNames = kids.map(function (a) { return a.short; }).join('、') || '无';
      var one = '识别类 App 是一门「头部通吃」的成人订阅生意：' + m.n + ' 款里 ' + m.nPaid + ' 款收费，最近 4 年收入前 10 名拿走约 ' + pc(r4.top10) +
        '、植物一类约占 ' + pc(C.catRev4y.plant) + '，而明示为孩子设计的只有 ' + kids.length + ' 款。';
      var facts = [
        ['收费普遍', m.nPaid + ' / ' + m.n, m.paid + ' 款订阅 + ' + m.buyout + ' 款买断；年付起步价中位数 ' + U.money(m.yearMedian) + '，' + m.weekly + ' 款用周付入门'],
        ['头部通吃', pc(r4.top10), '最近 4 年收入前 10 名的份额；' + r4.names[0] + ' 一款约 ' + pc(r4.top1) + '，过 $1000 万的只有 ' + r4.ge1e7 + ' 款'],
        ['植物独大', pc(C.catRev4y.plant), '植物 ' + plant.n + ' 款（占 ' + U.pct(plant.n, m.n, 0) + '）拿走的收入份额；鸟类的口碑头部反而是免费机构款'],
        ['儿童空位', kids.length + ' 款', '明示儿童可用的只有 ' + kidNames + '；能认多个类群的综合款也只有 ' + U.CAT.multi.n + ' 款']
      ];
      document.getElementById('sum-overall').innerHTML =
        '<p class="one-line">' + U.esc(one) + '</p>' +
        '<div class="ov-facts">' + facts.map(function (f) {
          return '<div class="ov-fact"><span>' + f[0] + '</span><b>' + U.esc(f[1]) + '</b><small>' + U.esc(f[2]) + '</small></div>';
        }).join('') + '</div>' +
        '<p class="fine">收入 = 七麦截图校准估算（' + m.nCal + ' 款）+ 无截图款按档位下限；免费 App 计 0。无截图款偏低估，集中度只会略偏高，只看量级。</p>';
    },

    /* ---------- 总结 2 · 品类总览（默认收起）---------- */
    renderCatalog: function () {
      var R = R0, m = P.meta, MK = function (id) { return document.getElementById(id); };
      // 什么类型最多
      var maxN = Math.max.apply(null, P.cats.map(function (c) { return c.n; }));
      MK('sum-types').innerHTML = P.cats.slice().sort(function (a, b) { return b.n - a.n; }).map(function (c) {
        return '<button class="ty-row" data-cat="' + c.key + '" style="--c:' + c.color + '">' + window.Glyph.svg(c.key, 18) +
          '<span class="ty-l">' + c.label + '</span><span class="ty-bar"><i style="width:' + (c.n / maxN * 100).toFixed(1) + '%"></i></span>' +
          '<b>' + c.n + '</b><em>' + U.pct(c.n, m.n, 0) + ' · 收费 ' + c.paid + '</em></button>';
      }).join('');
      MK('sum-types').querySelectorAll('.ty-row').forEach(function (b) {
        b.addEventListener('click', function () { Router.go('#cat/' + b.dataset.cat); });
      });
      // 收费款多做哪些功能（全 14 项，收费款 vs 免费款）
      MK('sum-featpay-sub').textContent = '收费 ' + m.nPaid + ' 款 vs 免费 ' + m.nFree + ' 款的功能覆盖率（14 功能位）';
      var pos = P.featPay.filter(function (r) { return r.gap >= 0.1; }).slice(0, 4).map(function (r) { return r.name; });
      var neg = P.featPay.filter(function (r) { return r.gap <= -0.1; }).map(function (r) { return r.name; });
      MK('sum-featpay').innerHTML = '<div class="fp2-legend"><i class="p"></i>收费 ' + m.nPaid + ' 款<i class="f"></i>免费 ' + m.nFree + ' 款</div>' +
        P.featPay.map(function (r) {
          return '<div class="fp2-row"><span>' + U.esc(r.name) + '</span><span class="fp2-bars"><i class="p" style="width:' +
            Math.round(r.paidPct * 100) + '%"></i><i class="f" style="width:' + Math.round(r.freePct * 100) + '%"></i></span><b class="' +
            (r.gap >= 0.05 ? 'pos' : r.gap <= -0.05 ? 'neg' : '') + '">' + (r.gap >= 0 ? '+' : '') + Math.round(r.gap * 100) + '</b></div>';
        }).join('') + '<p class="fine">右侧 = 收费款减免费款的覆盖率差（百分点）。' + pos.join(' / ') + ' 是「收费款更爱做」的' +
        (neg.length ? '；' + neg.join('、') + ' 在免费的机构款里更常见' : '') + '。</p>';
      // 识别结果给什么（不同 App 分行、前面小黑点）
      MK('sum-aspects').innerHTML = R.summary.resultAspects.map(function (x) {
        return '<div class="asp"><span class="asp-tag">' + U.esc(x.tag) + '</span><b>' + U.esc(x.t) + '</b>' + dotList(x.items) + '</div>';
      }).join('');
      // 官方怎么证明「认得准、答得专业」
      var V = P.verify, n = m.n;
      var freeIn = function (k) { return V.byMethod[k].filter(function (x) { return U.APP[x.id].stage === '免费'; }).length; };
      MK('sum-verify').innerHTML = V.methods.map(function (x) {
        var L = V.byMethod[x.key];
        return '<button class="vf-row" type="button" data-k="' + x.key + '"><span class="vf-l"><b>' + U.esc(x.label) + '</b><small>' + U.esc(x.desc) + '</small></span>' +
          '<span class="vf-bar"><i style="width:' + Math.max(1.5, L.length / n * 100).toFixed(1) + '%"></i></span><b class="vf-n">' + L.length + '</b>' +
          '<span class="vf-apps">' + L.slice(0, 4).map(function (y) { return U.esc(y.app); }).join(' · ') + (L.length > 4 ? ' …' : '') + '</span></button>';
      }).join('') +
        '<div class="vf-none"><b>' + V.none.length + ' / ' + n + '</b> 款对「为什么认得准」一句话都没写</div>' +
        '<p class="fine">科研机构出品的 ' + V.byMethod.inst.length + ' 款里 ' + freeIn('inst') + ' 款免费、社区复审的 ' + V.byMethod.community.length + ' 款里 ' + freeIn('community') +
        ' 款免费——最硬的验证几乎都在免费机构款（Merlin、Seek、eBird、iNaturalist、Pl@ntNet）。商业款最常见的是自报准确率（多为 97–99%）和宣称物种库规模，只说明「认得多」，不说明「认得准」。' +
        '矩阵外的 Flora Incognita 由伊尔梅瑙工业大学 × 马普所出品，拍摄前教学 + 可追加特征图，官宣 98.8%（厂商自报）。</p>';
      MK('sum-verify').querySelectorAll('.vf-row').forEach(function (b) {
        b.addEventListener('click', function () { Pop.verify(b.dataset.k); });
      });
      // 识别跑在哪
      var rc = m.recog, rtot = rc.reduce(function (s, x) { return s + x[1]; }, 0);
      var rcol = { '云端（宣称）': '#4F82B1', '混合/表述矛盾': '#8AB1D2', '端侧/离线可用（宣称）': '#5AA6A6' };
      var unk = rc.filter(function (x) { return /未明示/.test(x[0]); }).reduce(function (s, x) { return s + x[1]; }, 0);
      MK('sum-recog').innerHTML = '<div class="rb">' + rc.map(function (x) {
        return '<i style="width:' + (x[1] / rtot * 100).toFixed(1) + '%;background:' + (rcol[x[0]] || '#DDD8CC') + '" title="' + U.esc(x[0]) + ' ' + x[1] + '"></i>';
      }).join('') + '</div><div class="rb-l">' + rc.map(function (x) {
        return '<span><i style="background:' + (rcol[x[0]] || '#DDD8CC') + '"></i>' + U.esc(x[0]) + ' <b>' + x[1] + '</b></span>';
      }).join('') + '</div><p class="fine">识别端云 = 商店描述里的宣称' + (unk ? '；' + unk + ' 款未明示' : '') + '。模型与训练数据见下方「给我们的启示 · 素材库与合作方向」。</p>';
      MK('sum-models').innerHTML = R.summary.models.map(function (x) {
        return '<div class="mdl"><span class="mdl-tag">' + U.esc(x.tag) + '</span><b>' + U.esc(x.t) + '</b><p>' + U.esc(x.d) + '</p></div>';
      }).join('');
      // 七板块解读
      MK('sum-typeread').innerHTML = R.summary.types.map(function (x) {
        return '<div class="tyr"><b>' + U.esc(x.t) + '</b><p>' + U.esc(x.d) + '</p></div>';
      }).join('');
    },

    /* ---------- 总结 3 · 给我们的启示 ---------- */
    renderInsight: function () {
      var I = R0.insight, esc = U.esc;
      var OK = { yes: ['ok-yes', '可商用'], mix: ['ok-mix', '筛选后可商用'], paid: ['ok-paid', '付费可商用'], deal: ['ok-deal', '需授权 / 合作'], no: ['ok-no', '不可商用'] };
      // ① APP收费项目：款数来自 data.js，解读与修正来自 research.js
      var pay = '<div class="ins-card"><h4><i>①</i>APP 收费项目</h4><p class="ins-lead">' + esc(I.pay.lead) + '</p><div class="pc-grid">' +
        I.pay.cats.map(function (x) {
          var c = U.CAT[x.cat];
          return '<div class="pc-card" style="--c:' + c.color + '"><div class="pc-h">' + window.Glyph.svg(c.key, 18) + '<b>' + esc(x.head) + '</b></div>' +
            '<div class="pc-chips">' + c.gates.slice(0, 5).map(function (g) { return '<span>' + esc(g.label) + '<em>' + g.n + '</em></span>'; }).join('') + '</div>' +
            '<small class="pc-n">本类 ' + c.nPaid + ' 款收费，' + c.nPaidDesc + ' 款在商店描述里写明了收费内容（数字 = 写明的款数）</small>' +
            dotList(x.items) + (x.fix ? '<p class="pc-fix"><b>对照修正</b>' + esc(x.fix) + '</p>' : '') + '</div>';
        }).join('') + '</div></div>';
      // ② 产品功能方面：素材库表 + 三条
      var D = I.datasets;
      var table = '<div class="ds-wrap"><table class="ds-table"><thead><tr><th>类群</th><th>数据 / 机构</th><th>规模</th><th>能否商用</th><th>怎么拿</th></tr></thead><tbody>' +
        D.groups.map(function (g) {
          return g.rows.map(function (r, i) {
            var o = OK[r.ok] || OK.mix;
            return '<tr>' + (i === 0 ? '<th rowspan="' + g.rows.length + '" class="ds-g">' + esc(g.g) + '</th>' : '') +
              '<td><b>' + esc(r.n) + '</b><small>' + esc(r.who) + '</small></td><td>' + esc(r.size) + '</td>' +
              '<td><span class="ok ' + o[0] + '">' + o[1] + '</span><small>' + esc(r.lic) + '</small></td><td>' + esc(r.get) + '</td></tr>';
          }).join('');
        }).join('') + '</tbody></table></div><p class="fine">' + esc(D.foot) + '</p>';
      var prod = '<div class="ins-card"><h4><i>②</i>产品功能方面</h4>' +
        '<div class="ins-pt"><h5>素材库与合作方向</h5><p class="ins-lead">' + esc(D.lead) + '</p>' + table + '</div>' +
        I.product.map(function (p) { return '<div class="ins-pt"><h5>' + esc(p.t) + '</h5>' + dotList(p.items) + '</div>'; }).join('') + '</div>';
      // ③ 商业上：年费 + 成人版硬件
      var H = I.hardware;
      var biz = '<div class="ins-card"><h4><i>③</i>商业上</h4>' +
        I.biz.map(function (p) { return '<div class="ins-pt"><h5>' + esc(p.t) + '</h5>' + dotList(p.items) + '</div>'; }).join('') +
        '<div class="ins-pt"><h5>' + esc(H.t) + '</h5><p class="ins-lead">' + esc(H.lead) + '</p><div class="hw-grid">' +
        H.groups.map(function (g) {
          return '<div class="hw-card"><b class="hw-g">' + esc(g.g) + '</b><p class="hw-note">' + esc(g.note) + '</p>' +
            g.rows.map(function (r) {
              return '<div class="hw-row"><span class="hw-n">' + esc(r.n) + '</span><span class="hw-p">' + esc(r.p) + '</span><small>' + esc(r.d) + '</small></div>';
            }).join('') + '</div>';
        }).join('') + '</div><p class="fine">' + esc(H.foot) + '</p></div></div>';
      document.getElementById('sum-insight').innerHTML = pay + prod + biz;
    },
    stop: function () {
      [this.towers, this.board, this.pay].forEach(function (x) { if (x && x.stage && x.stage.hideTip) x.stage.hideTip(); });
    }
  };

  /* ================================================================
     视图 2 · 板块详情
     ================================================================ */
  var CatView = {
    show: function (r) {
      var c = U.CAT[r.key];
      if (!c) { Router.go('#overview'); return; }
      crumb({ v: 'cat', key: r.key });
      document.title = c.label + '板块 · 识别类APP竞品矩阵分析';
      var list = P.apps.filter(function (a) { return a.cat === r.key; });
      var self = this;

      // 3D 实例只建一次，切换板块时换数据（反复新建会把浏览器的 WebGL 上下文用光）
      if (!this.towers) {
        var host = document.getElementById('cat-towers');
        var opts = {
          dim: 'year', merged: true, colorMode: 'cat', apps: list, filterCat: r.key,
          onOpenApp: function (id) { Router.go('#app/' + id); }
        };
        this.towers = window.Stage3D.hasWebGL() ? new window.BlockTowers(host, opts) : window.Fallback.blocks(host, opts);
      } else if (this._current !== r.key) {
        this.towers.o.filterCat = r.key;
        this.towers.dimKey = 'year';
        this.towers.setApps(list);
        if (this.towers.intro) this.towers.intro();
      }

      var dimSel = document.getElementById('cat-dim');
      var dimKeys = ['year', 'ratings', 'price', 'dl30', 'rev30', 'dl4y', 'rev4y', 'feat'];
      var curDim = this.towers.dimKey;
      dimSel.innerHTML = dimButtons(dimKeys.map(function (k) { return U.DIM[k]; }), curDim);
      dimSel.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          dimSel.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          self.towers.setDim(b.dataset.dim);
        });
      });

      var rank = list.slice().sort(function (a, b) { return b.iosRatings - a.iosRatings; });
      var yearMin = Math.min.apply(null, list.map(function (a) { return +a.debut.slice(0, 4); }));
      document.getElementById('cat-head').innerHTML =
        '<span class="cat-chip big" style="--c:' + c.color + '">' + window.Glyph.svg(c.key, 22) + c.label + '</span>' +
        '<div class="cat-stats"><span><b>' + c.n + '</b> 款（A 层 ' + c.nA + (c.nB ? ' + B 层 ' + c.nB : '') + '）</span>' +
        '<span><b>' + c.paid + '/' + c.n + '</b> 在收费</span>' +
        '<span><b>' + yearMin + '</b> 年出现首款</span>' +
        '<span><b>' + c.since2021 + '</b> 款 2021 年后上架</span></div>';
      document.getElementById('cat-towers-axis').textContent = '本板块 ' + c.n + ' 款 · 横轴可切换 · 每块积木 = 1 款 App（点击进详情）';
      document.getElementById('cat-towers-title').textContent = c.label + ' · 分布积木';

      // 功能强项/短板
      var feats = P.features.map(function (f, i) {
        return { f: f, k: c.feat[i], p: c.feat[i] / c.n, d: c.feat[i] / c.n - f.pct };
      }).sort(function (x, y) { return y.d - x.d; });
      function featLi(x) {
        return '<li><span>' + x.f.name + '</span><b>' + Math.round(x.p * 100) + '%</b><em>' +
          (x.d >= 0 ? '+' : '') + Math.round(x.d * 100) + ' pp vs 全部</em></li>';
      }
      document.getElementById('cat-feats').innerHTML =
        '<div class="feat-col"><h4>强项 <small>领先全部均值最多</small></h4><ul>' + feats.slice(0, 5).map(featLi).join('') + '</ul></div>' +
        '<div class="feat-col"><h4>短板 <small>落后全部均值最多</small></h4><ul>' + feats.slice(-5).reverse().map(featLi).join('') + '</ul></div>' +
        '<p class="feat-note">pp = 百分点（百分点 = 差值单位，1 pp = 1%）；对比基准 = 全部 ' + P.meta.n + ' 款的覆盖率。「儿童可用」全库仅 ' + kidCount() + ' 款明示。</p>';

      // Top App 排行
      document.getElementById('cat-top').innerHTML = rank.map(function (a, i) {
        return '<button class="rank-card" data-app="' + a.id + '">' +
          '<i class="rk">' + (i + 1) + '</i>' + U.appIcon(a, 46) +
          '<span class="rk-body"><b>' + U.esc(a.short) + '</b><small>' + U.esc(a.pub) + '</small></span>' +
          '<span class="rk-nums"><b>' + U.fmtW(a.iosRatings) + '</b><small>评分数</small></span>' +
          '<span class="rk-nums"><b>' + (a.iosScore || '—') + '</b><small>评分</small></span>' +
          '<span class="rk-nums"><b>' + U.priceLine(a).replace('年付起步 ', '') + '</b><small>付费</small></span>' +
          (isDeep(a.id) ? '<span class="dot-badge">深度样本</span>' : '') + '</button>';
      }).join('');
      document.getElementById('cat-top').querySelectorAll('.rank-card').forEach(function (b) {
        b.addEventListener('click', function () { Router.go('#app/' + b.dataset.app); });
      });
      this._current = r.key;
    },
    stop: function () { if (this.towers && this.towers.stage) this.towers.stage.hideTip(); }
  };

  /* ================================================================
     视图 3 · 单款 App 详情
     ================================================================ */
  var AppView = {
    show: function (r) {
      var a = U.APP[r.id];
      if (!a) { Router.go('#overview'); return; }
      crumb({ v: 'app', id: r.id });
      var SH = window.PANO_SHOTS && window.PANO_SHOTS[r.id];
      var u = U;
      document.title = a.short + ' · 识别类APP竞品矩阵分析';
      var vlabel = {};
      P.verify.methods.forEach(function (x) { vlabel[x.key] = x.label; });

      var facts = a.special ? a.facts.map(function (x) { return '<li>' + u.esc(x) + '</li>'; }).join('') : [
        '出品方 ' + u.esc(a.pub) + ' · ' + u.layerName(a.layer),
        '上架 ' + a.debut + ' · 最近更新 ' + a.lastUpdate + ' · 体积 ' + (a.sizeMB || '—') + ' MB',
        'iOS 评分 ' + u.fmt(a.iosRatings) + ' 条 · 均分 ' + (a.iosScore || '—'),
        a.recentAvg != null
          ? '2026 年近期均分 ' + a.recentAvg + '（n=' + a.recentN + ' 条评论）' + (a.recent1star ? ' · 其中 1★ ' + a.recent1star + ' 条' : '')
          : '2026 年近期均分：' + u.esc(a.recentNote || '样本不足'),
        a.androidInstalls ? 'Android 安装数 ' + u.esc(a.androidInstalls) + ' · Google Play 评分 ' + u.esc(String(a.playRatings || '—')) + ' 条 · 均分 ' + (a.playScore || '—')
          : 'Android：未见安卓版（以 iOS 为准）',
        '变现：' + (a.stage === '免费' ? '免费' : a.monetHint + '（' + a.stage + '）') + ' · 广告 ' + (a.ads || '—'),
        a.stage !== '免费' ? '价格档（官方页）：年付 ' + u.moneyList(a.yearly) + ' ｜ 月付 ' + u.moneyList(a.monthly) + ' ｜ 周付 ' + u.moneyList(a.weekly) + ' ｜ 季付 ' + u.moneyList(a.quarterly) +
          '　证据 ' + u.esc(a.priceEvidence || '—') : '无内购字段',
        '上架 ' + (a.countries || '—') + ' 国 · ' + (a.languages || '—') + ' 种语言 · 年龄分级 ' + a.age,
        u.tag('最近30天') + '下载 ' + u.metricHtml(a, 'dl30') + ' · 收入 ' + u.metricHtml(a, 'rev30'),
        u.tag('最近4年') + '下载 ' + u.metricHtml(a, 'dl4y') + ' · 收入 ' + u.metricHtml(a, 'rev4y'),
        a.pubNum ? '<b>公开数字</b>：' + u.esc(a.pubNum.dl || '—') + ' ｜ ' + u.esc(a.pubNum.rev || '—') + '　<span class="cav-tag">' + u.esc(a.pubNum.caliber || '') + '</span> ' + u.esc(a.pubNum.source || '') : null,
        a.stage !== '免费' ? '价格结构：' + (a.trialDays ? a.trialDays + ' 天试用' : '官方页未写试用') + ' · 入门 ' +
          (a.entryCycle ? a.entryCycle + '付 ' + u.money(a.entryPrice) : a.stage === '买断' ? '买断' : '未标周期') : null,
        a.stage !== '免费' ? '<b>收费功能</b>：' + (a.gates && a.gates.length
          ? a.gates.map(function (g) { var d = U.DIM.gate, b = d.bins[d.binIndex[g]]; return u.esc(b ? b.label : g); }).join(' · ') + '（描述原文）'
          : '描述未写明；' + u.esc(u.binLabel(a, 'payev')) + (a.payEv ? '：' + u.esc(Object.values(a.payEv)[0] || '') : '')) : null,
        (function () {
          var L = (R0.summary.locks || []).filter(function (x) { return x.app === a.id; })[0];
          return L ? '<b>实拍锁点</b>：' + L.locks.map(u.esc).join('；') + '（逐屏截图确认）' : null;
        })(),
        '<b>怎么证明认得准</b>：' + (a.verify && a.verify.length ? a.verify.map(function (v) { return u.esc(vlabel[v.k] || v.k); }).join(' · ') : '商店描述里没有说明')
      ].filter(function (x) { return x; }).map(function (x) { return '<li>' + x + '</li>'; }).join('');

      var CH = R0.chains[r.id], CO = R0.company[r.id];
      var shotSrc = function (i) { return SH && SH[i - 1] ? SH[i - 1].src : ''; };

      // 交互链路：每一步 = 实拍截图区间；悬停看截图（说明文字只在浮层里出现），点击跳到画廊对应屏
      var chain = '';
      if (CH && SH && SH.length) {
        chain = '<h3>交互链路</h3><div class="chain-verdict">' + u.esc(CH.verdict) + '</div>' +
          '<div class="chain" id="chain">' + CH.steps.map(function (s, i) {
            var rng = s.shot2 ? '屏 ' + s.shot + '–' + s.shot2 : '屏 ' + s.shot;
            return '<button class="chain-step' + (s.key ? ' key' : '') + '" data-shot="' + (s.show || s.shot) + '" data-i="' + i + '">' +
              '<i class="cs-no">' + (i + 1) + '</i><span class="cs-t">' + u.esc(s.t) + '</span><span class="cs-r">' + rng + '</span></button>';
          }).join('<span class="chain-arrow" aria-hidden="true">→</span>') +
          '<div class="chain-pop" id="chain-pop"><img alt=""><span></span></div></div>';
      }

      // 公司与业务 + 汇总分析（热度第一条自动接 V3 的下载 / 收入档）
      var company = '';
      if (CO) {
        var blk = function (title, ico, arr) {
          return arr && arr.length ? '<div class="agg-blk"><h5>' + ico + ' ' + title + '</h5><ul>' + arr.map(function (x) { return '<li>' + u.esc(x) + '</li>'; }).join('') + '</ul></div>' : '';
        };
        var heat = a.special ? CO.heat : ['最近 4 年：下载 ' + u.metricText(a, 'dl4y') + ' · 收入 ' + u.metricText(a, 'rev4y') +
          '；最近 30 天：下载 ' + u.metricText(a, 'dl30') + ' · 收入 ' + u.metricText(a, 'rev30')].concat(CO.heat);
        company = '<h3>公司与业务</h3><div class="co-card"><div class="co-head"><b>' + u.esc(CO.co) + '</b>' +
          '<span class="mini-chip">' + u.esc(CO.hq) + '</span><span class="mini-chip">' + u.esc(CO.nature) + '</span><span class="mini-chip">团队 ' + u.esc(CO.size) + '</span></div>' +
          '<ul class="co-biz">' + CO.biz.map(function (x) { return '<li>' + u.esc(x) + '</li>'; }).join('') + '</ul></div>' +
          '<h3>汇总分析</h3><div class="agg-grid">' +
          blk('网上热度', '◐', heat) + blk('用户使用反馈', '✎', CO.feedback) + blk('近一年线上/线下活动', '◎', CO.act) +
          blk('学校 · 社区 · 机构合作', '⌂', CO.partner) + blk('商业参考', '◇', CO.ref) + '</div>' +
          '<p class="src-note-block">来源：02-板块二_母公司档案 · 03-板块三/02-活动盘点 · 00-汇报框架/07-补缺_社群运营 · xlsx-9 背书清单 · 新增数据_类目TOP3 公开数字（活动窗口 2025-11 → 2026-11）</p>';
      }

      var shotHtml = '';
      if (a.store) {
        var n = typeof a.store === 'number' ? a.store : (a.store ? 3 : 0);
        var arr = [];
        for (var k = 1; k <= n; k++) arr.push(k);
        shotHtml = '<h3>商店宣传图</h3><div class="shot-row">' + arr.map(function (k) {
          return '<img src="assets/store/' + a.id + '_' + k + '.png" alt="" loading="lazy">';
        }).join('') + '</div><p class="shot-cap">App Store 首屏三张宣传图（原顺序）· 部分款某格是营销摄影图，属其投放策略</p>';
      }

      var gallery = '';
      if (SH && SH.length) {
        gallery = '<h3>实拍交互截图</h3>' +
          '<div class="gal-tabs"><button class="on" data-g="flow">逐屏流程</button><button data-g="grid">缩略网格</button></div>' +
          '<div class="gal flow on" id="gal-flow">' + SH.map(function (s, i) {
            return '<figure><img src="' + s.src + '" alt="" loading="lazy" data-cap="屏 ' + (i + 1) + '"><figcaption>屏 ' + (i + 1) + '</figcaption></figure>';
          }).join('') + '</div>' +
          '<div class="gal grid" id="gal-grid">' + SH.map(function (s, i) {
            return '<img src="' + s.src + '" alt="" loading="lazy" data-i="' + i + '" data-cap="屏 ' + (i + 1) + '">';
          }).join('') + '</div>';
      }

      document.getElementById('app-body').innerHTML =
        '<div class="app-hero">' + u.appIcon(a, 96) +
        '<div class="app-hero-txt"><h2>' + u.esc(a.name) + '</h2>' +
        '<div class="app-hero-chips">' + u.catChip(a.cat) + '<span class="mini-chip">' + (a.special ? '特定款（样本外）' : u.layerName(a.layer)) + '</span>' +
        (u.rankInCat(a) ? '<span class="mini-chip">板块热度 No.' + u.rankInCat(a) + '</span>' : '') +
        (a.storeUrl ? '<a class="mini-chip link" href="' + a.storeUrl + '" target="_blank" rel="noopener">App Store ↗</a>' : '') + '</div></div>' +
        '<div class="hero-badges">' + (CH ? '<span class="dot-badge big chain">交互链路 ' + CH.steps.length + ' 步</span>' : '') +
        (CO ? '<span class="dot-badge big co">公司与业务调研</span>' : '') + '</div></div>' +
        '<div class="app-cols"><div class="app-facts"><h3>基础数据</h3><ul>' + facts + '</ul>' +
        (a.special ? '<p class="src-note-block">来源：' + u.esc(a.source || '') + '</p>'
          : '<p class="src-note-block">商店字段快照 2026-11-02 · 下载 / 收入为校准估算或档位下限（10 倍一级，只看量级）· 数据抓取 2026-11-07</p>') +
        '</div><div class="app-shots">' + shotHtml + '</div></div>' +
        chain + company + gallery;

      // 链路：悬停预览截图 + 这一步的说明（浮层跟随按钮），点击切到逐屏流程并滚到该屏
      var pop = document.getElementById('chain-pop');
      if (pop) {
        var pimg = pop.querySelector('img'), plab = pop.querySelector('span');
        document.querySelectorAll('.chain-step').forEach(function (b) {
          b.addEventListener('mouseenter', function () {
            var i = +b.dataset.shot, st = CH.steps[+b.dataset.i];
            pimg.src = shotSrc(i);
            plab.textContent = '屏 ' + i + ' · ' + (st ? st.d : '');
            var br = b.getBoundingClientRect(), hr = document.getElementById('chain').getBoundingClientRect();
            var left = br.left - hr.left + br.width / 2;
            pop.style.left = Math.max(130, Math.min(hr.width - 130, left)) + 'px';
            pop.style.top = (br.bottom - hr.top + 10) + 'px';
            pop.classList.add('on');
          });
          b.addEventListener('mouseleave', function () { pop.classList.remove('on'); });
          b.addEventListener('click', function () {
            var flowBtn = document.querySelector('.gal-tabs button[data-g="flow"]');
            if (flowBtn) flowBtn.click();
            var f = document.querySelectorAll('#gal-flow figure')[+b.dataset.shot - 1];
            if (f) {
              f.scrollIntoView({ behavior: 'smooth', block: 'center' });
              f.classList.add('flash');
              setTimeout(function () { f.classList.remove('flash'); }, 1600);
            }
          });
        });
      }

      var gtabs = document.querySelectorAll('.gal-tabs button');
      if (gtabs.length) {
        gtabs.forEach(function (b) {
          b.addEventListener('click', function () {
            gtabs.forEach(function (x) { x.classList.remove('on'); });
            b.classList.add('on');
            document.getElementById('gal-flow').classList.toggle('on', b.dataset.g === 'flow');
            document.getElementById('gal-grid').classList.toggle('on', b.dataset.g === 'grid');
          });
        });
        document.querySelectorAll('#gal-grid img').forEach(function (im) {
          im.addEventListener('click', function () {
            document.querySelector('.gal-tabs button[data-g="flow"]').click();
            var f = document.querySelectorAll('#gal-flow figure')[+im.dataset.i];
            if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
        });
        Zoom.bind(document.querySelectorAll('#gal-flow img, #gal-grid img'));
      }
    },
    stop: function () {}
  };

  /* ================================================================
     实拍截图悬停放大：鼠标移到截图上，旁边浮出大图（触屏不启用）
     ================================================================ */
  var Zoom = {
    el: null,
    init: function () {
      this.el = document.getElementById('zoom-pop');
      this.img = this.el.querySelector('img');
      this.cap = this.el.querySelector('span');
      this.coarse = window.matchMedia && window.matchMedia('(hover: none)').matches;
      var self = this;
      this.img.addEventListener('load', function () { if (self.lastE) self.move(self.lastE); });
    },
    bind: function (nodes) {
      if (!this.el) this.init();
      if (this.coarse) return;
      var self = this;
      nodes.forEach(function (im) {
        im.addEventListener('mouseenter', function (e) { self.show(im, e); });
        im.addEventListener('mousemove', function (e) { self.move(e); });
        im.addEventListener('mouseleave', function () { self.hide(); });
      });
    },
    show: function (im, e) {
      this.img.src = im.currentSrc || im.src;
      this.cap.textContent = im.dataset.cap || '';
      this.el.classList.add('on');
      this.move(e);
    },
    move: function (e) {
      this.lastE = { clientX: e.clientX, clientY: e.clientY };
      var w = this.el.offsetWidth || 380, h = this.el.offsetHeight || 640, vw = window.innerWidth, vh = window.innerHeight, pad = 16;
      var x = e.clientX + 28;
      if (x + w > vw - pad) x = e.clientX - w - 28;
      x = Math.max(pad, x);
      var y = Math.max(70, Math.min(vh - h - pad, e.clientY - h / 2));
      this.el.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    },
    hide: function () { if (this.el) this.el.classList.remove('on'); this.lastE = null; }
  };

  /* ================================================================
     左侧两级导航：APP总览（一/二/三）· 七大识别板块 · 深度样本交互分析 · 总结 · 数据底账
     可收起（记在 localStorage）；滚动时高亮当前区块
     ================================================================ */
  var Nav = {
    groups: [
      { key: 'overview', label: 'APP总览', icon: '⌂', target: 'hero', kids: [
        { key: 'towers', label: '一：APP积木塔', target: 'towers-card' },
        { key: 'board', label: '二：功能对比', target: 'board-card' },
        { key: 'pay', label: '三：收费业务分析', target: 'pay-card' }] },
      { key: 'cats', label: '七大识别板块', icon: '◫', target: 'cat-strip-sec', kind: 'cats' },
      { key: 'deep', label: '深度样本交互分析', icon: '◎', target: 'deep-sec', kind: 'deep' },
      { key: 'summary', label: '总结', icon: '✦', target: 'summary' },
      { key: 'base', label: '数据底账', icon: '≡', target: 'baseline-sec' }
    ],
    init: function () {
      var self = this, list = document.getElementById('sn-list');
      this.spyList = [];
      list.innerHTML = this.groups.map(function (g) {
        self.spyList.push({ key: g.key, target: g.target });
        var row = '<button class="sn-item top" data-key="' + g.key + '" data-target="' + g.target + '" title="' + U.esc(g.label) + '">' +
          '<i class="sn-ic">' + g.icon + '</i><span>' + U.esc(g.label) + '</span></button>';
        var kids = '';
        if (g.kids) {
          kids = g.kids.map(function (k) {
            self.spyList.push({ key: k.key, target: k.target });
            return '<button class="sn-item sub" data-key="' + k.key + '" data-target="' + k.target + '" title="' + U.esc(k.label) + '">' +
              '<i class="sn-ic dot"></i><span>' + U.esc(k.label) + '</span></button>';
          }).join('');
        } else if (g.kind === 'cats') {
          kids = P.cats.map(function (c) {
            return '<button class="sn-item sub" data-cat="' + c.key + '" title="' + c.label + ' ' + c.n + ' 款" style="--c:' + c.color + '">' +
              '<i class="sn-ic">' + window.Glyph.svg(c.key, 15) + '</i><span>' + c.label + '<em>' + c.n + '</em></span></button>';
          }).join('');
        } else if (g.kind === 'deep') {
          kids = R0.deep.map(function (d) {
            return '<button class="sn-item sub app" data-app="' + d.id + '" title="' + U.esc(d.name + '：' + d.sub) + '">' +
              '<i class="sn-ic">' + U.appIcon(U.APP[d.id], 18) + '</i><span>' + U.esc(d.name) + '<small>' + U.esc(d.sub) + '</small></span></button>';
          }).join('');
        }
        return row + (kids ? '<div class="sn-sub">' + kids + '</div>' : '');
      }).join('');
      list.querySelectorAll('.sn-item').forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.dataset.cat) Router.go('#cat/' + b.dataset.cat);
          else if (b.dataset.app) Router.go('#app/' + b.dataset.app);
          else if (Router._fromHash().v !== 'overview') { Router.pendingTarget = b.dataset.target; Router.go('#overview', true); }
          else self.scrollTo(b.dataset.target);
          if (window.innerWidth <= 760) self.set(false);
        });
      });
      var saved = null;
      try { saved = localStorage.getItem('pano-nav'); } catch (e) { /* 本地文件可能禁用存储 */ }
      this.set(saved ? saved === 'open' : window.innerWidth >= 1500);
      document.getElementById('sn-toggle').addEventListener('click', function () { self.set(!self.open); });
      document.getElementById('sn-fab').addEventListener('click', function () { self.set(true); });
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () { ticking = false; self.spy(); });
      }, { passive: true });
    },
    set: function (open) {
      this.open = open;
      document.body.classList.toggle('nav-open', open);
      document.body.classList.toggle('nav-closed', !open);
      var t = document.querySelector('#sn-toggle span');
      if (t) t.textContent = open ? '收起导航' : '';
      try { localStorage.setItem('pano-nav', open ? 'open' : 'closed'); } catch (e) { /* 忽略 */ }
      // 3D 舞台跟随版心宽度变化重新取景
      setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 320);
    },
    scrollTo: function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var y = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    },
    mark: function (attr, val) {
      document.querySelectorAll('#sn-list .sn-item').forEach(function (b) {
        b.classList.toggle('on', val != null && b.dataset[attr] === val);
      });
    },
    sync: function (r) {
      if (r.v === 'cat') this.mark('cat', r.key);
      else if (r.v === 'app') {
        if (isDeep(r.id)) this.mark('app', r.id);
        else { var a = U.APP[r.id]; this.mark('cat', a ? a.cat : null); }
      } else this.spy();
    },
    spy: function () {
      if (Router._fromHash().v !== 'overview') return;
      var cur = 'overview', line = window.innerHeight * 0.35;
      this.spyList.forEach(function (it) {
        var el = document.getElementById(it.target);
        if (el && el.getBoundingClientRect().top < line) cur = it.key;
      });
      this.mark('key', cur);
    }
  };

  /* ================================================================
     明细浮层：点击「官方怎么证明认得准」的一行 → 逐款原文证据
     ================================================================ */
  var Pop = {
    open: function (html) {
      var card = document.getElementById('pop-card'), mask = document.getElementById('pop-mask');
      card.innerHTML = '<button class="pop-x" type="button" aria-label="关闭">×</button>' + html;
      card.classList.add('on'); mask.classList.add('on');
      card.querySelector('.pop-x').addEventListener('click', Pop.close);
      card.querySelectorAll('[data-app]').forEach(function (b) {
        b.addEventListener('click', function () { Pop.close(); Router.go('#app/' + b.dataset.app); });
      });
    },
    close: function () {
      document.getElementById('pop-card').classList.remove('on');
      document.getElementById('pop-mask').classList.remove('on');
    },
    verify: function (key) {
      var V = P.verify, x = V.methods.filter(function (mm) { return mm.key === key; })[0], rows = V.byMethod[key] || [];
      if (!x) return;
      var html = '<div class="pop-h"><b>' + U.esc(x.label) + '</b><span>' + rows.length + ' 款 · ' + U.esc(x.desc) + '</span></div>' +
        '<div class="pop-rows">' + rows.map(function (r) {
          var a = U.APP[r.id];
          return '<div class="pop-row"><button class="pop-app" data-app="' + r.id + '">' + U.appIcon(a, 40) + '</button>' +
            '<div class="pop-body"><div class="pop-l1"><b>' + U.esc(a.short) + '</b>' + U.catChip(a.cat) +
            '<span class="pop-typ' + (a.stage === '免费' ? ' store' : '') + '">' + U.esc(a.stage) + '</span></div>' +
            '<p>' + U.esc(r.ev) + '</p><button class="pop-go" data-app="' + r.id + '">看这款详情 →</button></div></div>';
        }).join('') + '</div>' +
        '<p class="pop-foot">证据 = 商店描述原文（英文原句）；标「实拍截图」的来自深度样本逐屏识读，标「平台机制」的是平台公开规则；机构关系只认高校 / 研究所 / 学会（xlsx-9）。</p>';
      Pop.open(html);
    }
  };
  document.getElementById('pop-mask').addEventListener('click', function () { Pop.close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') Pop.close(); });

  Router.register('overview', Overview);
  Router.register('cat', CatView);
  Router.register('app', AppView);
  window.PanoRouter = Router;
  window.PanoNav = Nav;
  window.PanoPop = Pop;
})();
