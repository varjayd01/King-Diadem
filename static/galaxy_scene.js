/* ============================================================
   KING DIADEM — galaxy_scene.js v24
   Realistic solar system — matches reference image
   Sun left, planets spread full width, orbit dashed ellipses
   Performance: delta-time RAF, no layout thrash
   ============================================================ */
(function () {
  'use strict';
  var cv = document.getElementById('galaxy');
  if (!cv) return;
  if (!window.KD) window.KD = {};

  var ctx = cv.getContext('2d', { alpha: true });
  var W = 0, H = 0, lastTime = 0;
  var activeRoute = 'general';

  /* Logo */
  var _logo = new Image();
  _logo.src = '/static/logo.png';
  _logo.onerror = function () { _logo = null; };

  cv.style.cssText = 'display:block;width:100%;height:100%;';

  /* ── Resize ── */
  var _rT;
  function doResize() {
    var p = cv.parentElement;
    W = cv.width  = p ? p.offsetWidth  : 900;
    H = cv.height = p ? p.offsetHeight : 110;
    buildStars();
  }
  var ro = window.ResizeObserver
    ? new ResizeObserver(function () { clearTimeout(_rT); _rT = setTimeout(doResize, 60); })
    : null;
  if (ro && cv.parentElement) ro.observe(cv.parentElement);
  window.addEventListener('resize', function () { clearTimeout(_rT); _rT = setTimeout(doResize, 80); }, { passive: true });
  setTimeout(doResize, 10);

  /* ── Sun geometry ── */
  function SX() { return Math.max(H * 0.58, Math.min(W * 0.12, 72)); }
  function SY() { return H * 0.50; }
  function SR() { return Math.min(H * 0.36, 22); }

  /* Orbit tilt — shallow ellipse like reference */
  var TILT = 0.18;

  /* ── Planet definitions ──
     orb  = orbit semi-major as fraction of (W - SX)
     sz   = base radius px (will scale with H)
  */
  var PDEFS = [
    /* main visible planets */
    { id:'general',  label:'GENERAL',  ang:0.60, spd:0.00022, orb:0.14, sz:6.0,
      c0:'#b8cce0', c1:'#4a7090', c2:'#1a3050', atm:'rgba(100,160,220,' },
    { id:'risk',     label:'RISK',     ang:2.30, spd:0.00015, orb:0.22, sz:5.0,
      c0:'#cc7858', c1:'#803018', c2:'#340c04', atm:'rgba(175,70,30,' },
    { id:'survival', label:'SURVIVAL', ang:3.80, spd:0.00010, orb:0.31, sz:6.4,
      c0:'#a8c460', c1:'#4a6c20', c2:'#1c2808', atm:'rgba(100,155,60,' },
    { id:'collapse', label:'COLLAPSE', ang:5.10, spd:0.00007, orb:0.41, sz:5.2,
      c0:'#b88855', c1:'#705025', c2:'#2c1c08', atm:'rgba(145,85,30,' },
    { id:'civil',    label:'CIVIL',    ang:1.20, spd:0.00004, orb:0.54, sz:6.8,
      c0:'#98c0d8', c1:'#407090', c2:'#182c44', atm:'rgba(80,130,185,' },
    { id:'vega',     label:'VEGA',     ang:4.20, spd:0.00002, orb:0.72, sz:9.5,
      c0:'#d0c498', c1:'#988448', c2:'#3a2c10', atm:'rgba(165,135,65,' },
    /* small ambient */
    { id:'a1', ang:1.60, spd:0.00032, orb:0.09, sz:1.8,
      c0:'#7888a0', c1:'#445060', c2:'#202838' },
    { id:'a2', ang:3.20, spd:0.00019, orb:0.18, sz:1.5,
      c0:'#908070', c1:'#504030', c2:'#201808' },
    { id:'a3', ang:5.60, spd:0.00009, orb:0.36, sz:1.6,
      c0:'#809070', c1:'#405038', c2:'#1e2a16' },
    { id:'a4', ang:2.80, spd:0.00003, orb:0.62, sz:1.9,
      c0:'#90a0b0', c1:'#506070', c2:'#202c38' },
  ];
  var PLANETS = PDEFS.map(function (d) { return Object.assign({}, d); });

  /* ── Stars ── */
  var STARS = [];
  function buildStars() {
    STARS = [];
    /* faint bg stars */
    for (var i = 0; i < 900; i++)
      STARS.push({ x:Math.random()*W, y:Math.random()*H,
        r:0.05+Math.random()*0.18, a:0.05+Math.random()*0.22,
        col: Math.random()>0.55 ? '218,200,165' : '195,210,235', tw:false });
    /* twinkling mid */
    for (var j = 0; j < 160; j++)
      STARS.push({ x:Math.random()*W, y:Math.random()*H,
        r:0.15+Math.random()*0.35, a:0.18+Math.random()*0.30,
        col: Math.random()>0.5 ? '222,205,168' : '190,205,235',
        tw:true, tS:0.00012+Math.random()*0.00020, tO:Math.random()*Math.PI*2, tA:0.07 });
    /* bright bloom */
    for (var k = 0; k < 40; k++)
      STARS.push({ x:Math.random()*W, y:Math.random()*H,
        r:0.4+Math.random()*0.65, a:0.38+Math.random()*0.38,
        col: Math.random()>0.4 ? '238,220,175' : '196,210,244',
        tw:true, tS:0.00006+Math.random()*0.00012, tO:Math.random()*Math.PI*2, tA:0.11, bloom:true });
  }

  /* ── Comet ── */
  var COMET = { x:0, y:0, vx:0, vy:0, active:false, life:0, maxLife:0 };
  var nextComet = 8000;
  function spawnComet(t) {
    COMET.x = W*0.25 + Math.random()*W*0.30;
    COMET.y = -6;
    COMET.vx = 0.6 + Math.random()*0.8;
    COMET.vy = 0.5 + Math.random()*0.6;
    COMET.life = 0;
    COMET.maxLife = 1.4 + Math.random()*1.2;
    COMET.active = true;
    nextComet = t + 16000 + Math.random()*28000;
  }
  function drawComet(t, dt) {
    if (t > nextComet && !COMET.active) spawnComet(t);
    if (!COMET.active) return;
    COMET.life += dt;
    if (COMET.life > COMET.maxLife || COMET.y > H+30) { COMET.active = false; return; }
    COMET.x += COMET.vx * dt * 60 * 0.014;
    COMET.y += COMET.vy * dt * 60 * 0.014;
    var prog = COMET.life / COMET.maxLife;
    var al = prog < 0.15 ? prog/0.15 : Math.max(0, 1-(prog-0.15)/0.85);
    var tl = 80, tx = COMET.x - COMET.vx*tl*0.014, ty = COMET.y - COMET.vy*tl*0.014;
    var g = ctx.createLinearGradient(tx, ty, COMET.x, COMET.y);
    g.addColorStop(0, 'rgba(195,215,255,0)');
    g.addColorStop(0.5, 'rgba(210,225,255,'+(al*0.20)+')');
    g.addColorStop(1, 'rgba(235,245,255,'+(al*0.65)+')');
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(COMET.x, COMET.y);
    ctx.strokeStyle = g; ctx.lineWidth = 0.85; ctx.stroke();
    ctx.beginPath(); ctx.arc(COMET.x, COMET.y, 1.4, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(235,245,255,'+(al*0.88)+')'; ctx.fill();
  }

  /* ── Background ── */
  function drawBg() {
    ctx.clearRect(0, 0, W, H);
    /* deep space base */
    var bg = ctx.createLinearGradient(0, 0, W, 0);
    bg.addColorStop(0,    '#0d0608');
    bg.addColorStop(0.18, '#090710');
    bg.addColorStop(0.55, '#06070e');
    bg.addColorStop(1,    '#04060c');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    var sx = SX(), sy = SY();
    ctx.globalCompositeOperation = 'screen';

    /* warm red nebula — sun side */
    var n1 = ctx.createRadialGradient(sx*0.5, sy*0.5, 0, sx*0.5, sy*0.5, W*0.22);
    n1.addColorStop(0,   'rgba(140,42,12,0.34)');
    n1.addColorStop(0.5, 'rgba(95,25,8,0.12)');
    n1.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(sx*0.5, sy*0.5, W*0.22, H*1.15, -0.12, 0, Math.PI*2);
    ctx.fillStyle = n1; ctx.fill();

    /* amber halo behind sun */
    var n2 = ctx.createRadialGradient(sx, sy, SR()*0.3, sx, sy, W*0.28);
    n2.addColorStop(0,   'rgba(162,82,12,0.24)');
    n2.addColorStop(0.4, 'rgba(115,52,6,0.08)');
    n2.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(sx, sy, W*0.28, H*0.90, 0, 0, Math.PI*2);
    ctx.fillStyle = n2; ctx.fill();

    /* cold blue far right — like reference */
    var n3 = ctx.createRadialGradient(W*0.90, H*0.40, 0, W*0.90, H*0.40, W*0.20);
    n3.addColorStop(0,   'rgba(28,45,105,0.22)');
    n3.addColorStop(0.5, 'rgba(12,25,65,0.08)');
    n3.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(W*0.90, H*0.40, W*0.20, H*0.85, 0, 0, Math.PI*2);
    ctx.fillStyle = n3; ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
  }

  function drawStars(t) {
    for (var i = 0; i < STARS.length; i++) {
      var s = STARS[i], al = s.a;
      if (s.tw) al = s.a * (1 + Math.sin(t*s.tS + s.tO) * s.tA);
      al = Math.max(0.02, Math.min(1, al));
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba('+s.col+','+al.toFixed(3)+')'; ctx.fill();
      if (s.bloom && al > 0.50) {
        var sp = s.r*3.5;
        ctx.strokeStyle = 'rgba('+s.col+','+(al*0.055).toFixed(3)+')';
        ctx.lineWidth = 0.25;
        ctx.beginPath();
        ctx.moveTo(s.x-sp, s.y); ctx.lineTo(s.x+sp, s.y);
        ctx.moveTo(s.x, s.y-sp); ctx.lineTo(s.x, s.y+sp);
        ctx.stroke();
      }
    }
  }

  /* ── Orbits — dashed ellipses like reference ── */
  function drawOrbits() {
    var sx = SX(), sy = SY();
    var available = W - sx;
    var seen = {};
    ctx.setLineDash([4, 10]);
    PLANETS.forEach(function (p) {
      var orb = Math.round(p.orb * available / 3) * 3;
      if (seen[orb]) return; seen[orb] = true;
      var isA = p.id === activeRoute;
      ctx.beginPath();
      ctx.ellipse(sx, sy, p.orb*available, p.orb*available*TILT, 0, 0, Math.PI*2);
      ctx.strokeStyle = isA ? 'rgba(200,175,110,0.32)' : 'rgba(160,170,200,0.12)';
      ctx.lineWidth   = isA ? 0.80 : 0.40;
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  /* ── Single planet ── */
  function drawPlanet(x, y, p, isA, t) {
    var sz = Math.max(p.sz * (H/110), p.sz * 0.7);

    /* atmosphere glow */
    if (p.atm) {
      var atmA = isA ? 0.22 : 0.12;
      var atmR = sz * 2.8 + (isA ? 6 : 0);
      var atm = ctx.createRadialGradient(x, y, sz*0.4, x, y, atmR);
      atm.addColorStop(0, p.atm + atmA + ')');
      atm.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x, y, atmR, 0, Math.PI*2);
      ctx.fillStyle = atm; ctx.fill();
    }

    /* active pulse */
    if (isA) {
      ctx.globalCompositeOperation = 'screen';
      var pulse = 1 + Math.sin(t*0.0012) * 0.08;
      var glow = ctx.createRadialGradient(x, y, sz, x, y, sz*6*pulse);
      glow.addColorStop(0,   'rgba(200,180,115,0.30)');
      glow.addColorStop(0.4, 'rgba(175,150,75,0.08)');
      glow.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x, y, sz*6*pulse, 0, Math.PI*2);
      ctx.fillStyle = glow; ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    /* sphere body */
    var body = ctx.createRadialGradient(x - sz*0.30, y - sz*0.28, 0, x + sz*0.08, y + sz*0.08, sz*1.08);
    body.addColorStop(0,    p.c0);
    body.addColorStop(0.45, p.c1);
    body.addColorStop(1,    p.c2);
    ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI*2);
    ctx.fillStyle = body; ctx.fill();

    /* specular highlight */
    var spec = ctx.createRadialGradient(x - sz*0.34, y - sz*0.34, 0, x - sz*0.16, y - sz*0.16, sz*0.56);
    spec.addColorStop(0, 'rgba(255,250,235,'+(isA ? 0.52 : 0.26)+')');
    spec.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI*2);
    ctx.fillStyle = spec; ctx.fill();

    /* limb darkening */
    var limb = ctx.createRadialGradient(x, y, sz*0.15, x, y, sz*1.05);
    limb.addColorStop(0,   'rgba(0,0,0,0)');
    limb.addColorStop(0.5, 'rgba(0,0,0,0.14)');
    limb.addColorStop(1,   'rgba(0,0,0,0.72)');
    ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI*2);
    ctx.fillStyle = limb; ctx.fill();

    /* label below planet */
    if (p.label) {
      var fs = Math.max(6, Math.round(sz * 0.65));
      ctx.save();
      if (isA) {
        ctx.globalCompositeOperation = 'screen';
        ctx.shadowColor = 'rgba(218,195,135,0.70)'; ctx.shadowBlur = 7;
        ctx.fillStyle = 'rgba(238,220,168,0.96)';
      } else {
        ctx.fillStyle = 'rgba(178,192,215,0.50)';
      }
      ctx.font = '500 '+fs+'px "DM Mono",monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(p.label, x, y + sz + 3);
      ctx.restore();
    }
  }

  function drawPlanets(dt, t) {
    var sx = SX(), sy = SY();
    var available = W - sx;

    var items = PLANETS.map(function (p) {
      p.ang += p.spd * dt * 60;
      var orb = p.orb * available;
      return {
        p: p,
        x: sx + Math.cos(p.ang) * orb,
        y: sy + Math.sin(p.ang) * orb * TILT,
      };
    }).sort(function (a, b) { return a.y - b.y; });

    items.forEach(function (item) {
      if (item.x < -30 || item.x > W+30) return;
      drawPlanet(item.x, item.y, item.p, item.p.id === activeRoute, t);
    });
  }

  /* ── Sun ── */
  var _S = { thinking: false };

  function drawSun(t) {
    var sx = SX(), sy = SY(), R = SR();
    var gm = _S.thinking ? 1 + Math.sin(t*0.005)*0.20 : 1;

    ctx.globalCompositeOperation = 'lighter';

    /* far corona — horizontal oval like reference */
    var fc = ctx.createRadialGradient(sx, sy, R*0.10, sx, sy, R*11);
    fc.addColorStop(0,    'rgba(210,130,22,'+(0.30*gm)+')');
    fc.addColorStop(0.18, 'rgba(168,80,12,'+(0.10*gm)+')');
    fc.addColorStop(0.46, 'rgba(120,46,6,'+(0.04*gm)+')');
    fc.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.ellipse(sx, sy, R*11, R*3.8, 0, 0, Math.PI*2);
    ctx.fillStyle = fc; ctx.fill();

    /* rays */
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(t*0.000025);
    for (var i = 0; i < 12; i++) {
      var a = (i/12)*Math.PI*2;
      var rl = R * (2.0 + 0.28*Math.sin(i*2.2 + t*0.00018)) * gm;
      var gr = ctx.createLinearGradient(
        Math.cos(a)*R*0.20, Math.sin(a)*R*0.20,
        Math.cos(a)*rl, Math.sin(a)*rl);
      gr.addColorStop(0,    'rgba(252,202,70,'+(0.22*gm)+')');
      gr.addColorStop(0.45, 'rgba(215,120,25,0.04)');
      gr.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.strokeStyle = gr; ctx.lineWidth = 0.90;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*R*0.20, Math.sin(a)*R*0.20);
      ctx.lineTo(Math.cos(a)*rl, Math.sin(a)*rl);
      ctx.stroke();
    }
    ctx.restore();

    /* inner halo */
    var ih = ctx.createRadialGradient(sx, sy, R*0.25, sx, sy, R*2.4);
    ih.addColorStop(0,    'rgba(255,235,148,0.92)');
    ih.addColorStop(0.22, 'rgba(252,182,50,0.62)');
    ih.addColorStop(0.56, 'rgba(195,90,16,0.20)');
    ih.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(sx, sy, R*2.4, 0, Math.PI*2);
    ctx.fillStyle = ih; ctx.fill();

    ctx.globalCompositeOperation = 'source-over';

    /* sun body */
    var body = ctx.createRadialGradient(sx - R*0.22, sy - R*0.22, 0, sx, sy, R);
    body.addColorStop(0,    '#fff8c8');
    body.addColorStop(0.25, '#ffd035');
    body.addColorStop(0.65, '#dc6a0c');
    body.addColorStop(1,    '#7c2a06');
    ctx.beginPath(); ctx.arc(sx, sy, R, 0, Math.PI*2);
    ctx.fillStyle = body; ctx.fill();

    /* logo inside sun */
    var lr = R * 0.82;
    if (_logo && _logo.complete && _logo.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = 0.88;
      ctx.beginPath(); ctx.arc(sx, sy, lr, 0, Math.PI*2); ctx.clip();
      ctx.drawImage(_logo, sx-lr, sy-lr, lr*2, lr*2);
      ctx.restore();
    }

    /* LYLA label above sun */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.shadowColor = 'rgba(252,192,72,0.82)'; ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(252,230,135,0.92)';
    var fs = Math.max(7, Math.round(R*0.50));
    ctx.font = '600 '+fs+'px "DM Mono",monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('LYLA \u25c6', sx, sy - R - 3);
    ctx.restore();
  }

  /* ── Overlay text ── */
  function drawAxiom() {
    ctx.save();
    ctx.font = '400 8px "DM Mono",monospace';
    ctx.fillStyle = 'rgba(148,162,208,0.22)';
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('Choice(t) \u2265 1  \u2192  collapse = False', SX()+SR()+8, H-5);
    ctx.restore();
  }
  function drawBadge() {
    ctx.save();
    ctx.font = '500 6px "DM Mono",monospace';
    ctx.fillStyle = 'rgba(165,178,215,0.16)';
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
    ctx.fillText('FATE\u2122  DETERMINISTIC DECISION INFRASTRUCTURE  v24', W-6, H-5);
    ctx.restore();
  }

  /* ── Main loop ── */
  function loop(ts) {
    if (!lastTime) lastTime = ts;
    var dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;

    drawBg();
    drawStars(ts);
    drawComet(ts, dt);
    drawOrbits();
    drawPlanets(dt, ts);
    drawSun(ts);
    drawAxiom();
    drawBadge();

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ── Public API ── */
  window.LYLA_thinking  = function () { _S.thinking = true; };
  window.LYLA_answered  = function () { _S.thinking = false; };
  window.KD_pulse       = function (r) { _S.thinking = false; if (r) activeRoute = r; };
  window.KD_setRoute    = function (r) { activeRoute = r; };
  window.KD_council     = function () { _S.thinking = true; };
  window.KD_councilEnd  = function () { _S.thinking = false; };
  window.KD.safeVal     = function (v, d) {
    var n = +v, dec = typeof d === 'number' ? d : 2;
    return (isFinite(n) && !isNaN(n)) ? n.toFixed(dec) : '0.00';
  };
})();
