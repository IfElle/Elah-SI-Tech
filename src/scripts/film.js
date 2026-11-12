import { track } from './forms.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Silent loop plays only while on screen.
document.querySelectorAll('.film-loop').forEach(loop => {
  if (reduce || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(es => es.forEach(e => { e.isIntersecting ? loop.play().catch(() => {}) : loop.pause(); }), { threshold: 0.25 }).observe(loop);
});

// Film frame: gentle tilt and a play button that leans toward the pointer.
document.querySelectorAll('.film-frame').forEach(frame => {
  if (reduce || matchMedia('(hover: none)').matches) return;
  const play = frame.querySelector('.film-play');
  frame.addEventListener('pointermove', e => {
    const r = frame.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    frame.style.transform = `perspective(1400px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
    if (play) play.style.transform = `translate(${x * 40}px, ${y * 30}px)`;
  });
  frame.addEventListener('pointerleave', () => { frame.style.transform = ''; if (play) play.style.transform = ''; });
});

const modal = document.getElementById('filmModal');
if (modal) {
  const video = document.getElementById('filmVideo');
  const after = document.getElementById('fmAfter');
  const closeBtn = document.getElementById('fmClose');
  let opener = null, done = false;
  const pick = () => {
    if (video.getAttribute('src')) return;
    const small = innerWidth <= 900 || (navigator.connection && navigator.connection.saveData);
    video.src = small ? '/film/meet-samantha-720.mp4' : '/film/meet-samantha-1080.mp4';
  };
  const loops = () => document.querySelectorAll('.film-loop');
  function open(e) {
    opener = e && e.currentTarget; pick(); done = false;
    after.hidden = true; modal.hidden = false; document.body.style.overflow = 'hidden';
    loops().forEach(l => l.pause());
    video.currentTime = 0; video.play().catch(() => {});
    track('film_play', { from: opener && opener.dataset.film || 'page' });
    closeBtn.focus();
  }
  function close() {
    video.pause(); modal.hidden = true; document.body.style.overflow = '';
    if (opener) opener.focus();
  }
  document.querySelectorAll('[data-film]').forEach(b => b.addEventListener('click', open));
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { // keep focus inside the player
      const f = [...modal.querySelectorAll('button, video, input, a[href]')].filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  video.addEventListener('ended', () => { after.hidden = false; if (!done) { done = true; track('film_complete'); } const i = after.querySelector('input[type=email]'); if (i) i.focus(); });
  video.addEventListener('play', () => { after.hidden = true; });
  document.getElementById('fmReplay').addEventListener('click', () => { after.hidden = true; video.currentTime = 0; video.play().catch(() => {}); });
}
