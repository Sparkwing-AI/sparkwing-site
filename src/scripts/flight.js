/** The Home transformation steps: a butterfly flies in once and touches each hidden card to life.
 * Canvas pixel colours stay in this file: they are drawn, not styled.
 */
const RGB = { gold: '254,185,56', ember: '240,130,30', violet: '106,86,200', white: '255,255,255' };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (t) => t * t * (3 - 2 * t);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function spline(pts) {
  const out = [];
  const cr = (a, b, c, d, t) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < 36; k++) {
      const t = k / 36;
      out.push({ x: cr(p0.x, p1.x, p2.x, p3.x, t), y: cr(p0.y, p1.y, p2.y, p3.y, t) });
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

export function startFlight(section, opts = {}) {
  const canvas = section.querySelector('.home-flight-canvas');
  const wrap = section.querySelector('.home-flight');
  const cards = Array.from(section.querySelectorAll('.home-flight-card'));
  if (!canvas || !wrap || !cards.length) return { pause() {}, reveal() {} };
  const g = canvas.getContext('2d');
  const trail = document.createElement('canvas');
  const tg = trail.getContext('2d');
  const low = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;

  let W = 0, H = 0, dpr = 1, T = 0, raf = 0, last = 0, paused = false, onScreen = false;
  let legs = [], leg = -1, legT = 0, hold = 0, mode = 'wait', done = false;
  const B = { x: -80, y: 40, ang: 0, size: 1 };
  const dust = [];
  const tracers = [];
  const jets = [];
  let stacked = false;
  let lastDot = null;

  const rel = (el) => {
    const a = el.getBoundingClientRect(), b = canvas.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
  };
  const touchPoint = (i) => {
    const r = rel(cards[i]);
    const last = i === cards.length - 1;
    return { x: r.x + r.w * (last ? 0.72 : 0.5), y: r.y - (last ? 7 : 2) };
  };

  function plan() {
    stacked = rel(cards[0]).y + 4 < rel(cards[cards.length - 1]).y;
        let from = { x: -80, y: Math.max(20, touchPoint(0).y - (stacked ? 70 : 72)) };
    legs = cards.map((card, i) => {
      const to = touchPoint(i);
      const dx = to.x - from.x, dy = to.y - from.y;
      const lift = stacked ? 0 : rnd(62, 84);
      const pts = stacked
        ? [from, { x: W * (i % 2 ? 0.78 : 0.22), y: from.y + dy * 0.34 }, { x: W * (i % 2 ? 0.3 : 0.7), y: from.y + dy * 0.66 }, { x: to.x + 34, y: to.y - 42 }, to]
        : [
            from,
            { x: from.x + dx * 0.28, y: to.y - lift },
            { x: from.x + dx * 0.6, y: to.y - lift * 0.3 },
            { x: from.x + dx * 0.52, y: to.y - lift * 0.9 },
            { x: from.x + dx * 0.8, y: to.y - lift * 0.82 },
            { x: to.x + 18, y: to.y - 34 },
            to,
          ];
      from = to;
      return { path: spline(pts), to, dur: stacked ? 1.5 : 1.8 };
    });
  }

  function layout() {
    const b = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, low ? 1.5 : 2);
    W = Math.round(b.width); H = Math.round(b.height);
    if (!W || !H) return;
    canvas.width = trail.width = W * dpr;
    canvas.height = trail.height = H * dpr;
    B.size = W < 700 ? 0.74 : 0.92;
    if (!done) plan();
  }

  function overCard(x, y) {
    return cards.some((card) => {
      const r = rel(card);
      return x > r.x - 6 && x < r.x + r.w + 6 && y > r.y - 6 && y < r.y + r.h + 6;
    });
  }

  function dot(x, y) {
    if (lastDot && Math.hypot(x - lastDot.x, y - lastDot.y) < 11) return;
    lastDot = { x, y };
    if (stacked && overCard(x, y)) return;
    tg.setTransform(dpr, 0, 0, dpr, 0, 0);
    tg.fillStyle = `rgba(${RGB.gold},.9)`;
    tg.beginPath(); tg.arc(x, y, 1.7, 0, 6.29); tg.fill();
  }

  function fountain(p, count) {
    jets.push({ x: p.x, y: p.y, left: count, rate: count / 0.55, carry: 0 });
  }

  function spray(jet) {
    const a = -Math.PI / 2 + rnd(-0.62, 0.62), v = rnd(170, 430);
    dust.push({ x: jet.x + rnd(-3, 3), y: jet.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 520, age: 0, life: rnd(0.8, 1.7), size: rnd(3, 11), col: pick(['gold', 'gold', 'ember', 'violet', 'white']), ph: rnd(0, 6.28) });
  }

  // The card's outline as points, clockwise from the top left.
  function outline(card) {
    const r = rel(card), rad = Math.min(24, r.w / 4), pts = [];
    const add = (x, y) => pts.push({ x, y });
    const arc = (cx, cy, from) => { for (let k = 0; k <= 8; k++) { const a = from + (k / 8) * (Math.PI / 2); add(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); } };
    const line = (x0, y0, x1, y1) => { const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 8)); for (let k = 1; k < n; k++) add(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n); };
    const L = r.x, R = r.x + r.w, Y = r.y, B2 = r.y + r.h;
    line(L + rad, Y, R - rad, Y); arc(R - rad, Y + rad, -Math.PI / 2);
    line(R, Y + rad, R, B2 - rad); arc(R - rad, B2 - rad, 0);
    line(R - rad, B2, L + rad, B2); arc(L + rad, B2 - rad, Math.PI / 2);
    line(L, B2 - rad, L, Y + rad); arc(L + rad, Y + rad, Math.PI);
    return pts;
  }

  function trace(i) {
    const p = legs[i].to, pts = outline(cards[i]);
    let start = 0, best = Infinity;
    pts.forEach((q, k) => { const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < best) { best = d; start = k; } });
    const half = Math.floor(pts.length / 2);
    tracers.push({ card: i, pts, start, half, t: 0, fade: 1, lit: false, dur: low ? 0.8 : 0.95 });
  }

  function light(i) {
    trace(i);
    fountain(legs[i].to, low ? 45 : 110);
  }

  function star(x, y, size, col, alpha) {
    g.globalAlpha = clamp(alpha, 0, 1);
    g.fillStyle = `rgb(${RGB[col]})`;
    g.beginPath();
    [[0, -1], [0.14, -0.14], [1, 0], [0.14, 0.14], [0, 1], [-0.14, 0.14], [-1, 0], [-0.14, -0.14]].forEach(([a, b], i) => {
      const px = x + a * size, py = y + b * size;
      if (i) g.lineTo(px, py); else g.moveTo(px, py);
    });
    g.closePath(); g.fill();
  }

  function butterfly(x, y, ang, scale, open) {
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(scale, scale);
    [-1, 1].forEach((side) => {
      g.save(); g.scale(side * open, 1);
      const up = g.createLinearGradient(0, -2, 26, -24);
      up.addColorStop(0, '#FFD777'); up.addColorStop(0.42, '#8D78E2'); up.addColorStop(1, '#55459B');
      g.fillStyle = up; g.strokeStyle = 'rgba(85,69,155,.55)'; g.lineWidth = 0.9;
      g.beginPath(); g.moveTo(1, -1); g.bezierCurveTo(6, -24, 27, -30, 31, -18); g.bezierCurveTo(33, -9, 19, 0, 1, 2); g.closePath(); g.fill(); g.stroke();
      const lo = g.createLinearGradient(0, 2, 18, 20);
      lo.addColorStop(0, '#FFD777'); lo.addColorStop(1, '#F39A2B');
      g.fillStyle = lo;
      g.beginPath(); g.moveTo(1, 2); g.bezierCurveTo(13, 2, 24, 7, 20, 16); g.bezierCurveTo(16, 24, 5, 17, 1, 7); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.9)';
      [[22, -19, 2], [15, -13, 1.4], [13, 11, 1.3]].forEach(([a, b, r]) => { g.beginPath(); g.arc(a, b, r, 0, 6.29); g.fill(); });
      g.restore();
    });
    g.fillStyle = '#14263D'; g.beginPath(); g.ellipse(0, 1, 1.7, 9, 0, 0, 6.29); g.fill();
    g.restore();
  }

  function draw() {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.globalAlpha = 1;
    g.drawImage(trail, 0, 0);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    tracers.forEach((tr) => {
      const n = Math.floor(ease(Math.min(tr.t, 1)) * tr.half), at = (k) => tr.pts[(tr.start + k + tr.pts.length) % tr.pts.length];
      g.lineCap = 'round'; g.lineJoin = 'round';
      [[9, `rgba(${RGB.gold},.22)`], [3, `rgb(${RGB.gold})`], [1.2, 'rgba(255,255,255,.95)']].forEach(([w, col]) => {
        g.globalAlpha = tr.fade; g.strokeStyle = col; g.lineWidth = w;
        g.beginPath(); for (let k = -n; k <= n; k++) { const q = at(k); if (k === -n) g.moveTo(q.x, q.y); else g.lineTo(q.x, q.y); } g.stroke();
      });
      if (tr.t < 1) { [at(n), at(-n)].forEach((q) => { star(q.x, q.y, 11 + Math.sin(T * 30) * 2, 'white', 1); star(q.x, q.y, 7, 'gold', 1); }); }
    });
    dust.forEach((s) => {
      const k = s.age / s.life, tw = 0.6 + 0.4 * Math.sin(T * 14 + s.ph);
      star(s.x, s.y, s.size * (1 - k * 0.4), s.col, (1 - k * k) * tw);
    });
    g.globalAlpha = 1;
    if (mode !== 'wait') {
      const moving = mode === 'fly';
      const open = moving ? 0.3 + 0.7 * Math.abs(Math.cos(T * 19)) : 0.55 + 0.45 * Math.abs(Math.cos(T * 2.4));
      butterfly(B.x, B.y, B.ang, B.size, open);
    }
  }

  const nearView = (i) => cards[i].getBoundingClientRect().top < window.innerHeight * 0.82;

  function step(dt) {
    T += dt;
    for (let i = dust.length - 1; i >= 0; i--) {
      const s = dust[i];
      s.age += dt; s.vy += (s.g || 70) * dt; s.vx *= 1 - dt * (s.g ? 0.5 : 1.5); s.vy *= 1 - dt * (s.g ? 0.15 : 0.8);
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.age >= s.life) dust.splice(i, 1);
    }
    for (let i = jets.length - 1; i >= 0; i--) {
      const jet = jets[i];
      jet.carry += jet.rate * dt;
      while (jet.carry >= 1 && jet.left > 0) { spray(jet); jet.carry -= 1; jet.left -= 1; }
      if (jet.left <= 0) jets.splice(i, 1);
    }
    for (let i = tracers.length - 1; i >= 0; i--) {
      const tr = tracers[i];
      tr.t += dt / tr.dur;
      if (tr.t < 1 && Math.random() < dt * (low ? 40 : 110)) {
        const n = Math.floor(ease(tr.t) * tr.half), side = Math.random() < 0.5 ? n : -n;
        const q = tr.pts[(tr.start + side + tr.pts.length) % tr.pts.length];
        dust.push({ x: q.x, y: q.y, vx: rnd(-34, 34), vy: rnd(-46, 18), g: 90, age: 0, life: rnd(0.35, 0.8), size: rnd(2.5, 6.5), col: pick(['gold', 'white', 'violet']), ph: rnd(0, 6.28) });
      }
      if (!tr.lit && tr.t >= 0.8) { tr.lit = true; cards[tr.card].classList.add('is-lit'); }
      if (tr.t >= 1) { tr.fade -= dt * 2.4; if (tr.fade <= 0) tracers.splice(i, 1); }
    }
    if (mode === 'wait' || mode === 'hold') {
      if (mode === 'hold' && hold > 0) { hold -= dt; return; }
      if (leg + 1 < legs.length && nearView(leg + 1)) { leg += 1; legT = 0; mode = 'fly'; }
      return;
    }
    if (mode === 'fly') {
      const cur = legs[leg];
      legT = Math.min(1, legT + dt / cur.dur);
      const k = ease(legT) * 0.45 + legT * 0.55;
      const f = k * (cur.path.length - 1), i = Math.floor(f), j = Math.min(i + 1, cur.path.length - 1), t = f - i;
      const px = B.x, py = B.y;
      const flutter = Math.sin(T * 8.5) * 5 * (1 - legT * legT);
      B.x = cur.path[i].x + (cur.path[j].x - cur.path[i].x) * t;
      B.y = cur.path[i].y + (cur.path[j].y - cur.path[i].y) * t + flutter;
      const target = clamp((B.x - px) * 0.035, -0.5, 0.5) + clamp((B.y - py) * 0.02, -0.25, 0.25);
      B.ang += (target - B.ang) * clamp(dt * 7, 0, 1);
      dot(B.x, B.y + 3);
      if (Math.random() < dt * (low ? 18 : 42)) dust.push({ x: B.x + rnd(-5, 5), y: B.y + rnd(-5, 7), vx: rnd(-22, 22), vy: rnd(-8, 34), age: 0, life: rnd(0.45, 1), size: rnd(2.5, 6), col: pick(['gold', 'gold', 'violet', 'ember']), ph: rnd(0, 6.28) });
      if (legT >= 1) {
        light(leg);
        B.x = cur.to.x; B.y = cur.to.y;
        if (leg === legs.length - 1) { mode = 'perch'; done = true; B.ang = 0.12; }
        else { mode = 'hold'; hold = 0.5; }
      }
    }
  }

  function placeFinal() {
    const p = touchPoint(cards.length - 1);
    B.x = p.x; B.y = p.y; B.ang = 0.12; mode = 'perch'; done = true;
  }

  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    if (low && now - last < 1000 / 30) return;
    last = now;
    step(dt); draw();
  };
  const sync = () => {
    cancelAnimationFrame(raf); raf = 0;
    if (!paused && onScreen && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); }
  };

  layout();
  draw();
  const io = new IntersectionObserver((e) => { onScreen = e[0].isIntersecting; sync(); });
  io.observe(section);
  const ro = new ResizeObserver(() => {
    const was = done;
    layout();
    if (was) { tg.clearRect(0, 0, trail.width, trail.height); placeFinal(); draw(); }
  });
  ro.observe(canvas);
  document.addEventListener('visibilitychange', sync);

  function reveal() {
    legs.forEach((_, i) => cards[i].classList.add('is-lit'));
    wrap.removeAttribute('data-flight');
    leg = legs.length - 1; dust.length = 0; tracers.length = 0; jets.length = 0; placeFinal(); draw();
  }

  section.addEventListener('focusin', (e) => {
    if (!done && e.target.closest && e.target.closest('.home-flight-card')) reveal();
  });

  if (opts.still) { reveal(); }

  return {
    pause(v) {
      paused = v;
      if (v && !done) reveal();
      sync();
      if (v) draw();
    },
    reveal,
  };
}
