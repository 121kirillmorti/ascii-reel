/* ============================================================
   ASCII REEL — ч/б облако точек на 3D-голове.
   Вращение продолжает модель и само собирает точки в картинку.
   ============================================================ */

(() => {
  'use strict';

  const D = window.PORTFOLIO;
  const AVATAR_ART = (window.AVATAR_ART || '').split('\n');
  const AVATAR_LUMA = (window.AVATAR_LUMA || '').split('\n');
  const AVATAR_RAMP = window.AVATAR_RAMP || ' .:-=+*#%@';

  const TAU = Math.PI * 2;
  const RAMP = ' .,:;irsXA253hMHGS#9B&@';
  const SCRAMBLE = '01#*+=<>/\\|_^';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IDLE_SPIN = reduced ? 0 : 0.0038;

  const el = {
    viewport: document.getElementById('viewport'),
    stageWrap: document.querySelector('.stage-wrap'),
    layerDim: document.getElementById('layer-dim'),
    layerBright: document.getElementById('layer-bright'),
    info: document.getElementById('info'),
    eyebrow: document.getElementById('info-eyebrow'),
    title: document.getElementById('info-title'),
    text: document.getElementById('info-text'),
    tags: document.getElementById('info-tags'),
    extra: document.getElementById('info-extra'),
    link: document.getElementById('info-link'),
    dots: document.getElementById('dots'),
    count: document.getElementById('count'),
    progress: document.getElementById('progress'),
    hint: document.getElementById('hint'),
    mode: document.getElementById('mode'),
    rain: document.getElementById('rain'),
    clock: document.getElementById('clock'),
    prev: document.getElementById('prev'),
    next: document.getElementById('next')
  };

  const slides = [
    { kind: 'intro', ...D.intro },
    ...D.projects.map(p => ({ kind: 'project', ...p })),
    { kind: 'outro', ...D.outro }
  ];

  let cols = 96, rows = 42, fontSize = 10;
  let particles = [], artCache = new Map();
  let angle = 0, tilt = -0.08, spin = IDLE_SPIN;
  let dragging = false, lastX = 0, lastY = 0;
  let visibleIndex = -1, lastFrame = performance.now();

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- layout ---------- */

  function resize() {
    cols = window.innerWidth < 720 ? 64 : 96;
    rows = window.innerWidth < 720 ? 30 : 42;
    const box = el.stageWrap.getBoundingClientRect();
    fontSize = Math.max(2.4, Math.min(box.width / (cols * 0.625), box.height / (rows * 1.04)));
    for (const layer of [el.layerDim, el.layerBright]) layer.style.fontSize = fontSize.toFixed(2) + 'px';
    artCache.clear();
    particles = makeParticles();
    visibleIndex = -1;
  }

  /* ---------- point cloud ---------- */

  function textureAt(nx, ny, nz) {
    if (!AVATAR_LUMA.length || !AVATAR_LUMA[0].length) return 0.5;
    const u = 0.5 + Math.atan2(nx, nz) / TAU;
    const v = 0.5 - Math.asin(clamp(ny, -1, 1)) / Math.PI;
    const x = clamp(Math.floor(u * (AVATAR_LUMA[0].length - 1)), 0, AVATAR_LUMA[0].length - 1);
    const y = clamp(Math.floor(v * (AVATAR_LUMA.length - 1)), 0, AVATAR_LUMA.length - 1);
    return clamp(AVATAR_RAMP.indexOf(AVATAR_LUMA[y][x]) / Math.max(1, AVATAR_RAMP.length - 1), 0, 1);
  }

  function makeParticles() {
    const n = window.innerWidth < 720 ? 900 : 1600;
    const headCount = Math.round(n * 0.64);
    const neckCount = Math.round(n * 0.09);
    const golden = Math.PI * (3 - Math.sqrt(5));
    const out = [];

    for (let i = 0; i < n; i++) {
      let base, normal, kind;
      if (i < headCount) {
        const ny = 1 - 2 * (i + 0.5) / headCount;
        const ring = Math.sqrt(Math.max(0, 1 - ny * ny));
        const a = golden * i;
        normal = [Math.cos(a) * ring, ny, Math.sin(a) * ring];
        base = [normal[0] * 0.70, 0.34 + normal[1] * 0.86, normal[2] * 0.66];
        kind = 'head';
      } else if (i < headCount + neckCount) {
        const a = Math.random() * TAU;
        normal = [Math.cos(a), 0.15, Math.sin(a)];
        base = [Math.cos(a) * 0.25, Math.random() * 0.52 - 0.42, Math.sin(a) * 0.23];
        kind = 'neck';
      } else {
        const a = Math.random() * TAU, r = Math.sqrt(Math.random());
        normal = [Math.cos(a) * r, -0.35 + Math.random() * 0.4, Math.sin(a) * r];
        base = [Math.cos(a) * r * 1.45, -1.02 + normal[1] * 0.34, Math.sin(a) * r * 0.52];
        kind = 'body';
      }

      const light = clamp(0.3 + 0.7 * (normal[0] * -0.38 + normal[1] * 0.58 + normal[2] * 0.72), 0, 1);
      let intensity = light * 0.75;
      if (kind === 'head') {
        const tex = textureAt(normal[0], normal[1], normal[2]);
        intensity = clamp(0.18 * light + 0.95 * tex * (0.35 + 0.65 * Math.max(0, normal[2])), 0, 1);
      }
      out.push({
        base, intensity, seed: Math.random(),
        ch: RAMP[Math.min(RAMP.length - 1, Math.floor(intensity * (RAMP.length - 1)))]
      });
    }
    return out;
  }

  function project(base) {
    const cy = Math.cos(angle), sy = Math.sin(angle);
    const cx = Math.cos(tilt), sx = Math.sin(tilt);
    const x = base[0] * cy + base[2] * sy;
    let z = -base[0] * sy + base[2] * cy;
    const y = base[1] * cx - z * sx;
    z = base[1] * sx + z * cx;
    const p = 3.6 / (3.6 - z);
    return {
      x: cols / 2 + x * p * cols * 0.19,
      y: rows / 2 - y * p * rows * 0.26,
      z, front: z > 0
    };
  }

  /* ---------- ASCII targets ---------- */

  const blank = () => Array(cols * rows).fill(' ');

  function putText(grid, row, col, text) {
    const s = String(text).toUpperCase();
    for (let i = 0; i < s.length && col + i < cols; i++) {
      if (row >= 0 && row < rows) grid[row * cols + col + i] = s[i];
    }
  }

  function frame(grid, label) {
    for (let c = 1; c < cols - 1; c++) { grid[c] = '-'; grid[(rows - 1) * cols + c] = '-'; }
    for (let r = 1; r < rows - 1; r++) { grid[r * cols + 1] = '|'; grid[r * cols + cols - 2] = '|'; }
    grid[0] = '+'; grid[cols - 1] = '+';
    grid[(rows - 1) * cols] = '+'; grid[rows * cols - 1] = '+';
    if (label) {
      const tag = `[ ${label} ]`;
      putText(grid, 0, 3, tag);
      putText(grid, rows - 1, cols - 12, 'ASCII.REEL');
    }
  }

  function textArt(lines, scale = 4) {
    const cw = cols, ch = rows * 2;
    const cv = document.createElement('canvas');
    cv.width = cw * scale; cv.height = ch * scale;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.scale(scale, scale);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    const upper = lines.map(l => String(l).toUpperCase());
    let size = Math.min(Math.floor(ch * 0.27), 24);
    const fit = s => {
      ctx.font = `900 ${s}px Consolas, "Courier New", monospace`;
      return Math.max(...upper.map(l => ctx.measureText(l).width));
    };
    while (size > 5 && fit(size) > cw - 12) size--;
    ctx.font = `900 ${size}px Consolas, "Courier New", monospace`;
    const lineH = size * 1.08;
    const startY = ch / 2 - (upper.length - 1) * lineH / 2;
    upper.forEach((line, i) => ctx.fillText(line, cw / 2, startY + i * lineH));

    const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
    const grid = blank();
    for (let r = 2; r < rows - 2; r++) {
      for (let c = 3; c < cols - 3; c++) {
        const px = (r * 2 * scale + scale / 2) * cv.width + (c * scale + scale / 2);
        const v = data[px * 4] / 255;
        if (v > 0.12) grid[r * cols + c] = RAMP[Math.min(RAMP.length - 1, Math.floor(v * (RAMP.length - 1)))];
      }
    }
    return grid;
  }

  function avatarArt() {
    const grid = blank();
    const w = Math.min(cols - 12, 72), h = rows - 10;
    const x0 = Math.floor((cols - w) / 2), y0 = 4;
    for (let r = 0; r < h; r++) {
      const src = AVATAR_ART[Math.floor(r * AVATAR_ART.length / h)] || '';
      for (let c = 0; c < w; c++) {
        const ch = src[Math.floor(c * (src.length || 1) / w)] || ' ';
        if (ch !== ' ') grid[(y0 + r) * cols + x0 + c] = ch;
      }
    }
    frame(grid, 'IDENTITY // 00');
    return grid;
  }

  function getArt(i) {
    if (artCache.has(i)) return artCache.get(i);
    const slide = slides[i];
    let grid;
    if (slide.kind === 'intro') grid = avatarArt();
    else if (slide.kind === 'outro') {
      grid = textArt(['THANKS', '4 WATCHING']);
      putText(grid, rows - 3, Math.floor(cols / 2) - 11, '@121KIRILLMORTI');
      frame(grid, 'FOLLOW ME // 07');
    } else {
      grid = textArt(slide.logo);
      putText(grid, rows - 3, Math.floor(cols / 2) - 7, `// ${String(i).padStart(2, '0')}`);
      frame(grid, `PROJECT ${String(i).padStart(2, '0')}`);
    }
    const cells = [];
    for (let idx = 0; idx < grid.length; idx++) if (grid[idx] !== ' ') cells.push({ idx, ch: grid[idx] });
    const art = { cells };
    artCache.set(i, art);
    return art;
  }

  /* ---------- panel ---------- */

  function renderPanel(slide) {
    el.eyebrow.textContent = slide.eyebrow || '';
    el.title.textContent = slide.title || '';
    el.text.textContent = slide.text || '';
    el.tags.innerHTML = (slide.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');

    if (slide.kind === 'project') {
      el.extra.innerHTML = `<span>★ ${slide.stars || 0}</span><span>OPEN SOURCE</span>`;
      el.link.hidden = false;
      el.link.href = slide.url;
      el.link.textContent = 'OPEN REPOSITORY ↗';
    } else if (slide.kind === 'outro') {
      el.extra.innerHTML = (slide.personal || []).map(x => `<span>${escapeHtml(x)}</span>`).join('') +
        (slide.socials || []).map(s => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">[ ${escapeHtml(s.label)} ↗ ]</a>`).join('');
      el.link.hidden = true;
    } else {
      el.extra.innerHTML = `<span>${escapeHtml(D.profile.role)}</span><span>${escapeHtml(D.profile.location)}</span>`;
      el.link.hidden = false;
      el.link.href = 'https://github.com/121kirillmorti?tab=repositories';
      el.link.textContent = 'ALL REPOSITORIES ↗';
    }

    const num = slides.indexOf(slide) + 1;
    el.count.textContent = String(num).padStart(2, '0');
    el.dots.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === num - 1));
    [...el.progress.children].forEach((s, i) => s.classList.toggle('on', i < num));
  }

  function buildNav() {
    el.dots.innerHTML = slides.map((_, i) => `<button class="dot" role="tab" aria-label="Кадр ${i + 1}" data-i="${i}"></button>`).join('');
    el.progress.innerHTML = slides.map(() => '<span></span>').join('');
    el.dots.addEventListener('click', e => {
      const b = e.target.closest('.dot');
      if (b) { angle = (Number(b.dataset.i) + 0.5) * TAU; spin = IDLE_SPIN; }
    });
  }

  /* ---------- frame ---------- */

  function render(now) {
    const dt = Math.min(50, now - lastFrame);
    lastFrame = now;

    if (!dragging) {
      angle += spin * dt / 16.7;
      spin += (IDLE_SPIN - spin) * 0.025;
      tilt += (-0.08 - tilt) * 0.02;
    }

    const turn = angle / TAU;
    const k = Math.floor(turn);
    const f = turn - k;
    const index = ((k % slides.length) + slides.length) % slides.length;
    const assembly = smooth(0.08, 0.42, f) * (1 - smooth(0.58, 0.92, f));
    const art = getArt(index);

    if (index !== visibleIndex) { renderPanel(slides[index]); visibleIndex = index; }
    el.info.classList.toggle('show', assembly > 0.42);
    el.info.style.opacity = (0.35 + 0.65 * assembly).toFixed(2);
    el.hint.classList.toggle('faded', assembly > 0.55);
    el.mode.textContent = assembly > 0.75 ? 'PICTURE: ASSEMBLED' : 'POINTS: ROTATING';
    el.mode.classList.toggle('active', assembly > 0.75);

    const dim = Array(cols * rows).fill(' ');
    const bright = Array(cols * rows).fill(' ');
    const zbuf = new Float32Array(cols * rows).fill(-Infinity);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const head = project(p.base);
      const cell = art.cells[i % art.cells.length];
      const tx = cell.idx % cols, ty = Math.floor(cell.idx / cols);
      const sx = head.x + (tx - head.x) * assembly;
      const sy = head.y + (ty - head.y) * assembly;
      let ch = p.ch;
      if (assembly > 0.3 && assembly <= 0.72) {
        ch = SCRAMBLE[(i + Math.floor(now * 0.03) + Math.floor(p.seed * 31)) % SCRAMBLE.length];
      } else if (assembly > 0.72) {
        ch = cell.ch;
      }

      const c = Math.round(sx), r = Math.round(sy);
      if (c < 0 || c >= cols || r < 0 || r >= rows) continue;
      const idx = r * cols + c;
      if (assembly < 0.3) {
        if (head.z <= zbuf[idx]) continue;
        zbuf[idx] = head.z;
      }
      const isBright = assembly > 0.55 || (p.intensity > 0.42 && head.front);
      if (isBright) bright[idx] = ch; else dim[idx] = ch;
    }

    el.layerDim.textContent = toText(dim);
    el.layerBright.textContent = toText(bright);
    requestAnimationFrame(render);
  }

  function toText(arr) {
    const out = new Array(rows);
    for (let r = 0; r < rows; r++) out[r] = arr.slice(r * cols, (r + 1) * cols).join('');
    return out.join('\n');
  }

  /* ---------- input ---------- */

  function bindInput() {
    el.viewport.addEventListener('pointerdown', e => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      dragging = true;
      lastX = e.clientX; lastY = e.clientY;
      el.viewport.classList.add('grabbing');
      el.viewport.setPointerCapture(e.pointerId);
      el.viewport.focus();
    });

    el.viewport.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      angle += dx * 0.01;
      tilt = clamp(tilt + dy * 0.004, -0.6, 0.6);
      spin = clamp(dx * 0.01, -0.12, 0.12);
    });

    const end = e => {
      if (!dragging) return;
      dragging = false;
      spin = clamp(spin, -0.09, 0.09);
      el.viewport.classList.remove('grabbing');
      if (e.pointerId !== undefined && el.viewport.hasPointerCapture(e.pointerId)) el.viewport.releasePointerCapture(e.pointerId);
    };
    el.viewport.addEventListener('pointerup', end);
    el.viewport.addEventListener('pointercancel', end);

    el.viewport.addEventListener('wheel', e => {
      e.preventDefault();
      angle += e.deltaY * 0.0022;
      spin = clamp(e.deltaY * 0.0022, -0.1, 0.1);
    }, { passive: false });

    document.addEventListener('keydown', e => {
      const k = Math.floor(angle / TAU);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); angle = (k + 1.5) * TAU; spin = IDLE_SPIN; }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); angle = (k - 0.5) * TAU; spin = IDLE_SPIN; }
    });

    el.next.addEventListener('click', () => { angle = (Math.floor(angle / TAU) + 1.5) * TAU; spin = IDLE_SPIN; });
    el.prev.addEventListener('click', () => { angle = (Math.floor(angle / TAU) - 0.5) * TAU; spin = IDLE_SPIN; });

    let timer;
    window.addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(resize, 180); });
  }

  /* ---------- ambient ---------- */

  function startRain() {
    const chars = '01<>/\\|+=*#';
    let grid = [];
    const reset = () => {
      grid = Array.from({ length: Math.ceil(innerHeight / 19) }, () => Array(Math.ceil(innerWidth / 9)).fill(' '));
    };
    reset();
    setInterval(() => {
      const rr = Math.ceil(innerHeight / 19), cc = Math.ceil(innerWidth / 9);
      if (grid.length !== rr || grid[0].length !== cc) reset();
      for (let k = 0; k < 22; k++) grid[Math.floor(Math.random() * rr)][Math.floor(Math.random() * cc)] = chars[Math.floor(Math.random() * chars.length)];
      el.rain.textContent = grid.map(row => row.join('')).join('\n');
    }, 170);
  }

  function startClock() {
    const tick = () => { el.clock.textContent = new Date().toLocaleTimeString('ru-RU', { hour12: false }); };
    tick(); setInterval(tick, 1000);
  }

  buildNav();
  resize();
  bindInput();
  startRain();
  startClock();
  requestAnimationFrame(render);
})();
