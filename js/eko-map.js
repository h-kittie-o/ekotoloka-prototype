/* Екотолока — Leaflet map helpers.
   Експортує window.EkoMap з двома функціями:
   - initEventsMap(containerEl): малює карту Львова з пінами всіх толок із EKO_EVENTS
   - initSingleEventMap(containerEl, evData, evId): одна точка для сторінки події
   Стиль піна: брендовий помаранч (#FF5114), краплина з білим колом всередині. */
(function () {
  'use strict';

  if (typeof window === 'undefined') return;

  function makePinIcon() {
    if (typeof L === 'undefined') return null;
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46" aria-hidden="true">' +
        '<path d="M18 1C8.6 1 1 8.6 1 18c0 12.5 15.5 26.5 16.2 27.1.5.4 1.2.4 1.6 0C19.5 44.5 35 30.5 35 18 35 8.6 27.4 1 18 1z" fill="#FF5114" stroke="#fff" stroke-width="2"/>' +
        '<circle cx="18" cy="17" r="6.5" fill="#fff"/>' +
      '</svg>';
    return L.divIcon({
      html: svg,
      className: 'eko-pin',
      iconSize: [36, 46],
      iconAnchor: [18, 44],
      popupAnchor: [0, -40]
    });
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function popupHtmlForEvent(id, ev) {
    var date = ev.date || {};
    var loc = ev.location || {};
    var pts = ev.participants || {};
    return (
      '<div class="eko-popup">' +
        '<strong class="eko-popup__title">' + escapeHtml(ev.title || '') + '</strong>' +
        '<div class="eko-popup__meta">' + escapeHtml(date.full || '') +
          (date.time ? ' · ' + escapeHtml(date.time) : '') + '</div>' +
        (loc.short ? '<div class="eko-popup__meta">' + escapeHtml(loc.short) + '</div>' : '') +
        (pts.capacity ? '<div class="eko-popup__count"><strong>' + pts.count + '/' + pts.capacity +
          '</strong> учасників</div>' : '') +
        '<a class="eko-popup__cta" href="event.html?id=' + encodeURIComponent(id) + '">Деталі →</a>' +
      '</div>'
    );
  }

  function setupBaseMap(containerEl, center, zoom) {
    var map = L.map(containerEl, {
      scrollWheelZoom: false,
      tap: true,
      attributionControl: true
    }).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    // Click on the map enables wheel zoom (UX: don't hijack page scroll until intent)
    map.on('click', function () { map.scrollWheelZoom.enable(); });
    map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

    return map;
  }

  function initEventsMap(containerEl) {
    if (!containerEl || typeof L === 'undefined' || !window.EKO_EVENTS) return null;
    if (containerEl._leaflet_id) return null; // вже ініціалізовано

    var icon = makePinIcon();
    var map = setupBaseMap(containerEl, [49.835, 24.03], 12);

    var markers = [];
    Object.keys(window.EKO_EVENTS).forEach(function (id) {
      var ev = window.EKO_EVENTS[id];
      if (!ev || !ev.map) return;
      var m = L.marker([ev.map.lat, ev.map.lng], { icon: icon, title: ev.title || '' })
        .addTo(map)
        .bindPopup(popupHtmlForEvent(id, ev), { className: 'eko-popup-wrap', maxWidth: 280 });
      markers.push(m);
    });

    if (markers.length > 0) {
      var group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.18));
    }

    return map;
  }

  function initSingleEventMap(containerEl, evData, evId) {
    if (!containerEl || typeof L === 'undefined' || !evData || !evData.map) return null;
    if (containerEl._leaflet_id) return null;

    var icon = makePinIcon();
    var center = [evData.map.lat, evData.map.lng];
    var map = setupBaseMap(containerEl, center, 15);

    L.marker(center, { icon: icon, title: evData.title || '' })
      .addTo(map)
      .bindPopup(popupHtmlForEvent(evId || '', evData), { className: 'eko-popup-wrap', maxWidth: 280 })
      .openPopup();

    return map;
  }

  window.EkoMap = {
    initEventsMap: initEventsMap,
    initSingleEventMap: initSingleEventMap
  };
})();
