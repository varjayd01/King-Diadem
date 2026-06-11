/* ============================================================
   KING DIADEM — galaxy_scene.js v20 "Cosmic Latte"
   
   Theme   : #FFF8E7 Cosmic Latte — สีจริงของจักรวาล
             Johns Hopkins 2002: avg light of universe = warm beige
   
   Perf    : lightweight — static star field, minimal animation
             ไม่กิน CPU เหมือน Gemini/Claude
   
   Style   : Solar system orbit + planets คง structure เดิม
             แต่ทุกสีเป็น warm amber / cream / ochre
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('galaxy');
  if (!cv) return;
  if (!window.KD) window.KD = {};

  var ctx = cv.getContext('2d', { alpha: true });
  var W = 0, H = 0, CX = 0, CY = 0;
  var lastTime = 0;
  var mouseX = 0, mouseY = 0;
  var activeRoute = 'general';

  var _logo = new Image();
  _logo.src = '/static/logo.png';
  _logo.onerror = function () { _logo = null; };

  /* ★ Strip canvas — NOT fullscreen */
  cv.style.cssText = 'display:block;width:100%;height:100%;';

  window.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ════════ RESIZE ════════ */
  var _rT;
  function doResize() {
    var p = cv.parentElement;
    W  = cv.width  = p ? p.offsetWidth  : 800;
    H  = cv.height = p ? p.offsetHeight : 110;
    CX = W * 0.5; CY = H * 0.5;
    buildStars();
    buildPlanets();
  }
  var ro = window.ResizeObserver
    ? new ResizeObserver(function () { clearTimeout(_rT); _rT = setTimeout(doResize, 80); })
    : null;
  if (ro && cv.parentElement) ro.observe(cv.parentElement);
  window.addEventListener('resize', function () { clearTimeout(_rT); _rT = setTimeout(doResize, 100); }, { passive: true });
  setTimeout(doResize, 10);

  function sc(v) { return v * H / 110; }

  /* ════════ STATE ════════ */
  var STATE = {
    mode: 'idle',
    converge: 0,
    routeGlow: {},
    sunDriftAng: 0,
  };

  /* ════════ COSMIC LATTE PALETTE ════════
     All colors derived from #FFF8E7 warm beige universe avg
  ════════ */
  var CL = {
    bg:      '#08060300',
    star0:   { r:255, g:248, b:225 }, /* cosmic latte pure */
    star1:   { r:255, g:235, b:190 }, /* warm amber */
    star2:   { r:245, g:218, b:155 }, /* ochre */
    star3:   { r:255, g:255, b:240 }, /* cool white */
    star4:   { r:255, g:220, b:140 }, /* golden */
    nebAmber:  'rgba(200,155,60,',
    nebCream:  'rgba(230,210,155,',
    nebRose:   'rgba(185,130,90,',
    nebCool:   'rgba(160,145,120,',
    deVoid:    { r:140, g:110, b:70  }, /* dark matter warm brown */
    deNorm:    { r:200, g:170, b:100 }, /* warm gold particle */
  };

  /* ════════ ROUTES ════════ */
  var ROUTES = {
    general:  { r:230, g:210, b:160, name:'GENERAL'  },
    risk:     { r:210, g:120, b:80,  name:'RISK'      },
    survival: { r:150, g:195, b:120, name:'SURVIVAL'  },
    collapse: { r:180, g:150, b:110, name:'COLLAPSE'  },
    civil:    { r:220, g:195, b:140, name:'CIVIL'     },
    vega:     { r:240, g:220, b:160, name:'VEGA'      },
  };
  function rgb(r) { return r.r + ',' + r.g + ',' + r.b; }

  /* ════════ STARS — Cosmic Latte tones, lightweight ════════
     Layer 0: 900 tiny background — no twinkle, pure static
     Layer 1: 500 mid — very slow fade only
     Layer 2: 200 bright foreground — slow pulse
     Total ~1600 — fast render
  ════════ */
  var STARS = [];
  function buildStars() {
    STARS = [];
    var palette = [CL.star0, CL.star1, CL.star2, CL.star3, CL.star4];
    var cfgs = [
      { n:900, sMin:0.06, sMax:0.24, aMin:0.10, aMax:0.36, tw:false, par:0.00006 },
      { n:500, sMin:0.18, sMax:0.50, aMin:0.20, aMax:0.50, tw:true, tA:0.04, tS:0.0005, par:0.00014 },
      { n:200, sMin:0.42, sMax:0.95, aMin:0.38, aMax:0.72, tw:true, tA:0.06, tS:0.0010, par:0.00022 },
    ];
    cfgs.forEach(function (c) {
      for (var i = 0; i < c.n; i++) {
        var col = palette[Math.floor(Math.random() * palette.length)];
        STARS.push({
          x: Math.random(), y: Math.random(),
          s: c.sMin + Math.random() * (c.sMax - c.sMin),
          a: c.aMin + Math.random() * (c.aMax - c.aMin),
          col: col,
          tw: c.tw, tA: c.tA || 0, tS: c.tS || 0,
          tO: Math.random() * Math.PI * 2,
          par: c.par,
          bloom: c.n === 200 && Math.random() > 0.60,
        });
      }
    });
  }

  /* ════════ PLANETS — Cosmic Latte earth tones ════════ */
  var PLANET_DEFS = [
    { id:'general',  route:'general',  ang:0.52, spd:0.0018, orb:0.092, sz:3.6, col:{r:210,g:185,b:130} },
    { id:'risk',     route:'risk',     ang:1.85, spd:0.0012, orb:0.138, sz:3.2, col:{r:200,g:110,b:70}  },
    { id:'survival', route:'survival', ang:3.10, spd:0.0009, orb:0.185, sz:3.8, col:{r:140,g:175,b:105} },
    { id:'collapse', route:'collapse', ang:4.55, spd:0.0006, orb:0.230, sz:3.4, col:{r:175,g:145,b:105} },
    { id:'civil',    route:'civil',    ang:0.85, spd:0.0004, orb:0.275, sz:3.7, col:{r:210,g:180,b:130} },
    { id:'vega',     route:'vega',     ang:2.65, spd:0.0003, orb:0.318, sz:4.0, col:{r:230,g:205,b:145} },
    /* ambient */
    { id:'a1', ang:1.10, spd:0.0025, orb:0.068, sz:1.5, col:{r:195,g:175,b:130} },
    { id:'a2', ang:2.90, spd:0.0016, orb:0.112, sz:1.3, col:{r:185,g:165,b:120} },
    { id:'a3', ang:4.20, spd:0.0012, orb:0.158, sz:1.4, col:{r:200,g:180,b:135} },
    { id:'a4', ang:5.50, spd:0.0008, orb:0.203, sz:1.2, col:{r:190,g:170,b:125} },
    { id:'a5', ang:0.30, spd:0.0005, orb:0.248, sz:1.5, col:{r:205,g:185,b:140} },
    { id:'a6', ang:3.70, spd:0.0003, orb:0.290, sz:1.3, col:{r:195,g:175,b:130} },
  ];
  var PLANETS = [];
  function buildPlanets() {
    PLANETS = PLANET_DEFS.map(function (d) { return Object.assign({}, d); });
  }

  /* ════════ SUPPLY CHAIN RIPPLE — global state ════════ */
  var supplyChainRipple = null;
  var _frame = 0;

  /* ════════ SHOOTING STAR ════════ */
  var SHOOTS = [], nextShoot = 6000;
  function spawnShoot(t) {
    var fl = Math.random() > 0.5;
    SHOOTS.push({
      x: fl ? -10 : W + 10,
      y: H * (0.05 + Math.random() * 0.90),
      vx: fl ? 1.8 + Math.random() * 2.8 : -(1.8 + Math.random() * 2.8),
      vy: (Math.random() - 0.5) * 1.0,
      life: 0, maxLife: 0.8 + Math.random() * 0.7,
      len: 55 + Math.random() * 70,
      al: 0.25 + Math.random() * 0.20,
    });
    nextShoot = t + 8000 + Math.random() * 18000;
  }

  /* ════════ SUN DRIFT ════════ */
  function updateSunDrift(dt) {
    STATE.sunDriftAng += dt * 0.06;
    CX = W * 0.50 + Math.cos(STATE.sunDriftAng) * sc(3.0);
    CY = H * 0.50 + Math.sin(STATE.sunDriftAng * 0.65) * sc(2.0);
  }

  /* ════════════════════════════════════════
     DRAW — BACKGROUND
     Warm dark — ดำอุ่น ไม่ใช่ cold black
  ════════════════════════════════════════ */
  function drawBg() {
    ctx.clearRect(0, 0, W, H);
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0,   '#090704');
    g.addColorStop(0.5, '#0a0805');
    g.addColorStop(1,   '#080603');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    /* warm nebula wisps — cream + amber, very subtle */
    ctx.globalCompositeOperation = 'screen';
    var n = STATE.sunDriftAng;
    [
      { x:W*0.65, y:H*0.45, rx:W*0.38, ry:H*0.80, c:CL.nebAmber + '0.14)' },
      { x:W*0.25, y:H*0.55, rx:W*0.28, ry:H*0.65, c:CL.nebCream + '0.09)' },
      { x:W*0.82, y:H*0.35, rx:W*0.22, ry:H*0.55, c:CL.nebRose  + '0.10)' },
      { x:W*0.12, y:H*0.60, rx:W*0.18, ry:H*0.48, c:CL.nebCool  + '0.07)' },
      { x:CX,     y:CY,     rx:W*0.14, ry:H*0.40, c:CL.nebAmber + '0.05)' },
    ].forEach(function (nb) {
      ctx.save();
      ctx.translate(nb.x + Math.cos(n * 0.8) * 6, nb.y + Math.sin(n * 0.6) * 4);
      ctx.scale(1, nb.ry / nb.rx);
      var gr = ctx.createRadialGradient(0, 0, 0, 0, 0, nb.rx);
      gr.addColorStop(0, nb.c); gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(0, 0, nb.rx, 0, Math.PI * 2);
      ctx.fillStyle = gr; ctx.fill();
      ctx.restore();
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════ STARS ════════ */
  function drawStars(t) {
    for (var i = 0; i < STARS.length; i++) {
      var s  = STARS[i];
      var px = ((s.x * W + mouseX * s.par * W * 28) % W + W) % W;
      var py = ((s.y * H + mouseY * s.par * H * 28) % H + H) % H;
      var al = s.a;
      if (s.tw) al = s.a * (1 + Math.sin(t * s.tS + s.tO) * s.tA);
      ctx.beginPath();
      ctx.arc(px, py, s.s, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + s.col.r + ',' + s.col.g + ',' + s.col.b + ',' + Math.min(1, al) + ')';
      ctx.fill();
      if (s.bloom && al > 0.45) {
        var bl = s.s * 2.6;
        ctx.strokeStyle = 'rgba(' + s.col.r + ',' + s.col.g + ',' + s.col.b + ',' + (al * 0.06) + ')';
        ctx.lineWidth = 0.20;
        ctx.beginPath();
        ctx.moveTo(px - bl, py); ctx.lineTo(px + bl, py);
        ctx.moveTo(px, py - bl); ctx.lineTo(px, py + bl);
        ctx.stroke();
      }
    }
  }

  /* ════════ RIPPLE ════════ */
  function drawRipple() {
    if (!supplyChainRipple || supplyChainRipple.alpha <= 0) return;
    supplyChainRipple.radius += 3.0;
    supplyChainRipple.alpha  -= 0.0025;
    if (supplyChainRipple.radius >= W * 0.52 || supplyChainRipple.alpha <= 0) {
      supplyChainRipple = null; return;
    }
    ctx.beginPath();
    ctx.arc(CX, CY, supplyChainRipple.radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(210,180,100,' + supplyChainRipple.alpha.toFixed(3) + ')';
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  /* ════════ ORBIT RINGS ════════ */
  var TILT = 0.30;
  function drawOrbits() {
    var tilt = getTilt();
    var seen = {};
    PLANETS.forEach(function (p) {
      var orb = getOrb(p);
      var key = Math.round(orb / 3) * 3;
      if (seen[key]) return;
      seen[key] = true;
      var gl = p.route ? (STATE.routeGlow[p.route] || 0) : 0;
      var rc = p.route ? ROUTES[p.route] : null;
      ctx.beginPath();
      ctx.ellipse(CX, CY, orb, orb * (tilt + (p.inc || 0)), 0, 0, Math.PI * 2);
      if (gl > 0.02 && rc) {
        ctx.strokeStyle = 'rgba(' + rgb(rc) + ',' + (0.04 + gl * 0.18) + ')';
        ctx.lineWidth   = 0.4 + gl * 0.9;
        ctx.shadowColor = 'rgba(' + rgb(rc) + ',' + (gl * 0.45) + ')';
        ctx.shadowBlur  = 3 + gl * 5;
        ctx.setLineDash([3, 12]);
      } else {
        ctx.strokeStyle = 'rgba(200,175,110,0.022)';
        ctx.lineWidth   = 0.35;
        ctx.shadowBlur  = 0;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    });
  }

  function getOrb(p) {
    var base = p.orb * W;
    if (STATE.mode === 'council' || STATE.mode === 'thinking')
      return base * (1 - STATE.converge * 0.45);
    return base;
  }

  function getTilt() {
    if (STATE.mode === 'council' || STATE.mode === 'thinking')
      return TILT + STATE.converge * (0.75 - TILT);
    return TILT;
  }

  /* ════════ PLANETS ════════ */
  function drawPlanets(dt, t) {
    var tilt = getTilt();
    var isC  = STATE.mode === 'council' || STATE.mode === 'thinking';
    var boost = isC ? 1 + STATE.converge * 3.5 : 1;
    var items = PLANETS.map(function (p) {
      p.ang += p.spd * boost * dt * 60;
      var orb = getOrb(p);
      var t2  = tilt + (p.inc || 0);
      return { p:p, x: CX + Math.cos(p.ang) * orb, y: CY + Math.sin(p.ang) * orb * t2 };
    }).sort(function (a, b) { return a.y - b.y; });

    items.forEach(function (item) {
      var p = item.p, x = item.x, y = item.y;
      if (y < -20 || y > H + 20) return;
      var c  = p.col;
      var sz = sc(p.sz) * (isC ? 0.82 + STATE.converge * 0.32 : 1);
      var gl = p.route ? (STATE.routeGlow[p.route] || 0) : 0;
      var rc = p.route ? ROUTES[p.route] : null;

      /* route halo */
      if (gl > 0.02 && rc) {
        ctx.globalCompositeOperation = 'screen';
        var pulse = 1 + Math.sin(t * 0.0018 + p.ang) * 0.14;
        var halo = ctx.createRadialGradient(x, y, sz * 0.3, x, y, sz * 6.5 * pulse);
        halo.addColorStop(0, 'rgba(' + rgb(rc) + ',' + (gl * 0.45) + ')');
        halo.addColorStop(0.35, 'rgba(' + rgb(rc) + ',' + (gl * 0.08) + ')');
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(x, y, sz * 6.5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = halo; ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }

      /* atmosphere */
      var atm = ctx.createRadialGradient(x, y, sz * 0.65, x, y, sz * 2.0);
      atm.addColorStop(0, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0)');
      atm.addColorStop(0.5, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.05)');
      atm.addColorStop(1, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (0.11 + gl * 0.10) + ')');
      ctx.beginPath(); ctx.arc(x, y, sz * 2.0, 0, Math.PI * 2);
      ctx.fillStyle = atm; ctx.fill();

      /* body */
      var body = ctx.createRadialGradient(x - sz * 0.28, y - sz * 0.28, 0, x, y, sz);
      body.addColorStop(0, 'rgba(' + Math.min(255,c.r+75) + ',' + Math.min(255,c.g+65) + ',' + Math.min(255,c.b+45) + ',0.94)');
      body.addColorStop(0.55, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.96)');
      body.addColorStop(1, 'rgba(' + Math.round(c.r*0.42) + ',' + Math.round(c.g*0.38) + ',' + Math.round(c.b*0.30) + ',1)');
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2);
      ctx.fillStyle = body; ctx.fill();

      /* specular */
      var spec = ctx.createRadialGradient(x - sz*0.32, y - sz*0.32, 0, x - sz*0.32, y - sz*0.32, sz * 0.50);
      spec.addColorStop(0, 'rgba(255,248,225,' + (0.32 + gl * 0.10) + ')');
      spec.addColorStop(1, 'rgba(255,248,225,0)');
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2);
      ctx.fillStyle = spec; ctx.fill();

      /* limb darkening */
      var limb = ctx.createRadialGradient(x, y, sz * 0.22, x, y, sz * 1.04);
      limb.addColorStop(0, 'rgba(4,2,0,0)');
      limb.addColorStop(0.58, 'rgba(4,2,0,0.20)');
      limb.addColorStop(1, 'rgba(4,2,0,0.62)');
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2);
      ctx.fillStyle = limb; ctx.fill();

      /* route label */
      if (rc && gl > 0.12) {
        var fs = Math.max(6, Math.round(sz * 0.58));
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.shadowColor = 'rgba(' + rgb(rc) + ',' + gl + ')';
        ctx.shadowBlur  = 6 + gl * 4;
        ctx.fillStyle   = 'rgba(' + rgb(rc) + ',' + Math.min(1, gl * 1.15) + ')';
        ctx.font = '500 ' + fs + 'px "DM Mono",monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(rc.name, x, y - sz - 4);
        ctx.restore();
      }
    });
  }

  /* ════════ SHOOTING STARS ════════ */
  function drawShoots(t, dt) {
    if (t > nextShoot) spawnShoot(t);
    for (var i = SHOOTS.length - 1; i >= 0; i--) {
      var s = SHOOTS[i];
      s.life += dt;
      if (s.life > s.maxLife) { SHOOTS.splice(i, 1); continue; }
      var prog = s.life / s.maxLife;
      var al   = (prog < 0.15 ? prog / 0.15 : 1 - ((prog - 0.15) / 0.85)) * s.al;
      s.x += s.vx * dt * 60 * 0.016;
      s.y += s.vy * dt * 60 * 0.016;
      var x2 = s.x - s.vx * s.len * 0.016, y2 = s.y - s.vy * s.len * 0.016;
      var gr = ctx.createLinearGradient(x2, y2, s.x, s.y);
      gr.addColorStop(0, 'rgba(230,210,160,0)');
      gr.addColorStop(0.6, 'rgba(240,220,170,' + (al * 0.30) + ')');
      gr.addColorStop(1, 'rgba(255,245,210,' + (al * 0.72) + ')');
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = gr; ctx.lineWidth = 0.85; ctx.stroke();
    }
  }

  /* ════════ SUN — LYLA, warm white-gold ════════ */
  function drawSun(t) {
    var R  = sc(13);
    var isT = STATE.mode === 'thinking' || STATE.mode === 'council';
    var gm  = isT ? 1 + Math.sin(t * 0.006) * 0.26 : 1;

    ctx.globalCompositeOperation = 'lighter';

    /* outer corona — warm cream */
    var cor = ctx.createRadialGradient(CX, CY, R * 0.18, CX, CY, R * 8.5);
    cor.addColorStop(0,   'rgba(240,220,160,' + (0.20 * gm) + ')');
    cor.addColorStop(0.28,'rgba(200,165,80,'  + (0.08 * gm) + ')');
    cor.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CX, CY, R * 8.5, 0, Math.PI * 2);
    ctx.fillStyle = cor; ctx.fill();

    /* rays */
    ctx.save(); ctx.translate(CX, CY); ctx.rotate(t * 0.000042);
    for (var i = 0; i < 14; i++) {
      var a  = (i / 14) * Math.PI * 2;
      var rl = R * (2.3 + 0.38 * Math.sin(i * 2.0 + t * 0.00030)) * gm;
      var gr = ctx.createLinearGradient(
        Math.cos(a) * R * 0.22, Math.sin(a) * R * 0.22,
        Math.cos(a) * rl, Math.sin(a) * rl
      );
      gr.addColorStop(0, 'rgba(245,225,160,' + (0.20 * gm) + ')');
      gr.addColorStop(0.5, 'rgba(200,165,80,0.04)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = gr; ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * R * 0.22, Math.sin(a) * R * 0.22);
      ctx.lineTo(Math.cos(a) * rl, Math.sin(a) * rl);
      ctx.stroke();
    }
    ctx.restore();

    /* inner halo — cosmic latte warm */
    var halo = ctx.createRadialGradient(CX, CY, R * 0.38, CX, CY, R * 2.5);
    halo.addColorStop(0,   'rgba(255,250,220,0.90)');
    halo.addColorStop(0.20,'rgba(240,220,155,0.65)');
    halo.addColorStop(0.55,'rgba(200,165,80, 0.20)');
    halo.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CX, CY, R * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = halo; ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    /* logo */
    var lr = R * 1.36;
    if (_logo && _logo.complete && _logo.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath(); ctx.arc(CX, CY, lr, 0, Math.PI * 2); ctx.clip();
      ctx.globalAlpha = 0.88;
      ctx.drawImage(_logo, CX - lr, CY - lr, lr * 2, lr * 2);
      ctx.restore(); ctx.globalAlpha = 1;
    } else {
      var fb = ctx.createRadialGradient(CX - R * 0.25, CY - R * 0.25, 0, CX, CY, R);
      fb.addColorStop(0, '#fff8e0'); fb.addColorStop(0.5, '#d4a840'); fb.addColorStop(1, '#7a5010');
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fillStyle = fb; ctx.fill();
    }

    /* LYLA label */
    ctx.globalCompositeOperation = 'screen';
    ctx.shadowColor = 'rgba(220,190,100,0.70)'; ctx.shadowBlur = 10;
    ctx.fillStyle   = 'rgba(240,220,155,0.80)';
    ctx.font = '500 ' + Math.max(7, Math.round(sc(7))) + 'px "DM Mono",monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('LYLA ◈', CX, CY - lr - 4);
    ctx.shadowBlur = 0; ctx.textBaseline = 'alphabetic';
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════ GLOW + STATE ════════ */
  function updateGlow(dt) {
    Object.keys(ROUTES).forEach(function (r) {
      if (!STATE.routeGlow[r]) STATE.routeGlow[r] = 0;
      var target = r === activeRoute ? 1 : 0;
      STATE.routeGlow[r] += (target - STATE.routeGlow[r]) * Math.min(1, dt * 2.6);
    });
  }
  function updateState(dt) {
    if (STATE.mode === 'thinking' || STATE.mode === 'council')
      STATE.converge = Math.min(1, STATE.converge + dt * 0.58);
    else if (STATE.mode === 'answering') {
      STATE.converge = Math.max(0, STATE.converge - dt * 0.88);
      if (STATE.converge <= 0) STATE.mode = 'idle';
    } else {
      STATE.converge = Math.max(0, STATE.converge - dt * 0.26);
    }
  }

  /* ════════ MAIN LOOP ════════ */
  function loop(ts) {
    if (!lastTime) lastTime = ts;
    var dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    _frame++;

    updateState(dt);
    updateGlow(dt);
    updateSunDrift(dt);

    if (_frame % 200 === 0) supplyChainRipple = { radius: 0, alpha: 0.12 };

    drawBg();
    drawRipple();
    drawStars(ts);
    drawShoots(ts, dt);
    drawOrbits();
    drawPlanets(dt, ts);
    drawSun(ts);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ════════ PUBLIC API ════════ */
  window.LYLA_thinking = function () { STATE.mode = 'thinking';  STATE.converge = 0; };
  window.LYLA_answered = function () { STATE.mode = 'answering'; };
  window.KD_pulse      = function (route) { STATE.mode = 'answering'; if (route) activeRoute = route; };
  window.KD_setRoute   = function (route) { activeRoute = route; };
  window.KD_council    = function () { STATE.mode = 'council';   STATE.converge = 0; };
  window.KD_councilEnd = function () { STATE.mode = 'answering'; };

  if (!window.KD) window.KD = {};
  window.KD.safeVal = function (v, d) {
    var n = +v, dec = typeof d === 'number' ? d : 2;
    return (isFinite(n) && !isNaN(n)) ? n.toFixed(dec) : '0.00';
  };

})();
