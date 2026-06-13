/* ============================================================
   KING DIADEM — galaxy_scene.js v30
   OTHERWORLDLY — Living Decision Membrane
   Bioluminescent planets | Aurora filaments | FATE™ Doc layer
   Mobile-first: SX=W*0.08, orbit fills W
   ============================================================ */
(function () {
  'use strict';
  var cv = document.getElementById('galaxy');
  if (!cv) return;
  if (!window.KD) window.KD = {};

  var ctx = cv.getContext('2d', { alpha: true });
  var W = 0, H = 0, lastTime = 0;
  var activeRoute = 'general';
  var STARS = [];
  var FILAMENTS = [];
  var FATE_TEXTS = [];

  cv.style.cssText = 'display:block;position:absolute;inset:0;width:100%;height:100%;';

  /* ── RESIZE ── */
  var _rT;
  function doResize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    buildStars();
    buildFilaments();
  }
  window.addEventListener('resize', function () {
    clearTimeout(_rT); _rT = setTimeout(doResize, 60);
  }, { passive: true });
  window.addEventListener('orientationchange', function () {
    clearTimeout(_rT); _rT = setTimeout(doResize, 160);
  }, { passive: true });
  setTimeout(doResize, 10);

  /* ── SUN — anchored W*0.08, never H-based ── */
  function SX() { return Math.max(48, Math.min(W * 0.09, 72)); }
  function SY() { return H * 0.50; }
  function SR() { return Math.max(6, Math.min(W * 0.018, 13)); }

  var TILT = 0.14;

  /* ── FATE™ Canonical ghost texts ── */
  var CANON = [
    'Logic over Persona.',
    'Rule over Authority.',
    'Downside before Upside.',
    'If it cannot be explained,\nit cannot be used.',
    'Human retains final authority.',
    'Fail less, not win more.',
    'Power without trace is risk.',
    'Structure before action.',
    'Know the 99. Respect the 1.',
    'Auditability over convenience.',
    'Deferred is better than reckless.',
    'Evidence before opinion.',
    'Choice(t) ≥ 1 → collapse = False',
    'ไม่ได้สร้างมาเพื่อชนะทุกครั้ง\nสร้างมาเพื่อไม่พังแบบเดิมอีกครั้ง',
    'กฎมีไว้จำกัดอำนาจ\nไม่ใช่ขยายอำนาจ',
  ];

  /* Ghost text objects */
  function spawnFateText(t) {
    var text = CANON[Math.floor(Math.random() * CANON.length)];
    var lines = text.split('\n');
    return {
      lines: lines,
      x: W * (0.15 + Math.random() * 0.70),
      y: H * (0.08 + Math.random() * 0.80),
      alpha: 0,
      maxAlpha: 0.055 + Math.random() * 0.055,
      state: 'in', // in | hold | out
      lifeIn: 2200 + Math.random() * 1800,
      lifeHold: 4000 + Math.random() * 5000,
      lifeOut: 2500 + Math.random() * 1500,
      age: 0,
      size: W < 500 ? (7 + Math.random() * 4) : (9 + Math.random() * 5),
    };
  }

  /* init pool */
  function initFateTexts() {
    FATE_TEXTS = [];
    var count = W < 500 ? 3 : 5;
    for (var i = 0; i < count; i++) {
      var ft = spawnFateText(0);
      ft.age = Math.random() * (ft.lifeIn + ft.lifeHold); // stagger start
      if (ft.age > ft.lifeIn) ft.state = 'hold';
      FATE_TEXTS.push(ft);
    }
  }

  /* ── PLANET DEFINITIONS — bioluminescent palette ── */
  var PDEFS = [
    { id:'general',  label:'GENERAL',  ang:0.60, spd:0.00022, orb:0.12, sz:4.4,
      c0:'#7effd4', c1:'#00b890', c2:'#003830',
      glow:'rgba(0,220,160,', atm:'rgba(0,200,140,' },
    { id:'risk',     label:'RISK',     ang:2.30, spd:0.00015, orb:0.20, sz:3.8,
      c0:'#ff6eb0', c1:'#cc0060', c2:'#300015',
      glow:'rgba(255,60,120,', atm:'rgba(200,30,80,' },
    { id:'survival', label:'SURVIVAL', ang:3.80, spd:0.00010, orb:0.30, sz:4.8,
      c0:'#baff6e', c1:'#5ecc00', c2:'#153000',
      glow:'rgba(130,255,40,', atm:'rgba(90,200,10,' },
    { id:'collapse', label:'COLLAPSE', ang:5.10, spd:0.00007, orb:0.40, sz:4.0,
      c0:'#ffaa44', c1:'#cc5500', c2:'#301000',
      glow:'rgba(255,140,20,', atm:'rgba(200,80,10,' },
    { id:'civil',    label:'CIVIL',    ang:1.20, spd:0.00004, orb:0.53, sz:5.2,
      c0:'#44ddff', c1:'#0088cc', c2:'#001830',
      glow:'rgba(0,200,255,', atm:'rgba(0,150,220,' },
    { id:'vega',     label:'VEGA',     ang:4.20, spd:0.00002, orb:0.72, sz:6.8,
      c0:'#eebbff', c1:'#9933dd', c2:'#1a0030',
      glow:'rgba(180,80,255,', atm:'rgba(140,40,220,' },
    /* asteroids — muted bioluminescent */
    { id:'a1', ang:1.60, spd:0.00032, orb:0.07, sz:1.3,
      c0:'#44ffcc', c1:'#006644', c2:'#001a10', glow:'rgba(0,180,120,' },
    { id:'a2', ang:3.20, spd:0.00019, orb:0.16, sz:1.1,
      c0:'#ff88aa', c1:'#880033', c2:'#1a0008', glow:'rgba(200,40,80,' },
    { id:'a3', ang:5.60, spd:0.00009, orb:0.36, sz:1.2,
      c0:'#88ffaa', c1:'#226633', c2:'#061508', glow:'rgba(60,200,80,' },
    { id:'a4', ang:2.80, spd:0.00003, orb:0.62, sz:1.4,
      c0:'#99aaff', c1:'#334499', c2:'#080d1e', glow:'rgba(80,100,255,' },
  ];
  var PLANETS = PDEFS.map(function (d) { return Object.assign({}, d); });

  /* ── STARS — sparse, cold, alien ── */
  function buildStars() {
    STARS = [];
    /* ultra-dim pin dust */
    for (var i = 0; i < 1800; i++)
      STARS.push({ x:Math.random()*W, y:Math.random()*H,
        r: 0.05+Math.random()*0.18, a: 0.08+Math.random()*0.22,
        col: Math.random()>0.5 ? '160,255,220' : '200,180,255', tw:false });
    /* medium — cold green/violet tint */
    for (var j = 0; j < 280; j++)
      STARS.push({ x:Math.random()*W, y:Math.random()*H,
        r: 0.15+Math.random()*0.32, a: 0.18+Math.random()*0.28,
        col: Math.random()>0.5 ? '140,255,200' : '180,140,255',
        tw:true, tS:0.00008+Math.random()*0.00015, tO:Math.random()*Math.PI*2, tA:0.14 });
    /* bright anomalies */
    for (var k = 0; k < 60; k++)
      STARS.push({ x:Math.random()*W, y:Math.random()*H,
        r: 0.40+Math.random()*0.65, a: 0.40+Math.random()*0.38,
        col: Math.random()>0.4 ? '100,255,200' : '200,120,255',
        tw:true, tS:0.00004+Math.random()*0.00009, tO:Math.random()*Math.PI*2, tA:0.20, bloom:true });
    initFateTexts();
  }

  /* ── AURORA FILAMENTS ── */
  function buildFilaments() {
    FILAMENTS = [];
    var count = W < 500 ? 4 : 7;
    for (var i = 0; i < count; i++) {
      FILAMENTS.push({
        x: Math.random() * W,
        y: Math.random() * H,
        w: W * (0.18 + Math.random() * 0.35),
        h: H * (0.06 + Math.random() * 0.12),
        angle: -0.3 + Math.random() * 0.6,
        hue: Math.random() > 0.5 ? 160 : 270, // teal or violet
        alpha: 0.03 + Math.random() * 0.055,
        speed: 0.000008 + Math.random() * 0.000012,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  /* ── COMET ── */
  var COMET = { x:0, y:0, vx:0, vy:0, active:false, life:0, maxLife:0 };
  var nextComet = 12000;
  function spawnComet(t) {
    COMET.x = W*0.20 + Math.random()*W*0.55;
    COMET.y = -4;
    COMET.vx = 0.5 + Math.random()*0.7;
    COMET.vy = 0.4 + Math.random()*0.5;
    COMET.life = 0;
    COMET.maxLife = 1.5 + Math.random()*1.4;
    COMET.active = true;
    nextComet = t + 20000 + Math.random()*35000;
  }
  function drawComet(t, dt) {
    if (t > nextComet && !COMET.active) spawnComet(t);
    if (!COMET.active) return;
    COMET.life += dt;
    if (COMET.life > COMET.maxLife || COMET.y > H+20) { COMET.active = false; return; }
    COMET.x += COMET.vx * dt * 60 * 0.013;
    COMET.y += COMET.vy * dt * 60 * 0.013;
    var prog = COMET.life / COMET.maxLife;
    var al = prog < 0.15 ? prog/0.15 : Math.max(0, 1-(prog-0.15)/0.85);
    var tl = 80, tx = COMET.x - COMET.vx*tl*0.013, ty = COMET.y - COMET.vy*tl*0.013;
    var g = ctx.createLinearGradient(tx, ty, COMET.x, COMET.y);
    g.addColorStop(0, 'rgba(80,255,200,0)');
    g.addColorStop(0.5, 'rgba(120,255,220,'+(al*0.20)+')');
    g.addColorStop(1, 'rgba(180,255,240,'+(al*0.72)+')');
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(COMET.x, COMET.y);
    ctx.strokeStyle = g; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.beginPath(); ctx.arc(COMET.x, COMET.y, 1.3, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(160,255,220,'+(al*0.90)+')'; ctx.fill();
  }

  /* ── BACKGROUND — void with aurora layer ── */
  function drawBg(t) {
    ctx.clearRect(0, 0, W, H);

    /* deep void — near black with green undertone */
    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0,    '#020a06');
    bg.addColorStop(0.30, '#03080e');
    bg.addColorStop(0.65, '#050308');
    bg.addColorStop(1,    '#020106');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'screen';

    /* aurora filaments */
    for (var i = 0; i < FILAMENTS.length; i++) {
      var f = FILAMENTS[i];
      var breathe = Math.sin(t * f.speed + f.phase);
      var al = f.alpha * (0.7 + 0.3 * breathe);
      var cx = f.x + Math.sin(t * f.speed * 0.7 + f.phase) * W * 0.04;
      var cy = f.y + Math.cos(t * f.speed * 0.5 + f.phase) * H * 0.03;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(f.angle);
      var n = ctx.createRadialGradient(0, 0, 0, 0, 0, f.w * 0.5);
      var h = f.hue;
      n.addColorStop(0,   'hsla('+h+',100%,70%,'+al+')');
      n.addColorStop(0.5, 'hsla('+h+',80%,50%,'+(al*0.4)+')');
      n.addColorStop(1,   'hsla('+h+',60%,30%,0)');
      ctx.beginPath();
      ctx.ellipse(0, 0, f.w * 0.5, f.h * 0.5, 0, 0, Math.PI*2);
      ctx.fillStyle = n; ctx.fill();
      ctx.restore();
    }

    /* gravitational warmth behind sun */
    var sx = SX(), sy = SY();
    var sunHalo = ctx.createRadialGradient(sx, sy, SR()*0.5, sx, sy, W*0.42);
    sunHalo.addColorStop(0,   'rgba(255,140,20,0.36)');
    sunHalo.addColorStop(0.4, 'rgba(180,80,0,0.14)');
    sunHalo.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(sx, sy, W*0.42, H*0.85, 0, 0, Math.PI*2);
    ctx.fillStyle = sunHalo; ctx.fill();

    /* void depth — far right cold dark */
    var farVoid = ctx.createRadialGradient(W*0.90, H*0.50, 0, W*0.90, H*0.50, W*0.40);
    farVoid.addColorStop(0,   'rgba(0,20,40,0.40)');
    farVoid.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(W*0.90, H*0.50, W*0.40, H*0.80, 0, 0, Math.PI*2);
    ctx.fillStyle = farVoid; ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
  }

  function drawStars(t) {
    for (var i = 0; i < STARS.length; i++) {
      var s = STARS[i], al = s.a;
      if (s.tw) al = s.a * (1 + Math.sin(t*s.tS + s.tO) * s.tA);
      al = Math.max(0.02, Math.min(1, al));
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba('+s.col+','+al.toFixed(3)+')'; ctx.fill();
      if (s.bloom && al > 0.45) {
        var sp = s.r * 3.5;
        ctx.strokeStyle = 'rgba('+s.col+','+(al*0.06).toFixed(3)+')';
        ctx.lineWidth = 0.20;
        ctx.beginPath();
        ctx.moveTo(s.x-sp, s.y); ctx.lineTo(s.x+sp, s.y);
        ctx.moveTo(s.x, s.y-sp); ctx.lineTo(s.x, s.y+sp);
        ctx.stroke();
      }
    }
  }

  /* ── FATE™ DOC LAYER ── */
  function drawFateTexts(dt, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < FATE_TEXTS.length; i++) {
      var ft = FATE_TEXTS[i];
      ft.age += dt * 1000;
      /* state machine */
      if (ft.state === 'in') {
        ft.alpha = ft.maxAlpha * Math.min(1, ft.age / ft.lifeIn);
        if (ft.age >= ft.lifeIn) { ft.state = 'hold'; ft.age = 0; }
      } else if (ft.state === 'hold') {
        ft.alpha = ft.maxAlpha;
        if (ft.age >= ft.lifeHold) { ft.state = 'out'; ft.age = 0; }
      } else if (ft.state === 'out') {
        ft.alpha = ft.maxAlpha * Math.max(0, 1 - ft.age / ft.lifeOut);
        if (ft.age >= ft.lifeOut) {
          /* respawn */
          var nft = spawnFateText(t);
          FATE_TEXTS[i] = nft;
          continue;
        }
      }
      if (ft.alpha < 0.002) continue;
      var isMulti = ft.lines.length > 1;
      var fs = ft.size;
      ctx.font = '300 ' + fs + 'px "DM Mono", monospace';
      ctx.fillStyle = 'rgba(160,255,220,' + ft.alpha.toFixed(4) + ')';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (var li = 0; li < ft.lines.length; li++) {
        var ly = ft.y + (li - (ft.lines.length - 1) * 0.5) * (fs * 1.5);
        ctx.fillText(ft.lines[li], ft.x, ly);
      }
    }
    ctx.restore();
  }

  /* ── ORBITS ── */
  function drawOrbits() {
    var sx = SX(), sy = SY();
    var available = W - sx;
    var spread = W < 500 ? 1.18 : 1.0;
    var seen = {};
    ctx.setLineDash([2, 12]);
    PLANETS.forEach(function (p) {
      var key = Math.round(p.orb * 100);
      if (seen[key]) return; seen[key] = true;
      var isA = p.id === activeRoute;
      var orbR = p.orb * available * spread;
      ctx.beginPath();
      ctx.ellipse(sx, sy, orbR, orbR * TILT, 0, 0, Math.PI*2);
      ctx.strokeStyle = isA ? 'rgba(0,255,160,0.22)' : 'rgba(60,200,120,0.06)';
      ctx.lineWidth   = isA ? 0.65 : 0.30;
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  /* ── PLANET draw — bioluminescent ── */
  function drawPlanet(x, y, p, isA, t) {
    var sz = p.sz * (Math.min(W, 900) / 500);
    sz = Math.max(p.sz * 0.65, Math.min(sz, p.sz * 2.0));

    /* outer atmosphere */
    if (p.atm) {
      var atmA = isA ? 0.22 : 0.10;
      var atmR = sz * 3.0 + (isA ? 6 : 0);
      var atm = ctx.createRadialGradient(x, y, sz*0.5, x, y, atmR);
      atm.addColorStop(0, p.atm + atmA + ')');
      atm.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x, y, atmR, 0, Math.PI*2);
      ctx.fillStyle = atm; ctx.fill();
    }

    /* bioluminescent glow ring */
    if (p.glow) {
      ctx.globalCompositeOperation = 'screen';
      var pulse = isA ? (1 + Math.sin(t*0.0012)*0.10) : 1;
      var gr = ctx.createRadialGradient(x, y, sz*0.8, x, y, sz*(isA ? 5.5 : 3.5)*pulse);
      gr.addColorStop(0,   p.glow + (isA ? '0.45' : '0.18') + ')');
      gr.addColorStop(0.4, p.glow + (isA ? '0.12' : '0.05') + ')');
      gr.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x, y, sz*5.5*pulse, 0, Math.PI*2);
      ctx.fillStyle = gr; ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    /* body */
    var body = ctx.createRadialGradient(x - sz*0.28, y - sz*0.26, 0, x + sz*0.08, y + sz*0.08, sz*1.06);
    body.addColorStop(0,    p.c0);
    body.addColorStop(0.45, p.c1);
    body.addColorStop(1,    p.c2);
    ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI*2);
    ctx.fillStyle = body; ctx.fill();

    /* inner bioluminescent veining — subtle */
    ctx.globalCompositeOperation = 'screen';
    var vein = ctx.createRadialGradient(x - sz*0.20, y - sz*0.20, 0, x - sz*0.05, y - sz*0.05, sz*0.65);
    vein.addColorStop(0, p.glow ? p.glow + '0.35)' : 'rgba(255,255,255,0.20)');
    vein.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI*2);
    ctx.fillStyle = vein; ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    /* limb darkening */
    var limb = ctx.createRadialGradient(x, y, sz*0.10, x, y, sz*1.05);
    limb.addColorStop(0,   'rgba(0,0,0,0)');
    limb.addColorStop(0.5, 'rgba(0,0,0,0.18)');
    limb.addColorStop(1,   'rgba(0,0,0,0.80)');
    ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI*2);
    ctx.fillStyle = limb; ctx.fill();

    /* label */
    if (p.label) {
      var fs = Math.max(5.0, Math.round(sz * 0.58));
      ctx.save();
      if (isA) {
        ctx.globalCompositeOperation = 'screen';
        ctx.shadowColor = p.glow ? p.glow + '0.80)' : 'rgba(0,255,160,0.80)';
        ctx.shadowBlur = 7;
        ctx.fillStyle = p.c0;
      } else {
        ctx.fillStyle = 'rgba(120,200,160,0.35)';
      }
      ctx.font = '500 '+fs+'px "DM Mono",monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(p.label, x, y + sz + 2.5);
      ctx.restore();
    }
  }

  function drawPlanets(dt, t) {
    var sx = SX(), sy = SY();
    var available = W - sx;
    var spread = W < 500 ? 1.18 : 1.0;
    var items = PLANETS.map(function (p) {
      p.ang += p.spd * dt * 60;
      var orb = p.orb * available * spread;
      return { p:p, x: sx + Math.cos(p.ang)*orb, y: sy + Math.sin(p.ang)*orb*TILT };
    }).sort(function (a, b) { return a.y - b.y; });
    items.forEach(function (item) {
      if (item.x < -40 || item.x > W+40) return;
      drawPlanet(item.x, item.y, item.p, item.p.id === activeRoute, t);
    });
  }

  var _S = { thinking: false };

  /* ── SUN LYLA — warm amber core, alien corona ── */
  function drawSun(t) {
    var sx = SX(), sy = SY(), R = SR();
    var gm = _S.thinking ? 1 + Math.sin(t*0.005)*0.20 : 1;

    ctx.globalCompositeOperation = 'lighter';

    /* gravitational lens distortion — soft rings */
    for (var ring = 3; ring >= 1; ring--) {
      var rAl = (0.018 / ring) * gm;
      var rR = R * (4 + ring * 3.5);
      ctx.beginPath(); ctx.arc(sx, sy, rR, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(80,255,160,'+rAl+')';
      ctx.lineWidth = 0.40;
      ctx.stroke();
    }

    /* alien corona — teal-amber mix */
    var fc = ctx.createRadialGradient(sx, sy, R*0.10, sx, sy, R*10);
    fc.addColorStop(0,    'rgba(255,200,60,'+(0.30*gm)+')');
    fc.addColorStop(0.15, 'rgba(255,140,20,'+(0.12*gm)+')');
    fc.addColorStop(0.40, 'rgba(0,200,120,'+(0.06*gm)+')');
    fc.addColorStop(0.70, 'rgba(0,100,80,'+(0.02*gm)+')');
    fc.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.ellipse(sx, sy, R*10, R*3.5, 0, 0, Math.PI*2);
    ctx.fillStyle = fc; ctx.fill();

    /* rotating rays — amber */
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(t*0.000018);
    for (var i = 0; i < 12; i++) {
      var a = (i/12)*Math.PI*2;
      var rl = R * (1.9 + 0.28*Math.sin(i*1.8 + t*0.00014)) * gm;
      var gr = ctx.createLinearGradient(
        Math.cos(a)*R*0.20, Math.sin(a)*R*0.20,
        Math.cos(a)*rl, Math.sin(a)*rl);
      gr.addColorStop(0,    'rgba(255,200,50,'+(0.28*gm)+')');
      gr.addColorStop(0.5,  'rgba(200,120,10,0.06)');
      gr.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.strokeStyle = gr; ctx.lineWidth = 0.70;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*R*0.20, Math.sin(a)*R*0.20);
      ctx.lineTo(Math.cos(a)*rl, Math.sin(a)*rl);
      ctx.stroke();
    }
    ctx.restore();

    /* inner halo */
    var ih = ctx.createRadialGradient(sx, sy, R*0.25, sx, sy, R*2.5);
    ih.addColorStop(0,    'rgba(255,240,150,0.95)');
    ih.addColorStop(0.25, 'rgba(255,190,50,0.65)');
    ih.addColorStop(0.60, 'rgba(200,90,10,0.22)');
    ih.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(sx, sy, R*2.5, 0, Math.PI*2);
    ctx.fillStyle = ih; ctx.fill();

    ctx.globalCompositeOperation = 'source-over';

    /* sun body */
    var body = ctx.createRadialGradient(sx - R*0.22, sy - R*0.22, 0, sx, sy, R);
    body.addColorStop(0,    '#fffad0');
    body.addColorStop(0.25, '#ffdd40');
    body.addColorStop(0.65, '#e06800');
    body.addColorStop(1,    '#5c1e00');
    ctx.beginPath(); ctx.arc(sx, sy, R, 0, Math.PI*2);
    ctx.fillStyle = body; ctx.fill();

    /* specular */
    var spec = ctx.createRadialGradient(sx - R*0.34, sy - R*0.34, 0, sx - R*0.16, sy - R*0.16, R*0.54);
    spec.addColorStop(0, 'rgba(255,252,230,0.55)');
    spec.addColorStop(1, 'rgba(255,252,230,0)');
    ctx.beginPath(); ctx.arc(sx, sy, R, 0, Math.PI*2);
    ctx.fillStyle = spec; ctx.fill();

    /* limb */
    var limb = ctx.createRadialGradient(sx, sy, R*0.15, sx, sy, R*1.05);
    limb.addColorStop(0,   'rgba(0,0,0,0)');
    limb.addColorStop(0.5, 'rgba(0,0,0,0.15)');
    limb.addColorStop(1,   'rgba(0,0,0,0.75)');
    ctx.beginPath(); ctx.arc(sx, sy, R, 0, Math.PI*2);
    ctx.fillStyle = limb; ctx.fill();

    /* LYLA label */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.shadowColor = 'rgba(255,200,60,0.90)'; ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(255,240,140,0.95)';
    var lfs = Math.max(6, Math.round(R*0.52));
    ctx.font = '600 '+lfs+'px "DM Mono",monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('LYLA ◆', sx, sy - R - 2);
    ctx.restore();
  }

  /* ── AXIOM & BADGE ── */
  function drawAxiom() {
    ctx.save();
    ctx.font = '300 7px "DM Mono",monospace';
    ctx.fillStyle = 'rgba(80,220,160,0.14)';
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('Choice(t) ≥ 1  →  collapse = False', SX()+SR()+8, H-4);
    ctx.restore();
  }
  function drawBadge() {
    ctx.save();
    ctx.font = '400 5px "DM Mono",monospace';
    ctx.fillStyle = 'rgba(80,220,160,0.10)';
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
    ctx.fillText('FATE™  DETERMINISTIC DECISION INFRASTRUCTURE  v30', W-5, H-4);
    ctx.restore();
  }

  /* ── RENDER LOOP ── */
  function loop(ts) {
    if (!lastTime) lastTime = ts;
    var dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    drawBg(ts);
    drawStars(ts);
    drawFateTexts(dt, ts);
    drawComet(ts, dt);
    drawOrbits();
    drawPlanets(dt, ts);
    drawSun(ts);
    drawAxiom();
    drawBadge();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ── PUBLIC API ── */
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
