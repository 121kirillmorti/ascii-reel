/* ============================================================
   ASCII CUBE — бело-зелёный куб, который крутится вместе с тобой.
   ============================================================ */

(() => {
  'use strict';

  const D = window.PORTFOLIO;
  const LOGO_ART = window.LOGO_ART || {};
  const TAU = Math.PI * 2;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const el = {
    viewport: document.getElementById('viewport'),
    stageWrap: document.querySelector('.stage-wrap'),
    layerDim: document.getElementById('layer-dim'),
    layerGreen: document.getElementById('layer-green'),
    layerWhite: document.getElementById('layer-white'),
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
    mode: document.getElementById('mode'),
    rain: document.getElementById('rain'),
    clock: document.getElementById('clock'),
    prev: document.getElementById('prev'),
    next: document.getElementById('next')
  };

  const faces = [
    { key: 'intro', slide: D.intro, target: [0, 0] },
    { key: 'stickcommander', slide: D.projects[0], target: [-Math.PI / 2, 0] },
    { key: 'm5wheel', slide: D.projects[1], target: [Math.PI, 0] },
    { key: 'justvibrait', slide: D.projects[2], target: [Math.PI / 2, 0] },
    { key: 'tetris', slide: D.projects[3], target: [0, Math.PI / 2] },
    { key: 'github', slide: D.outro, target: [0, -Math.PI / 2] }
  ];

  let cols = 96, rows = 42, fontSize = 10;
  let points = [];
  let rotY = 0.35, rotX = -0.22, velY = 0, velX = 0;
  let dragging = false, lastX = 0, lastY = 0;
  let visibleIndex = -1, lastFrame = performance.now();

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- размеры ---------- */

  function resize() {
    cols = window.innerWidth < 720 ? 64 : 96;
    rows = window.innerWidth < 720 ? 30 : 42;
    const box = el.stageWrap.getBoundingClientRect();
    fontSize = Math.max(2.2, Math.min(box.width / (cols * 0.625), box.height / (rows * 1.04)));
    for (const layer of [el.layerDim, el.layerGreen, el.layerWhite]) layer.style.fontSize = fontSize.toFixed(2) + 'px';
    points = makeCube();
    visibleIndex = -1;
  }

  /* ---------- куб из точек ---------- */

  const BASIS = [
    { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
    { n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },
    { n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] },
    { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
    { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },
    { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] }
  ];

  function logoRows(key) {
    const lines = (LOGO_ART[key] || '').split('\n');
    return lines.length > 1 ? lines : Array(28).fill(' '.repeat(48));
  }

  function makeCube() {
    const out = [];
    faces.forEach((face, fi) => {
      const b = BASIS[fi];
      const lines = logoRows(face.key);
      const h = lines.length, w = Math.max(...lines.map(l => l.length));
      for (let v = 0; v < h; v++) {
        for (let u = 0; u < w; u++) {
          const ch = lines[v][u] || ' ';
          const a = (u / (w - 1)) * 2 - 1;
          const bb = (v / (h - 1)) * 2 - 1;
          const pos = [0, 0, 0];
          for (let k = 0; k < 3; k++) pos[k] = b.n[k] * 1.003 + b.u[k] * a * 0.97 + b.v[k] * bb * 0.97;
          out.push({ pos, normal: b.n, ch: ch === ' ' ? ':' : ch, layer: ch === ' ' ? 0 : 1 });
        }
      }
    });

    // белые рёбра, чтобы куб читался как куб
    const corners = [];
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) corners.push([x, y, z]);
    for (let i = 0; i < 8; i++) {
      for (let j = i + 1; j < 8; j++) {
        if (corners[i].filter((val, k) => val !== corners[j][k]).length !== 1) continue;
        const a = corners[i], b = corners[j];
        for (let t = 0; t <= 38; t++) {
          const k = t / 38;
          out.push({
            pos: a.map((val, idx) => val + (b[idx] - val) * k),
            normal: null,
            ch: k === 0 || k === 1 ? '+' : '#',
            layer: 2
          });
        }
      }
    }
    return out;
  }

  function rotate(v, ry, rx) {
    const cy = Math.cos(ry), sy = Math.sin(ry);
    const cx = Math.cos(rx), sx = Math.sin(rx);
    const x = v[0] * cy + v[2] * sy;
    let z = -v[0] * sy + v[2] * cy;
    const y = v[1] * cx - z * sx;
    z = v[1] * sx + z * cx;
    return [x, y, z];
  }

  function project(pos, ry, rx) {
    const [x, y, z] = rotate(pos, ry, rx);
    const p = 3.9 / (3.9 - z);
    return {
      x: cols / 2 + x * p * cols * 0.21,
      y: rows / 2 - y * p * rows * 0.30,
      z
    };
  }

  function activeFace(ry, rx) {
    let best = 0, bestZ = -Infinity;
    BASIS.forEach((b, i) => {
      const z = rotate(b.n, ry, rx)[2];
      if (z > bestZ) { bestZ = z; best = i; }
    });
    return { index: best, focus: smooth(0.3, 0.82, bestZ) };
  }

  /* ---------- текст под кубом ---------- */

  function renderPanel(slide, index) {
    el.eyebrow.textContent = slide.eyebrow || '';
    el.title.textContent = slide.title || '';
    el.text.textContent = slide.text || '';
    el.tags.innerHTML = (slide.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');

    if (index > 0 && index < 5) {
      el.extra.innerHTML = `<span>★ ${slide.stars || 0}</span><span>исходники на GitHub</span>`;
      el.link.hidden = false;
      el.link.href = slide.url;
      el.link.textContent = 'посмотреть репозиторий ↗';
    } else if (index === 5) {
      el.extra.innerHTML = (slide.personal || []).map(x => `<span>${escapeHtml(x)}</span>`).join('') +
        (slide.socials || []).map(s => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">↗ ${escapeHtml(s.label)}</a>`).join('');
      el.link.hidden = true;
    } else {
      el.extra.innerHTML = `<span>${escapeHtml(D.profile.role)}</span><span>${escapeHtml(D.profile.location)}</span>`;
      el.link.hidden = false;
      el.link.href = 'https://github.com/121kirillmorti?tab=repositories';
      el.link.textContent = 'все репозитории ↗';
    }

    el.count.textContent = String(index + 1).padStart(2, '0');
    el.dots.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === index));
    [...el.progress.children].forEach((s, i) => s.classList.toggle('on', i <= index));
  }

  function buildNav() {
    el.dots.innerHTML = faces.map((_, i) => `<button class="dot" role="tab" aria-label="Грань ${i + 1}" data-i="${i}"></button>`).join('');
    el.progress.innerHTML = faces.map(() => '<span></span>').join('');
    el.dots.addEventListener('click', e => {
      const b = e.target.closest('.dot');
      if (!b) return;
      [rotY, rotX] = faces[Number(b.dataset.i)].target;
      velY = 0; velX = 0;
    });
  }

  /* ---------- кадр ---------- */

  function render(now) {
    const dt = Math.min(50, now - lastFrame);
    lastFrame = now;

    if (!dragging) {
      const idleX = reduced ? 0 : 0.00055 * Math.sin(now * 0.00028);
      const idleY = reduced ? 0 : 0.0022;
      velY += (idleY - velY) * 0.028;
      velX += (idleX - velX) * 0.028;
      rotY += velY * dt / 16.7;
      rotX += velX * dt / 16.7;
    }

    const active = activeFace(rotY, rotX);
    if (active.index !== visibleIndex) { renderPanel(faces[active.index].slide, active.index); visibleIndex = active.index; }
    el.info.classList.toggle('show', active.focus > 0.28);
    el.info.style.opacity = (0.45 + 0.55 * active.focus).toFixed(2);
    el.mode.textContent = active.focus > 0.72 ? 'вот оно' : 'вертится...';
    el.mode.classList.toggle('active', active.focus > 0.72);

    const dim = Array(cols * rows).fill(' ');
    const green = Array(cols * rows).fill(' ');
    const white = Array(cols * rows).fill(' ');
    const zbuf = new Float32Array(cols * rows).fill(-Infinity);

    for (const p of points) {
      const rp = project(p.pos, rotY, rotX);
      if (rp.z <= -0.02) continue;
      const c = Math.round(rp.x), r = Math.round(rp.y);
      if (c < 0 || c >= cols || r < 0 || r >= rows) continue;
      const idx = r * cols + c;
      if (rp.z <= zbuf[idx]) continue;
      zbuf[idx] = rp.z;
      if (p.layer === 0) dim[idx] = p.ch;
      else if (p.layer === 1) green[idx] = p.ch;
      else white[idx] = p.ch;
    }

    el.layerDim.textContent = toText(dim);
    el.layerGreen.textContent = toText(green);
    el.layerWhite.textContent = toText(white);
    requestAnimationFrame(render);
  }

  function toText(arr) {
    const out = new Array(rows);
    for (let r = 0; r < rows; r++) out[r] = arr.slice(r * cols, (r + 1) * cols).join('');
    return out.join('\n');
  }

  /* ---------- управление ---------- */

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
      rotY += dx * 0.009;
      rotX += dy * 0.009;   // крутим и вверх, и вниз без ограничений
      velY = dx * 0.009;
      velX = dy * 0.009;
    });

    const end = e => {
      if (!dragging) return;
      dragging = false;
      velY = clamp(velY, -0.12, 0.12);
      velX = clamp(velX, -0.12, 0.12);
      el.viewport.classList.remove('grabbing');
      if (e.pointerId !== undefined && el.viewport.hasPointerCapture(e.pointerId)) el.viewport.releasePointerCapture(e.pointerId);
    };
    el.viewport.addEventListener('pointerup', end);
    el.viewport.addEventListener('pointercancel', end);

    el.viewport.addEventListener('wheel', e => {
      e.preventDefault();
      rotY += e.deltaY * 0.0022;
      velY = clamp(e.deltaY * 0.0022, -0.1, 0.1);
    }, { passive: false });

    const step = dir => {
      rotY = Math.round((rotY + dir * Math.PI / 2) / (Math.PI / 2)) * (Math.PI / 2);
      velY = 0; velX = 0;
    };
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
    });
    el.next.addEventListener('click', () => step(1));
    el.prev.addEventListener('click', () => step(-1));

    let timer;
    window.addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(resize, 180); });
  }

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
      for (let k = 0; k < 16; k++) grid[Math.floor(Math.random() * rr)][Math.floor(Math.random() * cc)] = chars[Math.floor(Math.random() * chars.length)];
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
