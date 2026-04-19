// Рендер event.html з window.EKO_EVENTS на основі ?id= у URL
(function () {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id') || 'stryiskyi';
  var data = (window.EKO_EVENTS && window.EKO_EVENTS[id]) || window.EKO_EVENTS['stryiskyi'];
  if (!data) return;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function setText(sel, value) {
    $all(sel).forEach(function (el) { el.textContent = value; });
  }
  function setHTML(sel, value) {
    $all(sel).forEach(function (el) { el.innerHTML = value; });
  }

  // <title>
  document.title = data.title + ' — Екотолока';

  // Hero title
  setText('[data-ef="title"]', data.title);

  // Chips
  var chipsEl = $('[data-ef="chips"]');
  if (chipsEl) {
    chipsEl.innerHTML = '';
    data.chips.forEach(function (c) {
      var span = document.createElement('span');
      span.className = 'chip' + (c.variant ? ' chip--' + c.variant : '');
      span.textContent = c.label;
      chipsEl.appendChild(span);
    });
    if (data.waitlist) {
      var w = document.createElement('span');
      w.className = 'chip chip--warning';
      w.innerHTML = '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ' + data.waitlist.count + ' у листі очікування';
      chipsEl.appendChild(w);
    }
  }

  // Date tile + strong date line
  setText('[data-ef="date-month"]', data.date.month);
  setText('[data-ef="date-day"]', data.date.day);
  setText('[data-ef="date-full"]', data.date.full);
  setText('[data-ef="date-time"]', data.date.time);
  setText('[data-ef="date-sidebar"]', data.date.full + ' · ' + data.date.time.split(' · ')[0]);

  // Location
  setText('[data-ef="loc-primary"]', data.location.primary);
  setText('[data-ef="loc-secondary"]', data.location.secondary);
  setText('[data-ef="loc-short"]', data.location.short);

  // Participants summary
  var p = data.participants;
  setHTML('[data-ef="participants-summary"]',
    '<strong>' + p.count + ' людей вже ' + (p.count >= p.capacity ? 'у черзі' : 'йдуть') + '</strong> · ' +
    p.firstTime + ' вперше · ' + p.neighbors + ' з твого району');

  // Hero image text
  setHTML('[data-ef="hero-image"]', data.heroImage);

  // Timeline
  var tl = $('[data-ef="timeline"]');
  if (tl) {
    tl.innerHTML = '';
    data.timeline.forEach(function (row) {
      var r = document.createElement('div');
      r.className = 'timeline__row';
      r.innerHTML = '<div class="timeline__time">' + row[0] + '</div><div class="timeline__desc">' + row[1] + '</div>';
      tl.appendChild(r);
    });
  }

  // What we do
  setText('[data-ef="what-we-do"]', data.whatWeDo);

  // Bring / Provide lists
  function renderList(sel, items) {
    var ul = $(sel);
    if (!ul) return;
    ul.innerHTML = '';
    items.forEach(function (item) {
      var li = document.createElement('li');
      li.innerHTML = item;
      ul.appendChild(li);
    });
  }
  renderList('[data-ef="bring"]', data.bring);
  renderList('[data-ef="provide"]', data.provide);

  // Meet at
  setText('[data-ef="meet-at"]', data.meetAt);

  // Map iframe
  var iframe = $('[data-ef="map-iframe"]');
  if (iframe) {
    var lat = data.map.lat, lng = data.map.lng;
    iframe.src = 'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2572.8!2d' + lng + '!3d' + lat + '!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1suk!2sua!4v1700000001';
    iframe.title = data.map.title;
  }

  // Organizer
  var org = data.organizer;
  setText('[data-ef="org-name"]', org.name);
  setText('[data-ef="org-initial"]', org.initial);
  setText('[data-ef="org-quote"]', org.quote);
  setText('[data-ef="org-contact"]', org.contact);
  var orgBadges = $('[data-ef="org-badges"]');
  if (orgBadges) {
    orgBadges.innerHTML = '';
    org.badges.forEach(function (b) {
      var span = document.createElement('span');
      if (typeof b === 'string') {
        span.className = 'chip chip--outline';
        span.textContent = b;
      } else {
        span.className = 'chip';
        span.textContent = b.label;
      }
      orgBadges.appendChild(span);
    });
  }

  // FAQ
  var faq = $('[data-ef="faq"]');
  if (faq) {
    faq.innerHTML = '';
    data.faq.forEach(function (pair) {
      var d = document.createElement('details');
      d.className = 'accordion';
      d.innerHTML = '<summary>' + pair[0] + '</summary><p>' + pair[1] + '</p>';
      faq.appendChild(d);
    });
  }

  // Sidebar count / capacity
  setText('[data-ef="count"]', p.count);
  setText('[data-ef="capacity"]', '/' + p.capacity);
  var progress = $('[data-ef="progress"]');
  if (progress) {
    var pct = Math.min(100, Math.round((p.count / p.capacity) * 100));
    progress.style.width = pct + '%';
  }

  // Sidebar waitlist chip show/hide
  var waitlistChip = $('[data-ef="sidebar-waitlist"]');
  if (waitlistChip) {
    if (data.waitlist) {
      waitlistChip.style.display = '';
      waitlistChip.innerHTML = '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ' + data.waitlist.count + ' у листі очікування';
    } else {
      waitlistChip.style.display = 'none';
    }
  }
  var waitlistNote = $('[data-ef="waitlist-note"]');
  if (waitlistNote) waitlistNote.style.display = data.waitlist ? '' : 'none';

  // CTA button label
  var ctaBtn = $('[data-ef="cta-btn"]');
  if (ctaBtn) {
    var label = data.cta === 'waitlist' ? 'Приєднатись до waitlist' : 'Записатись на толоку';
    ctaBtn.innerHTML = label + ' <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';
  }

  // Share / invite codes
  var share = data.shareCode;
  var inviteCode = share + '?team=marko';
  $all('[data-ef="invite-code"]').forEach(function (el) { el.textContent = inviteCode; });
  $all('[data-ef="share-code"]').forEach(function (el) { el.textContent = share; });
  $all('[data-ef-copy="invite"]').forEach(function (el) { el.setAttribute('data-copy', inviteCode); });
  $all('[data-ef-copy="share"]').forEach(function (el) { el.setAttribute('data-copy', share); });
})();
