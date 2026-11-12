/* A day with Node: cloud's wall vs Node's output */
(() => {
  if (!document.getElementById('stage')) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const stage = $('stage'), out = $('nodeOut'), tl = document.querySelector('.timeline');
  const svgOff = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/></svg>';
  const svgLock = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  const svgMoon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

  // Pseudo-random so the "generated" art looks the same on every visit.
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const palettes = [
    ['#F2B880', '#C9573C', '#2B1B17'], ['#E8D5B5', '#1F6F6B', '#0E2A2A'], ['#F5E6CC', '#D9822B', '#5B2A12'],
    ['#C7D3DD', '#3F5E7A', '#121C26'], ['#F0C6C3', '#B23A48', '#2A0F14'], ['#E4E1D3', '#7C8B4E', '#1E2410'],
  ];
  function art(warm) {
    const p = warm ? ['#FFD39A', '#E8642C', '#4A1606'] : palettes[Math.floor(rnd() * palettes.length)];
    const x1 = 20 + rnd() * 60, y1 = 20 + rnd() * 60, x2 = rnd() * 100, y2 = rnd() * 100;
    return `radial-gradient(circle at ${x1}% ${y1}%, ${p[0]} 0 ${12 + rnd() * 14}%, transparent ${30 + rnd() * 10}%),` +
           `radial-gradient(circle at ${x2}% ${y2}%, ${p[1]} 0 ${18 + rnd() * 20}%, transparent ${48 + rnd() * 12}%),` +
           `linear-gradient(${Math.floor(rnd() * 360)}deg, ${p[2]}, ${p[1]})`;
  }

  const scenes = [
    {
      time: '9:10 AM', label: 'Visa desk',
      ask: 'Check these 186 passport scans against the visa forms.',
      wall: ['Upload blocked', "Company policy doesn't allow client documents in external AI tools."],
      reply: 'Done. 182 match. Four need a look before they go to the embassy.',
      badge: () => `<span class="badge">${svgLock}On this device</span>`,
      render(o) {
        o.innerHTML = `
          <div class="sum rise"><p><b>186</b>scans checked</p><p><b>182</b>match</p><p class="warn"><b>4</b>flagged</p></div>
          <table class="vt rise"><thead><tr><th>Passport</th><th>Applicant</th><th>Issue</th></tr></thead><tbody>
            <tr class="flag"><td>Z•••4471</td><td>R. Mehta</td><td>Expiry under 6 months</td></tr>
            <tr class="flag"><td>N•••0932</td><td>A. Khan</td><td>Name spelling differs</td></tr>
            <tr class="flag"><td>P•••7718</td><td>S. Iyer</td><td>Date of birth differs</td></tr>
            <tr class="flag"><td>K•••2205</td><td>D. Shah</td><td>Photo page unreadable</td></tr>
            <tr><td>M•••5530</td><td>L. Fernandes</td><td>Matches</td></tr>
          </tbody></table>`;
      },
    },
    {
      time: '11:30 AM', label: 'Creator',
      ask: 'Give me 24 visuals for the summer launch, in our brand style.',
      wall: ["You're out of image generations", 'Upgrade your plan or wait 3 days for your limit to reset.'],
      reply: 'Here are 24. Want me to push any of them further?',
      badge: () => '<span class="badge">Unlimited</span>',
      render(o) {
        seed = 7;
        const tiles = Array.from({ length: 24 }, (_, i) => `<span class="tile rise" data-i="${i}" style="background:${art()}"></span>`).join('');
        o.innerHTML = `<div class="tiles">${tiles}</div>
          <div class="follow"><p class="ask rise" data-later="1">Make the 7th one warmer.</p><p class="reply rise" data-later="1" style="font-size:1rem">Done. Same layout, sunset tones.</p></div>`;
        return () => { const t = o.querySelector('[data-i="6"]'); if (t) { t.classList.add('pick'); t.style.background = art(true); } };
      },
    },
    {
      time: '2:00 PM', label: 'Builder',
      ask: 'Why does checkout fail for customers in Canada?',
      wall: ['This conversation is too long', 'Start a new chat to continue. It won\'t remember this one.'],
      reply: "It's the tax lookup. In March you added provinces for Canada, but checkout still reads the country rate. Fixed in 3 files, tests passing.",
      badge: () => '<span class="badge">Remembers the whole project</span>',
      render(o) {
        o.innerHTML = `<div class="files rise"><span class="badge">checkout/tax.ts</span><span class="badge">lib/region.ts</span><span class="badge">tests/checkout.test.ts</span></div>
<div class="diff rise"><span class="f">checkout/tax.ts</span>
<span class="del">- const rate = TAX[country]</span>
<span class="add">+ const rate = needsProvince(country)</span>
<span class="add">+   ? TAX[country][province] : TAX[country].default</span>
<span class="f">lib/region.ts</span>
<span class="add">+ export const needsProvince = c =&gt; c === 'CA'</span>
<span class="f">tests/checkout.test.ts</span>
<span class="add">+ it('charges HST in Ontario', ...)</span></div>`;
      },
    },
    {
      time: '5:30 PM', label: 'Finances',
      ask: 'Here are our bank statements. Will we make payroll this month?',
      wall: ['Files are processed on our servers', "It's your bank statements. You close the tab instead."],
      reply: 'Not quite. Payroll on the 28th takes you $18,000 below zero. Move the $30,000 vendor payment to the 2nd and you stay above zero all month.',
      badge: () => `<span class="badge">${svgLock}Never leaves the office</span>`,
      render(o) {
        const now = [92, 78, 61, 43, -18, 24], fix = [92, 78, 61, 43, 12, 24];
        const W = o.clientWidth && o.clientWidth < 480 ? 340 : 520, X = i => 40 + i * ((W - 70) / 5), Y = v => 150 - (v + 30) * 1.1;
        const pts = a => a.map((v, i) => `${X(i)},${Y(v)}`).join(' ');
        const weeks = ['1 Mar', '8 Mar', '15 Mar', '22 Mar', '28 Mar', '4 Apr'];
        o.innerHTML = `<svg class="chart rise" viewBox="0 0 ${W} 172" role="img" aria-label="Cash balance dips to minus $18,000 on 28 March, or stays at $12,000 if the vendor payment moves">
            ${[-20, 0, 20, 40, 60, 80, 100].map(v => `<line class="${v === 0 ? 'zero' : 'grid'}" x1="36" x2="${W - 10}" y1="${Y(v)}" y2="${Y(v)}"/><text x="0" y="${Y(v) + 4}">${v === 0 ? '$0' : (v < 0 ? '-$' + (-v) : '$' + v) + 'K'}</text>`).join('')}
            ${weeks.map((w, i) => (W < 400 && i % 2) ? '' : `<text x="${X(i) - 16}" y="168">${w}</text>`).join('')}
            <polyline class="fix rise" points="${pts(fix)}"/>
            <polyline class="now draw" points="${pts(now)}"/>
            <circle cx="${X(4)}" cy="${Y(-18)}" r="4.5" fill="#E5102A"/>
          </svg>
          <div class="legend rise"><span><i></i>As planned</span><span><i class="d"></i>Vendor payment moved to the 2nd</span></div>`;
      },
    },
    {
      time: '8:45 PM', label: 'Offline',
      ask: 'Finish the investor deck and write the speaker notes.',
      wall: ['Network error', 'Check your internet connection and try again.'],
      reply: "The Wi-Fi's down. Doesn't matter. Slides 9 to 12 will be ready before it's back.",
      badge: () => `<span class="badge">${svgOff}Offline</span>`,
      render(o) {
        o.innerHTML = `<div class="jobs">
          <div class="job rise"><div class="job-top"><span>Investor deck</span><span>slide 9 of 12</span></div><div class="track"><i data-w="75%"></i></div></div>
          <div class="job rise"><div class="job-top"><span>Speaker notes</span><span>drafting</span></div><div class="track"><i data-w="40%"></i></div></div>
          <div class="job rise"><div class="job-top"><span>Charts from last quarter's numbers</span><span>done</span></div><div class="track"><i data-w="100%"></i></div></div>
        </div>`;
      },
    },
    {
      time: '11:30 PM', label: 'Overnight',
      ask: 'Finish the report and the 3D model of the new stand by morning.',
      wall: ["You've reached your usage limit", 'Try again at 4:00 AM.'],
      reply: "Go to sleep. Both will be on your desk when you wake up.",
      badge: () => `<span class="badge">${svgMoon}Working overnight</span>`,
      render(o, alive) {
        o.innerHTML = `<div class="night"><canvas class="rise" width="340" height="340" aria-label="Rotating wireframe of the 3D model"></canvas>
          <ul class="checks">
            <li class="rise"><span>Quarterly report<small>Done at 1:52 AM</small></span></li>
            <li class="rise"><span>3D model of the new stand<small>Done at 4:10 AM</small></span></li>
            <li class="rise"><span>Learned something new<small>You prefer summaries under 100 words</small></span></li>
          </ul></div>`;
        spin(o.querySelector('canvas'), alive);
      },
    },
  ];

  // Wireframe "3D model": a stand made of stacked rings.
  function spin(cv, alive) {
    const ctx = cv.getContext('2d'), S = 340, rings = [];
    const prof = [[0.55, -0.9], [0.62, -0.75], [0.28, -0.55], [0.22, 0.3], [0.5, 0.55], [0.7, 0.75], [0.7, 0.9]];
    prof.forEach(([r, y]) => { const ring = []; for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2; ring.push([Math.cos(a) * r, y, Math.sin(a) * r]); } rings.push(ring); });
    function draw(t) {
      if (!alive()) return;
      const a = t * 0.0006, tilt = 0.45;
      ctx.clearRect(0, 0, S, S);
      const P = ([x, y, z]) => { const X = x * Math.cos(a) + z * Math.sin(a), Z = -x * Math.sin(a) + z * Math.cos(a);
        const Y = y * Math.cos(tilt) - Z * Math.sin(tilt), Z2 = y * Math.sin(tilt) + Z * Math.cos(tilt); return [S / 2 + X * 150, S / 2 + Y * 150, Z2]; };
      ctx.lineWidth = 1.2;
      rings.forEach((ring, i) => {
        ring.forEach((p, k) => {
          const q = ring[(k + 1) % ring.length], [x1, y1, z1] = P(p), [x2, y2] = P(q);
          ctx.strokeStyle = `rgba(255,255,255,${0.25 + (z1 + 1) * 0.3})`; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
          if (i < rings.length - 1) { const [x3, y3] = P(rings[i + 1][k]); ctx.strokeStyle = `rgba(229,16,42,${0.35 + (z1 + 1) * 0.25})`; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x3, y3); ctx.stroke(); }
        });
      });
      if (!reduce) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  // Timeline buttons
  const btns = scenes.map((s, i) => {
    const b = document.createElement('button');
    b.className = 'tl-btn'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', 'false');
    b.innerHTML = `<time>${s.time}</time><span>${s.label}</span>`;
    b.addEventListener('click', () => { stopAuto(); show(i); });
    tl.appendChild(b); return b;
  });

  let current = -1, token = 0, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, reduce ? 0 : ms));
  function show(i) {
    current = i; const my = ++token; timers.forEach(clearTimeout); timers = [];
    const s = scenes[i];
    btns.forEach((b, j) => b.setAttribute('aria-selected', j === i ? 'true' : 'false'));
    $('tlBar').style.width = ((i + 1) / scenes.length * 100) + '%';
    stage.classList.remove('walled');
    $('cloudTime').textContent = s.time; $('cloudAsk').textContent = s.ask; $('nodeAsk').textContent = s.ask;
    $('wallTitle').textContent = s.wall[0]; $('wallText').textContent = s.wall[1];
    $('nodeBadge').innerHTML = s.badge();
    const reply = $('nodeReply'); reply.classList.remove('in'); reply.textContent = s.reply;
    const after = s.render(out, () => my === token) || null;
    $('tWalls').textContent = i + 1; $('tDone').textContent = i + 1;

    later(() => stage.classList.add('walled'), 450);
    later(() => reply.classList.add('in'), 900);
    const items = [...out.querySelectorAll('.rise:not([data-later])')];
    items.forEach((el, k) => later(() => el.classList.add('in'), 1100 + k * (items.length > 10 ? 45 : 160)));
    const t0 = 1100 + items.length * (items.length > 10 ? 45 : 160);
    later(() => {
      out.querySelectorAll('.draw').forEach(el => el.classList.add('in'));
      out.querySelectorAll('.track i').forEach(el => el.style.width = el.dataset.w);
    }, t0 - 300);
    out.querySelectorAll('[data-later]').forEach((el, k) => later(() => el.classList.add('in'), t0 + 500 + k * 900));
    if (after) later(after, t0 + 1500);
  }

  // Desktop with a tall enough window: the section pins and scrolling moves through the day.
  const pinWrap = document.getElementById('dayPin');
  const canPin = () => pinWrap && !reduce && innerWidth > 900 && innerHeight >= 820;
  let pinned = false;
  function setupPin() {
    pinned = canPin();
    pinWrap.classList.toggle('pinned', pinned);
    pinWrap.style.height = pinned ? `calc(100vh + ${scenes.length * 55}vh)` : '';
  }
  function onScroll() {
    if (!pinned) return;
    const r = pinWrap.getBoundingClientRect();
    const span = r.height - innerHeight;
    const k = Math.min(0.999, Math.max(0, -r.top / span));
    const i = Math.floor(k * scenes.length);
    if (i !== current) show(i);
  }
  if (pinWrap) {
    setupPin();
    addEventListener('resize', () => { setupPin(); onScroll(); });
    addEventListener('scroll', onScroll, { passive: true });
  }
  // Clicking a moment while pinned scrolls to it, so scroll and selection agree.
  btns.forEach((b, i) => b.addEventListener('click', () => {
    if (!pinned) return;
    const top = pinWrap.getBoundingClientRect().top + scrollY;
    const span = pinWrap.offsetHeight - innerHeight;
    scrollTo({ top: top + span * (i + 0.5) / scenes.length, behavior: 'smooth' });
  }));

  // Otherwise: autoplay through the day while on screen, until someone picks a moment.
  let auto = null, picked = false;
  function stopAuto() { picked = true; clearInterval(auto); auto = null; }
  new IntersectionObserver(es => {
    if (es[0].isIntersecting) {
      if (current < 0) show(0);
      if (!pinned && !picked && !reduce && !auto) auto = setInterval(() => show((current + 1) % scenes.length), 9000);
    } else { clearInterval(auto); auto = null; }
  }, { threshold: 0.35 }).observe(stage);
})();
