/* Hero: the sling releases a stone, the stone becomes Node */
(() => {
  if (!document.getElementById('orb')) return;
  const hero = document.querySelector('.hero');
  const cv = document.getElementById('orb');
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, cx = 0, cy = 0, R = 0, lx = 0, ly = 0, S = 0;

  const N = 1100, pts = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
    pts.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r, red: Math.random() < 0.13, d: Math.random() * 0.3 });
  }
  const ax = [0.35, 0.88, 0.32]; const al = Math.hypot(...ax); ax.forEach((v, i) => ax[i] = v / al);

  // sling-e path in unit space
  const path = [];
  for (let i = 0; i <= 40; i++) path.push([-0.95 + 1.9 * i / 40, 0]);
  const TH = 5.3;
  for (let i = 1; i <= 120; i++) { const t = TH * i / 120; path.push([0.95 * Math.cos(t), -0.95 * Math.sin(t)]); }
  const tan = [-Math.sin(TH), -Math.cos(TH)];
  const rel = path[path.length - 1];
  const stoneU = [rel[0] + tan[0] * 0.7, rel[1] + tan[1] * 0.7];

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (W > 900) { cx = W * 0.68; cy = H * 0.47; R = Math.min(W * 0.22, H * 0.34); }
    else { cx = W * 0.5; cy = H * 0.2; R = Math.min(W * 0.3, H * 0.15); }
    lx = W * 0.5; ly = H * 0.5; S = Math.min(W, H) * 0.11;
  }
  size(); addEventListener('resize', size);

  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

  const ease = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  const easeIO = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  function project(p, rotY, rotX) {
    let x = p.x * Math.cos(rotY) + p.z * Math.sin(rotY);
    let z = -p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
    let y = p.y * Math.cos(rotX) - z * Math.sin(rotX);
    z = p.y * Math.sin(rotX) + z * Math.cos(rotX);
    const s = 1 + z * 0.14;
    return [cx + x * R * s, cy + y * R * s, z];
  }

  let start = null, visible = false, running = false, readied = false, pulseAt = -1;
  document.addEventListener('elah:lead', () => { pulseAt = performance.now(); if (!running && visible) { running = true; requestAnimationFrame(frame); } });
  const ready = () => { if (!readied) { readied = true; hero.classList.add('ready'); } };
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !running) { running = true; requestAnimationFrame(frame); } }).observe(hero);

  function drawLogo(progress, alpha) {
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.2 * S; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const n = Math.max(2, Math.floor(path.length * progress));
    ctx.beginPath();
    for (let i = 0; i < n; i++) { const [x, y] = path[i]; i ? ctx.lineTo(lx + x * S, ly + y * S) : ctx.moveTo(lx + x * S, ly + y * S); }
    ctx.stroke(); ctx.restore();
  }
  function stone(x, y, r, a = 1) {
    ctx.save(); ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    g.addColorStop(0, 'rgba(215,38,30,0.55)'); g.addColorStop(1, 'rgba(215,38,30,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4, 0, 7); ctx.fill();
    ctx.fillStyle = '#D7261E'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.restore();
  }

  function frame(now) {
    if (!visible) { running = false; return; }
    if (start === null) start = now;
    const t = reduce ? 99999 : now - start;
    ctx.clearRect(0, 0, W, H);
    tx += (mx - tx) * 0.04; ty += (my - ty) * 0.04;

    const sx = lx + stoneU[0] * S, sy = ly + stoneU[1] * S;
    // 1. draw the sling e
    if (t < 1700) {
      drawLogo(clamp(t / 1000), 1 - clamp((t - 1150) / 450));
      if (t >= 1000 && t < 1150) stone(sx, sy, 0.14 * S, clamp((t - 1000) / 120));
    }
    // 2. the stone flies
    if (t >= 1150 && t < 1800) {
      const k = easeIO(clamp((t - 1150) / 600));
      const qx = sx + tan[0] * S * 3, qy = sy + tan[1] * S * 3;
      for (let j = 6; j >= 0; j--) {
        const kk = clamp(k - j * 0.03); const u = 1 - kk;
        const x = u * u * sx + 2 * u * kk * qx + kk * kk * cx;
        const y = u * u * sy + 2 * u * kk * qy + kk * kk * cy;
        stone(x, y, 0.14 * S * (1 - j * 0.11), j ? 0.25 : 1);
      }
    }
    // 3. the stone becomes Node
    if (t >= 1750) {
      const b = (t - 1750) / 1300;
      if (b > 0.45) ready();
      const rotY = t * 0.00012 + tx * 0.9, rotX = 0.38 + ty * 0.5;
      // core glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.25);
      g.addColorStop(0, `rgba(215,38,30,${0.22 * clamp(b * 2)})`); g.addColorStop(0.55, 'rgba(215,38,30,0.05)'); g.addColorStop(1, 'rgba(215,38,30,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, 7); ctx.fill();
      // orbit ring + satellite stone
      const ringA = clamp((b - 0.6) * 2.5);
      const orb = t * 0.0005;
      const ox = Math.cos(orb), oz = Math.sin(orb);
      const drawSat = () => stone(cx + ox * R * 1.32, cy + oz * R * 0.31 - ox * R * 0.105, Math.max(3, R * 0.035), ringA);
      if (ringA > 0) {
        ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.14 * ringA})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.32, R * 0.32, -0.08, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        if (oz < 0) drawSat();
      }
      const wave = ((t / 3800) % 1) * 2.8 - 1.4;
      for (const p of pts) {
        const k = reduce ? 1 : ease(clamp((b - p.d) / 0.75));
        if (k <= 0) continue;
        const [px, py, z] = project(p, rotY, rotX);
        const x = cx + (px - cx) * k, y = cy + (py - cy) * k;
        const depth = (z + 1) / 2;
        const band = Math.abs(p.x * ax[0] + p.y * ax[1] + p.z * ax[2] - wave) < 0.06;
        let a = (0.12 + depth * 0.88) * clamp(k * 1.4);
        let r = 0.5 + depth * 1.5;
        if (band) { r += 0.7; ctx.fillStyle = `rgba(215,38,30,${Math.min(1, a + 0.3)})`; }
        else ctx.fillStyle = p.red ? `rgba(215,38,30,${a})` : `rgba(255,255,255,${a})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      }
      if (ringA > 0 && oz >= 0) drawSat();
      if (pulseAt > 0) { const pk = (now - pulseAt) / 1400; if (pk < 1) { ctx.save(); ctx.strokeStyle = `rgba(215,38,30,${0.8 * (1 - pk)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R * (1 + pk * 0.9), 0, 7); ctx.stroke(); ctx.restore(); } }
    }
    if (reduce && !(pulseAt > 0 && now - pulseAt < 1400)) { ready(); running = false; return; }
    requestAnimationFrame(frame);
  }
})();
