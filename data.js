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
    text: 'Привет. Я Кирилл — собираю Android-приложения, возюсь с ESP32 и M5Stick и превращаю железяки в толковые Tools. Покрути куб: на его гранях — логотипы моих проектов.',
    tags: ['KOTLIN', 'C++', 'ESP32', 'JETPACK COMPOSE']
  },

  projects: [
    {
      slug: 'stickcommander',
      art: 'stickcommander',
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
      art: 'm5wheel',
      logo: ['M5', 'WHEEL'],
      eyebrow: '// PROJECT 02 · 2025',
      title: 'm5wheel-ets2',
      text: 'Гироскопический руль на M5StickC Plus 2: BLE HID (Logitech G29), 1080°, десктопное C++ приложение с зеркалом экрана и установщиком для Windows.',
      tags: ['C++', 'BLE HID', 'GYRO', 'WINDOWS'],
      stars: 0,
      url: 'https://github.com/121kirillmorti/m5wheel-ets2'
    },
    {
      slug: 'justvibrait',
      art: 'justvibrait',
      logo: ['JUST', 'VIBRAIT'],
      eyebrow: '// PROJECT 03 · 2025',
      title: 'justvibrait',
      text: 'Вибрация в такт музыке: Android-приложение на Kotlin/Compose с FFT-анализом баса, AudioPlaybackCapture и микрофоном, плюс Windows-монитор по UDP.',
      tags: ['KOTLIN', 'FFT', 'UDP', 'MATERIAL YOU'],
      stars: 1,
      url: 'https://github.com/121kirillmorti/justvibrait'
    },
    {
      slug: 'tetris-you',
      art: 'tetris',
      logo: ['TETRIS', 'YOU'],
      eyebrow: '// PROJECT 04 · 2024',
      title: 'Tetris You',
      text: 'Material You тетрис для Android: офлайн, двуязычный (RU/EN), без рекламы. Привычная классика с аккуратным интерфейсом.',
      tags: ['KOTLIN', 'COMPOSE', 'RU/EN', 'OFFLINE'],
      stars: 1,
      url: 'https://github.com/121kirillmorti/tetris-you'
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
