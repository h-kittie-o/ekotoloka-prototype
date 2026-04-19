# Екотолока — HTML/CSS клікабельний прототип

Статичний клікабельний прототип сайту "Екотолока" (координація толок у Львові).

## Як запустити

Просто відкрий `index.html` у браузері. Можна також запустити локальний сервер:

```bash
cd ekotoloka-prototype
python -m http.server 8000
# відкрий http://localhost:8000
```

## Структура

```
ekotoloka-prototype/
├── index.html          — головна
├── events.html         — знайти подію (карта / список / календар)
├── event.html          — сторінка події (Стрийський парк)
├── confirm.html        — підтвердження реєстрації
├── results.html        — результати + галерея До/Після
├── community.html      — ком'юніті + стіна слави + відгуки
├── support.html        — підтримати (донат + партнерство)
├── report.html         — сповістити про забруднення
├── profile.html        — профіль (історія, бейджі, команди, знижки, налаштування)
├── login.html          — вхід (Google / FB / magic-link)
├── onboarding.html     — онбординг (1 поле)
├── faq.html            — часті питання
├── news.html           — новини
├── privacy.html        — політика конфіденційності
├── terms.html          — умови використання
├── cookie.html         — cookie policy (з granular consent)
├── 404.html            — сторінка не знайдена
├── css/
│   ├── tokens.css      — дизайн-токени (палітра, типографіка, spacing)
│   ├── base.css        — reset + typography + utilities
│   ├── components.css  — кнопки, картки, форми, модалки, хедер, футер
│   └── layout.css      — hero, grid, stats, leaderboard, profile
├── js/
│   └── main.js         — drawer, табы, модалки, toast, cookies, counters
└── assets/             — (порожнє; фото — сірі плейсхолдери)
```

## Що працює

- **Навігація** між усіма сторінками
- **Mobile-first адаптив** (breakpoints: 640, 768, 1024)
- **Бургер-меню** на мобайлі
- **Таби** (карта/список/календар на `events.html`; секції в `profile.html`)
- **Модалки**: Soft-gate "Я йду" на `event.html`, Запросити друзів, Поділитись
- **Toast-повідомлення**
- **Cookie-banner** з вибором
- **Google Maps iframe** (карта Львова)
- **Анімовані лічильники**
- **Плейсхолдери для фото** (смугасті сірі квадрати з підписами — замість реальних зображень)
- **Акордеон FAQ**

## Дизайн-токени

- **Primary** `#2E7D47` (зелений)
- **Accent** `#C85A1E` (терракота)
- **Background** `#FAFAF7` (теплий off-white)
- **Text** `#1A2E1F`
- **Font display** `Unbounded` (Google Fonts)
- **Font body** `Inter` (Google Fonts)
- **Body baseline** 18px (mobile), 18px (desktop)
- **Tap target** min 44x44 px
- **Contrast** WCAG AA (усі текстові співвідношення ≥4.5:1)

## Ключові флоу для тестування

1. **Happy path:** `index.html` → "Знайти подію" → картка → `event.html` → "Я йду" → модалка soft-gate → submit → `confirm.html`
2. **Browse:** `events.html` → перемикання Карта/Список/Календар
3. **Share:** `event.html` → "Поділитись" → модалка з мережами
4. **Report:** `report.html` → заповнити форму → success-стан з прогрес-баром бейджа
5. **Support:** `support.html` → обрати суму → Apple Pay
6. **Profile:** `profile.html` → таби Історія/Бейджі/Команди/Знижки/Налаштування

## Що НЕ в прототипі (по дизайну)

- Реальне фото (використовуються сірі плейсхолдери)
- Логотип (текстовий bookmark "Е" — заміниш SVG'ом коли готовий)
- Реальний бекенд (форми просто симулюють submit)
- Реальні платежі (кнопки Apple/Google Pay декоративні)
- PWA manifest (можна додати поверх)

## Наступні кроки

- Підключити реальний бекенд (Node/Go/Python)
- Додати PWA-манифест + service worker
- Замінити iframe Google Maps на Maps JS API з реальними пінами
- Додати реальний логотип SVG
- Інтегрувати OAuth (Google, Facebook)
- Інтегрувати email-розсилку (Sendpulse/Mailchimp)
- Інтегрувати платежі (LiqPay/Fondy)
