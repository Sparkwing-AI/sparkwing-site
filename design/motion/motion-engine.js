  startScene(kind, opts = {}) {
    const root = document.querySelector('.mx-hero');
    const c = root.querySelector('.mx-canvas');
    const stageEl = root.querySelector('.mx-stage');
    const ctx = c.getContext('2d');
    const RGB = { gold: [254, 185, 56], ember: [240, 130, 30], teal: [95, 214, 196], white: [235, 250, 247], violet: [150, 132, 232] };
    const rnd = (a, b) => a + Math.random() * (b - a);
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const ease = (t) => t * t * (3 - 2 * t);
    const sprites = {};
    Object.keys(RGB).forEach((k) => {
      const s = document.createElement('canvas'); s.width = s.height = 128;
      const g = s.getContext('2d'); const [r, gr, b] = RGB[k];
      const rad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      rad.addColorStop(0, 'rgba(255,255,255,1)');
      rad.addColorStop(0.09, `rgba(${r},${gr},${b},.95)`);
      rad.addColorStop(0.28, `rgba(${r},${gr},${b},.26)`);
      rad.addColorStop(1, `rgba(${r},${gr},${b},0)`);
      g.fillStyle = rad; g.fillRect(0, 0, 128, 128); sprites[k] = s;
    });
    let W = 0, H = 0, dpr = 1, F = { x0: 0, y0: 0, w: 1, h: 1, cx: 0, cy: 0, r: 1 }, T = 0;
    let stars = [], pulses = [], bursts = [], X = {}, emit = 0;
    const spark = (x, y, size, alpha, col) => { ctx.globalAlpha = clamp(alpha, 0, 1); ctx.drawImage(sprites[col], x - size / 2, y - size / 2, size, size); };
    const relRect = (el) => { const a = el.getBoundingClientRect(), b = c.getBoundingClientRect(); const k = b.width ? W / b.width : 1; return { x: (a.left - b.left) * k, y: (a.top - b.top) * k, w: a.width * k, h: a.height * k, cx: (a.left - b.left + a.width / 2) * k, cy: (a.top - b.top + a.height / 2) * k }; };
    const curve = (a, b, bend) => { const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y; return { a, b, c: { x: mx - dy * bend, y: my + dx * bend } }; };
    const at = (q, t) => { const u = 1 - t; return { x: u * u * q.a.x + 2 * u * t * q.c.x + t * t * q.b.x, y: u * u * q.a.y + 2 * u * t * q.c.y + t * t * q.b.y }; };
    const stroke = (q, col, alpha) => { const [r, g, b] = RGB[col]; ctx.globalAlpha = 1; ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(q.a.x, q.a.y); ctx.quadraticCurveTo(q.c.x, q.c.y, q.b.x, q.b.y); ctx.stroke(); };
    const pulse = (q, o = {}) => pulses.push({ q, t: 0, v: o.v || 0.42, col: o.col || 'gold', col2: o.col2, flip: o.flip || 0.5, size: o.size || 15, done: o.done });
    const burst = (x, y, col = 'gold', size = 1) => bursts.push({ x, y, age: 0, col, size });
    const lit = (el, ms = 1500) => { if (!el) return; el.setAttribute('data-on', '1'); clearTimeout(el._t); el._t = setTimeout(() => el.removeAttribute('data-on'), ms); };
    function buildStars() {
      const n = W < 700 ? 80 : 190; stars = [];
      const pal = kind === 'trust' ? ['white', 'white', 'teal', 'gold'] : ['teal', 'teal', 'white', 'gold', 'teal', 'gold'];
      for (let i = 0; i < n; i++) {
        const z = Math.pow(Math.random(), 1.7) * 0.85 + 0.15;
        stars.push({ x: rnd(W * (W < 700 ? 0 : 0.25), W * 1.03), y: rnd(-20, H + 20), z, vx: rnd(-4, 4) * z, vy: rnd(-3, 3) * z, ph: rnd(0, 6.28), col: Math.random() < 0.035 ? 'violet' : pick(pal), big: Math.random() < 0.07 });
      }
    }
    function drawStars() {
      const L = W < 700 ? 74 : 112, buckets = [[], [], []];
      for (let i = 0; i < stars.length; i++) { const a = stars[i]; for (let j = i + 1; j < stars.length; j++) { const b = stars[j]; const dx = a.x - b.x, dy = a.y - b.y; if (Math.abs(dx) > L || Math.abs(dy) > L) continue; const d = Math.hypot(dx, dy); if (d < L) { const q = 1 - d / L; buckets[q > 0.66 ? 2 : q > 0.33 ? 1 : 0].push(a.x, a.y, b.x, b.y); } } }
      const line = kind === 'trust' ? '190,215,245' : '130,225,208';
      buckets.forEach((seg, k) => { ctx.globalAlpha = 1; ctx.strokeStyle = `rgba(${line},${[0.05, 0.11, 0.2][k]})`; ctx.lineWidth = 0.7; ctx.beginPath(); for (let i = 0; i < seg.length; i += 4) { ctx.moveTo(seg[i], seg[i + 1]); ctx.lineTo(seg[i + 2], seg[i + 3]); } ctx.stroke(); });
      stars.forEach((s) => { const tw = 0.6 + 0.4 * Math.sin(T * 0.9 + s.ph); if (s.big) spark(s.x, s.y, 46 + 40 * s.z, 0.13 * tw, s.col); spark(s.x, s.y, (6 + 19 * s.z) * (0.85 + 0.15 * tw), (0.3 + 0.7 * s.z) * tw, s.col); });
    }
    function stepCommon(dt) {
      stars.forEach((s) => { s.x += (s.vx + Math.sin(T * 0.13 + s.ph) * 3 * s.z) * dt; s.y += (s.vy + Math.cos(T * 0.11 + s.ph) * 3 * s.z) * dt; if (s.x < W * 0.1) s.x = W * 1.02; if (s.x > W * 1.04) s.x = W * 0.12; if (s.y < -24) s.y = H + 20; if (s.y > H + 24) s.y = -20; });
      for (let i = pulses.length - 1; i >= 0; i--) { const p = pulses[i]; p.t += p.v * dt; if (p.t >= 1) { pulses.splice(i, 1); if (p.done) p.done(p); } }
      for (let i = bursts.length - 1; i >= 0; i--) { bursts[i].age += dt; if (bursts[i].age > 1.1) bursts.splice(i, 1); }
    }
    function drawPulses() {
      pulses.forEach((p) => { for (let i = 9; i >= 0; i--) { const t = p.t - i * 0.018; if (t < 0) continue; const q = at(p.q, t); const col = p.col2 && t > p.flip ? p.col2 : p.col; spark(q.x, q.y, p.size * (1 - i / 11) * (i ? 1 : 1.7), (i ? 0.42 : 1) * (1 - i / 10), col); } });
      bursts.forEach((b) => { const k = b.age / 1.1; const [r, g, a] = RGB[b.col]; ctx.globalAlpha = 1; ctx.strokeStyle = `rgba(${r},${g},${a},${0.5 * (1 - k)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(b.x, b.y, (8 + 38 * ease(k)) * b.size, 0, 6.29); ctx.stroke(); spark(b.x, b.y, 58 * b.size, 0.5 * (1 - k), b.col); });
    }
    const scenes = {
      sparkkeeper: {
        init() { X.rows = [...root.querySelectorAll('[data-row]')]; X.bubble = root.querySelector('[data-bubble]'); X.papers = []; X.i = 0; X.next = 0; },
        step(dt) {
          X.next -= dt;
          if (X.next <= 0) { X.next = rnd(1.5, 2.1); const mob = W < 900; const tgt = X.rows[X.i++ % X.rows.length]; const r = relRect(tgt); X.papers.push({ x: mob ? rnd(W * 0.08, W * 0.92) : rnd(F.x0 + 8, F.x0 + F.w * 0.92), y: mob ? rnd(F.y0 + 6, F.y0 + 70) : (Math.random() < 0.5 ? rnd(H * 0.07, H * 0.17) : rnd(H * 0.84, H * 0.94)), rot: rnd(0, 6.28), sp: rnd(0.3, 0.7) * (Math.random() < 0.5 ? -1 : 1), tilt: rnd(-0.35, 0.35), t: 0, life: rnd(5.2, 6.4), row: tgt, tx: r.x + 8, ty: r.cy, shed: 0, drift: rnd(-40, 40) }); }
          for (let i = X.papers.length - 1; i >= 0; i--) { const p = X.papers[i]; p.t += dt / p.life; const k = ease(clamp(p.t / 0.62, 0, 1)); p.px = p.x + (p.tx - p.x) * k * 0.12; p.py = p.y + (p.ty - p.y) * k * 0.1 + Math.sin(T * 0.7 + p.rot) * 7; p.rot += p.sp * dt;
            if (p.t > 0.5 && p.shed < 9 && p.t > 0.5 + p.shed * 0.034) { p.shed++; const end = { x: p.tx, y: p.ty + rnd(-5, 5) }; const q = curve({ x: p.px + rnd(-13, 13), y: p.py + rnd(-16, 16) }, end, rnd(-0.42, 0.42)); const last = p.shed === 9; pulse(q, { v: rnd(0.42, 0.62), size: rnd(12, 20), col: Math.random() < 0.7 ? 'gold' : 'white', done: last ? () => { burst(end.x, end.y, 'gold', 0.8); lit(p.row, 1500); if (p.row.hasAttribute('data-first')) lit(X.bubble, 3200); } : null }); }
            if (p.t >= 1) X.papers.splice(i, 1); }
        },
        draw() {
          X.papers.forEach((p) => { const a = p.t < 0.14 ? p.t / 0.14 : p.t > 0.5 ? clamp(1 - (p.t - 0.5) / 0.22, 0, 1) : 1; if (a <= 0) return; ctx.save(); ctx.translate(p.px, p.py); ctx.rotate(p.tilt + Math.sin(T * 0.3 + p.rot) * 0.08); ctx.scale(0.72 + 0.28 * Math.cos(p.rot), 1); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(215,240,235,.1)'; ctx.strokeStyle = 'rgba(235,250,247,.78)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(-19, -25, 38, 50, 4); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(235,250,247,.5)'; [-13, -5, 3, 11].forEach((y, i) => { ctx.beginPath(); ctx.moveTo(-11, y); ctx.lineTo(i === 3 ? 2 : 11, y); ctx.stroke(); }); ctx.restore(); });
        }
      },
      magnet: {
        init() { X.R = Math.min(F.r * 1.5, W * 0.48); X.parts = []; for (let i = 0; i < (W < 700 ? 300 : 640); i++) X.parts.push({ a: rnd(0, 6.28), r: Math.pow(Math.random(), 0.6) * X.R, col: Math.random() < 0.5 ? 'gold' : Math.random() < 0.7 ? 'teal' : 'white', s: rnd(0.65, 1.2) }); X.chips = [...root.querySelectorAll('[data-in]')]; X.out = root.querySelector('[data-out]'); X.tile = root.querySelector('[data-tile]'); X.n = 0; X.next = 0.3; },
        step(dt) {
          X.parts.forEach((p) => { const near = 1 - p.r / X.R; p.pa = p.a; p.pr = p.r; p.a += dt * (0.14 + 0.95 * near * near) * p.s; p.r -= dt * (9 + 34 * near) * p.s; if (p.r < 26) { p.r = X.R * rnd(0.82, 1); p.a = rnd(0, 6.28); p.pa = p.a; p.pr = p.r; } });
          X.next -= dt; if (X.next <= 0) { X.next = rnd(1.1, 1.7); const ch = X.chips[X.n % X.chips.length]; X.n++; const r = relRect(ch); const n = X.n; lit(ch, 1400); pulse(curve({ x: r.cx, y: r.cy }, { x: F.cx, y: F.cy }, 0.2), { v: 0.5, done: () => { burst(F.cx, F.cy, 'gold', 1); lit(X.tile, 900); if (n % 3 === 0) { const o = relRect(X.out); pulse(curve({ x: F.cx, y: F.cy }, { x: o.cx, y: o.cy }, -0.18), { v: 0.5, size: 20, col: 'white', col2: 'gold', flip: 0.1, done: () => { burst(o.cx, o.cy, 'gold', 0.9); lit(X.out, 2400); } }); } } }); }
        },
        draw() {
          const ang = -0.28, ca = Math.cos(ang), sa = Math.sin(ang), proj = (a, r) => { const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.5; return [F.cx + x * ca - y * sa, F.cy + x * sa + y * ca]; };
          spark(F.cx, F.cy, F.r * 2.6, 0.2 + 0.05 * Math.sin(T * 1.2), 'ember'); spark(F.cx, F.cy, F.r * 1.1, 0.32, 'gold');
          X.parts.forEach((p) => { const near = 1 - p.r / X.R; const fade = clamp((X.R - p.r) / (X.R * 0.16), 0, 1); const [x, y] = proj(p.a, p.r); const [r, g, b] = RGB[p.col]; const arc = 0.1 + 0.42 * near; ctx.globalAlpha = 1; ctx.strokeStyle = `rgba(${r},${g},${b},${(0.08 + 0.34 * near) * fade})`; ctx.lineWidth = 0.7 + near; ctx.beginPath(); for (let s = 0; s <= 6; s++) { const [lx, ly] = proj(p.a - arc * s / 6, p.r + (9 + 34 * near) * 0.08 * s); s ? ctx.lineTo(lx, ly) : ctx.moveTo(lx, ly); } ctx.stroke(); spark(x, y, 4 + 11 * near, fade * (0.3 + 0.7 * near), p.col); });
          X.chips.forEach((ch) => { const r = relRect(ch); stroke(curve({ x: r.cx, y: r.cy }, { x: F.cx, y: F.cy }, 0.2), 'teal', 0.26); });
          const o = relRect(X.out); stroke(curve({ x: F.cx, y: F.cy }, { x: o.cx, y: o.cy }, -0.18), 'gold', 0.34);
        }
      },
      academy: {
        init() { const P = [[0.05, 0.82], [0.33, 0.52], [0.59, 0.68], [0.9, 0.16]]; const pts = P.map(([a, b]) => ({ x: F.x0 + a * F.w, y: F.y0 + b * F.h })); X.nodes = pts; const out = []; const cr = (a, b, c2, d, t) => 0.5 * (2 * b + (c2 - a) * t + (2 * a - 5 * b + 4 * c2 - d) * t * t + (3 * b - a - 3 * c2 + d) * t * t * t); for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]; for (let t = 0; t < 1; t += 0.02) out.push({ x: cr(p0.x, p1.x, p2.x, p3.x, t), y: cr(p0.y, p1.y, p2.y, p3.y, t) }); } X.path = out; X.nodeAt = pts.map((_, i) => i / (pts.length - 1)); X.flow = []; for (let i = 0; i < (W < 700 ? 110 : 210); i++) X.flow.push({ t: Math.random(), off: rnd(-26, 26), v: rnd(0.035, 0.07), col: Math.random() < 0.5 ? 'teal' : 'white' }); X.p = 0; X.hold = 0; X.hit = -1; X.labels = [...root.querySelectorAll('[data-step]')]; X.end = [...root.querySelectorAll('[data-end]')]; },
        step(dt) { X.flow.forEach((f) => { f.t += f.v * dt; if (f.t > 1) f.t = 0; }); if (X.hold > 0) { X.hold -= dt; if (X.hold <= 0) { X.p = 0; X.hit = -1; X.labels.forEach((l) => l.removeAttribute('data-on')); X.end.forEach((el) => el.removeAttribute('data-on')); } return; } X.p += dt / 9; X.nodeAt.forEach((v, i) => { if (X.p >= v - 0.002 && i > X.hit) { X.hit = i; const n = X.nodes[i]; burst(n.x, n.y, 'gold', i === 3 ? 1.8 : 1); if (X.labels[i]) X.labels[i].setAttribute('data-on', '1'); if (i === 3) X.end.forEach((el) => el.setAttribute('data-on', '1')); } }); if (X.p >= 1) { X.p = 1; X.hold = 3.4; } },
        draw() {
          const pt = (t) => X.path[clamp(Math.floor(t * (X.path.length - 1)), 0, X.path.length - 1)];
          ctx.globalAlpha = 1; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(130,225,208,.42)'; ctx.lineWidth = 1.5; ctx.beginPath(); X.path.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke();
          const e = Math.floor(X.p * (X.path.length - 1)); ctx.strokeStyle = 'rgba(254,185,56,.8)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= e; i++) { const p = X.path[i]; i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); } ctx.stroke();
          X.flow.forEach((f) => { const p = pt(f.t); const n = pt(Math.min(1, f.t + 0.01)); const dx = n.x - p.x, dy = n.y - p.y, m = Math.hypot(dx, dy) || 1; const passed = f.t <= X.p; spark(p.x - dy / m * f.off, p.y + dx / m * f.off, passed ? 11 : 7, (passed ? 0.85 : 0.62) * (1 - Math.abs(f.off) / 32), passed ? 'gold' : f.col); });
          X.nodes.forEach((n, i) => { const on = i <= X.hit; spark(n.x, n.y, on ? 62 : 34, on ? 1 : 0.8, on ? 'gold' : 'teal'); });
          const h = pt(X.p); spark(h.x, h.y, 62, 1, 'gold');
        }
      },
      nest: {
        init() { X.R = Math.min(F.r * 0.98, W * 0.42); X.strands = []; const n = W < 700 ? 15 : 22; for (let i = 0; i < n; i++) X.strands.push({ a0: (i / n) * 6.283, tw: rnd(1.7, 3), rr: rnd(0.14, 0.26), k: pick([2, 3, 3, 4]), ph: rnd(0, 6.28), col: i % 3 === 0 ? 'gold' : i % 3 === 1 ? 'teal' : 'white' }); X.chips = [...root.querySelectorAll('[data-in]')]; X.tile = root.querySelector('[data-tile]'); X.n = 0; X.next = 0.2; },
        step(dt) { X.next -= dt; if (X.next <= 0) { X.next = rnd(1.1, 1.6); const ch = X.chips[X.n++ % X.chips.length]; const r = relRect(ch); lit(ch, 1300); pulse(curve({ x: r.cx, y: r.cy }, { x: F.cx, y: F.cy + X.R * 0.1 }, rnd(-0.2, 0.2)), { v: 0.48, size: 17, done: () => { burst(F.cx, F.cy + X.R * 0.1, 'gold', 1.3); lit(X.tile, 900); } }); } },
        draw() {
          const tilt = 1.22, ct = Math.cos(tilt), st = Math.sin(tilt), rot = T * 0.17, cr = Math.cos(rot), sr = Math.sin(rot), f = X.R * 4.2;
          const P = (a, tube, s) => { const R = X.R * (1 + tube * Math.cos(s.k * a + s.ph + T * 0.06)); const lift = X.R * tube * 0.9 * Math.sin(s.k * a + s.ph); const x0 = Math.cos(a) * R, z0 = Math.sin(a) * R; const x = x0 * cr - z0 * sr, z = x0 * sr + z0 * cr; const y = lift * ct + z * st * 0.95, zz = z * ct - lift * st; const q = f / (f + zz); return [F.cx + x * q, F.cy + X.R * 0.1 + y * q, q]; };
          spark(F.cx, F.cy + X.R * 0.1, X.R * 2.3, 0.2, 'ember'); spark(F.cx, F.cy + X.R * 0.1, X.R * 0.9, 0.3, 'gold');
          X.strands.forEach((s) => { const [r, g, b] = RGB[s.col]; const N = 58; let prev = null; for (let i = 0; i <= N; i++) { const a = s.a0 + (i / N) * s.tw * 3.14; const v = P(a, s.rr, s); if (prev) { ctx.globalAlpha = 1; ctx.lineWidth = 0.65 + v[2] * 0.25; ctx.strokeStyle = `rgba(${r},${g},${b},${clamp((v[2] - 0.72) * 0.9, 0.05, 0.34)})`; ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(v[0], v[1]); ctx.stroke(); } prev = v; if (i % 8 === 0) spark(v[0], v[1], 5 + 9 * v[2] * v[2], clamp((v[2] - 0.72) * 1.8, 0.14, 0.95), s.col); } const m = s.a0 + ((T * 0.1 + s.ph) % 1) * s.tw * 3.14; const v = P(m, s.rr, s); spark(v[0], v[1], 18 * v[2], 0.8, 'gold'); });
          X.chips.forEach((ch) => { const r = relRect(ch); stroke(curve({ x: r.cx, y: r.cy }, { x: F.cx, y: F.cy + X.R * 0.1 }, 0.14), 'teal', 0.22); });
        }
      },
      home: {
        init() { X.L = Math.min(F.r * 1.42, W * 0.46); X.sheds = []; X.next = 0; X.fe = []; const n = W < 700 ? 13 : 18; for (let i = 0; i < n; i++) { const u = i / (n - 1); X.fe.push({ ang: -0.42 + u * 1.75, len: X.L * (0.46 + 0.62 * Math.sin(0.25 + u * 2.75)), bend: 0.2 + u * 0.14, ph: rnd(0, 6.28) }); } },
        pt(fe, t, side) { const flap = 0.16 + Math.sin(T * 0.62) * 0.14; const a = fe.ang + Math.sin(T * 0.62 + fe.ang) * 0.025; const b = fe.bend * Math.sin(t * 3.14) * fe.len; const x0 = Math.cos(a) * fe.len * t + Math.sin(a) * b * 0.55, y0 = -Math.sin(a) * fe.len * t + Math.cos(a) * b * 0.55; const fold = (side > 0 ? 0.32 : 0.92) + flap; const x = x0 * Math.cos(fold) * side, z = x0 * Math.sin(fold) * (side > 0 ? -0.55 : 0.55), y = y0; const f = 900 / (900 + z); return [F.cx + x * f, F.cy + F.r * 0.32 + y * f, f]; },
        step(dt) { X.next -= dt; if (X.next <= 0) { X.next = 0.11; const fe = pick(X.fe), side = Math.random() < 0.74 ? 1 : -1; const p = this.pt(fe, 1, side); X.sheds.push({ x: p[0], y: p[1], vx: rnd(-20, 4), vy: rnd(10, 34), age: 0, life: rnd(1.8, 3.2), col: Math.random() < 0.8 ? 'gold' : 'white' }); } for (let i = X.sheds.length - 1; i >= 0; i--) { const s = X.sheds[i]; s.age += dt; s.x += s.vx * dt; s.y += s.vy * dt; if (s.age > s.life) X.sheds.splice(i, 1); } },
        draw() {
          spark(F.cx, F.cy + F.r * 0.32, F.r * 2.1, 0.16, 'violet');
          [-1, 1].forEach((side) => { X.fe.forEach((fe, i) => { const u = i / (X.fe.length - 1), N = 22; let prev = null; for (let k = 0; k <= N; k++) { const t = k / N, v = this.pt(fe, t, side); if (prev) { const mix = t; const r = Math.round(150 + (254 - 150) * mix), g = Math.round(132 + (185 - 132) * mix), b = Math.round(232 + (56 - 232) * mix); ctx.globalAlpha = 1; ctx.strokeStyle = `rgba(${r},${g},${b},${(side > 0 ? 0.5 : 0.34) * (0.45 + 0.55 * t)})`; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(v[0], v[1]); ctx.stroke(); } prev = v; if (k % 3 === 0 && k) spark(v[0], v[1], 4 + 12 * t * t, 0.34 + 0.6 * t, t > 0.58 ? 'gold' : 'violet'); } const trav = (T * 0.14 + fe.ph) % 1; const v = this.pt(fe, trav, side); spark(v[0], v[1], 18, 0.9 * Math.sin(trav * 3.14), 'white'); const tip = this.pt(fe, 1, side); spark(tip[0], tip[1], 20 + 22 * Math.sin(u * 3.14), 0.82 + 0.15 * Math.sin(T * 1.4 + fe.ph), 'gold'); }); });
          X.sheds.forEach((s) => { const k = s.age / s.life; spark(s.x, s.y, 13 * (1 - k * 0.6), 0.85 * (1 - k), s.col); });
          const cy = F.cy + F.r * 0.32, sz = 15 + Math.sin(T * 1.4) * 2.4; spark(F.cx, cy, 120, 0.55, 'gold'); ctx.globalAlpha = 1; ctx.fillStyle = '#FFF4D6'; ctx.beginPath(); [[0, -1], [0.13, -0.13], [1, 0], [0.13, 0.13], [0, 1], [-0.13, 0.13], [-1, 0], [-0.13, -0.13]].forEach(([a, b], i) => { const x = F.cx + a * sz * 1.5, y = cy + b * sz * 1.5; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill();
        }
      },
      trust: {
        init() { X.left = [...root.querySelectorAll('[data-from]')]; X.right = [...root.querySelectorAll('[data-to]')]; X.tile = root.querySelector('[data-tile]'); X.i = 0; X.next = 0.2; X.lanes = []; for (let i = 0; i < 9; i++) X.lanes.push(rnd(-0.86, 0.86)); },
        step(dt) { X.next -= dt; if (X.next <= 0) { X.next = 0.42; const k = X.i % X.left.length; const lead = X.i % 6 < 3; X.i++; const a = relRect(X.left[k]), b = relRect(X.right[k]); const q = { a: { x: a.x + a.w, y: a.cy }, c: { x: F.cx, y: F.cy + (a.cy - F.cy) * 0.1 }, b: { x: b.x, y: b.cy } }; if (lead) lit(X.left[k], 1500); const hit = X.right[k]; const flash = lead; pulse(q, { v: 0.4, col: 'white', col2: 'gold', flip: 0.5, size: 16, done: () => { if (flash) { lit(hit, 1800); burst(b.x, b.cy, 'gold', 0.6); } } }); if (lead) setTimeout(() => { lit(X.tile, 700); }, 1250); } },
        draw() {
          X.left.forEach((el, i) => { const a = relRect(el), b = relRect(X.right[i]); stroke({ a: { x: a.x + a.w, y: a.cy }, c: { x: F.cx, y: F.cy + (a.cy - F.cy) * 0.1 }, b: { x: b.x, y: b.cy } }, 'white', 0.22); }); spark(F.cx, F.cy, F.r * 2, 0.2, 'gold'); const rx = F.r * 0.34, ry = F.r * 0.92; [1, 0.82, 0.62].forEach((k, i) => { ctx.globalAlpha = 1; ctx.strokeStyle = `rgba(254,185,56,${[0.68, 0.3, 0.16][i]})`; ctx.lineWidth = i ? 0.9 : 1.5; ctx.beginPath(); ctx.ellipse(F.cx, F.cy, rx * k, ry * k, 0, 0, 6.29); ctx.stroke(); }); for (let i = 0; i < 26; i++) { const a = (i / 26) * 6.283 + T * 0.18; spark(F.cx + Math.cos(a) * rx, F.cy + Math.sin(a) * ry, 7 + 5 * (0.5 + 0.5 * Math.sin(a * 3 + T)), 0.75, 'gold'); }
        }
      }
    };

    scenes.flow = {
      init() { X.in = [...root.querySelectorAll('[data-in]')]; X.out = [...root.querySelectorAll('[data-out]')]; X.tile = root.querySelector('[data-tile]'); X.n = 0; X.next = 0.3; },
      step(dt) { X.next -= dt; if (X.next <= 0) { X.next = rnd(1, 1.5); const ch = X.in[X.n % X.in.length], n = X.n++, r = relRect(ch), t = relRect(X.tile); lit(ch, 1300); pulse(curve({ x: r.cx, y: r.cy }, { x: t.cx, y: t.cy }, 0.18), { v: 0.5, done: () => { burst(t.cx, t.cy, 'gold', 1); lit(X.tile, 800); const el = X.out[n % X.out.length]; if (!el) return; const o = relRect(el); pulse(curve({ x: t.cx, y: t.cy }, { x: o.cx, y: o.cy }, -0.18), { v: 0.5, size: 18, col: 'white', col2: 'gold', flip: 0.1, done: () => { burst(o.cx, o.cy, 'gold', 0.7); lit(el, 1600); } }); } }); } },
      draw() { const t = relRect(X.tile); [...X.in, ...X.out].forEach((el, i) => { const r = relRect(el); stroke(curve({ x: r.cx, y: r.cy }, { x: t.cx, y: t.cy }, i < X.in.length ? 0.18 : -0.18), 'white', 0.18); }); spark(t.cx, t.cy, F.r * 1.9, 0.22 + 0.05 * Math.sin(T * 1.2), 'gold'); spark(t.cx, t.cy, F.r * 0.8, 0.3, 'ember'); }
    };
    // The butterfly: flies over everything on its own canvas, then perches.
    const fc = root.querySelector('.mx-fairy'), fx = fc.getContext('2d');
    const starSprite = (col) => { const s = document.createElement('canvas'); s.width = s.height = 64; const g = s.getContext('2d'); const [r, gr, b] = RGB[col]; const rad = g.createRadialGradient(32, 32, 0, 32, 32, 30); rad.addColorStop(0, `rgba(${r},${gr},${b},.55)`); rad.addColorStop(1, `rgba(${r},${gr},${b},0)`); g.fillStyle = rad; g.fillRect(0, 0, 64, 64); g.fillStyle = '#FFFBEF'; g.beginPath(); [[0, -1], [0.1, -0.1], [1, 0], [0.1, 0.1], [0, 1], [-0.1, 0.1], [-1, 0], [-0.1, -0.1]].forEach(([a, c], i) => { const x = 32 + a * 30, y = 32 + c * 30; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill(); return s; };
    const stars2 = { gold: starSprite('gold'), white: starSprite('white'), violet: starSprite('violet') };
    const B = { mode: 'wait', x: 0, y: 0, ang: 0, t: 0, path: [], dur: 5.4, wait: 0.7, dust: [], emit: 0, nextHop: 20, seen: false, size: 1, px: 0, py: 0 };
    function perchPoint() {
      const tile = root.querySelector('[data-tile]'), card = root.querySelector('.mx-card');
      if (tile) { const r = relRect(tile); return { x: r.x + r.w * 0.82, y: r.y - 4 * B.size }; }
      if (card) { const r = relRect(card); return { x: r.x + r.w * 0.5, y: r.y - 12 * B.size }; }
      return { x: F.cx, y: F.cy + F.r * 0.32 - 26 * B.size };
    }
    function spline(pts) { const out = [], cr = (a, b, c2, d, t) => 0.5 * (2 * b + (c2 - a) * t + (2 * a - 5 * b + 4 * c2 - d) * t * t + (3 * b - a - 3 * c2 + d) * t * t * t); for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]; for (let k = 0; k < 40; k++) { const t = k / 40; out.push({ x: cr(p0.x, p1.x, p2.x, p3.x, t), y: cr(p0.y, p1.y, p2.y, p3.y, t) }); } } out.push(pts[pts.length - 1]); return out; }
    function flightPath() {
      const end = perchPoint(), mob = W < 900;
      const pts = mob ? [{ x: W + 50, y: H * 0.02 }, { x: W * 0.58, y: H * 0.05 }, { x: W * 0.14, y: H * 0.14 }, { x: W * 0.5, y: H * 0.27 }, { x: W * 0.86, y: H * 0.36 }, { x: W * 0.58, y: H * 0.46 }, { x: W * 0.32, y: H * 0.39 }, { x: W * 0.52, y: F.y0 - 34 }, { x: end.x - 26, y: end.y - 40 }, end]
        : [{ x: -60, y: H * 0.34 }, { x: W * 0.1, y: H * 0.09 }, { x: W * 0.31, y: H * 0.07 }, { x: W * 0.47, y: H * 0.2 }, { x: W * 0.4, y: H * 0.38 }, { x: W * 0.3, y: H * 0.26 }, { x: W * 0.41, y: H * 0.1 }, { x: F.cx - F.w * 0.1, y: H * 0.07 }, { x: end.x + (end.x > W * 0.82 ? -60 : 70), y: Math.max(end.y - 90, 18) }, end];
      return spline(pts);
    }
    function hopPath() { const end = perchPoint(), r = 60 + Math.random() * 50, s = Math.random() < 0.5 ? 1 : -1, pts = [end]; for (let i = 1; i < 6; i++) { const a = -1.57 + s * i * 1.05; pts.push({ x: clamp(end.x - r * 0.6 + Math.cos(a) * r, 24, W - 24), y: clamp(end.y - r * 0.7 + Math.sin(a) * r * 0.75, 18, H - 18) }); } pts.push(end); return spline(pts); }
    function landed() { const p = perchPoint(); B.x = p.x; B.y = p.y; B.ang = 0.18; B.mode = 'perch'; B.nextHop = rnd(16, 26); for (let i = 0; i < 34; i++) { const a = rnd(0, 6.28), v = rnd(18, 74); B.dust.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, life: rnd(0.7, 1.5), size: rnd(6, 15), col: pick(['gold', 'gold', 'white', 'violet']), ph: rnd(0, 6.28) }); } const tile = root.querySelector('[data-tile]'), row = root.querySelector('[data-first]'); lit(tile, 1500); if (row) { lit(row, 1800); lit(root.querySelector('[data-bubble]'), 3200); } }
    function fairyStep(dt) {
      if (B.mode === 'wait') { B.wait -= dt; if (B.wait <= 0 && B.live) { B.path = flightPath(); B.t = 0; B.dur = 5.4; B.mode = 'fly'; } }
      if (B.mode === 'fly' || B.mode === 'hop') { B.t += dt / B.dur; const k = ease(ease(clamp(B.t, 0, 1)) * 0.35 + clamp(B.t, 0, 1) * 0.65); const f = k * (B.path.length - 1), i = Math.floor(f), a = B.path[i], b = B.path[Math.min(i + 1, B.path.length - 1)], m = f - i; const nx = a.x + (b.x - a.x) * m, ny = a.y + (b.y - a.y) * m; const dx = nx - B.x, dy = ny - B.y; if (Math.hypot(dx, dy) > 0.01) { const want = Math.atan2(dy, dx) + 1.57; let d = want - B.ang; while (d > 3.14) d -= 6.28; while (d < -3.14) d += 6.28; B.ang += d * clamp(dt * 9, 0, 1); } B.x = nx; B.y = ny + Math.sin(T * 7) * 2.2; B.emit += dt * (B.mode === 'fly' ? 95 : 42); while (B.emit > 1) { B.emit -= 1; B.dust.push({ x: B.x + rnd(-7, 7), y: B.y + rnd(-7, 7), vx: rnd(-16, 16) - dx * 0.5, vy: rnd(-10, 12), age: 0, life: rnd(1.2, 3.3), size: rnd(3, 13) * B.size, col: pick(['gold', 'gold', 'gold', 'white', 'white', 'violet']), ph: rnd(0, 6.28) }); } if (B.t >= 1) { if (B.mode === 'fly') B.seen = true; landed(); } }
      if (B.mode === 'perch') { let d = 0.18 - B.ang; B.ang += d * clamp(dt * 5, 0, 1); const p = perchPoint(); B.x = p.x; B.y = p.y + Math.sin(T * 1.3) * 1.3; if (B.live) { B.nextHop -= dt; if (B.nextHop <= 0) { B.path = hopPath(); B.t = 0; B.dur = 3.4; B.mode = 'hop'; } if (Math.random() < dt * 2) B.dust.push({ x: B.x + rnd(-16, 16), y: B.y + rnd(-10, 6), vx: rnd(-5, 5), vy: rnd(5, 18), age: 0, life: rnd(0.9, 1.9), size: rnd(4, 9), col: pick(['gold', 'white']), ph: 0 }); } }
      for (let i = B.dust.length - 1; i >= 0; i--) { const s = B.dust[i]; s.age += dt; s.vy += 22 * dt; s.vx *= 1 - dt * 0.8; s.x += s.vx * dt; s.y += s.vy * dt; if (s.age > s.life) B.dust.splice(i, 1); }
      if (B.dust.length > 420) B.dust.splice(0, B.dust.length - 420);
    }
    function drawButterfly(x, y, ang, scale, open) {
      const g = fx; g.save(); g.translate(x, y); g.rotate(ang); g.scale(scale, scale);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5; g.drawImage(sprites.gold, -46, -46, 92, 92); g.globalAlpha = 0.34; g.drawImage(sprites.violet, -64, -64, 128, 128); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      [-1, 1].forEach((side) => {
        g.save(); g.scale(side * open, 1);
        const up = g.createLinearGradient(0, -2, 26, -24); up.addColorStop(0, '#FFE9A8'); up.addColorStop(0.42, '#B9A5F2'); up.addColorStop(1, '#6A56C8');
        g.fillStyle = up; g.strokeStyle = 'rgba(255,233,168,.95)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(1, -1); g.bezierCurveTo(6, -24, 27, -30, 31, -18); g.bezierCurveTo(33, -9, 19, 0, 1, 2); g.closePath(); g.fill(); g.stroke();
        const lo = g.createLinearGradient(0, 2, 18, 20); lo.addColorStop(0, '#FFE9A8'); lo.addColorStop(1, '#F39A2B');
        g.fillStyle = lo; g.beginPath(); g.moveTo(1, 2); g.bezierCurveTo(13, 2, 24, 7, 20, 16); g.bezierCurveTo(16, 24, 5, 17, 1, 7); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,.9)'; [[22, -19, 2], [15, -13, 1.4], [13, 11, 1.3]].forEach(([a, b, r]) => { g.beginPath(); g.arc(a, b, r, 0, 6.29); g.fill(); });
        g.strokeStyle = 'rgba(255,240,205,.9)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(0.5, -7); g.quadraticCurveTo(3, -14, 7, -16); g.stroke(); g.fillStyle = '#FFE9A8'; g.beginPath(); g.arc(7, -16, 0.9, 0, 6.29); g.fill();
        g.restore();
      });
      g.fillStyle = '#FFF8E7'; g.beginPath(); g.ellipse(0, 1, 1.7, 9, 0, 0, 6.29); g.fill();
      g.restore();
    }
    function fairyDraw() {
      fx.setTransform(dpr, 0, 0, dpr, 0, 0); fx.clearRect(0, 0, W, H); fx.globalCompositeOperation = 'lighter';
      B.dust.forEach((s) => { const k = s.age / s.life, tw = 0.55 + 0.45 * Math.sin(T * 11 + s.ph + s.size), a = (1 - k * k) * tw; fx.globalAlpha = clamp(a, 0, 1); const z = s.size * (1 - k * 0.45); if (s.size > 6.5) fx.drawImage(stars2[s.col], s.x - z, s.y - z, z * 2, z * 2); else fx.drawImage(sprites[s.col], s.x - z * 1.4, s.y - z * 1.4, z * 2.8, z * 2.8); });
      fx.globalAlpha = 1;
      if (B.mode !== 'wait') { const moving = B.mode !== 'perch', open = moving ? 0.28 + 0.72 * Math.abs(Math.cos(T * 19)) : 0.72 + 0.28 * Math.cos(T * 1.6); drawButterfly(B.x, B.y, B.ang, B.size, open); }
    }
    function fairyLayout() { fc.width = W * dpr; fc.height = H * dpr; B.size = W < 700 ? 0.72 : 0.92; }
    const sc = scenes[kind] || scenes.flow;
    function layout() {
      const b = c.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2); W = Math.round(b.width); H = Math.round(b.height); if (!W || !H) return false; c.width = W * dpr; c.height = H * dpr; const r = relRect(stageEl); F = { x0: r.x, y0: r.y, w: r.w, h: r.h, cx: r.cx, cy: r.cy, r: Math.min(r.w, r.h) / 2 }; pulses = []; bursts = []; X = {}; fairyLayout(); buildStars(); sc.init(); if (B.mode === 'fly') B.path = flightPath(); if (B.mode === 'hop') { B.mode = 'perch'; } if (B.seen) { B.mode = 'perch'; B.dust = []; } return true;
    }
    function nebula() { const m = Math.max(F.w, F.h); const a = kind === 'trust' ? ['teal', 'violet', 'gold'] : ['teal', 'ember', 'violet']; spark(F.cx + Math.sin(T * 0.07) * m * 0.22, F.cy - m * 0.2 + Math.cos(T * 0.05) * m * 0.1, m * 2.1, 0.13, a[0]); spark(F.cx + m * 0.36 + Math.cos(T * 0.06) * m * 0.12, F.cy + m * 0.26, m * 1.5, 0.09, a[1]); spark(F.cx - m * 0.3, F.cy + m * 0.3 + Math.sin(T * 0.05) * m * 0.12, m * 1.2, 0.07, a[2]); }
    function draw() { fairyDraw(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter'; nebula(); drawStars(); sc.draw(); drawPulses(); ctx.globalAlpha = 1; }
    function step(dt) { T += dt; stepCommon(dt); sc.step(dt); if (!settling) fairyStep(dt); }
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0, last = 0, paused = false, onScreen = true, settling = false;
    const tick = (now) => { raf = requestAnimationFrame(tick); const dt = Math.min((now - last) / 1000, 0.05); last = now; step(dt); draw(); };
    const settle = () => { settling = true; for (let i = 0; i < 300; i++) step(1 / 30); settling = false; draw(); };
    const sync = () => { cancelAnimationFrame(raf); raf = 0; if (!paused && onScreen && !still.matches && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    if (!layout()) return () => {};
    settle();
    B.live = true;
    if (opts.seen) { B.seen = true; B.mode = 'perch'; B.dust = []; const p0 = perchPoint(); B.x = p0.x; B.y = p0.y; B.ang = 0.18; draw(); }
    if (still.matches) { B.seen = true; B.dust = []; const p = perchPoint(); B.x = p.x; B.y = p.y; B.ang = 0.18; B.mode = 'perch'; draw(); }
    still.addEventListener('change', sync);
    const ro = new ResizeObserver(() => { if (Math.round(c.getBoundingClientRect().width) !== W || Math.round(c.getBoundingClientRect().height) !== H) { if (layout()) { settle(); } } });
    ro.observe(c);
    const io = new IntersectionObserver((e) => { onScreen = e[0].isIntersecting; sync(); }); io.observe(c);
    document.addEventListener('visibilitychange', sync);
    sync();
    return { fairy: () => ({ mode: B.mode, x: Math.round(B.x), y: Math.round(B.y), t: B.t, dust: B.dust.length }), pause: (v) => { paused = v; if (v && B.mode !== 'perch') { B.seen = true; B.mode = 'perch'; B.dust = []; const p = perchPoint(); B.x = p.x; B.y = p.y; B.ang = 0.18; } sync(); if (v) { draw(); } }, seek: (s) => { for (let i = 0; i < s * 30; i++) step(1 / 30); draw(); }, stop: () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', sync); } };
  }
