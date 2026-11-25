/* ============================================================
   ASCII CUBE — бело-зелёный 3D-куб с настоящими логотипами на гранях.
   Вращение куба само показывает следующую грань с логотипом.
   ============================================================ */

(() => {
  'use strict';

  const D = window.PORTFOLIO;
  const LOGO_ART = window.LOGO_ART || {};

  const TAU = Math.PI * 2;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IDLE_SPIN = reduced ? 0 : 0.0032;

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
    hint: document.getElementById('hint'),
    mode: document.getElementById('mode'),
    rain: document.getElementById('rain'),
    clock: document.getElementById('clock'),
    prev: document.getElementById('prev'),
    next: document.getElementById('next')
  };

  // Six faces of the cube = six frames of the reel.
  const faces = [
    { key: 'intro', target: [0, 0], slide: D.intro },
    { key: 'stickcommander', target: [-Math.PI / 2, 0], slide: D.projects[0] },
    { key: 'm5wheel', target: [Math.PI, 0], slide: D.projects[1] },
    { key: 'justvibrait', target: [Math.PI / 2, 0], slide: D.projects[2] },
    { key: 'tetris', target: [0, Math.PI / 2], slide: D.projects[3] },
    { key: 'github', target: [0, -Math.PI / 2], slide: D.outro }
  ];

  let cols = 96, rows = 42, fontSize = 10;
  let points = [];
  let angle = 0, manualTilt = 0, spin = IDLE_SPIN;
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
    for (const layer of [el.layerDim, el.layerGreen, el.layerWhite]) layer.style.fontSize = fontSize.toFixed(2) + 'px';
    points = makeCube();
    visibleIndex = -1;
  }

  /* ---------- cube point cloud ---------- */

  const FACE_BASIS = [
    { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },   // +Z front
    { n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },  // +X right
    { n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] }, // -Z back
    { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },  // -X left
    { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },  // +Y top
    { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] }   // -Y bottom
  ];

  function logoRows(key) {
    const raw = LOGO_ART[key] || '';
    const lines = raw.split('\n');
    return lines.length ? lines : Array(18).fill(' '.repeat(30));
  }

  function makeCube() {
    const out = [];
    faces.forEach((face, fi) => {
      const basis = FACE_BASIS[fi];
      const lines = logoRows(face.key);
      const h = lines.length, w = Math.max(...lines.map(l => l.length));
      for (let v = 0; v < h; v++) {
        for (let u = 0; u < w; u++) {
          const ch = lines[v][u] || ' ';
          const a = (u / (w - 1)) * 2 - 1;
          const b = (v / (h - 1)) * 2 - 1;
          const pos = [0, 0, 0];
          for (let k = 0; k < 3; k++) {
            pos[k] = basis.n[k] * 1.002 + basis.u[k] * a * 0.94 + basis.v[k] * b * 0.94;
          }
          out.push({ pos, normal: basis.n, ch: ch === ' ' ? '.' : ch, layer: ch === ' ' ? 0 : 1, seed: Math.random() });
        }
      }
    });

    // White wireframe edges make the cube unmistakably 3D.
    const corners = [];
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) corners.push([x, y, z]);
    const edgePairs = [];
    for (let i = 0; i < 8; i++) {
      for (let j = i + 1; j < 8; j++) {
        const diff = corners[i].filter((val, k) => val !== corners[j][k]).length;
        if (diff === 1) edgePairs.push([corners[i], corners[j]]);
      }
    }
    edgePairs.forEach(([a, b]) => {
      for (let t = 0; t <= 30; t++) {
        const k = t / 30;
        out.push({
          pos: a.map((val, i) => val + (b[i] - val) * k),
          normal: null,
          ch: k === 0 || k === 1 ? '+' : '#',
          layer: 2,
          seed: Math.random()
        });
      }
    });
    return out;
  }

  /* ---------- orientation from rotation ---------- */

  function orientation() {
    const turn = angle / TAU;
    const seg = Math.floor(turn);
    const f = turn - seg;
    const i = ((seg % faces.length) + faces.length) % faces.length;
    const e = smooth(0.12, 0.88, f);
    const from = faces[i].target, to = faces[(i + 1) % faces.length].target;
    const ry = from[0] + (to[0] - from[0]) * e;
    const rx = from[1] + (to[1] - from[1]) * e + manualTilt;
    const active = f < 0.5 ? i : (i + 1) % faces.length;
    const focus = 1 - smooth(0.06, 0.34, Math.min(f, 1 - f));
    return { i, f, ry, rx, active, focus };
  }

  function project(pos, ry, rx) {
    const cy = Math.cos(ry), sy = Math.sin(ry);
    const cx = Math.cos(rx), sx = Math.sin(rx);
    const x = pos[0] * cy + pos[2] * sy;
    let z = -pos[0] * sy + pos[2] * cy;
    const y = pos[1] * cx - z * sx;
    z = pos[1] * sx + z * cx;
    const p = 3.9 / (3.9 - z);
    return {
      x: cols / 2 + x * p * cols * 0.185,
      y: rows / 2 - y * p * rows * 0.255,
      z
    };
  }

  /* ---------- panel ---------- */

  function renderPanel(slide, index) {
    el.eyebrow.textContent = slide.eyebrow || '';
    el.title.textContent = slide.title || '';
    el.text.textContent = slide.text || '';
    el.tags.innerHTML = (slide.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');

    if (index > 0 && index < 5) {
      el.extra.innerHTML = `<span>★ ${slide.stars || 0}</span><span>OPEN SOURCE</span>`;
      el.link.hidden = false;
      el.link.href = slide.url;
      el.link.textContent = 'OPEN REPOSITORY ↗';
    } else if (index === 5) {
      el.extra.innerHTML = (slide.personal || []).map(x => `<span>${escapeHtml(x)}</span>`).join('') +
        (slide.socials || []).map(s => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">[ ${escapeHtml(s.label)} ↗ ]</a>`).join('');
      el.link.hidden = true;
    } else {
      el.extra.innerHTML = `<span>${escapeHtml(D.profile.role)}</span><span>${escapeHtml(D.profile.location)}</span>`;
      el.link.hidden = false;
      el.link.href = 'https://github.com/121kirillmorti?tab=repositories';
      el.link.textContent = 'ALL REPOSITORIES ↗';
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
      if (b) { angle = Number(b.dataset.i) * TAU; spin = IDLE_SPIN; manualTilt = 0; }
    });
  }

  /* ---------- frame ---------- */

  function render(now) {
    const dt = Math.min(50, now - lastFrame);
    lastFrame = now;
    if (!dragging) {
      angle += spin * dt / 16.7;
      spin += (IDLE_SPIN - spin) * 0.025;
      manualTilt *= 0.98;
    }

    const o = orientation();
    if (o.active !== visibleIndex) { renderPanel(faces[o.active].slide, o.active); visibleIndex = o.active; }
    el.info.classList.toggle('show', o.focus > 0.35);
    el.info.style.opacity = (0.4 + 0.6 * o.focus).toFixed(2);
    el.hint.classList.toggle('faded', o.focus > 0.5);
    el.mode.textContent = o.focus > 0.7 ? 'FACE: LOGO LOCKED' : 'CUBE: ROTATING';
    el.mode.classList.toggle('active', o.focus > 0.7);

    const dim = Array(cols * rows).fill(' ');
    const green = Array(cols * rows).fill(' ');
    const white = Array(cols * rows).fill(' ');
    const zbuf = new Float32Array(cols * rows).fill(-Infinity);

    for (const p of points) {
      const rp = project(p.pos, o.ry, o.rx);
      if (rp.z <= -0.02) continue; // rear half of the cube is hidden
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
      angle += dx * 0.008;
      manualTilt = clamp(manualTilt + dy * 0.003, -1.0, 1.0);
      spin = clamp(dx * 0.008, -0.1, 0.1);
    });

    const end = e => {
      if (!dragging) return;
      dragging = false;
      spin = clamp(spin, -0.08, 0.08);
      el.viewport.classList.remove('grabbing');
      if (e.pointerId !== undefined && el.viewport.hasPointerCapture(e.pointerId)) el.viewport.releasePointerCapture(e.pointerId);
    };
    el.viewport.addEventListener('pointerup', end);
    el.viewport.addEventListener('pointercancel', end);

    el.viewport.addEventListener('wheel', e => {
      e.preventDefault();
      angle += e.deltaY * 0.0019;
      spin = clamp(e.deltaY * 0.0019, -0.09, 0.09);
    }, { passive: false });

    const step = dir => {
      angle = (Math.floor(angle / TAU) + dir) * TAU;
      spin = IDLE_SPIN; manualTilt = 0;
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
      for (let k = 0; k < 18; k++) grid[Math.floor(Math.random() * rr)][Math.floor(Math.random() * cc)] = chars[Math.floor(Math.random() * chars.length)];
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
