const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const io = (els, fn, opts) => {
  if (!('IntersectionObserver' in window)) { els.forEach(el => fn(el, true)); return; }
  const o = new IntersectionObserver(es => es.forEach(e => fn(e.target, e.isIntersecting, o)), opts);
  els.forEach(el => o.observe(el));
};

/* Header: solid background after scrolling */
const header = document.getElementById('siteHeader');
const onScroll = () => header && header.classList.toggle('scrolled', scrollY > 30);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* Mobile menu */
const menu = document.getElementById('menu'), openBtn = document.getElementById('menuOpen'), closeBtn = document.getElementById('menuClose');
if (menu) {
  const set = open => { menu.hidden = !open; openBtn.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : ''; (open ? closeBtn : openBtn).focus(); };
  openBtn.addEventListener('click', () => set(true));
  closeBtn.addEventListener('click', () => set(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) set(false); });
}

/* Headlines: words rise in once */
const reveal = [...document.querySelectorAll('[data-reveal]')];
reveal.forEach(el => {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', el.textContent.trim());
  el.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true" style="--i:${i}">${w.replace(/</g, '&lt;')}</span>`).join(' ');
});
if (reduce) reveal.forEach(el => el.classList.add('in'));
else io(reveal, (el, vis, o) => { if (vis) { el.classList.add('in'); o && o.unobserve(el); } }, { rootMargin: '0px 0px -12% 0px' });

/* Promise 1: the meter runs, then stops */
document.querySelectorAll('[data-meter]').forEach(viz => {
  const num = viz.querySelector('.meter-num');
  let raf = 0;
  const run = () => {
    cancelAnimationFrame(raf); viz.classList.remove('stopped');
    const t0 = performance.now(), from = 1208940, to = 1209130;
    const step = now => {
      const k = Math.min(1, (now - t0) / 1800);
      num.textContent = Math.round(from + (to - from) * k).toLocaleString('en-US');
      if (k < 1) raf = requestAnimationFrame(step);
      else setTimeout(() => viz.classList.add('stopped'), 250);
    };
    raf = requestAnimationFrame(step);
  };
  if (reduce) { num.textContent = '1,209,130'; viz.classList.add('stopped'); return; }
  let timer = 0;
  io([viz], (el, vis) => {
    clearInterval(timer);
    if (vis) { run(); timer = setInterval(run, 6000); }
  }, { threshold: 0.5 });
});

/* Promise 2: a memory is edited, another is deleted, then it resets */
document.querySelectorAll('[data-chips]').forEach(viz => {
  const c2 = viz.querySelector('.c2'), t = c2.querySelector('.t'), c3 = viz.querySelector('.c3');
  const set = (edited, gone) => { c2.classList.toggle('edited', edited); t.textContent = edited ? 'Prefers short summaries' : 'Prefers long reports'; c3.classList.toggle('out', gone); };
  if (reduce) { set(true, false); return; }
  let timers = [];
  const cycle = () => { set(false, false); timers.push(setTimeout(() => set(true, false), 1400), setTimeout(() => set(true, true), 3200)); };
  let loop = 0;
  io([viz], (el, vis) => { clearInterval(loop); timers.forEach(clearTimeout); timers = []; if (vis) { cycle(); loop = setInterval(cycle, 6500); } }, { threshold: 0.4 });
});

/* Promise 3: data bounces around the room and never leaves */
document.querySelectorAll('canvas.room').forEach(cv => {
  const ctx = cv.getContext('2d');
  let W, H, dots = [], raf = 0, on = false, t = 0;
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!dots.length) for (let i = 0; i < 14; i++) dots.push({ x: W * (.3 + Math.random() * .4), y: H * (.35 + Math.random() * .4), vx: (Math.random() - .5) * 1.6, vy: (Math.random() - .5) * 1.6, red: i < 3, f: 0 });
  };
  const draw = () => {
    t += 1; ctx.clearRect(0, 0, W, H);
    const pad = 22, x0 = pad, y0 = pad + 10, x1 = W - pad, y1 = H - pad;
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect(x0, y0, x1 - x0, y1 - y0, 16); ctx.stroke();
    ctx.fillStyle = '#A3A3A3'; ctx.font = '600 12px "Instrument Sans", sans-serif'; ctx.fillText('Your room', x0 + 12, y0 - 8);
    for (const d of dots) {
      d.x += d.vx; d.y += d.vy; d.f *= 0.9;
      if (d.x < x0 + 6 || d.x > x1 - 6) { d.vx *= -1; d.f = 1; d.x = Math.max(x0 + 6, Math.min(x1 - 6, d.x)); }
      if (d.y < y0 + 6 || d.y > y1 - 6) { d.vy *= -1; d.f = 1; d.y = Math.max(y0 + 6, Math.min(y1 - 6, d.y)); }
      if (d.f > 0.05) { ctx.strokeStyle = `rgba(255,255,255,${d.f * .5})`; ctx.beginPath(); ctx.arc(d.x, d.y, 6 + (1 - d.f) * 14, 0, 7); ctx.stroke(); }
      ctx.fillStyle = d.red ? '#D7261E' : 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(d.x, d.y, d.red ? 4 : 2.6, 0, 7); ctx.fill();
    }
    if (on && !reduce) raf = requestAnimationFrame(draw);
  };
  size(); addEventListener('resize', size); draw();
  io([cv], (el, vis) => { on = vis; cancelAnimationFrame(raf); if (vis && !reduce) raf = requestAnimationFrame(draw); }, { threshold: 0.2 });
});
