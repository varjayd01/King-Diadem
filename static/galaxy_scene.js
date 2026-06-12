/* ============================================================
   KING DIADEM — galaxy_scene.js v21 "The Decision Universe"
   
   จักรวาลแห่งการตัดสินใจ — โรแมนติก มีน้ำหนัก ช่วยคนรอด
   
   Design philosophy:
   - Solar system ชัด: Sun กลาง orbit วนรอบ planets เห็นได้จริง
   - Strip height 110px → orbit แบน ใช้ความกว้างแทนความสูง
   - Near-static: planets เคลื่อนช้ามาก เหมือนดูดาวจริงๆ
   - Romantic glow: warm amber corona, soft nebula, deep black
   - ทุก planet = 1 route การตัดสินใจ มีชื่อ มีน้ำหนัก
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('galaxy');
  if (!cv) return;
  if (!window.KD) window.KD = {};

  var ctx = cv.getContext('2d', { alpha: true });
  var W = 0, H = 0;
  var activeRoute = 'general';
  var lastTime = 0;

  /* ── Logo ── */
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

  /* ════════════════════════════════════════
     PALETTE — Obsidian + Cosmic Amber
     ดำลึก อบอุ่น ไม่ cold
  ════════════════════════════════════════ */
  var PAL = {
    bg0: '#07050a',
    bg1: '#09070c',
    bg2: '#0b0809',
    sunCore:   'rgba(255,245,210,',
    sunHalo:   'rgba(200,155,60,',
    sunCrona:  'rgba(160,110,30,',
    nebAmber:  'rgba(180,130,50,',
    nebRose:   'rgba(140,80,60,',
    nebBlue:   'rgba(80,90,140,',
  };

  /* ════════════════════════════════════════
     ROUTES / PLANETS
     แต่ละดาว = 1 เส้นทางการตัดสินใจ
     orbit = ระยะห่างจากดวงอาทิตย์ (fraction of W)
     sz    = ขนาดดาว
     spd   = ความเร็ว (ช้ามาก = โรแมนติก)
  ════════════════════════════════════════ */
  var PLANET_DEFS = [
    /* ดาวใกล้ — ตัดสินใจด่วน */
    { id:'general',  label:'GENERAL',  ang:0.60, spd:0.00020, orb:0.110, sz:4.2, r:220, g:195, b:140, active:false },
    { id:'risk',     label:'RISK',     ang:2.10, spd:0.00014, orb:0.165, sz:3.8, r:205, g:100, b:65,  active:false },
    /* ดาวกลาง — ไตร่ตรอง */
    { id:'survival', label:'SURVIVAL', ang:3.80, spd:0.00009, orb:0.225, sz:4.0, r:130, g:180, b:100, active:false },
    { id:'collapse', label:'COLLAPSE', ang:5.20, spd:0.00006, orb:0.285, sz:3.6, r:170, g:130, b:90,  active:false },
    /* ดาวไกล — มองระยะยาว */
    { id:'civil',    label:'CIVIL',    ang:1.40, spd:0.00004, orb:0.345, sz:4.4, r:215, g:175, b:120, active:false },
    { id:'vega',     label:'VEGA',     ang:4.10, spd:0.00002, orb:0.400, sz:5.0, r:240, g:220, b:160, active:false },
    /* ambient — ดาวบริวาร ไม่มีชื่อ */
    { id:'a1', ang:1.80, spd:0.00030, orb:0.085, sz:1.4, r:190, g:165, b:115 },
    { id:'a2', ang:3.20, spd:0.00018, orb:0.140, sz:1.6, r:180, g:155, b:105 },
    { id:'a3', ang:0.90, spd:0.00011, orb:0.195, sz:1.3, r:185, g:160, b:110 },
    { id:'a4', ang:4.60, spd:0.00007, orb:0.255, sz:1.5, r:175, g:150, b:100 },
    { id:'a5', ang:2.40, spd:0.00004, orb:0.315, sz:1.4, r:185, g:165, b:120 },
    { id:'a6', ang:5.80, spd:0.00002, orb:0.375, sz:1.6, r:195, g:175, b:130 },
  ];

  var PLANETS = PLANET_DEFS.map(function (d) { return Object.assign({}, d); });

  /* ════════════════════════════════════════
     STARS — 3 layer, near-static
     เยอะ แต่ส่วนใหญ่ไม่ blink
  ════════════════════════════════════════ */
  var STARS = [];
  function buildStars() {
    STARS = [];
    /* layer 0: 1200 micro dots — ไม่กระพริบ */
    for (var i = 0; i < 1200; i++) {
      STARS.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.08 + Math.random() * 0.22,
        a: 0.08 + Math.random() * 0.28,
        tw: false,
      });
    }
    /* layer 1: 300 mid — blink ช้ามาก */
    for (var j = 0; j < 300; j++) {
      STARS.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.20 + Math.random() * 0.45,
        a: 0.25 + Math.random() * 0.40,
        tw: true,
        tS: 0.00018 + Math.random() * 0.00025,
        tO: Math.random() * Math.PI * 2,
        tA: 0.05,
      });
    }
    /* layer 2: 80 bright — pulse ช้ามาก */
    for (var k = 0; k < 80; k++) {
      STARS.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.55 + Math.random() * 0.80,
        a: 0.45 + Math.random() * 0.40,
        tw: true,
        tS: 0.00010 + Math.random() * 0.00018,
        tO: Math.random() * Math.PI * 2,
        tA: 0.09,
        bloom: true,
      });
    }
  }

  /* Sun position — กลาง-ซ้าย 22% ของ strip */
  function getSunX() { return W * 0.22; }
  function getSunY() { return H * 0.50; }

  /* ════════════════════════════════════════
     DRAW BG — ดำลึก gradient + nebula ซ้าย
  ════════════════════════════════════════ */
  function drawBg() {
    ctx.clearRect(0, 0, W, H);

    /* gradient พื้น — อุ่นกว่าฝั่ง sun */
    var g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0,    '#0d0a06');
    g.addColorStop(0.22, '#0b0808');
    g.addColorStop(0.55, '#080608');
    g.addColorStop(1,    '#060508');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    var sx = getSunX(), sy = getSunY();

    ctx.globalCompositeOperation = 'screen';

    /* nebula ใกล้ดวงอาทิตย์ */
    var n1 = ctx.createRadialGradient(sx * 0.6, sy, 0, sx * 0.6, sy, W * 0.35);
    n1.addColorStop(0,   PAL.nebAmber + '0.18)');
    n1.addColorStop(0.5, PAL.nebAmber + '0.05)');
    n1.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(sx * 0.6, sy, W * 0.35, H * 1.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = n1; ctx.fill();

    /* nebula ปลายขวา — rose dust */
    var n2 = ctx.createRadialGradient(W * 0.80, H * 0.45, 0, W * 0.80, H * 0.45, W * 0.28);
    n2.addColorStop(0,   PAL.nebRose + '0.10)');
    n2.addColorStop(0.6, PAL.nebRose + '0.03)');
    n2.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(W * 0.80, H * 0.45, W * 0.28, H * 0.90, 0, 0, Math.PI * 2);
    ctx.fillStyle = n2; ctx.fill();

    /* nebula กลาง — blue hint ลึก */
    var n3 = ctx.createRadialGradient(W * 0.50, H * 0.50, 0, W * 0.50, H * 0.50, W * 0.22);
    n3.addColorStop(0,   PAL.nebBlue + '0.07)');
    n3.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(W * 0.50, H * 0.50, W * 0.22, H * 0.80, 0, 0, Math.PI * 2);
    ctx.fillStyle = n3; ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════════════════════════════════════
     DRAW STARS
  ════════════════════════════════════════ */
  function drawStars(t) {
    for (var i = 0; i < STARS.length; i++) {
      var s = STARS[i];
      var al = s.a;
      if (s.tw) al = s.a * (1 + Math.sin(t * s.tS + s.tO) * s.tA);
      al = Math.max(0.02, Math.min(1, al));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230,215,175,' + al.toFixed(3) + ')';
      ctx.fill();
      if (s.bloom && al > 0.55) {
        /* diffraction spike เล็ก */
        var sp = s.r * 3.5;
        ctx.strokeStyle = 'rgba(240,225,180,' + (al * 0.08).toFixed(3) + ')';
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.moveTo(s.x - sp, s.y); ctx.lineTo(s.x + sp, s.y);
        ctx.moveTo(s.x, s.y - sp); ctx.lineTo(s.x, s.y + sp);
        ctx.stroke();
      }
    }
  }

  /* ════════════════════════════════════════
     DRAW ORBITS
     แบน ellipse ตามแนวนอน เหมาะ strip
     tilt ต่ำมาก = solar system มองจากด้านข้างเล็กน้อย
  ════════════════════════════════════════ */
  var TILT = 0.18; /* ยิ่งน้อย = แบนกว่า = เห็น orbit ชัดกว่า */

  function drawOrbits() {
    var sx = getSunX(), sy = getSunY();
    var seen = {};

    PLANETS.forEach(function (p) {
      var orb = p.orb * W;
      var key = Math.round(orb / 4) * 4;
      if (seen[key]) return;
      seen[key] = true;

      var isActive = p.id === activeRoute;
      ctx.beginPath();
      ctx.ellipse(sx, sy, orb, orb * TILT, 0, 0, Math.PI * 2);

      if (isActive) {
        ctx.strokeStyle = 'rgba(210,175,90,0.20)';
        ctx.lineWidth   = 0.7;
        ctx.setLineDash([4, 14]);
      } else {
        ctx.strokeStyle = 'rgba(180,150,80,0.07)';
        ctx.lineWidth   = 0.4;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  /* ════════════════════════════════════════
     DRAW PLANETS
     วนรอบ sun ช้ามาก
     active planet — glow สวยขึ้น label ชัดขึ้น
  ════════════════════════════════════════ */
  function drawPlanets(dt, t) {
    var sx = getSunX(), sy = getSunY();

    /* sort by y ให้ planet ที่อยู่หน้า render ทีหลัง */
    var items = PLANETS.map(function (p) {
      p.ang += p.spd * dt * 60;
      var orb = p.orb * W;
      var px  = sx + Math.cos(p.ang) * orb;
      var py  = sy + Math.sin(p.ang) * orb * TILT;
      return { p: p, x: px, y: py };
    }).sort(function (a, b) { return a.y - b.y; });

    items.forEach(function (item) {
      var p = item.p, x = item.x, y = item.y;

      /* ตัด planet ที่หายออกนอก strip */
      if (x < -20 || x > W + 20 || y < -10 || y > H + 10) return;

      var isActive = p.id === activeRoute;
      var haslabel = !!p.label;
      var sz = p.sz;
      var rc = p.r, gc = p.g, bc = p.b;

      /* ── GLOW / HALO ── */
      if (isActive || haslabel) {
        ctx.globalCompositeOperation = 'screen';
        var glowR = isActive ? sz * 7 : sz * 4;
        var glowA = isActive ? 0.35 : 0.12;
        var pulse = isActive ? 1 + Math.sin(t * 0.0015 + p.ang) * 0.08 : 1;
        var halo = ctx.createRadialGradient(x, y, 0, x, y, glowR * pulse);
        halo.addColorStop(0,   'rgba(' + rc + ',' + gc + ',' + bc + ',' + glowA + ')');
        halo.addColorStop(0.4, 'rgba(' + rc + ',' + gc + ',' + bc + ',' + (glowA * 0.25) + ')');
        halo.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(x, y, glowR * pulse, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }

      /* ── ATMOSPHERE ── */
      var atm = ctx.createRadialGradient(x, y, sz * 0.5, x, y, sz * 2.2);
      atm.addColorStop(0,   'rgba(' + rc + ',' + gc + ',' + bc + ',0)');
      atm.addColorStop(0.6, 'rgba(' + rc + ',' + gc + ',' + bc + ',0.06)');
      atm.addColorStop(1,   'rgba(' + rc + ',' + gc + ',' + bc + ',0.16)');
      ctx.beginPath(); ctx.arc(x, y, sz * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = atm; ctx.fill();

      /* ── BODY ── */
      var body = ctx.createRadialGradient(
        x - sz * 0.30, y - sz * 0.30, 0,
        x, y, sz
      );
      body.addColorStop(0,   'rgba(' + Math.min(255,rc+80) + ',' + Math.min(255,gc+70) + ',' + Math.min(255,bc+50) + ',0.96)');
      body.addColorStop(0.5, 'rgba(' + rc + ',' + gc + ',' + bc + ',0.97)');
      body.addColorStop(1,   'rgba(' + Math.round(rc*0.38) + ',' + Math.round(gc*0.32) + ',' + Math.round(bc*0.25) + ',1)');
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2);
      ctx.fillStyle = body; ctx.fill();

      /* ── SPECULAR ── */
      var spec = ctx.createRadialGradient(
        x - sz * 0.35, y - sz * 0.35, 0,
        x - sz * 0.35, y - sz * 0.35, sz * 0.55
      );
      spec.addColorStop(0, 'rgba(255,248,225,' + (isActive ? 0.50 : 0.28) + ')');
      spec.addColorStop(1, 'rgba(255,248,225,0)');
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2);
      ctx.fillStyle = spec; ctx.fill();

      /* ── LIMB DARKENING ── */
      var limb = ctx.createRadialGradient(x, y, sz * 0.2, x, y, sz * 1.05);
      limb.addColorStop(0,   'rgba(3,1,0,0)');
      limb.addColorStop(0.6, 'rgba(3,1,0,0.22)');
      limb.addColorStop(1,   'rgba(3,1,0,0.68)');
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2);
      ctx.fillStyle = limb; ctx.fill();

      /* ── LABEL ── */
      if (haslabel) {
        var fs = Math.max(6, Math.round(sz * 0.68));
        var labelA = isActive ? 0.90 : 0.38;
        ctx.save();
        if (isActive) {
          ctx.globalCompositeOperation = 'screen';
          ctx.shadowColor = 'rgba(' + rc + ',' + gc + ',' + bc + ',0.80)';
          ctx.shadowBlur  = 8;
        }
        ctx.fillStyle = 'rgba(' + rc + ',' + gc + ',' + bc + ',' + labelA + ')';
        ctx.font = '500 ' + fs + 'px "DM Mono",monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(p.label, x, y - sz - 5);
        ctx.restore();
      }
    });
  }

  /* ════════════════════════════════════════
     DRAW SUN — LYLA
     Heart of the decision universe
     อบอุ่น สว่าง มีน้ำหนัก
  ════════════════════════════════════════ */
  var _frame = 0;
  function drawSun(t) {
    var sx = getSunX(), sy = getSunY();
    var isThinking = _STATE.thinking;
    var R = Math.min(H * 0.52, 28); /* ขนาด sun ตาม strip height */
    var gm = isThinking ? 1 + Math.sin(t * 0.005) * 0.20 : 1;

    ctx.globalCompositeOperation = 'lighter';

    /* ── OUTER CORONA ── ขยายกว้างตามแนวนอน */
    var cor = ctx.createRadialGradient(sx, sy, R * 0.2, sx, sy, R * 10);
    cor.addColorStop(0,    PAL.sunHalo  + (0.22 * gm) + ')');
    cor.addColorStop(0.20, PAL.sunHalo  + (0.08 * gm) + ')');
    cor.addColorStop(0.55, PAL.sunCrona + (0.04 * gm) + ')');
    cor.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath();
    /* corona ellipse ขยายด้านข้าง */
    ctx.ellipse(sx, sy, R * 10, R * 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = cor; ctx.fill();

    /* ── RAYS ── หมุนช้า */
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(t * 0.000035);
    for (var i = 0; i < 12; i++) {
      var a  = (i / 12) * Math.PI * 2;
      var rl = R * (2.2 + 0.28 * Math.sin(i * 2.2 + t * 0.00025)) * gm;
      var gr = ctx.createLinearGradient(
        Math.cos(a) * R * 0.28, Math.sin(a) * R * 0.28,
        Math.cos(a) * rl, Math.sin(a) * rl
      );
      gr.addColorStop(0,   PAL.sunCore  + (0.22 * gm) + ')');
      gr.addColorStop(0.5, PAL.sunHalo  + '0.05)');
      gr.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.strokeStyle = gr;
      ctx.lineWidth   = 0.9;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * R * 0.28, Math.sin(a) * R * 0.28);
      ctx.lineTo(Math.cos(a) * rl, Math.sin(a) * rl);
      ctx.stroke();
    }
    ctx.restore();

    /* ── INNER HALO ── */
    var halo = ctx.createRadialGradient(sx, sy, R * 0.35, sx, sy, R * 2.8);
    halo.addColorStop(0,    PAL.sunCore  + '0.92)');
    halo.addColorStop(0.22, PAL.sunCore  + '0.65)');
    halo.addColorStop(0.55, PAL.sunHalo  + '0.22)');
    halo.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(sx, sy, R * 2.8, 0, Math.PI * 2);
    ctx.fillStyle = halo; ctx.fill();

    ctx.globalCompositeOperation = 'source-over';

    /* ── LOGO / PLANET BODY ── */
    var lr = R * 1.30;
    if (_logo && _logo.complete && _logo.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath(); ctx.arc(sx, sy, lr, 0, Math.PI * 2); ctx.clip();
      ctx.globalAlpha = 0.92;
      ctx.drawImage(_logo, sx - lr, sy - lr, lr * 2, lr * 2);
      ctx.restore(); ctx.globalAlpha = 1;
    } else {
      /* fallback circle */
      var fb = ctx.createRadialGradient(sx - R * 0.28, sy - R * 0.28, 0, sx, sy, R);
      fb.addColorStop(0, '#fffae0');
      fb.addColorStop(0.5, '#d4a840');
      fb.addColorStop(1, '#7a5010');
      ctx.beginPath(); ctx.arc(sx, sy, R, 0, Math.PI * 2);
      ctx.fillStyle = fb; ctx.fill();
    }

    /* ── LYLA LABEL ── */
    ctx.globalCompositeOperation = 'screen';
    ctx.shadowColor = 'rgba(220,185,95,0.65)';
    ctx.shadowBlur  = 9;
    ctx.fillStyle   = 'rgba(240,218,148,0.82)';
    ctx.font        = '500 ' + Math.max(7, Math.round(R * 0.44)) + 'px "DM Mono",monospace';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('LYLA ◈', sx, sy - lr - 5);
    ctx.shadowBlur  = 0;
    ctx.textBaseline = 'alphabetic';
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════════════════════════════════════
     OCCASIONAL SHOOTING STAR
     ช้า นาน ไม่บ่อย — เหมือน comet ผ่านชีวิต
  ════════════════════════════════════════ */
  var SHOOTS = [], nextShoot = 12000;
  function drawShoots(t, dt) {
    if (t > nextShoot) {
      var fl = Math.random() > 0.5;
      SHOOTS.push({
        x: fl ? -8 : W + 8,
        y: H * (0.08 + Math.random() * 0.84),
        vx: fl ? 1.2 + Math.random() * 1.6 : -(1.2 + Math.random() * 1.6),
        vy: (Math.random() - 0.5) * 0.5,
        life: 0, maxLife: 1.4 + Math.random() * 1.0,
        len: 40 + Math.random() * 60,
        al: 0.18 + Math.random() * 0.16,
      });
      nextShoot = t + 14000 + Math.random() * 22000;
    }
    for (var i = SHOOTS.length - 1; i >= 0; i--) {
      var s = SHOOTS[i];
      s.life += dt;
      if (s.life > s.maxLife) { SHOOTS.splice(i, 1); continue; }
      var prog = s.life / s.maxLife;
      var al = (prog < 0.12 ? prog / 0.12 : 1 - ((prog - 0.12) / 0.88)) * s.al;
      s.x += s.vx * dt * 60 * 0.014;
      s.y += s.vy * dt * 60 * 0.014;
      var x2 = s.x - s.vx * s.len * 0.014;
      var y2 = s.y - s.vy * s.len * 0.014;
      var gr = ctx.createLinearGradient(x2, y2, s.x, s.y);
      gr.addColorStop(0, 'rgba(230,210,155,0)');
      gr.addColorStop(0.55, 'rgba(235,215,160,' + (al * 0.28) + ')');
      gr.addColorStop(1,   'rgba(250,240,200,' + (al * 0.65) + ')');
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = gr; ctx.lineWidth = 0.75; ctx.stroke();
    }
  }

  /* ════════════════════════════════════════
     STATE
  ════════════════════════════════════════ */
  var _STATE = { thinking: false };

  /* ════════════════════════════════════════
     MAIN LOOP
  ════════════════════════════════════════ */
  function loop(ts) {
    if (!lastTime) lastTime = ts;
    var dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    _frame++;

    drawBg();
    drawStars(ts);
    drawShoots(ts, dt);
    drawOrbits();
    drawPlanets(dt, ts);
    drawSun(ts);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ════════════════════════════════════════
     PUBLIC API — compat กับ app.js เดิม
  ════════════════════════════════════════ */
  window.LYLA_thinking = function () { _STATE.thinking = true;  };
  window.LYLA_answered = function () { _STATE.thinking = false; };
  window.KD_pulse      = function (route) { _STATE.thinking = false; if (route) activeRoute = route; };
  window.KD_setRoute   = function (route) { activeRoute = route; };
  window.KD_council    = function () { _STATE.thinking = true;  };
  window.KD_councilEnd = function () { _STATE.thinking = false; };

  window.KD.safeVal = function (v, d) {
    var n = +v, dec = typeof d === 'number' ? d : 2;
    return (isFinite(n) && !isNaN(n)) ? n.toFixed(dec) : '0.00';
  };

})();
