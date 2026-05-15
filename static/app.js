/* ============================================================
   KING DIADEM — app.js  v2.1
   แก้ไข: conversation memory (ส่ง history ไป backend)
         + tone detection ครบ + session persist
   ============================================================ */

'use strict';

/* ── Conversation history (in-memory per session) ── */
const _convHistory = {};   // { sessionId: [ {role, content}, … ] }

function getHistory(sid) {
  if (!_convHistory[sid]) _convHistory[sid] = [];
  return _convHistory[sid];
}

function pushHistory(sid, role, content) {
  const h = getHistory(sid);
  h.push({ role, content: String(content) });
  // keep last 20 turns (40 messages) to avoid token overflow
  if (h.length > 40) h.splice(0, h.length - 40);
}

function activeSessionId() {
  try {
    const s = JSON.parse(localStorage.getItem('kd_sessions_v1') || '{}');
    return s.active || 'default';
  } catch (_) { return 'default'; }
}

/* ── Tone / voice detection ── */
const CRISIS_KEYWORDS = [
  'ฆ่าตัวตาย','อยากตาย','สิ้นหวัง','ทนไม่ไหว','หมดแรง','หมดหวัง',
  'จบชีวิต','เลิกมีชีวิต','crisis','suicid','hopeless','give up'
];
const VEGA_KEYWORDS = [
  'เจ็บปวด','เสียใจ','ร้องไห้','กลัว','เหงา','โดดเดี่ยว','ทรมาน',
  'hurt','pain','scared','lonely','griev','heartbreak'
];

window.detectConversationMode = function (text) {
  const t = text.toLowerCase();
  if (CRISIS_KEYWORDS.some(k => t.includes(k))) return 'crisis';
  if (VEGA_KEYWORDS.some(k => t.includes(k))) return 'vega';
  return 'lyla';
};

window.buildVoiceHint = function (text, mode) {
  if (mode === 'crisis') return 'ผู้ใช้อาจอยู่ในภาวะวิกฤต ให้ความห่วงใยและข้อมูลความปลอดภัยก่อน';
  if (mode === 'vega')   return 'ผู้ใช้แสดงอารมณ์ ให้รับฟังและเห็นอกเห็นใจก่อนให้ข้อมูล';
  return 'โหมดปกติ/สังเกตการณ์ — ช่วยวิเคราะห์และเปิดทางเลือก';
};

