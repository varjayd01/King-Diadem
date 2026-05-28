/**
 * KING DIADEM — galaxy_scene.js v4.0
 * ระบบสุริยะเหมือนจริง มองจากยานอวกาศที่บินออกไปขอบกาแลคซี่
 * 360° orbit · ทางช้างเผือก · ดาวเคราะห์มีชื่อตาม KING DIADEM Axes
 * Pure Canvas2D — ไม่ใช้ Three.js
 */
(function () {
  var cv = document.getElementById('galaxy');
  if (!cv) return;
  var ctx = cv.getContext('2d', { alpha: false });
  var W, H, CX, CY;

  /* ── resize ── */
  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    CX = W * 0.50;
    CY = H * 0.46;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ══════════════════════════════════════════════════
     CAMERA — ยานอวกาศโคจรรอบระบบสุริยะ 360°
     ══════════════════════════════════════════════════ */
  var CAM = {
    yaw:   0.0,   /* หมุนรอบแกน Y (azimuth) */
    pitch: 0.28,  /* เอียงขึ้น-ลง (elevation) */
    dist:  1.0,   /* ระยะห่างปกติ */
    fov:   520,   /* focal length */
    autoYaw: true
  };

  /* touch / mouse drag */
  var drag = { on: false, x: 0, y: 0 };
  cv.addEventListener('mousedown',  function(e){ drag.on=true; drag.x=e.clientX; drag.y=e.clientY; CAM.autoYaw=false; });
  cv.addEventListener('mousemove',  function(e){ if(!drag.on)return; CAM.yaw   -=(e.clientX-drag.x)*0.005; CAM.pitch +=(e.clientY-drag.y)*0.003; CAM.pitch=Math.max(-.6,Math.min(.8,CAM.pitch)); drag.x=e.clientX; drag.y=e.clientY; });
  cv.addEventListener('mouseup',    function(){ drag.on=false; });
  cv.addEventListener('mouseleave', function(){ drag.on=false; });
  cv.addEventListener('touchstart', function(e){ drag.on=true; drag.x=e.touches[0].clientX; drag.y=e.touches[0].clientY; CAM.autoYaw=false; e.preventDefault(); },{passive:false});
  cv.addEventListener('touchmove',  function(e){ if(!drag.on)return; CAM.yaw   -=(e.touches[0].clientX-drag.x)*0.005; CAM.pitch +=(e.touches[0].clientY-drag.y)*0.003; CAM.pitch=Math.max(-.6,Math.min(.8,CAM.pitch)); drag.x=e.touches[0].clientX; drag.y=e.touches[0].clientY; e.preventDefault(); },{passive:false});
  cv.addEventListener('touchend',   function(){ drag.on=false; });
  cv.addEventListener('wheel',      function(e){ CAM.fov=Math.max(180,Math.min(900,CAM.fov+e.deltaY*0.4)); e.preventDefault(); },{passive:false});

  /* ── 3D → 2D projection ── */
  function project(x, y, z) {
    /* rotate yaw */
    var cy = Math.cos(CAM.yaw), sy = Math.sin(CAM.yaw);
    var rx = x * cy - z * sy;
    var rz = x * sy + z * cy;
    /* rotate pitch */
    var cp = Math.cos(CAM.pitch), sp = Math.sin(CAM.pitch);
    var ry2 = y * cp - rz * sp;
    var rz2 = y * sp + rz * cp;
    /* perspective */
    var dist = rz2 + CAM.fov * 1.4;
    if (dist < 10) return null;
    var scale = CAM.fov / dist;
    return { x: CX + rx * scale, y: CY - ry2 * scale, z: dist, scale: scale };
  }

  /* ══════════════════════════════════════════════════
     MILKY WAY — แกนกาแลคซี่ชื่อตาม KING DIADEM
     ══════════════════════════════════════════════════ */
  var GALAXY_ARMS = [
    /* arm label · color · stars */
    { name: 'DriftZero Arm',   hue: 210, count: 1800 },
    { name: 'Waterline Arm',   hue: 185, count: 1600 },
    { name: 'FATE Arm',        hue: 260, count: 1400 },
    { name: 'LYLA Arm',        hue: 170, count: 1200 },
  ];

  var MW_STARS = [];
  GALAXY_ARMS.forEach(function(arm, ai) {
    var baseAngle = (ai / GALAXY_ARMS.length) * Math.PI * 2;
    for (var i = 0; i < arm.count; i++) {
      var r     = 600 + Math.random() * 2200;
      var theta = baseAngle + (r / 400) + (Math.random() - .5) * 1.2;
      var spread = 60 + r * 0.06;
      var off_y  = (Math.random() - .5) * spread * 0.18;
      var off_xz = (Math.random() - .5) * spread;
      MW_STARS.push({
        x: Math.cos(theta) * r + off_xz,
        y: off_y,
        z: Math.sin(theta) * r + off_xz * .3,
        s: .3 + Math.random() * 1.4,
        a: .15 + Math.random() * .65,
        hue: arm.hue + (Math.random() - .5) * 30,
        arm: ai
      });
    }
  });
  /* background stars — กระจายทั่ว */
  for (var i = 0; i < 3000; i++) {
    var r = 2500 + Math.random() * 5000;
    var th = Math.random() * Math.PI * 2;
    var ph = (Math.random() - .5) * Math.PI;
    MW_STARS.push({
      x: r * Math.cos(th) * Math.cos(ph),
      y: r * Math.sin(ph) * 0.12,
      z: r * Math.sin(th) * Math.cos(ph),
      s: .2 + Math.random() * .8,
      a: .08 + Math.random() * .3,
      hue: 200 + Math.random() * 60,
      arm: -1
    });
  }

  /* ══════════════════════════════════════════════════
     SOLAR SYSTEM — ดาวเคราะห์จริง + ชื่อ KING DIADEM
     ══════════════════════════════════════════════════ */
  var SUN_R = 22;

  /* ระยะห่างและขนาดสเกลตามจริง (simplified) */
  var PLANETS = [
    {
      name: 'Mercury · Black Hole Axis',
      realName: 'Mercury',
      orbit: 58,   r: 3.2,  speed: 4.15,  tilt: 0.03,
      rgb: [180, 175, 170], ring: false,
      ph: Math.random() * Math.PI * 2,
      desc: 'Axis 1 — Existence'
    },
    {
      name: 'Venus · Dark Energy',
      realName: 'Venus',
      orbit: 108,  r: 5.5,  speed: 1.62,  tilt: 0.04,
      rgb: [220, 195, 140], ring: false,
      ph: Math.random() * Math.PI * 2,
      desc: 'Axis 2 — System Failure'
    },
    {
      name: 'Earth · Zero Kelvin',
      realName: 'Earth',
      orbit: 150,  r: 5.8,  speed: 1.00,  tilt: 0.41,
      rgb: [60, 130, 200], ring: false,
      ph: Math.random() * Math.PI * 2,
      desc: 'Axis 3 — Minimum Existence',
      moon: { orbit: 14, r: 1.6, speed: 13.37, ph: 0 }
    },
    {
      name: 'Mars · Universe',
      realName: 'Mars',
      orbit: 228,  r: 4.2,  speed: 0.53,  tilt: 0.44,
      rgb: [200, 100, 70], ring: false,
      ph: Math.random() * Math.PI * 2,
      desc: 'Axis 4 — Authority Nullification'
    },
    {
      name: 'Jupiter · Titan Force',
      realName: 'Jupiter',
      orbit: 380,  r: 14.0, speed: 0.084, tilt: 0.05,
      rgb: [210, 185, 150], ring: false,
      ph: Math.random() * Math.PI * 2,
      desc: 'Axis 5 — Intervention'
    },
    {
      name: 'Saturn · Summer Triangle',
      realName: 'Saturn',
      orbit: 480,  r: 11.5, speed: 0.034, tilt: 0.47,
      rgb: [220, 200, 160], ring: true,
      ph: Math.random() * Math.PI * 2,
      desc: 'Axis 6 — Silence'
    },
    {
      name: 'Uranus · Cosmic Latte',
      realName: 'Uranus',
      orbit: 580,  r: 8.0,  speed: 0.012, tilt: 1.71,
      rgb: [140, 200, 215], ring: true,
      ph: Math.random() * Math.PI * 2,
      desc: 'Axis 7 — Non-Ownership'
    },
    {
      name: 'Neptune · Creator Shadow',
      realName: 'Neptune',
      orbit: 660,  r: 7.5,  speed: 0.006, tilt: 0.49,
      rgb: [60, 100, 220], ring: false,
      ph: Math.random() * Math.PI * 2,
      desc: 'Axis 8 — Maskless Design'
    },
  ];

  /* asteroid belt */
  var BELT = [];
  for (var i = 0; i < 600; i++) {
    var ba = Math.random() * Math.PI * 2;
    var br = 290 + Math.random() * 60;
    var by = (Math.random() - .5) * 8;
    BELT.push({ a: ba, r: br, y: by, sp: .0002 + Math.random() * .0003, s: .8 + Math.random() * 1.2 });
  }

  /* ── planet position at time t ── */
  function planetPos(p, t) {
    var a = p.ph + t * p.speed * 0.00008;
    return {
      x: Math.cos(a) * p.orbit,
      y: Math.sin(a) * p.orbit * Math.sin(p.tilt) * .15,
      z: Math.sin(a) * p.orbit,
      a: a
    };
  }

  /* ── draw orbit ring ── */
  function drawOrbitRing(orbit, tilt, segments) {
    segments = segments || 120;
    var pts = [];
    for (var i = 0; i <= segments; i++) {
      var a = (i / segments) * Math.PI * 2;
      var p = project(
        Math.cos(a) * orbit,
        Math.sin(a) * orbit * Math.sin(tilt) * .15,
        Math.sin(a) * orbit
      );
      if (p) pts.push(p);
    }
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
    ctx.strokeStyle = 'rgba(160,170,200,.10)';
    ctx.lineWidth = .7;
    ctx.stroke();
  }

  /* ── draw planet ── */
  function drawPlanet(p3d, r, rgb, ring, tilt, name, desc) {
    var pp = project(p3d.x, p3d.y, p3d.z);
    if (!pp || pp.z < 0) return;
    var pr = Math.max(.8, r * pp.scale * .18);

    /* glow */
    var glow = ctx.createRadialGradient(pp.x, pp.y, 0, pp.x, pp.y, pr * 4.5);
    glow.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',.28)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(pp.x, pp.y, pr * 4.5, 0, Math.PI * 2);
    ctx.fillStyle = glow; ctx.fill();

    /* saturn rings */
    if (ring) {
      ctx.save();
      ctx.translate(pp.x, pp.y);
      ctx.scale(1, .32 + Math.abs(Math.sin(CAM.pitch)) * .3);
      ctx.strokeStyle = 'rgba(200,190,160,.42)'; ctx.lineWidth = pr * 1.1;
      ctx.beginPath(); ctx.arc(0, 0, pr * 2.4, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(180,170,140,.22)'; ctx.lineWidth = pr * .6;
      ctx.beginPath(); ctx.arc(0, 0, pr * 2.0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    /* planet body */
    var sunDir = project(-SUN_R, 0, 0);
    var lx = sunDir ? (sunDir.x - pp.x) : -1;
    var ly = sunDir ? (sunDir.y - pp.y) : 0;
    var ld = Math.sqrt(lx * lx + ly * ly) || 1;
    lx /= ld; ly /= ld;
    var lit = ctx.createRadialGradient(
      pp.x + lx * pr * .6, pp.y + ly * pr * .6, pr * .05,
      pp.x, pp.y, pr * 1.1
    );
    lit.addColorStop(0, 'rgba(255,255,255,.90)');
    lit.addColorStop(.3, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',1)');
    lit.addColorStop(1, 'rgba(' + Math.floor(rgb[0]*.2) + ',' + Math.floor(rgb[1]*.2) + ',' + Math.floor(rgb[2]*.2) + ',1)');
    ctx.beginPath(); ctx.arc(pp.x, pp.y, pr, 0, Math.PI * 2);
    ctx.fillStyle = lit; ctx.fill();

    /* label — แสดงเมื่อดาวใหญ่พอ */
    if (pr > 3.5) {
      ctx.fillStyle = 'rgba(180,190,210,.65)';
      ctx.font = 'bold ' + Math.max(9, Math.min(13, pr * 1.6)) + 'px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(name.split('·')[0].trim(), pp.x, pp.y - pr - 5);
    }
  }

  /* ── draw moon ── */
  function drawMoon(parentPos, moon, t) {
    var ma = moon.ph + t * moon.speed * 0.00008;
    var mx = parentPos.x + Math.cos(ma) * moon.orbit;
    var my = parentPos.y;
    var mz = parentPos.z + Math.sin(ma) * moon.orbit;
    var mp = project(mx, my, mz);
    if (!mp) return;
    var mr = Math.max(.4, 1.6 * mp.scale * .18);
    ctx.beginPath(); ctx.arc(mp.x, mp.y, mr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(190,195,205,.85)'; ctx.fill();
  }

  /* ══════════════════════════════════════════════════
     STARS & NEBULA
     ══════════════════════════════════════════════════ */
  var BG_STARS = [];
  for (var i = 0; i < 5000; i++) {
    BG_STARS.push({
      x: (Math.random() - .5) * W * 3,
      y: (Math.random() - .5) * H * 3,
      s: .2 + Math.pow(Math.random(), 2) * 1.8,
      a: .2 + Math.random() * .7,
      tw: Math.random() * Math.PI * 2,
      sp: .005 + Math.random() * .02
    });
  }

  /* ══════════════════════════════════════════════════
     DRAW FUNCTIONS
     ══════════════════════════════════════════════════ */
  function drawBackground() {
    ctx.fillStyle = '#06060e';
    ctx.fillRect(0, 0, W, H);
  }

  function drawMilkyWay(t) {
    /* กาแลคซี่ที่ถูก project จาก 3D */
    var visible = [];
    for (var i = 0; i < MW_STARS.length; i++) {
      var s = MW_STARS[i];
      var pp = project(s.x, s.y, s.z);
      if (!pp || pp.z < 0) continue;
      visible.push({ pp: pp, s: s });
    }
    /* sort by z */
    visible.sort(function(a,b){ return b.pp.z - a.pp.z; });

    for (var i = 0; i < visible.length; i++) {
      var v = visible[i];
      var pp = v.pp, s = v.s;
      var sc = Math.max(.25, s.s * Math.min(1, 600 / pp.z));
      var tw = .5 + .5 * Math.sin(t * s.sp + s.tw);
      var al = s.a * (.7 + .3 * tw) * Math.min(1, 400 / pp.z);
      if (al < .03) continue;

      var r, g, b;
      if (s.hue < 195) { r=180; g=205; b=255; }       /* ฟ้า */
      else if (s.hue < 220) { r=200; g=218; b=255; }   /* ขาวฟ้า */
      else { r=220; g=215; b=255; }                     /* ม่วงอ่อน */

      ctx.beginPath();
      ctx.arc(pp.x, pp.y, sc, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + al + ')';
      ctx.fill();
    }

    /* nebula glow — วาดบน canvas ปกติ (2D overlay) */
    var nebulas = [
      { x: W * .15, y: H * .20, r: Math.max(W,H)*.40, c: 'rgba(80,60,180,.06)' },
      { x: W * .82, y: H * .22, r: Math.max(W,H)*.38, c: 'rgba(255,80,30,.05)' },
      { x: W * .50, y: H * .72, r: Math.max(W,H)*.55, c: 'rgba(30,160,150,.05)' },
      { x: W * .30, y: H * .55, r: Math.max(W,H)*.32, c: 'rgba(140,60,220,.04)' },
    ];
    ctx.globalCompositeOperation = 'screen';
    nebulas.forEach(function(n) {
      var gr = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      gr.addColorStop(0, n.c); gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.ellipse(n.x, n.y, n.r, n.r * .55, .45, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawSun() {
    var sp = project(0, 0, 0);
    if (!sp) return;
    var sr = Math.max(12, SUN_R * sp.scale * .22);

    /* corona rays */
    ctx.save(); ctx.translate(sp.x, sp.y);
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 36; i++) {
      var a = (i / 36) * Math.PI * 2;
      var w = sr * (2.0 + .5 * Math.sin(i * 2.1));
      var grd = ctx.createLinearGradient(
        Math.cos(a) * sr * .2, Math.sin(a) * sr * .2,
        Math.cos(a) * w, Math.sin(a) * w
      );
      grd.addColorStop(0, 'rgba(255,240,200,.28)');
      grd.addColorStop(.4, 'rgba(255,140,40,.08)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = grd; ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*sr*.2, Math.sin(a)*sr*.2);
      ctx.lineTo(Math.cos(a)*w, Math.sin(a)*w);
      ctx.stroke();
    }
    ctx.restore(); ctx.globalCompositeOperation = 'source-over';

    /* halo */
    var cor = ctx.createRadialGradient(sp.x, sp.y, sr*.05, sp.x, sp.y, sr*2.2);
    cor.addColorStop(0,   'rgba(255,255,252,.95)');
    cor.addColorStop(.08, '#ffe8a0');
    cor.addColorStop(.22, '#ffb035');
    cor.addColorStop(.45, '#ff5515');
    cor.addColorStop(.72, 'rgba(160,30,0,.08)');
    cor.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath(); ctx.arc(sp.x, sp.y, sr * 2.1, 0, Math.PI * 2);
    ctx.fillStyle = cor; ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    /* core */
    var core = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sr * .65);
    core.addColorStop(0, '#fffef8');
    core.addColorStop(.25, '#ffd060');
    core.addColorStop(.6,  '#ff6e0e');
    core.addColorStop(1,   '#780c00');
    ctx.beginPath(); ctx.arc(sp.x, sp.y, sr * .60, 0, Math.PI * 2);
    ctx.fillStyle = core; ctx.fill();

    /* label */
    if (sr > 8) {
      ctx.fillStyle = 'rgba(255,210,120,.7)';
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LYLA · SOL', sp.x, sp.y - sr - 7);
    }
  }

  function drawAsteroidBelt(t) {
    for (var i = 0; i < BELT.length; i++) {
      var ro = BELT[i];
      ro.a += ro.sp;
      var bx = Math.cos(ro.a) * ro.r;
      var bz = Math.sin(ro.a) * ro.r;
      var pp = project(bx, ro.y, bz);
      if (!pp) continue;
      var bs = Math.max(.3, ro.s * pp.scale * .15);
      ctx.beginPath(); ctx.arc(pp.x, pp.y, bs, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(160,155,145,.35)'; ctx.fill();
    }
  }

  /* ── arm labels ── */
  function drawArmLabels() {
    GALAXY_ARMS.forEach(function(arm, ai) {
      var baseAngle = (ai / GALAXY_ARMS.length) * Math.PI * 2;
      var r = 1400;
      var lx = Math.cos(baseAngle + .3) * r;
      var lz = Math.sin(baseAngle + .3) * r;
      var pp = project(lx, 0, lz);
      if (!pp) return;
      ctx.fillStyle = 'rgba(160,175,220,.28)';
      ctx.font = '9px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(arm.name, pp.x, pp.y);
    });
  }

  /* ══════════════════════════════════════════════════
     MAIN LOOP
     ══════════════════════════════════════════════════ */
  function frame(t) {
    /* auto rotate camera */
    if (CAM.autoYaw) {
      CAM.yaw += 0.00015;
    }

    drawBackground();
    drawMilkyWay(t);
    drawArmLabels();

    /* orbit rings */
    PLANETS.forEach(function(p) {
      drawOrbitRing(p.orbit, p.tilt);
    });

    /* collect planets by depth for sorting */
    var planetsWithDepth = PLANETS.map(function(p) {
      var pos = planetPos(p, t);
      var pp = project(pos.x, pos.y, pos.z);
      return { p: p, pos: pos, pp: pp, z: pp ? pp.z : 999999 };
    }).sort(function(a, b) { return b.z - a.z; });

    /* asteroid belt */
    drawAsteroidBelt(t);

    /* draw planets back-to-front */
    planetsWithDepth.forEach(function(pd) {
      drawPlanet(pd.pos, pd.p.r, pd.p.rgb, pd.p.ring, pd.p.tilt, pd.p.name, pd.p.desc);
      if (pd.p.moon) drawMoon(pd.pos, pd.p.moon, t);
    });

    /* sun last (always on top) */
    drawSun();

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  /* ── export pulse for run() ── */
  window.KD_pulse = function(route) {
    /* brief flash effect on route change */
    var colors = {
      crisis:   [255, 80,  80],
      vega:     [200,170, 255],
      survival: [80,  220,160],
      collapse: [255,130, 60],
    };
    /* no-op visual: handled by galaxy animation naturally */
  };
})();
