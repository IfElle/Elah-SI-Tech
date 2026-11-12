import { WEB3FORMS_KEY, WHATSAPP_NUMBER } from './config.js';

export function track(name, data) {
  try { if (window.va) window.va('event', { name, data }); } catch (_) {}
}

const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const TITLES = {
  'early-access': "I'd like early access",
  'business-pilot': "I'd like to talk about a pilot",
  'company-contact': "I'd like to get in touch",
  'careers-apply': "I'm applying for the founding System Architecture Engineer role",
  'quest-meter': 'puzzle level 2 (the Meter)',
  'quest-hiring': 'the next step (hiring side quest)',
};
const LABELS = { email: 'Email', name: 'Name', role: 'Interested as', note: 'Note', company: 'Company', size: 'Team size', need: 'What we want it to do', org: 'Organisation', topic: 'Topic', message: 'Message', link: 'Work', word: 'Word', why: 'How', source: 'From' };
const label = k => LABELS[k] || k;

/** Send a lead. Uses Web3Forms when a key is configured; otherwise opens WhatsApp. */
async function send(type, fields) {
  const clean = Object.fromEntries(Object.entries(fields).filter(([k, v]) => v && k !== 'botcheck'));
  if (WEB3FORMS_KEY) {
    const r = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject: `Elah: ${type}${clean.role ? ' (' + clean.role + ')' : ''}`, from_name: 'elah.one', ...(clean.email ? { replyto: clean.email } : {}), type, page: location.pathname, ...clean }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.success === false) throw new Error(j.message || 'Send failed');
    return { via: 'email' };
  }
  const lines = [`Hi Elah, ${TITLES[type] || type}.`, ''].concat(Object.entries(clean).filter(([k]) => k !== 'source').map(([k, v]) => `${label(k)}: ${v}`));
  const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
  return { via: 'whatsapp', url };
}

function say(el, text, kind = '') { if (!el) return; el.className = 'msg' + (kind ? ' ' + kind : ''); el.textContent = text; }
function waNote(el, url) {
  el.className = 'msg ok';
  el.innerHTML = 'Opening WhatsApp. Tap <b>Send</b> there to finish. <a target="_blank" rel="noopener"></a>';
  const a = el.querySelector('a'); a.href = url; a.textContent = 'Open it again';
  window.location.href = url;
}
function fields(form) {
  const out = {};
  new FormData(form).forEach((v, k) => { out[k] = typeof v === 'string' ? v.trim() : v; });
  return out;
}
function validate(form, msg) {
  let bad = null;
  form.querySelectorAll('input, textarea, select').forEach(el => {
    el.removeAttribute('aria-invalid');
    const v = (el.value || '').trim();
    let ok = true;
    if (el.required && !v) ok = false;
    if (ok && el.type === 'email' && v && !emailOk(v)) ok = false;
    if (ok && el.dataset.minlen && v.length < +el.dataset.minlen) ok = false;
    if (!ok) { el.setAttribute('aria-invalid', 'true'); if (!bad) bad = el; }
  });
  if (bad) {
    const name = bad.type === 'email' ? 'a valid email address' : (bad.dataset.need || 'this field');
    say(msg, `Add ${name}.`, 'err'); bad.focus(); return false;
  }
  return true;
}
const announce = () => document.dispatchEvent(new CustomEvent('elah:lead'));

/* ---------- one-field early-access capture, with an optional second step ---------- */
document.querySelectorAll('[data-capture]').forEach(wrap => {
  const f1 = wrap.querySelector('.capture'), f2 = wrap.querySelector('.capture-2');
  const m1 = wrap.querySelector('.capture-meta .msg'), m2 = f2.querySelector('.msg');
  const btn1 = f1.querySelector('button');
  let email = '', started = false;
  f1.querySelector('input[type=email]').addEventListener('focus', () => { if (!started) { started = true; track('signup_start', { source: f1.dataset.source }); } });

  f1.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate(f1, m1)) return;
    const data = fields(f1);
    if (data.botcheck) return;
    email = data.email;
    track('signup_submit', { source: f1.dataset.source });
    if (!WEB3FORMS_KEY) {
      // No email backend yet: collect the details first, then hand over to WhatsApp once.
      f1.classList.add('done'); f2.hidden = false;
      f2.querySelector('[data-landed]').textContent = 'One more step.';
      f2.querySelector('input').focus();
      return;
    }
    btn1.disabled = true; say(m1, 'Sending…');
    try {
      await send('early-access', { email, source: f1.dataset.source });
      say(m1, ''); f1.classList.add('done'); f2.hidden = false; announce();
      f2.querySelector('input').focus();
    } catch (_) {
      say(m1, "Couldn't send. Check your connection and try again.", 'err');
    } finally { btn1.disabled = false; }
  });

  async function finish(skip) {
    const d = fields(f2);
    if (d.role) track('signup_role', { role: d.role });
    if (!WEB3FORMS_KEY) {
      const r = await send('early-access', { email, role: d.role, note: d.note, source: f1.dataset.source });
      announce(); waNote(m2, r.url); return;
    }
    if (skip || (!d.role && !d.note)) { f2.innerHTML = '<p class="landed"><span class="stone" aria-hidden="true"></span><span>You\'re on the list. We\'ll be in touch.</span></p>'; return; }
    const b = f2.querySelector('button[type=submit]'); b.disabled = true; say(m2, 'Sending…');
    try {
      await send('early-access-details', { email, role: d.role, note: d.note });
      f2.innerHTML = '<p class="landed"><span class="stone" aria-hidden="true"></span><span>Thank you. We\'ll be in touch.</span></p>';
    } catch (_) { say(m2, "Couldn't send. Try again, or skip: you're already on the list.", 'err'); b.disabled = false; }
  }
  f2.addEventListener('submit', e => { e.preventDefault(); finish(false); });
  f2.querySelector('[data-skip]').addEventListener('click', () => finish(true));
});

/* ---------- full forms: business, company, careers, access, quests ---------- */
document.querySelectorAll('form[data-lead]').forEach(form => {
  const msg = form.querySelector('.msg');
  const btn = form.querySelector('button[type=submit]');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate(form, msg)) return;
    const data = fields(form);
    if (data.botcheck) return;
    const type = form.dataset.lead;
    track(type.startsWith('quest') ? 'quest_submit' : 'form_submit', { type, role: data.role || '' });
    btn.disabled = true; say(msg, 'Sending…');
    try {
      const r = await send(type, data);
      announce();
      if (r.via === 'whatsapp') { waNote(msg, r.url); btn.disabled = false; return; }
      form.reset();
      say(msg, form.dataset.done || "Sent. We'll reply soon.", 'ok');
    } catch (_) {
      say(msg, "Couldn't send. Check your connection and try again.", 'err');
    } finally { btn.disabled = false; }
  });
});

/* ---------- preselect a role from ?role= on the access page ---------- */
const role = new URLSearchParams(location.search).get('role');
if (role) {
  const r = document.querySelector(`form[data-lead] input[name=role][value="${CSS.escape(role)}"]`);
  if (r) r.checked = true;
}
