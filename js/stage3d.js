/* ============================================================
   3D 舞台底座（three.js r128）—— 三张 3D 图共用
   负责：渲染器 / 相机与取景 / 柔光与地面阴影 / HTML 标签层 /
        悬停拾取与点击 / 补间动画 / 视口外自动暂停
   缩放：双指捏合 或 ⌘/Ctrl + 滚轮（普通滚轮留给页面滚动）
   ============================================================ */
(function () {
  'use strict';
  var T = window.THREE;

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  var EASE = {
    inOut: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    out: function (t) { return 1 - Math.pow(1 - t, 3); },
    outBack: function (t) { var c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    linear: function (t) { return t; }
  };

  /* ---------- 圆角方块几何（按尺寸缓存） ---------- */
  var geoCache = {};
  function roundedBox(w, h, d, r) {
    var key = [w, h, d, r].join('|');
    if (geoCache[key]) return geoCache[key];
    var bev = Math.min(r, w / 4, h / 4, d / 4);
    var sw = w - 2 * bev, sh = h - 2 * bev;
    var rr = Math.min(r * 0.9, sw / 2, sh / 2);
    var x = -sw / 2, y = -sh / 2;
    var s = new T.Shape();
    s.moveTo(x + rr, y);
    s.lineTo(x + sw - rr, y); s.quadraticCurveTo(x + sw, y, x + sw, y + rr);
    s.lineTo(x + sw, y + sh - rr); s.quadraticCurveTo(x + sw, y + sh, x + sw - rr, y + sh);
    s.lineTo(x + rr, y + sh); s.quadraticCurveTo(x, y + sh, x, y + sh - rr);
    s.lineTo(x, y + rr); s.quadraticCurveTo(x, y, x + rr, y);
    var g = new T.ExtrudeGeometry(s, {
      depth: Math.max(0.001, d - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: bev,
      bevelSegments: 3, curveSegments: 5
    });
    g.center();
    geoCache[key] = g;
    return g;
  }

  /* ---------- 色带（浅 → 深；起点不能太白，否则会和纸底混在一起） ---------- */
  var RAMPS = {
    mist: ['#DCE6EE', '#A8BFD2', '#7092AE', '#3E5D77'],
    teal: ['#D3EAE5', '#98CCC4', '#5EA6A0', '#2C6B67'],
    sage: ['#E2EAD6', '#B9CFA9', '#80A47B', '#466A4D'],
    clay: ['#F1DCC6', '#E3B68F', '#C98A5F', '#8A5232'],
    heat: ['#F2EEE2', '#D6E1C6', '#97B991', '#56806A', '#2E5345'],
    ocean: ['#EEF3F8', '#C4D7E8', '#8AB1D2', '#4F82B1', '#2B5683']   // 正视热力格用蓝：Sara 反馈绿色不易分辨深浅
  };
  var NA_COLOR = '#E4E0D6', ALT_COLOR = '#E8D3A6', GHOST = '#EEEAE0';
  function rampColor(name, t) {
    var a = RAMPS[name] || RAMPS.sage;
    t = Math.max(0, Math.min(1, t));
    var x = t * (a.length - 1), i = Math.min(a.length - 2, Math.floor(x));
    return new T.Color(a[i]).lerp(new T.Color(a[i + 1]), x - i);
  }
  function rampCss(name, t) { return '#' + rampColor(name, t).getHexString(); }
  function luminance(c) { return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; }

  /* ================================================================
     Stage
     ================================================================ */
  function Stage(host, opts) {
    var self = this;
    this.host = host;
    this.opts = opts || {};
    this.coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    var r = this.renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    r.setClearColor(0x000000, 0);
    r.shadowMap.enabled = true;
    r.shadowMap.type = T.PCFSoftShadowMap;
    r.domElement.className = 'stage-canvas';
    host.appendChild(r.domElement);

    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(this.opts.fov || 30, 1.6, 0.1, 600);
    this.camera.position.set(14, 14, 28);

    var c = this.controls = new T.OrbitControls(this.camera, r.domElement);
    c.enableDamping = true;
    c.dampingFactor = 0.085;
    c.enablePan = true;                // 平移：按住滚轮（中键）拖拽，或右键拖拽
    c.mouseButtons = { LEFT: T.MOUSE.ROTATE, MIDDLE: T.MOUSE.PAN, RIGHT: T.MOUSE.PAN };
    c.enableZoom = false;              // 自定义缩放：只认捏合 / ⌘+滚轮
    c.rotateSpeed = 0.55;
    c.autoRotateSpeed = 0.55;
    c.maxPolarAngle = Math.PI / 2 - 0.04;
    // 阻止 Chrome 中键「自动滚动」抢走拖拽事件（按住滚轮拖拽 = 平移场景）
    r.domElement.addEventListener('pointerdown', function (e) { if (e.button === 1) e.preventDefault(); });
    if (this.coarse) { c.enableRotate = false; r.domElement.style.touchAction = 'pan-y'; }

    // 柔光：天光 + 一盏投影主光 + 少量环境光
    this.scene.add(new T.HemisphereLight(0xffffff, 0xd8d0bb, 0.72));
    this.scene.add(new T.AmbientLight(0xffffff, 0.16));
    var sun = this.sun = new T.DirectionalLight(0xffffff, 0.58);
    sun.position.set(-14, 30, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0006;
    sun.shadow.radius = 4;
    this.scene.add(sun);
    this.scene.add(sun.target);

    var ground = this.ground = new T.Mesh(new T.PlaneGeometry(600, 600), new T.ShadowMaterial({ opacity: 0.085 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // HTML 标签层 & 悬浮卡
    this.labelLayer = document.createElement('div');
    this.labelLayer.className = 'stage-labels';
    host.appendChild(this.labelLayer);
    this.labels = [];
    this.tip = document.createElement('div');
    this.tip.className = 'stage-tip';
    host.appendChild(this.tip);

    // 拾取
    this.raycaster = new T.Raycaster();
    this.pointer = new T.Vector2();
    this.pickables = [];
    this.hovered = null;
    this._down = null;
    var el = r.domElement;
    el.addEventListener('pointermove', function (e) { self._onMove(e); });
    el.addEventListener('pointerleave', function () { self._setHover(null); self.hideTip(); });
    el.addEventListener('pointerdown', function (e) { self._down = { x: e.clientX, y: e.clientY }; self.userMoved = true; });
    el.addEventListener('pointerup', function (e) {
      if (!self._down) return;
      var moved = Math.hypot(e.clientX - self._down.x, e.clientY - self._down.y);
      self._down = null;
      if (moved < 6) self._onClick(e);
    });
    el.addEventListener('wheel', function (e) { self._onWheel(e); }, { passive: false });

    // 补间
    this.tweens = [];
    this.minDist = 5; this.maxDist = 200;

    // 视口外暂停 & 尺寸自适应
    this.visible = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          self.visible = en.isIntersecting;
          if (self.visible && self.opts.onFirstVisible && !self._seen) { self._seen = true; self.opts.onFirstVisible(); }
        });
      }, { threshold: 0.12 }).observe(host);
    } else { this.visible = true; }
    if ('ResizeObserver' in window) new ResizeObserver(function () { self.resize(); }).observe(host);
    else window.addEventListener('resize', function () { self.resize(); });
    this.resize();

    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  Stage.prototype.resize = function () {
    var w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    this.w = w; this.h = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.opts.onResize) this.opts.onResize(w, h);
  };

  /* ---------- 动画循环 ---------- */
  Stage.prototype._loop = function (now) {
    if (this._dead) return;
    requestAnimationFrame(this._loop);
    if (!this.visible || document.hidden || !this.w) return;
    this._runTweens(now);
    this.controls.update();
    if (this.opts.onFrame) this.opts.onFrame(now);
    this.renderer.render(this.scene, this.camera);
    this._updateLabels();
  };

  Stage.prototype.tween = function (dur, update, o) {
    o = o || {};
    var tw = { start: performance.now() + (o.delay || 0), dur: dur, update: update, ease: o.ease || EASE.inOut, done: o.done };
    this.tweens.push(tw);
    return tw;
  };
  Stage.prototype._runTweens = function (now) {
    if (!this.tweens.length) return;
    var keep = [];
    for (var i = 0; i < this.tweens.length; i++) {
      var tw = this.tweens[i];
      if (tw.dead) continue;
      if (now < tw.start) { keep.push(tw); continue; }
      var t = Math.min(1, (now - tw.start) / tw.dur);
      tw.update(tw.ease(t), t);
      if (t >= 1) { if (tw.done) tw.done(); } else keep.push(tw);
    }
    this.tweens = keep;
  };
  Stage.prototype.busy = function () { return this.tweens.length > 0; };

  /* ---------- 取景：二分求「刚好装下」的机位距离 ---------- */
  Stage.prototype.fit = function (box, azimuth, elevation, pad) {
    var center = box.getCenter(new T.Vector3());
    // 窄屏（竖向画面）把机位抬高，图形更"立"，避免缩成一条细带
    if (this.camera.aspect < 0.95) elevation = Math.min(1.2, elevation + 0.3);
    var dir = new T.Vector3(Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation));
    var cam = this.camera.clone();
    cam.aspect = this.camera.aspect;
    cam.updateProjectionMatrix();
    var pts = [];
    for (var i = 0; i < 8; i++) {
      pts.push(new T.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z));
    }
    var limit = 1 - (pad == null ? 0.08 : pad);
    var lo = 1, hi = 500, v = new T.Vector3();
    for (var k = 0; k < 26; k++) {
      var mid = (lo + hi) / 2;
      cam.position.copy(center).addScaledVector(dir, mid);
      cam.up.set(0, 1, 0);
      cam.lookAt(center);
      cam.updateMatrixWorld(true);
      var ok = true;
      for (var j = 0; j < 8 && ok; j++) {
        v.copy(pts[j]).project(cam);
        if (v.z > 1 || Math.abs(v.x) > limit || Math.abs(v.y) > limit) ok = false;
      }
      if (ok) hi = mid; else lo = mid;
    }
    return { pos: center.clone().addScaledVector(dir, hi), target: center, dist: hi };
  };

  Stage.prototype.flyTo = function (view, dur, instant) {
    var cam = this.camera, ctl = this.controls;
    this.minDist = view.dist * 0.32;
    this.maxDist = view.dist * 2.4;   // 远机位必须同步放宽，否则会被钳回去（1-1a 踩过）
    ctl.minDistance = this.minDist;
    ctl.maxDistance = this.maxDist;
    if (instant) {
      cam.position.copy(view.pos); ctl.target.copy(view.target); ctl.update();
      return;
    }
    var p0 = cam.position.clone(), t0 = ctl.target.clone();
    var self = this;
    if (this._fly) this._fly.dead = true;
    ctl.enabled = false;
    this._fly = this.tween(dur || 900, function (e) {
      cam.position.lerpVectors(p0, view.pos, e);
      ctl.target.lerpVectors(t0, view.target, e);
    }, { done: function () { ctl.enabled = true; ctl.update(); self._fly = null; } });
  };

  Stage.prototype.setShadowBox = function (box) {
    var c = box.getCenter(new T.Vector3()), s = box.getSize(new T.Vector3());
    var R = Math.max(s.x, s.z, s.y) * 0.75 + 4;
    var sc = this.sun.shadow.camera;
    sc.left = -R; sc.right = R; sc.top = R; sc.bottom = -R; sc.near = 1; sc.far = 160;
    sc.updateProjectionMatrix();
    this.sun.position.set(c.x - 14, 34, c.z + 22);
    this.sun.target.position.copy(c);
  };

  Stage.prototype.setAutoRotate = function (on) { this.controls.autoRotate = !!on; };

  /* ---------- 缩放（捏合 / ⌘+滚轮） ---------- */
  Stage.prototype._onWheel = function (e) {
    if (!(e.ctrlKey || e.metaKey)) return;     // 普通滚轮 → 页面滚动
    e.preventDefault();
    var ctl = this.controls, cam = this.camera;
    var off = cam.position.clone().sub(ctl.target);
    var len = Math.max(this.minDist, Math.min(this.maxDist, off.length() * Math.exp(e.deltaY * 0.0028)));
    cam.position.copy(ctl.target).add(off.setLength(len));
    this.userMoved = true;
  };
  Stage.prototype.zoomBy = function (f) {
    var ctl = this.controls, cam = this.camera;
    var off = cam.position.clone().sub(ctl.target);
    var len = Math.max(this.minDist, Math.min(this.maxDist, off.length() * f));
    var p0 = cam.position.clone(), p1 = ctl.target.clone().add(off.setLength(len));
    this.tween(360, function (e) { cam.position.lerpVectors(p0, p1, e); });
  };

  /* ---------- 拾取 ---------- */
  Stage.prototype._pick = function (e) {
    var rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    var hits = this.raycaster.intersectObjects(this.pickables, false);
    for (var i = 0; i < hits.length; i++) if (hits[i].object.visible && !hits[i].object.userData.noPick) return hits[i].object;
    return null;
  };
  Stage.prototype._onMove = function (e) {
    if (this._down && Math.hypot(e.clientX - this._down.x, e.clientY - this._down.y) > 6) { this._setHover(null); this.hideTip(); return; }
    var obj = this._pick(e);
    this._setHover(obj, e);
    if (obj && this.opts.tipFor) this.showTip(this.opts.tipFor(obj), e);
    else this.hideTip();
  };
  Stage.prototype._setHover = function (obj, e) {
    if (obj === this.hovered) return;
    var prev = this.hovered;
    this.hovered = obj;
    this.renderer.domElement.style.cursor = obj ? 'pointer' : 'grab';
    if (this.opts.onHover) this.opts.onHover(obj, prev, e);
  };
  Stage.prototype._onClick = function (e) {
    var obj = this._pick(e);
    if (obj && this.opts.onClick) this.opts.onClick(obj, e);
    else if (obj && this.coarse && this.opts.tipFor) this.showTip(this.opts.tipFor(obj), e);
  };

  Stage.prototype.showTip = function (html, e) {
    if (!html) { this.hideTip(); return; }
    var tip = this.tip;
    if (tip._html !== html) { tip.innerHTML = html; tip._html = html; }
    tip.classList.add('on');
    var rect = this.host.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var left = x + 18, top = y + 18;
    if (left + tw > rect.width - 8) left = x - tw - 18;
    if (top + th > rect.height - 8) top = y - th - 18;
    tip.style.transform = 'translate(' + Math.max(8, left) + 'px,' + Math.max(8, top) + 'px)';
  };
  Stage.prototype.hideTip = function () { this.tip.classList.remove('on'); };

  /* ---------- HTML 标签（跟随 3D 坐标） ----------
     o.thin = 'x' | 'y'：同组标签在该方向上重叠时自动隐去后一个（拥挤稀疏化） */
  Stage.prototype.label = function (html, cls, pos, o) {
    var el = document.createElement('div');
    el.className = 'lbl ' + (cls || '');
    el.innerHTML = html;
    this.labelLayer.appendChild(el);
    var lab = { el: el, pos: pos ? pos.clone() : new T.Vector3(), track: null, dy: 0, shown: true,
      anchor: (o && o.anchor) || 'bottom', group: o && o.group, thin: o && o.thin, thinKey: (o && o.thinKey) || (o && o.thin),
      prio: !!(o && o.prio) };
    if (o && o.onClick) { el.classList.add('clickable'); el.addEventListener('click', o.onClick); }
    this.labels.push(lab);
    return lab;
  };
  Stage.prototype.removeLabels = function (group) {
    this.labels = this.labels.filter(function (l) {
      if (group == null || l.group === group) { l.el.remove(); return false; }
      return true;
    });
  };
  var _v = new T.Vector3();
  function setOff(l, off) {
    if (l._off === off) return;
    l._off = off;
    l.el.classList.toggle('off', off);
  }
  Stage.prototype._updateLabels = function () {
    var w = this.w, h = this.h, cam = this.camera, groups = null;
    for (var i = 0; i < this.labels.length; i++) {
      var l = this.labels[i];
      if (!l.shown) { setOff(l, true); continue; }
      if (l.track) { l.track.getWorldPosition(_v); _v.y += l.dy; } else _v.copy(l.pos);
      _v.project(cam);
      if (_v.z > 1) { setOff(l, true); continue; }
      var x = (_v.x + 1) / 2 * w, y = (1 - _v.y) / 2 * h;
      l.sx = x; l.sy = y;
      l.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) ' +
        (l.anchor === 'right' ? 'translate(-100%,-50%)' :
          'translate(-50%,' + (l.anchor === 'bottom' ? '-100%' : l.anchor === 'top' ? '0' : '-50%') + ')');
      if (l.thin) { groups = groups || {}; (groups[l.thinKey] = groups[l.thinKey] || []).push(l); }
      else setOff(l, false);
    }
    if (!groups) return;
    // 稀疏化：按屏幕矩形做真实 2D 重叠检测；prio 标签（如「未采集」）先占位、永不隐藏
    Object.keys(groups).forEach(function (k) {
      var arr = groups[k], ax = arr[0].thin, kept = [];
      arr.sort(function (a, b) {
        if (a.prio !== b.prio) return a.prio ? -1 : 1;
        return ax === 'x' ? a.sx - b.sx : a.sy - b.sy;
      });
      arr.forEach(function (l) {
        if (!l.w) { l.w = l.el.offsetWidth; l.h = l.el.offsetHeight; }
        var cx = l.anchor === 'right' ? l.sx - l.w / 2 : l.sx;
        var cy = l.anchor === 'bottom' ? l.sy - l.h / 2 : l.anchor === 'top' ? l.sy + l.h / 2 : l.sy;
        var hit = !l.prio && kept.some(function (r) {
          return Math.abs(cx - r.x) < (l.w + r.w) / 2 + 4 && Math.abs(cy - r.y) < (l.h + r.h) / 2 + 2;
        });
        if (!hit) kept.push({ x: cx, y: cy, w: l.w, h: l.h });
        setOff(l, hit);
      });
    });
  };

  Stage.prototype.dispose = function () {
    this._dead = true;
    this.renderer.dispose();
    if (this.renderer.forceContextLoss) this.renderer.forceContextLoss();
  };

  window.Stage3D = {
    Stage: Stage, hasWebGL: hasWebGL, EASE: EASE, roundedBox: roundedBox,
    RAMPS: RAMPS, rampColor: rampColor, rampCss: rampCss, luminance: luminance,
    NA_COLOR: NA_COLOR, ALT_COLOR: ALT_COLOR, GHOST: GHOST
  };
})();
