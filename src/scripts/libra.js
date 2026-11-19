/**
 * How it works hero, ported from the board's startMeteors.
 * Canvas pixels live here. CSS tokens do not apply.
 * Pauses when the page pause control sets data-paused, and when the tab is hidden.
 */

export function startLibra(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { pause() {}, stop() {} };

  const rnd = (a, b) => a + Math.random() * (b - a);
  const COL = [[95, 214, 196], [169, 154, 240], [245, 160, 74], [235, 250, 247]];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let W = 0;
  let H = 0;
  let dpr = 1;
  let stars = [];
  let mets = [];
  let t = 0;
  let last = 0;
  let next = 2.5;
  let con = [];
  let raf = 0;
  let paused = reduce.matches || document.documentElement.hasAttribute('data-paused');
  const stageEl = canvas.closest('.mx-hero')?.querySelector('.mx-stage');

  const mkBand = (r, g, b) => {
    const s = document.createElement('canvas');
    s.width = 1;
    s.height = 128;
    const x = s.getContext('2d');
    const gr = x.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, `rgba(${r},${g},${b},0)`);
    gr.addColorStop(0.65, `rgba(${r},${g},${b},1)`);
    gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = gr;
    x.fillRect(0, 0, 1, 128);
    return s;
  };
  const bands = [mkBand(95, 214, 196), mkBand(150, 132, 232), mkBand(60, 200, 150)];
  const glow = document.createElement('canvas');
  glow.width = glow.height = 64;
  {
    const x = glow.getContext('2d');
    const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.12, 'rgba(235,250,247,0.9)');
    gr.addColorStop(0.35, 'rgba(95,214,196,0.28)');
    gr.addColorStop(1, 'rgba(95,214,196,0)');
    x.fillStyle = gr;
    x.fillRect(0, 0, 64, 64);
  }
  const DIP = [[0, 0.458, 1], [0.132, 0.377, 0.55], [0.227, 0.308, 0.55], [0.344, 0, 0.8], [0.7, 0.245, 1], [0.641, 0.725, 0.75], [0.366, 0.901, 0.9], [0.366, 1, 0.5]];
  const EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5], [4, 5], [5, 6], [6, 7]];

  const layout = () => {
    const b = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.round(b.width);
    H = Math.round(b.height);
    if (!W || !H) return false;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    if (stageEl) {
      const sb = stageEl.getBoundingClientRect();
      const S = Math.min(sb.width / 0.75, sb.height) * 0.88;
      const ox = sb.left - b.left + sb.width / 2 - 0.35 * S;
      const oy = sb.top - b.top + sb.height / 2 - 0.5 * S;
      con = DIP.map(([x, y, s]) => ({ x: ox + x * S, y: oy + y * S, s }));
    }
    stars = [];
    const n = Math.round((W * H) / 6500);
    for (let i = 0; i < n; i += 1) stars.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(0.5, 1.5), ph: rnd(0, 6.28), a: rnd(0.3, 0.9) });
    return true;
  };

  const spawn = () => {
    const big = Math.random() < 0.12;
    const ang = rnd(2.35, 2.65);
    const sp = big ? rnd(520, 700) : rnd(720, 1100);
    mets.push({
      x: rnd(W * 0.15, W * 1.3),
      y: rnd(-160, H * 0.45),
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      len: big ? rnd(240, 340) : rnd(110, 220),
      col: big ? [254, 185, 56] : COL[Math.floor(Math.random() * 3)],
      w: big ? 2.6 : rnd(1, 1.8),
      big,
    });
  };

  const step = (dt) => {
    t += dt;
    next -= dt;
    if (next <= 0) {
      spawn();
      next = rnd(3, 7);
    }
    for (let i = mets.length - 1; i >= 0; i -= 1) {
      const m = mets[i];
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.x < -m.len - 40 || m.y > H + m.len + 40) mets.splice(i, 1);
    }
  };

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    if (con.length) {
      const cx = (con[0].x + con[4].x) / 2;
      const cy = (con[3].y + con[7].y) / 2;
      const R = Math.max(W, H) * 0.3;
      [[-0.55, -0.2, [60, 110, 215], 0.12, 0.55], [0.35, 0.15, [140, 90, 215], 0.27, 0.7], [0.1, -0.5, [195, 95, 190], 0.17, 0.5], [-0.15, 0.5, [50, 170, 190], 0.08, 0.45], [0.75, -0.2, [115, 80, 205], 0.23, 0.6], [0.6, 0.6, [70, 130, 220], 0.09, 0.5], [-0.7, 0.45, [165, 90, 205], 0.17, 0.5]].forEach(([dx, dy, c, a, sz], i) => {
        const x = cx + dx * R + Math.sin(t * 0.05 + i) * R * 0.1;
        const y = cy + dy * R + Math.cos(t * 0.04 + i * 2) * R * 0.08;
        const r = R * sz * 1.2;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${a})`);
        g.addColorStop(0.45, `rgba(${c[0]},${c[1]},${c[2]},${a * 0.4})`);
        g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.globalAlpha = 1;
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      });
    }
    const ramp = (x) => Math.max(0, Math.min(1, (x - W * 0.28) / (W * 0.3)));
    bands.forEach((bs, k) => {
      for (let x = W * 0.28; x < W; x += 6) {
        const h = H * (0.34 + 0.1 * Math.sin(x * 0.004 + t * 0.22 + k * 2.1));
        const y0 = H * (0.04 + 0.14 * k) + Math.sin(x * 0.006 - t * 0.17 + k) * H * 0.05;
        ctx.globalAlpha = 0.07 * ramp(x) * (0.55 + 0.45 * Math.sin(x * 0.011 + t * 0.3 + k));
        ctx.drawImage(bs, x, y0, 7, h);
      }
    });
    stars.forEach((s) => {
      ctx.globalAlpha = s.a * (0.6 + 0.4 * Math.sin(t * 0.9 + s.ph));
      ctx.fillStyle = '#EBFAF7';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.29);
      ctx.fill();
    });
    if (con.length) {
      const p = Math.max(0, Math.min(1, (t - 0.6) / 4.5));
      ctx.lineCap = 'round';
      ctx.globalAlpha = 1;
      EDGES.forEach(([a, b], i) => {
        const f = Math.max(0, Math.min(1, p * EDGES.length - i));
        if (f <= 0) return;
        const ex = con[a].x + (con[b].x - con[a].x) * f;
        const ey = con[a].y + (con[b].y - con[a].y) * f;
        ctx.strokeStyle = 'rgba(95,214,236,0.14)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(con[a].x, con[a].y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(170,240,250,0.85)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(con[a].x, con[a].y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      });
      con.forEach((s, j) => {
        const al = Math.max(0, Math.min(1, (t - 0.3 - j * 0.35) / 0.6));
        if (al <= 0) return;
        const sz = (s.s >= 0.9 ? 78 : 46 * s.s) * (1 + 0.12 * Math.sin(t * 1.3 + j * 1.7));
        ctx.globalAlpha = al;
        ctx.drawImage(glow, s.x - sz / 2, s.y - sz / 2, sz, sz);
        if (s.s >= 0.9) {
          ctx.strokeStyle = 'rgba(255,248,231,0.7)';
          ctx.lineWidth = 1.2;
          const L = 26 + 4 * Math.sin(t * 1.3);
          ctx.beginPath();
          ctx.moveTo(s.x - L, s.y);
          ctx.lineTo(s.x + L, s.y);
          ctx.moveTo(s.x, s.y - L);
          ctx.lineTo(s.x, s.y + L);
          ctx.stroke();
        }
      });
    }
    ctx.lineCap = 'round';
    mets.forEach((m) => {
      const sp = Math.hypot(m.vx, m.vy) || 1;
      const dx = m.vx / sp;
      const dy = m.vy / sp;
      const tx = m.x - dx * m.len;
      const ty = m.y - dy * m.len;
      const [r, g, b] = m.col;
      const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.15, `rgba(${r},${g},${b},0.85)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = grad;
      ctx.lineWidth = m.w;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      const gr = m.big ? 22 : 13;
      const halo = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, gr);
      halo.addColorStop(0, 'rgba(255,255,255,0.95)');
      halo.addColorStop(0.3, `rgba(${r},${g},${b},0.45)`);
      halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(m.x - gr, m.y - gr, gr * 2, gr * 2);
    });
    ctx.globalAlpha = 1;
  };

  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    if (!last) {
      last = now;
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (paused || document.hidden) return;
    step(dt);
    draw();
  };

  if (!layout()) return { pause() {}, stop() {} };

  if (reduce.matches) {
    for (let i = 0; i < 7; i += 1) spawn();
    mets.forEach((m) => {
      m.x = rnd(W * 0.35, W * 0.95);
      m.y = rnd(H * 0.1, H * 0.7);
    });
    t = 10;
    draw();
  } else {
    for (let i = 0; i < 90; i += 1) step(1 / 30);
    t = 0;
    raf = requestAnimationFrame(tick);
  }

  const observer = new ResizeObserver(() => layout());
  observer.observe(canvas);
  const onPause = () => {
    paused = reduce.matches || document.documentElement.hasAttribute('data-paused');
  };
  const mo = new MutationObserver(onPause);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-paused'] });
  reduce.addEventListener('change', onPause);

  return {
    pause(next) {
      paused = next || reduce.matches;
    },
    stop() {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      mo.disconnect();
    },
  };
}
