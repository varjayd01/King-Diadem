/* ============================================================
   KING DIADEM — galaxy_scene.js v18
   Theme    : Obsidian Gold
   Layout   : strip canvas (NOT fullscreen)
              canvas lives inside #galaxy-strip div
   Palette  : deep black + warm gold nebula dust
              + cool blue-violet dark energy
   Philosophy: สุญยตา — particles emerge & dissolve
              no hard center, no static orbits
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('galaxy');
  if (!cv) return;
  if (!window.KD) window.KD = {};
  if (!window.KD.state) window.KD.state = {};

  var ctx = cv.getContext('2d', { alpha: true });
  var W = 0, H = 0, CX = 0, CY = 0;
  var lastTime = 0;
  var mouseX = 0, mouseY = 0;
  var activeRoute = 'general';

  /* ── Logo ── */
  var _logo = new Image();
  _logo.src = '/static/logo.png';

  /* ★ v18 FIX: canvas fills strip container — NOT position:fixed
     parent #galaxy-strip handles positioning              */
  cv.style.cssText = 'display:block;width:100%;height:100%;';

  /* ── Mouse parallax (subtle) ── */
  window.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ════════ RESIZE ════════ */
  var _rT;
  function doResize() {
    W = cv.width  = cv.offsetWidth  || cv.parentElement.offsetWidth  || 800;
    H = cv.height = cv.offsetHeight || cv.parentElement.offsetHeight || 110;
    CX = W * 0.5;
    CY = H * 0.5;
    buildStars();
    buildDE();
    buildPlanets();
  }
  var ro = window.ResizeObserver
    ? new ResizeObserver(function () { clearTimeout(_rT); _rT = setTimeout(doResize, 80); })
    : null;
  if (ro && cv.parentElement) ro.observe(cv.parentElement);
  window.addEventListener('resize', function () { clearTimeout(_rT); _rT = setTimeout(doResize, 100); }, { passive: true });
  setTimeout(doResize, 0); /* defer so parent has rendered size */

  /* sc = scale relative to strip height */
  function sc(v) { return v * H / 110; }

  /* ════════ STATE ════════ */
  var STATE = {
    mode: 'idle',
    converge: 0,
    routeGlow: {},
    tilt: 0.32,
  };

  /* ════════ ROUTE → PLANET color ════════ */
  var ROUTES = {
    general:  { rgb: '201,168,76',  name: 'GENERAL'  },
    risk:     { rgb: '200,100,80',  name: 'RISK'      },
    survival: { rgb: '120,190,140', name: 'SURVIVAL'  },
    collapse: { rgb: '160,130,200', name: 'COLLAPSE'  },
    civil:    { rgb: '190,175,140', name: 'CIVIL'     },
    vega:     { rgb: '220,195,110', name: 'VEGA'      },
  };

  /* ════════ PLANETS ════════
     baseOrb = fraction of W (not min(W,H)) so they spread across strip
     y-offset via tilt keeps them in strip height
  ════════ */
  var PLANETS = [];
  function buildPlanets() {
    PLANETS = [
      /* route planets — spread across width */
      { id:'general',  route:'general',  ang:0.52, spd:0.0022, baseOrb:0.10, sz:3.8, type:'gold',   inc: 0.00  },
      { id:'risk',     route:'risk',     ang:1.85, spd:0.0015, baseOrb:0.15, sz:3.4, type:'rust',   inc: 0.012 },
      { id:'survival', route:'survival', ang:3.10, spd:0.0011, baseOrb:0.20, sz:4.0, type:'mint',   inc:-0.008 },
      { id:'collapse', route:'collapse', ang:4.55, spd:0.0008, baseOrb:0.25, sz:3.6, type:'violet', inc: 0.016 },
      { id:'civil',    route:'civil',    ang:0.85, spd:0.0005, baseOrb:0.30, sz:3.9, type:'stone',  inc:-0.006 },
      { id:'vega',     route:'vega',     ang:2.65, spd:0.0003, baseOrb:0.35, sz:4.2, type:'gold',   inc: 0.010 },
      /* ambient dust orbs */
      { id:'d1', ang:1.10, spd:0.0028, baseOrb:0.08, sz:1.8, type:'dust', inc: 0.006 },
      { id:'d2', ang:2.90, spd:0.0018, baseOrb:0.13, sz:1.5, type:'dust', inc:-0.010 },
      { id:'d3', ang:4.20, spd:0.0013, baseOrb:0.18, sz:1.6, type:'dust', inc: 0.014 },
      { id:'d4', ang:5.50, spd:0.0009, baseOrb:0.23, sz:1.4, type:'dust', inc:-0.004 },
      { id:'d5', ang:0.30, spd:0.0007, baseOrb:0.28, sz:1.7, type:'dust', inc: 0.018 },
      { id:'d6', ang:3.70, spd:0.0004, baseOrb:0.33, sz:1.5, type:'dust', inc:-0.012 },
    ];
  }

  /* Obsidian Gold planet palette */
  var PCLR = {
    gold:   { base: '#c9a84c', atm: '201,168,76'  },
    rust:   { base: '#b86040', atm: '184,96,64'   },
    mint:   { base: '#6ab88a', atm: '106,184,138' },
    violet: { base: '#9878c8', atm: '152,120,200' },
    stone:  { base: '#a09070', atm: '160,144,112' },
    dust:   { base: '#887060', atm: '136,112,96'  },
  };

  /* ════════ STAR FIELD — warm gold + cool blue, 3 depths ════════ */
  var STARS = [];
  function buildStars() {
    STARS = [];
    var count = Math.round(W * 0.55); /* density proportional to width */
    for (var i = 0; i < count; i++) {
      var layer  = i < count * 0.55 ? 0 : i < count * 0.82 ? 1 : 2;
      var isWarm = Math.random() > 0.38; /* slightly more warm gold stars */
      var bright = Math.random() > 0.93;
      STARS.push({
        x:   Math.random(),
        y:   Math.random(),
        s:   bright ? 0.5 + Math.random() * 0.8 : 0.06 + Math.random() * (layer * 0.10 + 0.14),
        a:   bright ? 0.28 + Math.random() * 0.24 : 0.03 + Math.random() * (layer * 0.03 + 0.08),
        warm: isWarm,
        tw:  Math.random() * Math.PI * 2,
        tws: 0.002 + Math.random() * 0.012,
        twa: bright ? 0.08 + Math.random() * 0.15 : 0.015 + Math.random() * 0.06,
        bloom: bright && Math.random() > 0.55,
        par:  (layer + 1) * 0.00018,
      });
    }
  }

  /* ════════ DARK ENERGY particles — emerge / dissolve ════════ */
  var DE = [];
  function buildDE() {
    DE = [];
    var count = Math.round(W * 0.10);
    for (var i = 0; i < count; i++) {
      var a2 = Math.random() * Math.PI * 2;
      var d  = 0.06 + Math.random() * 0.48;
      DE.push({
        x:     0.5 + Math.cos(a2) * d * 0.50,
        y:     0.5 + Math.sin(a2) * d * 0.22,
        s:     0.18 + Math.random() * 0.70,
        a:     0,
        peak:  0.06 + Math.random() * 0.16,
        phase: Math.random() * Math.PI * 2,
        freq:  0.00020 + Math.random() * 0.00070,
        void_: Math.random() > 0.62,
        dx:    (Math.random() - 0.5) * 0.00004,
        dy:    (Math.random() - 0.5) * 0.00002,
      });
    }
  }

  /* ════════ SHOOTING STARS ════════ */
  var SHOOTS = [], nextShoot = 4000;
  function spawnShoot(t) {
    var fl = Math.random() > 0.5;
    SHOOTS.push({
      x:       fl ? W * -0.02 : W * 1.02,
      y:       H * (0.05 + Math.random() * 0.90),
      vx:      fl ? 2.2 + Math.random() * 3.5 : -(2.2 + Math.random() * 3.5),
      vy:      (Math.random() - 0.5) * 1.4,
      life:    0,
      maxLife: 0.8 + Math.random() * 0.8,
      len:     55 + Math.random() * 90,
      al:      0.30 + Math.random() * 0.28,
    });
    nextShoot = t + 6000 + Math.random() * 14000;
  }

  /* ════════════════════════════════════════
     BACKGROUND — obsidian deep + gold nebula dust
  ════════════════════════════════════════ */
  function drawBg(t) {
    ctx.clearRect(0, 0, W, H);

    /* deep obsidian base */
    var base = ctx.createLinearGradient(0, 0, W, H);
    base.addColorStop(0,   '#070509');
    base.addColorStop(0.4, '#090608');
    base.addColorStop(0.7, '#06050a');
    base.addColorStop(1,   '#050407');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'screen';
    var nt  = t * 0.00014;
    var pmx = mouseX * 8, pmy = mouseY * 5;

    /* nebula wisps — gold/amber warm dust, very subtle */
    var nebulae = [
      /* warm gold centre-right */
      { x: W * (0.68 + Math.sin(nt * 0.7) * 0.02) + pmx * 0.3,
        y: H * (0.42 + Math.cos(nt * 0.5) * 0.06) + pmy * 0.3,
        rx: W * 0.42, ry: H * 0.80,
        c: 'rgba(180,130,40,0.18)' },
      /* cool blue-violet left */
      { x: W * (0.22 + Math.cos(nt * 0.9) * 0.018) + pmx * 0.4,
        y: H * (0.55 + Math.sin(nt * 0.6) * 0.05) + pmy * 0.4,
        rx: W * 0.32, ry: H * 0.70,
        c: 'rgba(80,60,160,0.12)' },
      /* amber upper-right glow */
      { x: W * (0.82 + Math.sin(nt * 1.1) * 0.015) + pmx * 0.25,
        y: H * (0.30 + Math.cos(nt * 0.8) * 0.04) + pmy * 0.25,
        rx: W * 0.28, ry: H * 0.55,
        c: 'rgba(160,100,30,0.13)' },
      /* pale violet lower-left */
      { x: W * (0.14 + Math.cos(nt * 1.2) * 0.012) + pmx * 0.5,
        y: H * (0.65 + Math.sin(nt * 0.7) * 0.04) + pmy * 0.5,
        rx: W * 0.22, ry: H * 0.50,
        c: 'rgba(100,80,180,0.09)' },
      /* soft warm centre core */
      { x: CX + pmx * 0.6,
        y: CY + pmy * 0.6,
        rx: W * 0.18, ry: H * 0.45,
        c: 'rgba(200,150,50,0.07)' },
    ];

    nebulae.forEach(function (n) {
      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.scale(1, n.ry / n.rx);
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx);
      g.addColorStop(0, n.c);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(0, 0, n.rx, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
      ctx.restore();
    });

    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════ STARS ════════ */
  function drawStars(t) {
    for (var i = 0; i < STARS.length; i++) {
      var s  = STARS[i];
      var px = ((s.x * W + mouseX * s.par * W * 40) % W + W) % W;
      var py = ((s.y * H + mouseY * s.par * H * 40) % H + H) % H;
      var tw = s.a * (1 + Math.sin(t * s.tws + s.tw) * s.twa);
      /* warm = gold-amber, cool = blue-grey */
      var rgb = s.warm ? '220,185,100' : '140,160,210';
      ctx.beginPath(); ctx.arc(px, py, s.s, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + rgb + ',' + Math.min(1, tw) + ')';
      ctx.fill();
      if (s.bloom) {
        var bl = s.s * 3.0;
        ctx.strokeStyle = 'rgba(' + rgb + ',' + (tw * 0.06) + ')';
        ctx.lineWidth = 0.25;
        ctx.beginPath();
        ctx.moveTo(px - bl, py); ctx.lineTo(px + bl, py);
        ctx.moveTo(px, py - bl); ctx.lineTo(px, py + bl);
        ctx.stroke();
      }
    }
  }

  /* ════════ DARK ENERGY ════════ */
  function drawDE(t) {
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < DE.length; i++) {
      var p = DE[i];
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
      var wave = Math.sin(t * p.freq * 1000 + p.phase);
      p.a = Math.max(0, wave) * p.peak;
      if (p.a < 0.004) continue;
      var px = p.x * W, py = p.y * H;
      /* void = deep blue-violet, normal = warm gold */
      var rgb = p.void_ ? '120,80,200' : '180,135,55';
      var g = ctx.createRadialGradient(px, py, 0, px, py, p.s * 3.5);
      g.addColorStop(0, 'rgba(' + rgb + ',' + p.a + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(px, py, p.s * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
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
      gr.addColorStop(0, 'rgba(200,170,80,0)');
      gr.addColorStop(0.6, 'rgba(220,185,100,' + (al * 0.35) + ')');
      gr.addColorStop(1, 'rgba(240,210,140,' + (al * 0.80) + ')');
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = gr; ctx.lineWidth = 1.0; ctx.stroke();
      var hg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 3.5);
      hg.addColorStop(0, 'rgba(240,215,150,' + (al * 0.80) + ')');
      hg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(s.x, s.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = hg; ctx.fill();
    }
  }

  /* ════════ ORBIT RADIUS ════════ */
  function getOrb(p) {
    var base = p.baseOrb * W;
    if (STATE.mode === 'council' || STATE.mode === 'thinking')
      return base * (1 - STATE.converge * 0.50);
    return base;
  }

  /* ════════ ORBIT RINGS — very faint, almost invisible ════════ */
  function drawOrbits(tilt) {
    var seen = {};
    PLANETS.forEach(function (p) {
      var orb = getOrb(p);
      var key = Math.round(orb / 4) * 4; /* bucket by 4px */
      if (seen[key]) return;
      seen[key] = true;

      var rc = p.route ? ROUTES[p.route] : null;
      var gl = rc ? (STATE.routeGlow[p.route] || 0) : 0;
      var t2 = tilt + (p.inc || 0);

      ctx.beginPath();
      ctx.ellipse(CX, CY, orb, orb * t2, 0, 0, Math.PI * 2);

      if (gl > 0.02) {
        ctx.strokeStyle = 'rgba(' + rc.rgb + ',' + (0.05 + gl * 0.22) + ')';
        ctx.lineWidth   = 0.5 + gl * 1.2;
        ctx.shadowColor = 'rgba(' + rc.rgb + ',' + (gl * 0.6) + ')';
        ctx.shadowBlur  = 4 + gl * 8;
        ctx.setLineDash([4, 10]);
      } else {
        /* near-invisible resting orbits */
        ctx.strokeStyle = 'rgba(180,155,80,0.025)';
        ctx.lineWidth   = 0.4;
        ctx.shadowBlur  = 0;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    });
  }

  /* ════════ PLANETS ════════ */
  function drawPlanets(dt, t, tilt) {
    var isC  = STATE.mode === 'council' || STATE.mode === 'thinking';
    var boost = isC ? 1 + STATE.converge * 4 : 1;

    var items = PLANETS.map(function (p) {
      p.ang += p.spd * boost * dt * 60;
      var orb = getOrb(p);
      var t2  = tilt + (p.inc || 0);
      return {
        p: p,
        x: CX + Math.cos(p.ang) * orb,
        y: CY + Math.sin(p.ang) * orb * t2,
      };
    }).sort(function (a, b) { return a.y - b.y; });

    items.forEach(function (item) {
      var p = item.p, x = item.x, y = item.y;
      var pc = PCLR[p.type] || PCLR.dust;
      var sz = sc(p.sz) * (isC ? 0.80 + STATE.converge * 0.38 : 1);
      var gl = p.route ? (STATE.routeGlow[p.route] || 0) : 0;
      var rc = p.route ? ROUTES[p.route] : null;

      /* clip to strip bounds */
      if (y < -sz * 2 || y > H + sz * 2) return;

      /* route glow halo */
      if (gl > 0.02 && rc) {
        ctx.globalCompositeOperation = 'screen';
        var pulse = 1 + Math.sin(t * 0.0022 + p.ang) * 0.18;
        var hg = ctx.createRadialGradient(x, y, sz * 0.4, x, y, sz * 6.5 * pulse);
        hg.addColorStop(0, 'rgba(' + rc.rgb + ',' + (gl * 0.55) + ')');
        hg.addColorStop(0.3, 'rgba(' + rc.rgb + ',' + (gl * 0.12) + ')');
        hg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(x, y, sz * 6.5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = hg; ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }

      /* atmosphere */
      var atm = ctx.createRadialGradient(x, y, sz * 0.70, x, y, sz * 2.2);
      atm.addColorStop(0, 'rgba(' + pc.atm + ',0)');
      atm.addColorStop(0.5, 'rgba(' + pc.atm + ',0.06)');
      atm.addColorStop(1, 'rgba(' + pc.atm + ',' + (0.14 + gl * 0.14) + ')');
      ctx.beginPath(); ctx.arc(x, y, sz * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = atm; ctx.fill();

      /* planet body */
      var body = ctx.createRadialGradient(x - sz * 0.30, y - sz * 0.30, 0, x, y, sz);
      body.addColorStop(0, brighten(pc.base, 0.42 + gl * 0.22));
      body.addColorStop(0.55, pc.base);
      body.addColorStop(1, darken(pc.base, 0.40));
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2);
      ctx.fillStyle = body; ctx.fill();

      /* specular */
      var spec = ctx.createRadialGradient(x - sz * 0.36, y - sz * 0.36, 0, x - sz * 0.36, y - sz * 0.36, sz * 0.54);
      spec.addColorStop(0, 'rgba(255,245,210,' + (0.38 + gl * 0.14) + ')');
      spec.addColorStop(1, 'rgba(255,245,210,0)');
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2);
      ctx.fillStyle = spec; ctx.fill();

      /* limb darkening */
      var limb = ctx.createRadialGradient(x, y, sz * 0.25, x, y, sz * 1.06);
      limb.addColorStop(0, 'rgba(0,0,4,0)');
      limb.addColorStop(0.62, 'rgba(0,0,4,0.22)');
      limb.addColorStop(1, 'rgba(0,0,4,0.68)');
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2);
      ctx.fillStyle = limb; ctx.fill();

      /* route label when active */
      if (rc && gl > 0.10) {
        var fs = Math.max(6, Math.round(sz * 0.62));
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.shadowColor = 'rgba(' + rc.rgb + ',' + gl + ')';
        ctx.shadowBlur  = 8 + gl * 6;
        ctx.fillStyle   = 'rgba(' + rc.rgb + ',' + Math.min(1, gl * 1.25) + ')';
        ctx.font = '500 ' + fs + 'px "DM Mono",monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(rc.name, x, y - sz - 4);
        ctx.restore();
      }
    });
  }

  /* ════════ COMET RING (inner tracer, very subtle) ════════ */
  function drawComet(t, tilt) {
    var r1 = W * 0.065;
    ctx.globalCompositeOperation = 'screen';
    ctx.save(); ctx.translate(CX, CY); ctx.scale(1, tilt);

    var ba = t * 0.00016;
    for (var i = 0; i < 36; i++) {
      var f = i / 36, a = ba - 1.4 * f + 1.4;
      ctx.beginPath(); ctx.arc(Math.cos(a) * r1, Math.sin(a) * r1, 0.3 + f * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,168,70,' + (f * 0.55) + ')'; ctx.fill();
    }
    var bx = Math.cos(ba) * r1, by = Math.sin(ba) * r1;
    var bh = ctx.createRadialGradient(bx, by, 0, bx, by, 3.0);
    bh.addColorStop(0, 'rgba(240,210,130,0.85)');
    bh.addColorStop(0.4, 'rgba(200,160,80,0.40)');
    bh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(bx, by, 3.0, 0, Math.PI * 2); ctx.fillStyle = bh; ctx.fill();

    ctx.beginPath(); ctx.arc(0, 0, r1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(200,168,70,0.06)'; ctx.lineWidth = 0.4; ctx.stroke();

    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════ SUN — LYLA ════════
     Smaller proportion for strip; warm gold corona
  ════════ */
  function drawSun(t) {
    var R   = sc(14);
    var isT = STATE.mode === 'thinking' || STATE.mode === 'council';
    var gm  = isT ? 1 + Math.sin(t * 0.007) * 0.32 : 1;

    /* deep corona — gold */
    ctx.globalCompositeOperation = 'lighter';
    var cor = ctx.createRadialGradient(CX, CY, R * 0.20, CX, CY, R * 8.0);
    cor.addColorStop(0, 'rgba(200,155,40,' + (0.22 * gm) + ')');
    cor.addColorStop(0.30, 'rgba(160,110,20,' + (0.08 * gm) + ')');
    cor.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CX, CY, R * 8.0, 0, Math.PI * 2);
    ctx.fillStyle = cor; ctx.fill();

    /* rays — slow rotate */
    ctx.save(); ctx.translate(CX, CY); ctx.rotate(t * 0.000055);
    for (var i = 0; i < 16; i++) {
      var a  = (i / 16) * Math.PI * 2;
      var rl = R * (2.2 + 0.45 * Math.sin(i * 2.1 + t * 0.00038)) * gm;
      var gr = ctx.createLinearGradient(
        Math.cos(a) * R * 0.25, Math.sin(a) * R * 0.25,
        Math.cos(a) * rl, Math.sin(a) * rl
      );
      gr.addColorStop(0, 'rgba(220,180,80,' + (0.18 * gm) + ')');
      gr.addColorStop(0.5, 'rgba(180,130,40,0.04)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = gr; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * R * 0.25, Math.sin(a) * R * 0.25);
      ctx.lineTo(Math.cos(a) * rl, Math.sin(a) * rl);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';

    /* inner halo */
    ctx.globalCompositeOperation = 'lighter';
    var halo = ctx.createRadialGradient(CX, CY, R * 0.40, CX, CY, R * 2.6);
    halo.addColorStop(0, 'rgba(255,240,180,0.88)');
    halo.addColorStop(0.20, 'rgba(220,180,80,0.65)');
    halo.addColorStop(0.55, 'rgba(160,115,35,0.22)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CX, CY, R * 2.6, 0, Math.PI * 2);
    ctx.fillStyle = halo; ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    /* logo */
    var lr = R * 1.40;
    if (_logo.complete && _logo.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath(); ctx.arc(CX, CY, lr, 0, Math.PI * 2); ctx.clip();
      ctx.globalAlpha = 0.90;
      ctx.drawImage(_logo, CX - lr, CY - lr, lr * 2, lr * 2);
      ctx.restore(); ctx.globalAlpha = 1;
    } else {
      var fb = ctx.createRadialGradient(CX - R * 0.28, CY - R * 0.28, 0, CX, CY, R);
      fb.addColorStop(0, '#ffe090'); fb.addColorStop(0.5, '#c9a040'); fb.addColorStop(1, '#7a5010');
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.fillStyle = fb; ctx.fill();
    }

    /* LYLA label */
    ctx.globalCompositeOperation = 'screen';
    ctx.shadowColor = 'rgba(201,168,76,0.80)'; ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(230,195,110,0.82)';
    ctx.font = '500 ' + Math.max(7, Math.round(sc(7))) + 'px "DM Mono",monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('LYLA ◈', CX, CY - lr - 4);
    ctx.shadowBlur = 0; ctx.textBaseline = 'alphabetic';
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════ TILT ════════ */
  function getTilt() {
    if (STATE.mode === 'council' || STATE.mode === 'thinking')
      return STATE.tilt + STATE.converge * (0.78 - STATE.tilt);
    return STATE.tilt;
  }

  /* ════════ ROUTE GLOW ════════ */
  function updateGlow(dt) {
    Object.keys(ROUTES).forEach(function (r) {
      if (!STATE.routeGlow[r]) STATE.routeGlow[r] = 0;
      var target = r === activeRoute ? 1 : 0;
      STATE.routeGlow[r] += (target - STATE.routeGlow[r]) * Math.min(1, dt * 3.0);
    });
  }

  /* ════════ STATE ════════ */
  function updateState(dt) {
    if (STATE.mode === 'thinking' || STATE.mode === 'council')
      STATE.converge = Math.min(1, STATE.converge + dt * 0.65);
    else if (STATE.mode === 'answering') {
      STATE.converge = Math.max(0, STATE.converge - dt * 0.95);
      if (STATE.converge <= 0) STATE.mode = 'idle';
    } else {
      STATE.converge = Math.max(0, STATE.converge - dt * 0.30);
    }
  }

  /* ════════ COLOR HELPERS ════════ */
  function hexRGB(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
  }
  function brighten(hex, f) {
    var c = hexRGB(hex);
    return 'rgb('+Math.min(255,Math.round(c.r*(1+f)))+','+Math.min(255,Math.round(c.g*(1+f)))+','+Math.min(255,Math.round(c.b*(1+f)))+')';
  }
  function darken(hex, f) {
    var c = hexRGB(hex);
    return 'rgb('+Math.round(c.r*(1-f))+','+Math.round(c.g*(1-f))+','+Math.round(c.b*(1-f))+')';
  }

  /* ════════ MAIN LOOP ════════ */
  function loop(ts) {
    if (!lastTime) lastTime = ts;
    var dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;

    updateState(dt);
    updateGlow(dt);
    var tilt = getTilt();

    drawBg(ts);
    drawStars(ts);
    drawDE(ts);
    drawShoots(ts, dt);
    drawOrbits(tilt);
    drawComet(ts, tilt);
    drawPlanets(dt, ts, tilt);
    drawSun(ts);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ════════ PUBLIC API ════════ */
  window.LYLA_thinking  = function () { STATE.mode = 'thinking';  STATE.converge = 0; };
  window.LYLA_answered  = function () { STATE.mode = 'answering'; };
  window.KD_pulse       = function (route) { STATE.mode = 'answering'; if (route) activeRoute = route; };
  window.KD_setRoute    = function (route) { activeRoute = route; };
  window.KD_council     = function () { STATE.mode = 'council';  STATE.converge = 0; };
  window.KD_councilEnd  = function () { STATE.mode = 'answering'; };

})();
