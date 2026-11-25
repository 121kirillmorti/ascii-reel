/* Всё, что тут написано, можно спокойно менять на своё. */
window.PORTFOLIO = {
  profile: {
    name: 'Кирилл',
    handle: '@121kirillmorti',
    role: 'ANDROID · ESP32 · МАЛЕНЬКИЕ ШТУКИ',
    location: 'Актобе, Казахстан'
  },

  intro: {
    eyebrow: '// ну привет',
    title: 'Кирилл',
    text: 'Я Кирилл. Живу в Актобе, пишу приложения под Android, время от времени ковыряю ESP32 и M5Stick. Получается по-разному, но почти всегда интересно. Крути куб — на гранях логотипы того, что у меня вышло.',
    tags: ['ANDROID', 'KOTLIN', 'ESP32', 'M5STICK']
  },

  projects: [
    {
      slug: 'stickcommander',
      art: 'stickcommander',
      eyebrow: '// проект первый, 2025',
      title: 'StickCommander',
      text: 'Приложение для Android и прошивка Bruce на M5StickC Plus 2. Живое меню, зеркало экрана, ИК-пульт, менеджер файлов и терминал. Вышел маленький пульт, который всегда под рукой.',
      tags: ['KOTLIN', 'BRUCE', 'BLE', 'ESP32'],
      stars: 3,
      url: 'https://github.com/121kirillmorti/stickcommander'
    },
    {
      slug: 'm5wheel-ets2',
      art: 'm5wheel',
      eyebrow: '// проект второй, 2025',
      title: 'm5wheel-ets2',
      text: 'Руль на гироскопе из M5StickC Plus 2. Определяется как Logitech G29, крутится на 1080°, плюс небольшая программа на C++ с зеркалом экрана и установщиком для Windows. Для ETS2 — то что надо.',
      tags: ['C++', 'BLE HID', 'GYRO', 'WINDOWS'],
      stars: 0,
      url: 'https://github.com/121kirillmorti/m5wheel-ets2'
    },
    {
      slug: 'justvibrait',
      art: 'justvibrait',
      eyebrow: '// проект третий, 2025',
      title: 'justvibrait',
      text: 'Приложение, которое вибрирует в такт музыке. Слушает бас через FFT, умеет подхватывать звук с микрофона или из Android, а рядом на Windows висит маленький монитор вибрации.',
      tags: ['KOTLIN', 'FFT', 'UDP', 'MATERIAL YOU'],
      stars: 1,
      url: 'https://github.com/121kirillmorti/justvibrait'
    },
    {
      slug: 'tetris-you',
      art: 'tetris',
      eyebrow: '// проект четвёртый, 2024',
      title: 'Tetris You',
      text: 'Тетрис в стиле Material You. Работает офлайн, говорит по-русски и по-английски, без рекламы и лишних разрешений. Просто тетрис, который приятно открывать.',
      tags: ['KOTLIN', 'COMPOSE', 'RU/EN', 'OFFLINE'],
      stars: 1,
      url: 'https://github.com/121kirillmorti/tetris-you'
    }
  ],

  outro: {
    eyebrow: '// на этом всё',
    title: 'Спасибо, что крутил',
    text: 'Если докрутил сюда — спасибо. Я всё ещё учусь и делаю всякое: приложения, железяки, странные штуки просто для себя. Если что-то зацепило — пиши, всегда рад поговорить.',
    personal: [
      'Актобе, Казахстан',
      'Кофе, ESP32 и долгие вечера',
      'Люблю, когда завелось с первого раза'
    ],
    socials: [
      { label: 'GitHub', url: 'https://github.com/121kirillmorti' },
      { label: 'профиль', url: 'https://github.com/121kirillmorti/121kirillmorti' },
      { label: 'репозитории', url: 'https://github.com/121kirillmorti?tab=repositories' }
    ]
  }
};
