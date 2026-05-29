// Екотолока — пошук і фільтри на сторінці «Знайти подію»
(function () {
  'use strict';

  var search = document.querySelector('[data-filter="search"]');
  var districtSel = document.querySelector('[data-filter="district"]');
  var typeSel = document.querySelector('[data-filter="type"]');
  var dateSel = document.querySelector('[data-filter="date"]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-event]'));
  var countEl = document.querySelector('[data-events-count]');
  var countWordEl = document.querySelector('[data-events-count-word]');
  var emptyEl = document.querySelector('[data-events-empty]');
  var resetBtn = document.querySelector('[data-filter-reset]');
  var listTabBtn = document.querySelector('[data-tab="list"]');

  if (!search || !cards.length) return;

  // Демо-«сьогодні»: прототип з фіксованими датами квітня–травня.
  // У продакшені тут буде new Date().
  var REF_NOW = new Date(2026, 3, 20); // 20 квітня 2026, Пн
  var DAY = 86400000;

  // Стоп-слова — прийменники/частки, які не несуть змісту для пошуку локації.
  // Якщо їх не відсіяти, запит «двір на Червоної Калини» вимагав би слова «на»
  // у картці (а його там нема) і нічого б не знаходив.
  var STOP = { 'на': 1, 'в': 1, 'у': 1, 'і': 1, 'й': 1, 'з': 1, 'зі': 1, 'із': 1,
    'до': 1, 'від': 1, 'для': 1, 'та': 1, 'чи': 1, 'це': 1, 'я': 1, 'ти': 1,
    'о': 1, 'а': 1, 'по': 1, 'біля': 1, 'коло': 1 };

  // Закінчення відмінків (від найдовших до найкоротших). Легкий стемер: щоб
  // «Стрийський» (запит) і «Стрийському» (картка) звелись до спільного «стрийськ».
  var ENDINGS = ['ському', 'ського', 'ськими', 'ськім', 'ськ', 'ому', 'ого',
    'ими', 'ами', 'ями', 'еві', 'ові', 'ією', 'ою', 'ею', 'ах', 'ях', 'ів',
    'ою', 'ої', 'ій', 'ий', 'их', 'им', 'ім', 'ам', 'ям', 'у', 'ю', 'а', 'я',
    'и', 'і', 'е', 'о', 'й', 'ь'];

  function norm(s) {
    return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  // Відрізає одне відмінкове закінчення, лишаючи стем ≥ 3 символів.
  function stem(w) {
    for (var i = 0; i < ENDINGS.length; i++) {
      var e = ENDINGS[i];
      if (w.length - e.length >= 3 && w.slice(-e.length) === e) {
        return w.slice(0, w.length - e.length);
      }
    }
    return w;
  }

  // Розбиває рядок на стеми слів (без стоп-слів, без пунктуації).
  function stemSet(s) {
    return norm(s)
      .replace(/[^a-zа-яёіїєґ'\- ]/gi, ' ')
      .split(' ')
      .filter(function (w) { return w && !STOP[w]; })
      .map(stem);
  }

  // Кешуємо стеми слів кожної картки (назва + чипи + район + тип + keywords)
  cards.forEach(function (card) {
    card._stems = stemSet(
      card.textContent + ' ' +
      (card.getAttribute('data-district') || '') + ' ' +
      (card.getAttribute('data-type') || '') + ' ' +
      (card.getAttribute('data-keywords') || '')
    );
  });

  // Токен запиту вважається знайденим, якщо його стем — префікс будь-якого
  // стема картки або навпаки (≥3 символи). Це покриває як відмінки, так і
  // часткове введення («стрий» → «стрийськ»).
  function tokenMatches(tStem, stems) {
    for (var i = 0; i < stems.length; i++) {
      var w = stems[i];
      var short = tStem.length < w.length ? tStem : w;
      if (short.length >= 3 && (w.indexOf(tStem) === 0 || tStem.indexOf(w) === 0)) {
        return true;
      }
    }
    return false;
  }

  // Українська відміна: толока / толоки / толок
  function plural(n) {
    var d = n % 10, h = n % 100;
    if (d === 1 && h !== 11) return 'толока';
    if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return 'толоки';
    return 'толок';
  }

  function inDateBucket(card, bucket) {
    if (!bucket || bucket === 'Будь-коли') return true;
    var iso = card.getAttribute('data-date');
    if (!iso) return true;
    var parts = iso.split('-');
    var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    var diff = Math.floor((d - REF_NOW) / DAY);
    if (bucket === 'Цього тижня') return diff >= 0 && diff <= 6;
    if (bucket === 'Наступного') return diff >= 7 && diff <= 13;
    if (bucket === 'За місяць') return diff >= 0 && diff <= 30;
    return true;
  }

  function isDefault(sel) {
    return !sel || sel.selectedIndex === 0;
  }

  function apply() {
    var qTokens = stemSet(search.value);
    var district = isDefault(districtSel) ? '' : districtSel.value;
    var type = isDefault(typeSel) ? '' : typeSel.value;
    var dateBucket = isDefault(dateSel) ? '' : dateSel.value;

    var shown = 0;
    cards.forEach(function (card) {
      var ok = true;
      if (qTokens.length) {
        ok = qTokens.every(function (t) { return tokenMatches(t, card._stems); });
      }
      if (ok && district) ok = card.getAttribute('data-district') === district;
      if (ok && type) ok = card.getAttribute('data-type') === type;
      if (ok && dateBucket) ok = inDateBucket(card, dateBucket);

      card.hidden = !ok;
      if (ok) shown++;
    });

    if (countEl) countEl.textContent = shown;
    if (countWordEl) countWordEl.textContent = plural(shown);
    if (emptyEl) emptyEl.hidden = shown !== 0;

    // Активний фільтр → показуємо список, щоб результати було видно
    var active = qTokens.length || district || type || dateBucket;
    if (active && listTabBtn && !listTabBtn.classList.contains('is-active')) {
      listTabBtn.click();
    }
  }

  function reset() {
    search.value = '';
    [districtSel, typeSel, dateSel].forEach(function (s) { if (s) s.selectedIndex = 0; });
    apply();
    search.focus();
  }

  search.addEventListener('input', apply);
  [districtSel, typeSel, dateSel].forEach(function (s) {
    if (s) s.addEventListener('change', apply);
  });
  if (resetBtn) resetBtn.addEventListener('click', reset);

  apply();
})();
