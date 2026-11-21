/**
 * Apps hero starfield. The three app icons are the SVG nodes in the stage.
 * Canvas pixels live here. Pauses with data-paused and when the tab is hidden.
 */

export function startAppsSky(canvas) {
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
  let raf = 0;
  let paused = reduce.matches || document.documentElement.hasAttribute('data-paused');

  const layout = () => {
    const b = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1);
    W = Math.round(b.width);
    H = Math.round(b.height);
    if (!W || !H) return false;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
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
    stars.forEach((s) => {
      ctx.globalAlpha = s.a * (0.6 + 0.4 * Math.sin(t * 0.9 + s.ph));
      ctx.fillStyle = '#EBFAF7';
      const d = s.r * 2;
      ctx.fillRect(s.x - s.r, s.y - s.r, d, d);
    });
    mets.forEach((m) => {
      const sp = Math.hypot(m.vx, m.vy) || 1;
      const dx = m.vx / sp;
      const dy = m.vy / sp;
      const tx = m.x - dx * m.len;
      const ty = m.y - dy * m.len;
      const [r, g, b] = m.col;
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = `rgba(${r},${g},${b},0.85)`;
      ctx.lineWidth = m.w;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
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
    for (let i = 0; i < 5; i += 1) spawn();
    t = 4;
    draw();
  } else {
    for (let i = 0; i < 40; i += 1) step(1 / 30);
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
