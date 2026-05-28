// Зіниця кожної мурашки на сайті слідкує за курсором.
// Розмітка:
//   <svg ...> ...
//     <g class="ant-pupil" data-eye="<eyeX,eyeY>" data-pupil-base="<pupX,pupY>" data-max="N">
//       <ellipse/path .../>
//     </g>
//   </svg>
// data-eye   — центр білка ока у viewBox-коорд.
// data-pupil-base — центр зіниці у вихідному SVG (до transform)
// data-max   — макс. зсув зіниці від центру ока (radius eye − radius pupil)
(function () {
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var pupils = [];
  document.querySelectorAll('.ant-pupil[data-eye]').forEach(function (g) {
    var svg = g.closest('svg');
    if (!svg) return;
    var eye = g.getAttribute('data-eye').split(',').map(Number);
    var pup = g.getAttribute('data-pupil-base').split(',').map(Number);
    var max = parseFloat(g.getAttribute('data-max')) || 3.0;
    var vb = svg.viewBox.baseVal;
    var baseX = eye[0] - pup[0];
    var baseY = eye[1] - pup[1];
    g.style.transformBox = 'view-box';
    g.style.transform = 'translate(' + baseX + 'px,' + baseY + 'px)';
    g.style.transition = 'transform .12s cubic-bezier(.2,.6,.3,1)';
    g.style.willChange = 'transform';
    pupils.push({ svg: svg, g: g, eye: eye, base: [baseX, baseY], max: max, vboxW: vb.width });
  });
  if (!pupils.length) return;

  var queued = false;
  var lastX = 0, lastY = 0;
  function apply() {
    queued = false;
    pupils.forEach(function (a) {
      var r = a.svg.getBoundingClientRect();
      if (!r.width) return;
      var scale = r.width / a.vboxW;
      var cx = r.left + a.eye[0] * scale;
      var cy = r.top  + a.eye[1] * scale;
      var dx = (lastX - cx) / scale;
      var dy = (lastY - cy) / scale;
      var d = Math.hypot(dx, dy);
      var k = d > 0 ? Math.min(a.max, d * 0.08) / d : 0;
      var tx = a.base[0] + dx * k;
      var ty = a.base[1] + dy * k;
      a.g.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)';
    });
  }
  window.addEventListener('mousemove', function (e) {
    lastX = e.clientX; lastY = e.clientY;
    if (!queued) { queued = true; requestAnimationFrame(apply); }
  }, { passive: true });
})();
