/* ============================================================
   类别手绘图标（24×24 线稿）—— HTML 用 SVG，3D 积木用 Canvas 贴图
   7 类：植物 / 鸟类 / 鱼类·钓鱼 / 岩石·矿物 / 综合·多类群 / 昆虫 / 真菌
   ============================================================ */
(function () {
  'use strict';

  // 每个图标 = 若干条 SVG path（描边、圆头圆角）；"h.01" 的短线用于画圆点
  var GLYPHS = {
    plant: [
      'M12 20.5V12.2',
      'M12 14.6C12 10.6 9.3 8.1 5 8.1C5 12.4 7.7 14.6 12 14.6Z',
      'M12 12.2C12 7.7 14.8 4.6 19.4 4.6C19.4 9.3 16.6 12.2 12 12.2Z',
      'M7.6 20.5H16.4'
    ],
    bird: [
      'M13.6 9.3C13.6 7 15 5.2 17 5.2C18.8 5.2 20 6.5 20 8.3C20 13.2 16.4 17 11.6 17H6.2L3 19.4L4.4 15.5C5.6 11.7 9.3 9.5 13.6 9.3Z',
      'M20 7.5L22 8.3L20 9.1',
      'M17.1 7.6h.01',
      'M8.6 13.6C10.8 13.6 12.8 12.3 13.8 10.5',
      'M10.6 17V20.2', 'M13.8 16.6V20.2'
    ],
    fish: [
      'M6.6 12C8.3 8.7 11.3 7 14.6 7C17.8 7 20.4 9 21.5 12C20.4 15 17.8 17 14.6 17C11.3 17 8.3 15.3 6.6 12Z',
      'M6.6 12L2.6 8.6V15.4Z',
      'M17.6 11h.01',
      'M12.4 9.3C13.3 11 13.3 13 12.4 14.7'
    ],
    rock: [
      'M6.6 4.6H17.4L21 9.6L12 20.2L3 9.6Z',
      'M3 9.6H21',
      'M9.6 4.6L8.1 9.6L12 20.2L15.9 9.6L14.4 4.6'
    ],
    multi: [
      'M12 3.4A8.6 8.6 0 1 1 12 20.6A8.6 8.6 0 1 1 12 3.4Z',
      'M15.6 8.4L13.3 13.3L8.4 15.6L10.7 10.7Z',
      'M12 12h.01',
      'M12 1.6V3.4', 'M12 20.6V22.4'
    ],
    insect: [
      'M12 7.6C15.3 7.6 17.4 10.4 17.4 13.9C17.4 17.3 15.1 20 12 20C8.9 20 6.6 17.3 6.6 13.9C6.6 10.4 8.7 7.6 12 7.6Z',
      'M12 7.6V20',
      'M9.8 8C9.8 6.3 10.8 5 12 5C13.2 5 14.2 6.3 14.2 8',
      'M10.7 5.4L8.9 3', 'M13.3 5.4L15.1 3',
      'M6.9 11.4L3.9 9.9', 'M6.6 14.4H3.2', 'M7.2 17.3L4.3 18.9',
      'M17.1 11.4L20.1 9.9', 'M17.4 14.4H20.8', 'M16.8 17.3L19.7 18.9',
      'M9.6 12.3h.01', 'M14.4 12.3h.01', 'M9.8 16.3h.01', 'M14.2 16.3h.01'
    ],
    fungi: [
      'M4 11.6C4 7.1 7.6 4 12 4C16.4 4 20 7.1 20 11.6C20 12.4 19.4 12.9 18.6 12.9H5.4C4.6 12.9 4 12.4 4 11.6Z',
      'M9.5 12.9V18C9.5 19.4 10.6 20.5 12 20.5C13.4 20.5 14.5 19.4 14.5 18V12.9',
      'M8.6 8.3h.01', 'M14.6 7.3h.01', 'M12 9.8h.01', 'M16.6 10h.01'
    ]
  };

  function svg(key, size, strokeWidth) {
    var ps = GLYPHS[key] || GLYPHS.multi;
    var s = size || 20;
    return '<svg class="glyph" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
      ' stroke-width="' + (strokeWidth || 1.7) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      ps.map(function (d) {
        // 圆点画粗一些，保证小尺寸可见
        return /h\.01$/.test(d) ? '<path d="' + d + '" stroke-width="2.6"/>' : '<path d="' + d + '"/>';
      }).join('') + '</svg>';
  }

  var cache = {};
  // 生成 Canvas 贴图（透明底 + 图标线稿），供 three.js 积木正面使用
  function canvas(key, color, px) {
    var id = key + '|' + color + '|' + (px || 128);
    if (cache[id]) return cache[id];
    var n = px || 128;
    var c = document.createElement('canvas');
    c.width = c.height = n;
    var ctx = c.getContext('2d');
    ctx.scale(n / 24, n / 24);
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    (GLYPHS[key] || GLYPHS.multi).forEach(function (d) {
      ctx.lineWidth = /h\.01$/.test(d) ? 2.8 : 1.75;
      ctx.stroke(new Path2D(d));
    });
    cache[id] = c;
    return c;
  }

  window.Glyph = { svg: svg, canvas: canvas, keys: Object.keys(GLYPHS) };
})();
