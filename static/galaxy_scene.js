/* ============================================================
   KING DIADEM — galaxy_scene.js v19 "Sunyata"
   
   Philosophy: ไม่เกิดไม่ดับ — อนุภาคทุกอย่างมีอยู่และไม่มีอยู่
   ไม่มีศูนย์กลาง ไม่มีอัตตา dark matter คือพื้นฐานของทุกสิ่ง
   
   Rendering:
   - 2,400+ stars, 3 depth layers, no flicker
   - Milky Way band across strip
   - 8 route planets with realistic glow
   - Dark matter filaments (web structure)
   - Quantum fluctuation particles (emerge/dissolve slowly)
   - No fixed center — Sun drifts gently
   - WebGL-quality look via layered canvas compositing
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('galaxy');
  if (!cv) return;

  var ctx = cv.getContext('2d', { alpha: true });
  var W = 0, H = 0, SX = 0, SY = 0; /* SX/SY = drifting sun pos — no fixed center */
  var lastTime = 0;
  var mouseX = 0, mouseY = 0;
  var activeRoute = 'general';

  if (!window.KD) window.KD = {};
  if (!window.KD.state) window.KD.state = {};

  /* ── Logo ── */
  var _logo = new Image();
  _logo.src = '/static/logo.png';
  _logo.onerror = function() { _logo = null; };

  /* ★ Strip canvas — NOT fullscreen fixed */
  cv.style.cssText = 'display:block;width:100%;height:100%;';

  /* ── Mouse ── */
  window.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ════════ RESIZE ════════ */
  var _rT;
  function doResize() {
    var parent = cv.parentElement;
    W = cv.width  = parent ? parent.offsetWidth  : (cv.offsetWidth  || 800);
    H = cv.height = parent ? parent.offsetHeight : (cv.offsetHeight || 110);
    SX = W * 0.50;
    SY = H * 0.50;
    buildAll();
  }
  var ro = window.ResizeObserver ? new ResizeObserver(function() {
    clearTimeout(_rT); _rT = setTimeout(doResize, 80);
  }) : null;
  if (ro && cv.parentElement) ro.observe(cv.parentElement);
  window.addEventListener('resize', function() {
    clearTimeout(_rT); _rT = setTimeout(doResize, 100);
  }, { passive: true });
  setTimeout(doResize, 10);

  function sc(v) { return v * H / 110; }

  /* ════════ STATE ════════ */
  var STATE = {
    mode: 'idle',
    converge: 0,
    routeGlow: {},
    sunDriftAng: 0,
    sunDriftR: 0,
  };

  /* ════════ ROUTES ════════ */
  var ROUTES = {
    general:  { r:168, g:210, b:255, name:'GENERAL'  },
    risk:     { r:255, g:140, b:140, name:'RISK'      },
    survival: { r:140, g:230, b:180, name:'SURVIVAL'  },
    collapse: { r:200, g:160, b:255, name:'COLLAPSE'  },
    civil:    { r:255, g:220, b:160, name:'CIVIL'     },
    vega:     { r:180, g:230, b:255, name:'VEGA'      },
  };

  function rRGB(r) { return r.r+','+r.g+','+r.b; }

  /* ════════ STAR LAYERS ════════
     Layer 0: 1400 tiny background stars — static, no twinkle
     Layer 1: 700 mid stars — very slow shimmer
     Layer 2: 300 foreground bright stars — subtle pulse
     Total: 2400+ stars
  ════════ */
  var STARS = [];
  function buildStars() {
    STARS = [];
    var configs = [
      { n:1400, sMin:0.08, sMax:0.28, aMin:0.08, aMax:0.28, twinkle:false, par:0.00008 },
      { n:700,  sMin:0.20, sMax:0.55, aMin:0.18, aMax:0.42, twinkle:true,  tAmp:0.04, tSpd:0.0008, par:0.00016 },
      { n:300,  sMin:0.45, sMax:1.10, aMin:0.35, aMax:0.72, twinkle:true,  tAmp:0.08, tSpd:0.0015, par:0.00025 },
    ];
    configs.forEach(function(c) {
      for (var i = 0; i < c.n; i++) {
        var warm = Math.random();
        /* Star colors: blue-white (hot), white, warm yellow, orange-red (cool) */
        var col;
        if      (warm < 0.20) col = { r:180, g:200, b:255 }; /* blue-white */
        else if (warm < 0.55) col = { r:235, g:238, b:245 }; /* white */
        else if (warm < 0.80) col = { r:255, g:240, b:210 }; /* warm white */
        else if (warm < 0.93) col = { r:255, g:220, b:160 }; /* yellow */
        else                  col = { r:255, g:185, b:130 }; /* orange */

        STARS.push({
          x:  Math.random(),
          y:  Math.random(),
          s:  c.sMin + Math.random() * (c.sMax - c.sMin),
          a:  c.aMin + Math.random() * (c.aMax - c.aMin),
          col: col,
          twinkle: c.twinkle,
          tAmp: c.tAmp || 0,
          tSpd: c.tSpd || 0,
          tOff: Math.random() * Math.PI * 2,
          par:  c.par,
          bloom: c.n === 300 && Math.random() > 0.65,
        });
      }
    });
  }

  /* ════════ MILKY WAY BAND ════════ */
  var MW = [];
  function buildMilkyWay() {
    MW = [];
    /* diagonal band across strip */
    for (var i = 0; i < 1800; i++) {
      var t  = Math.random();
      var bx = -0.1 + t * 1.2; /* band runs left-right */
      var by = 0.15 + t * 0.70 + (Math.random() - 0.5) * 0.18;
      if (by < 0 || by > 1) continue;
      var d  = Math.abs(by - (0.15 + t * 0.70)); /* distance from band center */
      MW.push({
        x: bx,
        y: by,
        s: 0.05 + Math.random() * 0.20,
        a: (0.04 + Math.random() * 0.14) * (1 - d * 5.0),
        col: Math.random() > 0.6
          ? { r:200, g:215, b:255 }   /* blue-white nebula */
          : { r:255, g:245, b:225 },  /* warm dust */
      });
    }
  }

  /* ════════ DARK MATTER FILAMENTS ════════
     web-like structure — ultra faint, barely visible
     represent cosmic web / สุญยตา underlying structure
  ════════ */
  var FILAMENTS = [];
  function buildFilaments() {
    FILAMENTS = [];
    var nodes = [];
    for (var i = 0; i < 12; i++) {
      nodes.push({ x: Math.random(), y: Math.random() });
    }
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i+1; j < nodes.length; j++) {
        var dx = nodes[i].x - nodes[j].x;
        var dy = nodes[i].y - nodes[j].y;
        var dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 0.35) {
          FILAMENTS.push({
            x1: nodes[i].x, y1: nodes[i].y,
            x2: nodes[j].x, y2: nodes[j].y,
            a:  0.018 + Math.random() * 0.022,
          });
        }
      }
    }
  }

  /* ════════ QUANTUM PARTICLES ════════
     emerge and dissolve — "เกิดเพราะมีเหตุ ดับเพราะหมดเหตุ"
     very slow cycle, no sudden appearance
  ════════ */
  var QP = [];
  function buildQP() {
    QP = [];
    var count = Math.round(W * 0.12);
    for (var i = 0; i < count; i++) {
      QP.push({
        x:    Math.random(),
        y:    Math.random(),
        s:    0.15 + Math.random() * 0.80,
        life: Math.random(), /* 0-1 lifecycle position */
        spd:  0.00008 + Math.random() * 0.00025, /* very slow */
        col:  Math.random() > 0.55
          ? { r:140, g:100, b:200 }  /* dark matter violet */
          : { r:80,  g:120, b:180 }, /* cold dark matter blue */
        dx:  (Math.random() - 0.5) * 0.000035,
        dy:  (Math.random() - 0.5) * 0.000018,
      });
    }
  }

  /* ════════ PLANETS ════════ */
  var PLANET_DEFS = [
    { id:'general',  route:'general',  ang:0.52, spd:0.0022, orb:0.092, sz:3.8, col:{r:168,g:210,b:255}, rings:false },
    { id:'risk',     route:'risk',     ang:1.85, spd:0.0015, orb:0.138, sz:3.4, col:{r:255,g:140,b:140}, rings:false },
    { id:'survival', route:'survival', ang:3.10, spd:0.0011, orb:0.185, sz:4.2, col:{r:140,g:230,b:180}, rings:false },
    { id:'collapse', route:'collapse', ang:4.55, spd:0.0008, orb:0.232, sz:3.6, col:{r:200,g:160,b:255}, rings:true  },
    { id:'civil',    route:'civil',    ang:0.85, spd:0.0005, orb:0.278, sz:3.9, col:{r:255,g:220,b:160}, rings:false },
    { id:'vega',     route:'vega',     ang:2.65, spd:0.0003, orb:0.325, sz:4.6, col:{r:180,g:230,b:255}, rings:true  },
    /* ambient */
    { id:'a1', ang:1.10, spd:0.0032, orb:0.068, sz:1.6, col:{r:200,g:195,b:215} },
    { id:'a2', ang:2.90, spd:0.0021, orb:0.112, sz:1.4, col:{r:210,g:200,b:220} },
    { id:'a3', ang:4.20, spd:0.0015, orb:0.158, sz:1.5, col:{r:195,g:205,b:225} },
    { id:'a4', ang:5.50, spd:0.0010, orb:0.205, sz:1.3, col:{r:205,g:195,b:215} },
    { id:'a5', ang:0.30, spd:0.0007, orb:0.252, sz:1.7, col:{r:215,g:205,b:200} },
    { id:'a6', ang:3.70, spd:0.0004, orb:0.298, sz:1.4, col:{r:200,g:210,b:220} },
  ];
  var PLANETS = [];
  function buildPlanets() {
    PLANETS = PLANET_DEFS.map(function(d) {
      return Object.assign({}, d); /* copy so we can mutate ang */
    });
  }

  function buildAll() {
    buildStars();
    buildMilkyWay();
    buildFilaments();
    buildQP();
    buildPlanets();
  }

  /* ════════════════════════════════════════
     DRAW — BACKGROUND
  ════════════════════════════════════════ */
  function drawBg() {
    ctx.clearRect(0, 0, W, H);
    /* True void — almost pure black with very faint deep blue undertone */
    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0,   '#03020a');
    bg.addColorStop(0.5, '#04030c');
    bg.addColorStop(1,   '#030208');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  }

  /* ════════ MILKY WAY ════════ */
  function drawMilkyWay() {
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < MW.length; i++) {
      var m = MW[i];
      var px = m.x * W, py = m.y * H;
      ctx.beginPath();
      ctx.arc(px, py, m.s, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba('+m.col.r+','+m.col.g+','+m.col.b+','+m.a+')';
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════ DARK MATTER FILAMENTS ════════ */
  function drawFilaments() {
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < FILAMENTS.length; i++) {
      var f = FILAMENTS[i];
      ctx.beginPath();
      ctx.moveTo(f.x1 * W, f.y1 * H);
      ctx.lineTo(f.x2 * W, f.y2 * H);
      ctx.strokeStyle = 'rgba(100,80,160,' + f.a + ')';
      ctx.lineWidth = 0.4;
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════ STARS ════════ */
  function drawStars(t) {
    for (var i = 0; i < STARS.length; i++) {
      var s  = STARS[i];
      var px = s.x * W + mouseX * s.par * W * 30;
      var py = s.y * H + mouseY * s.par * H * 30;
      /* wrap */
      px = ((px % W) + W) % W;
      py = ((py % H) + H) % H;

      var alpha = s.a;
      if (s.twinkle) {
        /* very subtle — max ±8% brightness shift, slow */
        alpha = s.a * (1 + Math.sin(t * s.tSpd + s.tOff) * s.tAmp);
      }

      ctx.beginPath();
      ctx.arc(px, py, s.s, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba('+s.col.r+','+s.col.g+','+s.col.b+','+Math.min(1,alpha)+')';
      ctx.fill();

      /* bloom cross for brightest stars */
      if (s.bloom && alpha > 0.50) {
        var bl = s.s * 2.8;
        ctx.strokeStyle = 'rgba('+s.col.r+','+s.col.g+','+s.col.b+','+(alpha * 0.07)+')';
        ctx.lineWidth = 0.22;
        ctx.beginPath();
        ctx.moveTo(px-bl, py); ctx.lineTo(px+bl, py);
        ctx.moveTo(px, py-bl); ctx.lineTo(px, py+bl);
        ctx.stroke();
      }
    }
  }

  /* ════════ QUANTUM PARTICLES (dark matter) ════════ */
  function drawQP(t) {
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < QP.length; i++) {
      var p = QP[i];
      p.life += p.spd;
      if (p.life > 1) p.life = 0;
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;

      /* smooth sine lifecycle — emerge and dissolve */
      var phase = Math.sin(p.life * Math.PI);
      var alpha = phase * 0.14;
      if (alpha < 0.005) continue;

      var px = p.x * W, py = p.y * H;
      var r = p.s * (1 + phase * 0.5);
      var g = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
      g.addColorStop(0, 'rgba('+p.col.r+','+p.col.g+','+p.col.b+','+alpha+')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(px, py, r * 4, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════ ORBIT RINGS ════════ */
  function drawOrbits(tilt) {
    var seen = {};
    ctx.globalCompositeOperation = 'screen';
    PLANETS.forEach(function(p) {
      var orb = getOrb(p);
      var key = Math.round(orb / 3) * 3;
      if (seen[key]) return;
      seen[key] = true;

      var gl  = p.route ? (STATE.routeGlow[p.route] || 0) : 0;
      var rc  = p.route ? ROUTES[p.route] : null;
      var t2  = tilt + (p.orbTilt || 0);

      ctx.beginPath();
      ctx.ellipse(SX, SY, orb, orb * t2, 0, 0, Math.PI * 2);

      if (gl > 0.02) {
        ctx.strokeStyle = 'rgba('+rRGB(rc)+','+(0.04+gl*0.20)+')';
        ctx.lineWidth   = 0.4 + gl * 1.0;
        ctx.shadowColor = 'rgba('+rRGB(rc)+','+(gl*0.5)+')';
        ctx.shadowBlur  = 3 + gl * 6;
        ctx.setLineDash([3, 11]);
      } else {
        ctx.strokeStyle = 'rgba(180,190,220,0.018)';
        ctx.lineWidth   = 0.35;
        ctx.shadowBlur  = 0;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  function getOrb(p) {
    var base = p.orb * W;
    if (STATE.mode === 'council' || STATE.mode === 'thinking')
      return base * (1 - STATE.converge * 0.45);
    return base;
  }

  /* ════════ PLANETS ════════ */
  function drawPlanets(dt, t, tilt) {
    var isC   = STATE.mode === 'council' || STATE.mode === 'thinking';
    var boost = isC ? 1 + STATE.converge * 4 : 1;

    var items = PLANETS.map(function(p) {
      p.ang += p.spd * boost * dt * 60;
      var orb = getOrb(p);
      var t2  = tilt + (p.orbTilt || 0);
      return { p:p, x:SX + Math.cos(p.ang)*orb, y:SY + Math.sin(p.ang)*orb*t2 };
    }).sort(function(a,b) { return a.y - b.y; });

    items.forEach(function(item) {
      var p = item.p, x = item.x, y = item.y;
      if (y < -20 || y > H + 20) return;

      var sz = sc(p.sz) * (isC ? 0.82 + STATE.converge * 0.35 : 1);
      var gl = p.route ? (STATE.routeGlow[p.route] || 0) : 0;
      var rc = p.route ? ROUTES[p.route] : null;
      var c  = p.col;

      /* route active glow halo */
      if (gl > 0.02 && rc) {
        ctx.globalCompositeOperation = 'screen';
        var pulse = 1 + Math.sin(t * 0.0020 + p.ang) * 0.16;
        var halo = ctx.createRadialGradient(x, y, sz*0.3, x, y, sz*7*pulse);
        halo.addColorStop(0, 'rgba('+rRGB(rc)+','+(gl*0.50)+')');
        halo.addColorStop(0.3,'rgba('+rRGB(rc)+','+(gl*0.10)+')');
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(x, y, sz*7*pulse, 0, Math.PI*2);
        ctx.fillStyle = halo; ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }

      /* atmosphere */
      var atm = ctx.createRadialGradient(x, y, sz*0.65, x, y, sz*2.2);
      atm.addColorStop(0, 'rgba('+c.r+','+c.g+','+c.b+',0)');
      atm.addColorStop(0.5,'rgba('+c.r+','+c.g+','+c.b+',0.05)');
      atm.addColorStop(1, 'rgba('+c.r+','+c.g+','+c.b+','+(0.12+gl*0.12)+')');
      ctx.beginPath(); ctx.arc(x, y, sz*2.2, 0, Math.PI*2);
      ctx.fillStyle = atm; ctx.fill();

      /* planet body — realistic sphere shading */
      var body = ctx.createRadialGradient(x-sz*0.28, y-sz*0.28, 0, x, y, sz);
      body.addColorStop(0, 'rgba('+
        Math.min(255,c.r+80)+','+Math.min(255,c.g+80)+','+Math.min(255,c.b+80)+','+(0.92+gl*0.08)+')');
      body.addColorStop(0.5,'rgba('+c.r+','+c.g+','+c.b+',0.95)');
      body.addColorStop(1, 'rgba('+
        Math.round(c.r*0.45)+','+Math.round(c.g*0.45)+','+Math.round(c.b*0.45)+',1)');
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI*2);
      ctx.fillStyle = body; ctx.fill();

      /* specular highlight */
      var spec = ctx.createRadialGradient(x-sz*0.34, y-sz*0.34, 0, x-sz*0.34, y-sz*0.34, sz*0.50);
      spec.addColorStop(0, 'rgba(255,255,255,'+(0.35+gl*0.12)+')');
      spec.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI*2);
      ctx.fillStyle = spec; ctx.fill();

      /* limb darkening */
      var limb = ctx.createRadialGradient(x, y, sz*0.22, x, y, sz*1.05);
      limb.addColorStop(0, 'rgba(0,0,8,0)');
      limb.addColorStop(0.58,'rgba(0,0,8,0.20)');
      limb.addColorStop(1, 'rgba(0,0,8,0.65)');
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI*2);
      ctx.fillStyle = limb; ctx.fill();

      /* saturn-style rings for collapse/vega */
      if (p.rings) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, 0.28);
        ctx.beginPath();
        ctx.arc(0, 0, sz * 2.0, 0, Math.PI * 2);
        ctx.arc(0, 0, sz * 1.35, 0, Math.PI * 2, true);
        var ring = ctx.createRadialGradient(0, 0, sz*1.35, 0, 0, sz*2.0);
        ring.addColorStop(0, 'rgba('+c.r+','+c.g+','+c.b+',0.30)');
        ring.addColorStop(0.5,'rgba('+c.r+','+c.g+','+c.b+',0.18)');
        ring.addColorStop(1, 'rgba('+c.r+','+c.g+','+c.b+',0.05)');
        ctx.fillStyle = ring;
        ctx.fill('evenodd');
        ctx.restore();
      }

      /* label when route active */
      if (rc && gl > 0.12) {
        var fs = Math.max(6, Math.round(sz * 0.60));
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.shadowColor = 'rgba('+rRGB(rc)+','+gl+')';
        ctx.shadowBlur  = 7 + gl * 5;
        ctx.fillStyle   = 'rgba('+rRGB(rc)+','+Math.min(1,gl*1.2)+')';
        ctx.font = '500 '+fs+'px "DM Mono",monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(rc.name, x, y - sz - 4);
        ctx.restore();
      }
    });
  }

  /* ════════ SUN (LYLA) — no fixed center, drifts gently ════════ */
  function updateSunDrift(dt) {
    STATE.sunDriftAng += dt * 0.08; /* very slow drift */
    STATE.sunDriftR    = sc(3.5);   /* small drift radius */
    SX = W * 0.50 + Math.cos(STATE.sunDriftAng) * STATE.sunDriftR;
    SY = H * 0.50 + Math.sin(STATE.sunDriftAng * 0.7) * STATE.sunDriftR * 0.6;
  }

  function drawSun(t) {
    var R  = sc(13);
    var isT = STATE.mode === 'thinking' || STATE.mode === 'council';
    var gm  = isT ? 1 + Math.sin(t * 0.006) * 0.28 : 1;

    /* outer corona — white-blue cold star (not gold) */
    ctx.globalCompositeOperation = 'lighter';
    var cor = ctx.createRadialGradient(SX, SY, R*0.18, SX, SY, R*9);
    cor.addColorStop(0,   'rgba(200,215,255,'+(0.18*gm)+')');
    cor.addColorStop(0.25,'rgba(140,165,220,'+(0.07*gm)+')');
    cor.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(SX, SY, R*9, 0, Math.PI*2);
    ctx.fillStyle = cor; ctx.fill();

    /* diffraction spikes — 6 rays */
    ctx.save(); ctx.translate(SX, SY); ctx.rotate(t * 0.000042);
    for (var i = 0; i < 6; i++) {
      var a  = (i / 6) * Math.PI * 2;
      var rl = R * (2.5 + 0.40 * Math.sin(i * 1.8 + t * 0.00032)) * gm;
      var gr = ctx.createLinearGradient(
        Math.cos(a)*R*0.22, Math.sin(a)*R*0.22,
        Math.cos(a)*rl, Math.sin(a)*rl
      );
      gr.addColorStop(0, 'rgba(210,225,255,'+(0.22*gm)+')');
      gr.addColorStop(0.5,'rgba(160,185,230,0.05)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = gr; ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*R*0.22, Math.sin(a)*R*0.22);
      ctx.lineTo(Math.cos(a)*rl, Math.sin(a)*rl);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';

    /* inner glow */
    ctx.globalCompositeOperation = 'lighter';
    var halo = ctx.createRadialGradient(SX, SY, R*0.38, SX, SY, R*2.4);
    halo.addColorStop(0,   'rgba(245,250,255,0.90)');
    halo.addColorStop(0.18,'rgba(200,215,255,0.65)');
    halo.addColorStop(0.52,'rgba(130,160,220,0.20)');
    halo.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(SX, SY, R*2.4, 0, Math.PI*2);
    ctx.fillStyle = halo; ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    /* logo */
    var lr = R * 1.36;
    if (_logo && _logo.complete && _logo.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath(); ctx.arc(SX, SY, lr, 0, Math.PI*2); ctx.clip();
      ctx.globalAlpha = 0.88;
      ctx.drawImage(_logo, SX-lr, SY-lr, lr*2, lr*2);
      ctx.restore(); ctx.globalAlpha = 1;
    } else {
      var fb = ctx.createRadialGradient(SX-R*0.25, SY-R*0.25, 0, SX, SY, R);
      fb.addColorStop(0,'#e8f0ff'); fb.addColorStop(0.5,'#8090cc'); fb.addColorStop(1,'#202840');
      ctx.beginPath(); ctx.arc(SX, SY, R, 0, Math.PI*2);
      ctx.fillStyle = fb; ctx.fill();
    }

    /* LYLA label */
    ctx.globalCompositeOperation = 'screen';
    ctx.shadowColor = 'rgba(180,200,255,0.65)'; ctx.shadowBlur = 10;
    ctx.fillStyle   = 'rgba(200,215,255,0.75)';
    ctx.font = '500 '+Math.max(7,Math.round(sc(7)))+'px "DM Mono",monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('LYLA ◈', SX, SY - lr - 4);
    ctx.shadowBlur = 0; ctx.textBaseline = 'alphabetic';
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════ SHOOTING STAR ════════ */
  var SHOOTS = [], nextShoot = 5000;
  function spawnShoot(t) {
    var fl = Math.random() > 0.5;
    SHOOTS.push({
      x: fl ? -20 : W+20, y: H*(0.05+Math.random()*0.90),
      vx: fl ? 2.0+Math.random()*3.2 : -(2.0+Math.random()*3.2),
      vy: (Math.random()-0.5)*1.2,
      life:0, maxLife:0.9+Math.random()*0.7,
      len: 60+Math.random()*80, al:0.28+Math.random()*0.22,
    });
    nextShoot = t + 7000 + Math.random()*16000;
  }
  function drawShoots(t, dt) {
    if (t > nextShoot) spawnShoot(t);
    for (var i = SHOOTS.length-1; i >= 0; i--) {
      var s = SHOOTS[i];
      s.life += dt;
      if (s.life > s.maxLife) { SHOOTS.splice(i,1); continue; }
      var prog = s.life/s.maxLife;
      var al   = (prog<0.15 ? prog/0.15 : 1-((prog-0.15)/0.85)) * s.al;
      s.x += s.vx*dt*60*0.016; s.y += s.vy*dt*60*0.016;
      var x2=s.x-s.vx*s.len*0.016, y2=s.y-s.vy*s.len*0.016;
      var gr=ctx.createLinearGradient(x2,y2,s.x,s.y);
      gr.addColorStop(0,'rgba(200,215,255,0)');
      gr.addColorStop(0.6,'rgba(210,220,255,'+(al*0.32)+')');
      gr.addColorStop(1,'rgba(240,245,255,'+(al*0.75)+')');
      ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(s.x,s.y);
      ctx.strokeStyle=gr; ctx.lineWidth=0.9; ctx.stroke();
    }
  }

  /* ════════ TILT + GLOW + STATE ════════ */
  var BASE_TILT = 0.30;
  function getTilt() {
    if (STATE.mode==='council'||STATE.mode==='thinking')
      return BASE_TILT + STATE.converge*(0.75-BASE_TILT);
    return BASE_TILT;
  }
  function updateGlow(dt) {
    Object.keys(ROUTES).forEach(function(r) {
      if (!STATE.routeGlow[r]) STATE.routeGlow[r]=0;
      var target = r===activeRoute ? 1 : 0;
      STATE.routeGlow[r] += (target-STATE.routeGlow[r]) * Math.min(1, dt*2.8);
    });
  }
  function updateState(dt) {
    if (STATE.mode==='thinking'||STATE.mode==='council')
      STATE.converge = Math.min(1, STATE.converge+dt*0.60);
    else if (STATE.mode==='answering') {
      STATE.converge = Math.max(0, STATE.converge-dt*0.90);
      if (STATE.converge<=0) STATE.mode='idle';
    } else {
      STATE.converge = Math.max(0, STATE.converge-dt*0.28);
    }
  }

  /* ════════ MAIN LOOP ════════ */
  function loop(ts) {
    if (!lastTime) lastTime = ts;
    var dt = Math.min((ts-lastTime)/1000, 0.05);
    lastTime = ts;

    updateState(dt);
    updateGlow(dt);
    updateSunDrift(dt);

    var tilt = getTilt();

    drawBg();
    drawMilkyWay();
    drawFilaments();
    drawStars(ts);
    drawQP(ts);
    drawShoots(ts, dt);
    drawOrbits(tilt);
    drawPlanets(dt, ts, tilt);
    drawSun(ts);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ════════ PUBLIC API ════════ */
  window.LYLA_thinking = function(){ STATE.mode='thinking'; STATE.converge=0; };
  window.LYLA_answered = function(){ STATE.mode='answering'; };
  window.KD_pulse      = function(route){ STATE.mode='answering'; if(route) activeRoute=route; };
  window.KD_setRoute   = function(route){ activeRoute=route; };
  window.KD_council    = function(){ STATE.mode='council'; STATE.converge=0; };
  window.KD_councilEnd = function(){ STATE.mode='answering'; };

})();
