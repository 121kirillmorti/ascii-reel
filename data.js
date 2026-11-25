/* EDIT ME — все тексты и ссылки сайта лежат здесь. */
window.PORTFOLIO = {
  profile: {
    name: 'KOTIKTORTIKTECH',
    handle: '@121kirillmorti',
    role: 'ANDROID // EMBEDDED // CREATIVE CODING',
    location: 'AKTOBE, KZ',
    tagline: 'Делаю железо, которое слушается телефона.'
  },

  // Слайд 01 — автарка
  intro: {
    eyebrow: '// IDENTITY',
    title: 'KOTIKTORTIKTECH',
    text: 'Привет. Я Кирилл — собираю Android-приложения, возюсь с ESP32 и M5Stick и превращаю железяки в толковые Tools. Покрути модель дальше: каждый поворот собирает новый логотип.',
    tags: ['KOTLIN', 'C++', 'ESP32', 'JETPACK COMPOSE']
  },

  projects: [
    {
      slug: 'stickcommander',
      logo: ['STICK', 'COMMANDER'],
      eyebrow: '// PROJECT 01 · 2025',
      title: 'StickCommander',
      text: 'Android-приложение + прошивка Bruce 1.16.1 для M5StickC Plus 2: живое меню, зеркало экрана, IR-пульт, менеджер LittleFS и терминал.',
      tags: ['KOTLIN', 'BRUCE', 'BLE', 'ESP32'],
      stars: 3,
      url: 'https://github.com/121kirillmorti/stickcommander'
    },
    {
      slug: 'm5wheel-ets2',
      logo: ['M5', 'WHEEL'],
      eyebrow: '// PROJECT 02 · 2025',
      title: 'm5wheel-ets2',
      text: 'Гироскопический руль на M5StickC Plus 2: BLE HID (Logitech G29), 1080°, десктопное C++ приложение с зеркалом экрана и установщиком для Windows.',
      tags: ['C++', 'BLE HID', 'GYRO', 'WINDOWS'],
      stars: 0,
      url: 'https://github.com/121kirillmorti/m5wheel-ets2'
    },
    {
      slug: 'ketchunez-aktobe',
      logo: ['KETCHUNEZ'],
      eyebrow: '// PROJECT 03 · LOCAL BUSINESS',
      title: 'Ketchunez — pizza & doner',
      text: 'Сайт пиццы и донеров в Актобе. Местный бизнес в интернете: меню, заказы, аккуратная подача и быстрая загрузка.',
      tags: ['JAVASCRIPT', 'UI', 'AKTOBE'],
      stars: 0,
      url: 'https://github.com/121kirillmorti/ketchunez-aktobe'
    },
    {
      slug: 'justvibrait',
      logo: ['JUST', 'VIBRAIT'],
      eyebrow: '// PROJECT 04 · 2025',
      title: 'justvibrait',
      text: 'Вибрация в такт музыке: Android-приложение на Kotlin/Compose с FFT-анализом баса, AudioPlaybackCapture и микрофоном, плюс Windows-монитор по UDP.',
      tags: ['KOTLIN', 'FFT', 'UDP', 'MATERIAL YOU'],
      stars: 1,
      url: 'https://github.com/121kirillmorti/justvibrait'
    },
    {
      slug: 'tetris-you',
      logo: ['TETRIS', 'YOU'],
      eyebrow: '// PROJECT 05 · 2024',
      title: 'Tetris You',
      text: 'Material You тетрис для Android: офлайн, двуязычный (RU/EN), без рекламы. Привычная классика с аккуратным интерфейсом.',
      tags: ['KOTLIN', 'COMPOSE', 'RU/EN', 'OFFLINE'],
      stars: 1,
      url: 'https://github.com/121kirillmorti/tetris-you'
    },
    {
      slug: 'avtobys-qr',
      logo: ['AVTOBYS', 'QR'],
      eyebrow: '// PROJECT 06 · UTILITY',
      title: 'avtobys.kz QR generator',
      text: 'Небольшая утилита для генерации QR-кодов avtobys.kz. Один инструмент, одна задача, ноль лишнего.',
      tags: ['QR', 'UTILITY', 'KZ'],
      stars: 0,
      url: 'https://github.com/121kirillmorti/avtobys.kz-qr-generator'
    }
  ],

  // Финальный слайд
  outro: {
    eyebrow: '// END OF REEL · ELSE / ABOUT ME',
    title: 'THANKS FOR WATCHING',
    text: 'Живу в Актобе. Чем занимаюсь: пишу Android-приложения, прошиваю ESP32/M5Stick, делаю интерфейсы в Material You и иногда — странные штуки ради интереса. Люблю терминалы, ретро-эстетику и когда код наконец работает с первого раза.',
    personal: [
      '📍 Актобе, Казахстан',
      '⚡ Железо + Kotlin + любопытство',
      '☕ Кофе и долгие вечера за компиляцией'
    ],
    socials: [
      { label: 'GITHUB', url: 'https://github.com/121kirillmorti' },
      { label: 'BLOG', url: 'https://github.com/121kirillmorti/121kirillmorti' },
      { label: 'REPOS', url: 'https://github.com/121kirillmorti?tab=repositories' }
      // Добавь сюда Telegram / почту / другие соцсети, когда захочешь.
    ]
  }
};