/* ── UI helpers ── */
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function escH(t) {
  return String(t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function hideWelcome() {
  const w = document.getElementById('welcome');
  if (w) w.remove();
}

function addMsg(type, text, meta) {
  hideWelcome();
  const area = document.getElementById('chat-scroll');
  if (!area) return;
  const div = document.createElement('div');
  div.className = 'msg ' + type;
  const av = type === 'user'
    ? '<div class="msg-avatar">YOU</div>'
    : '<div class="msg-avatar"><img class="msg-logo" src="/static/logo.png" alt=""></div>';
  const snd = type === 'user' ? 'YOU' : 'KING DIADEM';

  /* render markdown-ish bold + newlines */
  const html = escH(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  div.innerHTML = av +
    '<div class="msg-body">' +
      '<div class="msg-sender">' + snd + '</div>' +
      '<div class="msg-text">' + html + '</div>' +
      (meta ? '<div class="route-tag">' + escH(meta) + '</div>' : '') +
    '</div>';
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
  if (typeof persistActiveChatHtml === 'function') persistActiveChatHtml();
}

function addThinking() {
  hideWelcome();
  const area = document.getElementById('chat-scroll');
  if (!area) return;
  const div = document.createElement('div');
  div.className = 'msg system';
  div.id = 'thinking-msg';
  div.innerHTML =
    '<div class="msg-avatar"><img class="msg-logo" src="/static/logo.png" alt=""></div>' +
    '<div class="msg-body"><div class="msg-sender">ANALYZING</div>' +
    '<div class="msg-text"><div class="thinking"><span></span><span></span><span></span></div></div></div>';
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
}

function removeThinking() {
  const el = document.getElementById('thinking-msg');
  if (el) el.remove();
}

/* ── LYLA waterline meters ── */
function updateLyla(data) {
  const pat = data.pattern || {};
  const e = +pat.entropy   || 40;
  const s = +pat.stability || 60;
  const r = +pat.resource  || 50;
  uM('wl-entropy',   e, true);
  uM('wl-stability', s, false);
  uM('wl-resource',  r, false);
  const ev = document.getElementById('wl-entropy-val');
  const sv = document.getElementById('wl-stability-val');
  const rv = document.getElementById('wl-resource-val');
  if (ev) ev.textContent = e.toFixed(0);
  if (sv) sv.textContent = s.toFixed(0);
  if (rv) rv.textContent = r.toFixed(0);
  const rs = data.risk_score;
  const lc = document.getElementById('lyla-choices');
  if (lc) lc.textContent = (rs != null && rs > 75) ? 'LOW' : '≥1';
  const ld = document.getElementById('lyla-drift');
  if (ld) ld.textContent = ((e / 100) * 0.1).toFixed(2) + '%';
}

function uM(id, val, inv) {
  const f = document.getElementById(id);
  if (!f) return;
  const p = Math.max(0, Math.min(100, val));
  f.style.width = p + '%';
  const bad = inv ? p > 72 : p < 28;
  const mid = inv ? p > 48 : p < 48;
  f.className = 'wl-fill ' + (bad ? 'crit' : mid ? 'warn' : 'safe');
}

/* ── Main send ── */
async function run() {
  const inp = document.getElementById('main-input');
  const text = (inp.value || '').trim();
  if (!text) return;

  const sid  = activeSessionId();
  const mode = window.detectConversationMode(text);
  const voiceHint = window.buildVoiceHint(text, mode);

  /* update tone pill */
  const tp = document.getElementById('tone-pill');
  if (tp) { tp.textContent = mode.toUpperCase(); tp.className = 'tone-pill ' + mode; }

  /* record user turn */
  pushHistory(sid, 'user', text);
  addMsg('user', text);
  if (typeof maybeRenameSessionFromMessage === 'function') maybeRenameSessionFromMessage(text);

  inp.value = ''; inp.style.height = 'auto';
  const btn = document.getElementById('run-btn');
  if (btn) btn.disabled = true;
  addThinking();

  try {
    const res = await fetch('/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input:       text,
        route:       window._KD_ROUTE || 'general',
        voice_mode:  mode,
        voice_hint:  voiceHint,
        /* ★ ส่ง history ทั้งหมด — backend จะใช้เป็น context ★ */
        history:     getHistory(sid).slice(0, -1),   // exclude the just-added user msg
        context: {
          client_voice: mode,
          tone_notes:   voiceHint,
          route_ui:     window._KD_ROUTE || 'general'
        }
      })
    });

    let data;
    try { data = await res.json(); }
    catch (_) { throw new Error('เซิร์ฟเวอร์ตอบไม่ใช่ JSON (อาจ timeout)'); }

    removeThinking();

    if (data.error) {
      addMsg('system', '⚠ ' + data.error, 'ERROR');
      return;
    }

    const reply = data.ai_response || data.message || JSON.stringify(data, null, 2);
    const risk  = data.risk_score != null ? ' · RISK ' + Math.round(data.risk_score) : '';
    const prefix = mode === 'crisis' ? '[VEGA · SAFETY]' : mode === 'vega' ? '[VEGA]' : '[LYLA]';
    const meta   = 'ROUTE ' + (data.route || (window._KD_ROUTE || 'general')).toUpperCase() + risk + ' · ' + mode.toUpperCase();

    /* record assistant turn */
    pushHistory(sid, 'assistant', reply);
    addMsg('system', prefix + '\n\n' + reply, meta);

    updateLyla(data);
    if (typeof refreshMe === 'function') refreshMe();

    /* broadcast for galaxy/council */
    try {
      const intent = (data.governance && data.governance.intent) ? data.governance.intent : {};
      const pat    = data.pattern || {};
      window.dispatchEvent(new CustomEvent('KD:response', { detail: {
        output:   { action: data.route || 'observe', reason: voiceHint, confidence: intent.confidence, risk: data.risk_score },
        consensus:{ final_action: data.route || 'observe', confidence: intent.confidence },
        risk:     { risk_score: data.risk_score },
        council:  {
          votes: [
            { member: 'LYLA', role: 'waterline', action: String(data.route || 'observe'), score: Math.round(data.risk_score || 0) },
            { member: 'VEGA', role: mode === 'crisis' ? 'safety' : 'empathy', action: mode, score: Math.round(pat.entropy || 40) }
          ],
          score: data.risk_score
        }
      }}));
    } catch (_) {}

  } catch (e) {
    removeThinking();
    addMsg('system', '🔴 เครือข่าย: ' + e.message, 'ERROR');
  } finally {
    if (btn) btn.disabled = false;
    if (typeof persistActiveChatHtml === 'function') persistActiveChatHtml();
  }
}

