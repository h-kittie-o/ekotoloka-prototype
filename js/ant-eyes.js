// Зіниця кожної мурашки на сайті слідкує за курсором.
// На SVG мурашки треба мати атрибути:
//   data-ant-eye="<eyeX>,<eyeY>"        — центр білка ока (viewBox-coords)
//   data-ant-pupil="<pupilX>,<pupilY>"  — базовий центр зіниці у вихідному SVG
//   data-ant-max="<px>"                 — макс. зсув зіниці (radius eye − radius pupil)
// і елемент <g class="ant-pupil"> навколо зіниці.
(function () {
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ants = [];
  document.querySelectorAll('svg[data-ant-eye]').forEach(function (svg) {
    var pupil = svg.querySelector('.ant-pupil');
    if (!pupil) return;
    var eye = svg.getAttribute('data-ant-eye').split(',').map(Number);
    var pup = svg.getAttribute('data-ant-pupil').split(',').map(Number);
    var max = parseFloat(svg.getAttribute('data-ant-max')) || 3.0;
    var vb = svg.viewBox.baseVal;
    var baseX = eye[0] - pup[0];
    var baseY = eye[1] - pup[1];
    pupil.style.transformBox = 'view-box';
    pupil.style.transform = 'translate(' + baseX + 'px,' + baseY + 'px)';
    pupil.style.transition = 'transform .12s cubic-bezier(.2,.6,.3,1)';
    pupil.style.willChange = 'transform';
    ants.push({ svg: svg, pupil: pupil, eye: eye, base: [baseX, baseY], max: max, vboxW: vb.width });
  });
  if (!ants.length) return;

  var queued = false;
  var lastX = 0, lastY = 0;
  function apply() {
    queued = false;
    ants.forEach(function (a) {
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
      a.pupil.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)';
    });
  }
  window.addEventListener('mousemove', function (e) {
    lastX = e.clientX; lastY = e.clientY;
    if (!queued) { queued = true; requestAnimationFrame(apply); }
  }, { passive: true });
})();
