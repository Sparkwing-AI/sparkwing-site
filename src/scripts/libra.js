/**
 * How it works hero. A hollow numbered puzzle cube turns slowly in the starfield.
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
  let dprCap = 1;
  let stars = [];
  let mets = [];
  let t = 0;
  let last = 0;
  let next = 2.5;
  let cube = { x: 0, y: 0, L: 200 };
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
  const sky = document.createElement('canvas');
  const skyCtx = sky.getContext('2d');
  let skyFrame = 0;
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
  const layout = () => {
    const b = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    W = Math.round(b.width);
    H = Math.round(b.height);
    if (!W || !H) return false;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    if (stageEl) {
      const sb = stageEl.getBoundingClientRect();
      const ox = sb.left - b.left;
      const oy = sb.top - b.top;
      cube = { x: ox + sb.width * 0.52, y: oy + sb.height * 0.52, L: Math.min(sb.width * 0.34, sb.height * 0.4) };
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

  const drawCube = () => {
    const TOP = [[1, 1, 1], [2, 3, 3], [2, 4, 4]];
    const FRONT = [[2, 4, 4], [2, 4, 5], [2, 5, 5]];
    const RIGHT = [[1, 3, 4], [1, 3, 5], [1, 5, 5]];
    const BACK = [[3, 3, 1], [4, 1, 1], [4, 2, 2]];
    const LEFT = [[2, 2, 4], [2, 5, 4], [5, 5, 4]];
    const th = ((35 + t * 5) * Math.PI) / 180;
    const ph = (35.264 * Math.PI) / 180;
    const cT = Math.cos(th);
    const sT = Math.sin(th);
    const cP = Math.cos(ph);
    const sP = Math.sin(ph);
    const L = cube.L;
    const proj = (X, Y, Z) => {
      const xr = X * cT - Z * sT;
      const zr = X * sT + Z * cT;
      const yr = Y * cP - zr * sP;
      return [cube.x + xr * L, cube.y + 7 * Math.sin(t * 0.5) - yr * L];
    };
    const allFaces = [
      { map: TOP, shade: 0.11, vis: 1, v: (a, b) => proj(-0.5 + a / 3, 0.5, -0.5 + b / 3) },
      { map: FRONT, shade: 0.05, vis: cT, v: (a, b) => proj(-0.5 + a / 3, 0.5 - b / 3, 0.5) },
      { map: RIGHT, shade: 0.08, vis: sT, v: (a, b) => proj(0.5, 0.5 - b / 3, -0.5 + a / 3) },
      { map: BACK, shade: 0.05, vis: -cT, v: (a, b) => proj(0.5 - a / 3, 0.5 - b / 3, -0.5) },
      { map: LEFT, shade: 0.08, vis: -sT, v: (a, b) => proj(-0.5, 0.5 - b / 3, 0.5 - a / 3) },
    ];
    const faces = allFaces.filter((f) => f.vis > 0.02);
    ctx.globalAlpha = 1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const seg = (p, q, w) => {
      ctx.strokeStyle = 'rgba(95,214,236,0.14)';
      ctx.lineWidth = w + 3.5;
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(q[0], q[1]);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(170,240,250,0.9)';
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(q[0], q[1]);
      ctx.stroke();
    };
    faces.forEach((f) => {
      for (let k = 0; k <= 3; k += 1) {
        for (let i = 0; i < 3; i += 1) {
          const edge = k === 0 || k === 3;
          if (edge || f.map[k - 1][i] !== f.map[k][i]) seg(f.v(i, k), f.v(i + 1, k), edge ? 1.9 : 1.3);
          if (edge || f.map[i][k - 1] !== f.map[i][k]) seg(f.v(k, i), f.v(k, i + 1), edge ? 1.9 : 1.3);
        }
      }
    });
    const num = (f, fi, fj, label) => {
      const o = f.v(fi, fj);
      const u = f.v(fi + 1, fj);
      const w = f.v(fi, fj + 1);
      ctx.save();
      ctx.transform((u[0] - o[0]) / 100, (u[1] - o[1]) / 100, (w[0] - o[0]) / 100, (w[1] - o[1]) / 100, o[0], o[1]);
      ctx.font = '800 46px "DM Sans", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,233,176,0.95)';
      ctx.fillText(label, 0, 2);
      ctx.restore();
    };
    const NUMS = [
      [allFaces[0], 1.5, 0.5, '1'], [allFaces[1], 0.5, 1.5, '2'], [allFaces[0], 2, 1.5, '3'], [allFaces[1], 2, 0.5, '4'], [allFaces[1], 2, 2.5, '5'],
      [allFaces[2], 0.5, 1.5, '1'], [allFaces[2], 1.5, 0.5, '3'], [allFaces[2], 2.5, 0.5, '4'], [allFaces[2], 2.5, 2.5, '5'],
      [allFaces[3], 1.5, 1.5, '1'], [allFaces[3], 0.5, 0.5, '3'], [allFaces[3], 0.5, 1.5, '4'], [allFaces[3], 1.5, 2.5, '2'],
      [allFaces[4], 0.5, 0.5, '2'], [allFaces[4], 0.5, 2.5, '5'], [allFaces[4], 2.5, 0.5, '4'],
    ];
    NUMS.forEach((n) => {
      if (faces.indexOf(n[0]) >= 0) num(n[0], n[1], n[2], n[3]);
    });
    [[0.5, 0.5, 0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]].forEach((c, j) => {
      const pt = proj(c[0], c[1], c[2]);
      const sz = 44 * (1 + 0.14 * Math.sin(t * 1.4 + j * 1.9));
      ctx.drawImage(glow, pt[0] - sz / 2, pt[1] - sz / 2, sz, sz);
    });
  };

  const paintSky = () => {
    sky.width = W;
    sky.height = H;
    const sctx = skyCtx;
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.clearRect(0, 0, W, H);
    sctx.globalCompositeOperation = 'lighter';
    if (cube.L) {
      const cx = cube.x;
      const cy = cube.y;
      const R = Math.max(W, H) * 0.3;
      [[-0.55, -0.2, [60, 110, 215], 0.12, 0.55], [0.35, 0.15, [140, 90, 215], 0.27, 0.7], [0.1, -0.5, [195, 95, 190], 0.17, 0.5], [-0.15, 0.5, [50, 170, 190], 0.08, 0.45], [0.75, -0.2, [115, 80, 205], 0.23, 0.6], [0.6, 0.6, [70, 130, 220], 0.09, 0.5], [-0.7, 0.45, [165, 90, 205], 0.17, 0.5], [0.72, 0.62, [254, 185, 56], 0.2, 0.5]].forEach(([dx, dy, c, a, sz], i) => {
        const x = cx + dx * R + Math.sin(t * 0.05 + i) * R * 0.1;
        const y = cy + dy * R + Math.cos(t * 0.04 + i * 2) * R * 0.08;
        const r = R * sz * 1.2;
        const g = sctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${a})`);
        g.addColorStop(0.45, `rgba(${c[0]},${c[1]},${c[2]},${a * 0.4})`);
        g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        sctx.globalAlpha = 1;
        sctx.fillStyle = g;
        sctx.fillRect(x - r, y - r, r * 2, r * 2);
      });
    }
    const ramp = (x) => Math.max(0, Math.min(1, (x - W * 0.28) / (W * 0.3)));
    bands.forEach((bs, k) => {
      for (let x = W * 0.28; x < W; x += 24) {
        const h = H * (0.34 + 0.1 * Math.sin(x * 0.004 + t * 0.22 + k * 2.1));
        const y0 = H * (0.04 + 0.14 * k) + Math.sin(x * 0.006 - t * 0.17 + k) * H * 0.05;
        sctx.globalAlpha = 0.07 * ramp(x) * (0.55 + 0.45 * Math.sin(x * 0.011 + t * 0.3 + k));
        sctx.drawImage(bs, x, y0, 7, h);
      }
    });
  };

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    if (skyFrame % 90 === 0) paintSky();
    skyFrame += 1;
    if (sky.width) ctx.drawImage(sky, 0, 0);
    stars.forEach((s) => {
      ctx.globalAlpha = s.a * (0.6 + 0.4 * Math.sin(t * 0.9 + s.ph));
      ctx.fillStyle = '#EBFAF7';
      const d = s.r * 2;
      ctx.fillRect(s.x - s.r, s.y - s.r, d, d);
    });
    if (cube.L) drawCube();
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