/* ── Route selector ── */
window._KD_ROUTE = 'general';
function setRoute(r) {
  window._KD_ROUTE = r;
  document.querySelectorAll('.route-chip').forEach(b => b.classList.toggle('active', b.dataset.r === r));
  document.querySelectorAll('.ctx-tag').forEach(t => t.classList.toggle('active', t.dataset.r === r));
}

/* ── Hint chips ── */
function useHint(el) {
  const inp = document.getElementById('main-input');
  inp.value = el.textContent;
  autoResize(inp);
  inp.focus();
  if (typeof setTab === 'function') setTab('chat');
  if (typeof closeRailMobile === 'function') closeRailMobile();
}

/* ── Simulate futures ── */
async function simulate() {
  const input = (document.getElementById('main-input').value || '').trim();
  const btn   = document.getElementById('sim-btn');
  const out   = document.getElementById('sim-result');
  out.style.display = 'block';
  if (!input) { out.textContent = 'พิมพ์ข้อความในช่องแชทก่อน แล้วกลับมากดใหม่'; return; }
  if (btn) btn.disabled = true;
  out.textContent = 'กำลังจำลอง…';
  const paths = [...document.querySelectorAll('#sim-paths input')].map(i => i.value).filter(Boolean);
  try {
    const d = await _post('/simulate', { input, paths });
    let txt = d.simulation || d.message || d.error || '—';
    if (d.lyla_observation) {
      txt += '\n\nLYLA OBSERVATION\n' +
        (typeof d.lyla_observation === 'object' ? JSON.stringify(d.lyla_observation, null, 2) : d.lyla_observation);
    }
    out.textContent = txt;
  } catch (e) { out.textContent = 'ERROR ' + e; }
  if (btn) btn.disabled = false;
}

function addSimPath() {
  const g = document.getElementById('sim-paths');
  const d = document.createElement('div');
  d.className = 'sim-path';
  d.innerHTML = '<input type="text" placeholder="เส้นทางใหม่…">';
  g.appendChild(d);
}

/* ── Stripe checkout ── */
async function stripeCheckout() {
  const email = (document.getElementById('payment-email').value || '').trim();
  const plan  = document.querySelector('input[name="plan"]:checked')?.value || 'basic';
  const d = await _post('/payment/create-checkout', { plan, email, api_key: email });
  if (d.url) location.href = d.url;
  else alert(d.error || 'Stripe ไม่สำเร็จ');
}

/* ── Image analysis ── */
async function uploadImage() {
  const fi  = document.getElementById('photo-file');
  const out = document.getElementById('photo-output');
  if (!fi.files.length) { out.textContent = 'เลือกภาพก่อน'; return; }
  const fd = new FormData();
  fd.append('file', fi.files[0]);
  out.textContent = 'กำลังวิเคราะห์…';
  try {
    const res  = await fetch('/analyze-image', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.error) { out.textContent = '❌ ' + data.error; return; }
    out.textContent = (data.analysis || '') + '\n\n[' + (data.filename || '') + ']';
  } catch (e) { out.textContent = 'ERROR ' + e; }
}

/* ── Utility ── */
async function _post(url, body) {
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await r.json();
  } catch (e) { return { error: String(e) }; }
}

/* expose globals index.html calls */
window.run           = run;
window.setRoute      = setRoute;
window.useHint       = useHint;
window.simulate      = simulate;
window.addSimPath    = addSimPath;
window.stripeCheckout= stripeCheckout;
window.uploadImage   = uploadImage;
window.autoResize    = autoResize;
window.addMsg        = addMsg;
window.updateLyla    = updateLyla;
