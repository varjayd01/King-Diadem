/* ============================================================
   galaxy_scene.js — KING DIADEM · SOLAR SYSTEM v5.0
   Full volumetric sun · 3D tilted orbits · long trails
   ============================================================ */
(function () {
  var canvas = document.getElementById('galaxy');
  if (!canvas) return;
  var ctx = canvas.getContext('2d', { alpha: false });
  var W, H, cx, cy, S;
  var t0 = performance.now();

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W * 0.50;
    cy = H * 0.46;
    S = Math.min(W, H) * 0.44;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Stars ──────────────────────────────────────────────── */
  var STAR_N = Math.min(6000, 3000 + Math.floor((W * H) / 2800));
  var stars = Array.from({ length: STAR_N }, function () {
    var z = 0.05 + Math.random() * 0.95;
    var layer = z < 0.3 ? 0 : z < 0.65 ? 1 : 2;
    return {
      x: Math.random(), y: Math.random(), z: z, layer: layer,
      s: 0.35 + Math.pow(Math.random(), 1.1) * 3.2,
      tw: Math.random() * Math.PI * 2,
      sp: 0.006 + Math.random() * 0.04,
      warm: Math.random() > 0.44,
      bloom: Math.random() > 0.88
    };
  });

  /* ── ORBIT NODES (LYLA Kernels) ─────────────────────────── */
  /* tilt: orbit plane tilt in radians (0=flat, PI/2=edge-on) */
  /* inc: inclination direction */
  var NODES = [
    { label: 'WATERLINE', key: 'K5',  color: [45, 212, 191],  a: 0.13, b: 0.115, tilt: 0.38, inc: 0.2,  period: 9000,  phase: 0,    r: 7,  desc: 'ฐานขั้นต่ำ\nTreat · Trace · Stop',           ring: false },
    { label: 'STOP LINE', key: 'K13', color: [255, 70, 70],   a: 0.21, b: 0.185, tilt: 0.52, inc: 2.8,  period: 14000, phase: 1.2,  r: 5.5,desc: 'หยุดระบบทันที\nHarm → HALT',                  ring: false },
    { label: 'STABILITY', key: 'K11', color: [232, 192, 120], a: 0.31, b: 0.255, tilt: 0.28, inc: 5.5,  period: 22000, phase: 2.5,  r: 8.5,desc: 'เสถียรก่อน optimize\nStabilize before improve', ring: true  },
    { label: 'AUDIT',     key: 'K10', color: [160, 130, 255], a: 0.41, b: 0.33,  tilt: 0.62, inc: 1.0,  period: 32000, phase: 0.8,  r: 6,  desc: 'หลักฐานก่อนเชื่อ\nEvidence, not narrative',    ring: false },
    { label: 'COMPASSION',key: 'K2',  color: [255, 145, 55],  a: 0.52, b: 0.41,  tilt: 0.19, inc: 3.7,  period: 47000, phase: 3.2,  r: 7,  desc: 'ลดอันตราย default\nWho suffers if wrong?',     ring: false },
    { label: 'ENTROPY',   key: 'DHD', color: [160, 200, 255], a: 0.64, b: 0.495, tilt: 0.72, inc: 0.6,  period: 66000, phase: 1.9,  r: 5,  desc: '0.1% drift รายวัน\nMeasure drift, not narrative', ring: false },
    { label: 'RESTORE',   key: 'K6',  color: [80, 255, 168],  a: 0.79, b: 0.595, tilt: 0.44, inc: 4.1,  period: 92000, phase: 4.3,  r: 6,  desc: 'ซ่อมก่อน normalize\nRepair harm first',         ring: false },
  ];

  /* ── Asteroid belt ──────────────────────────────────────── */
  var BELT = Array.from({ length: 460 }, function () {
    return {
      g: 0.27 + Math.random() * 0.14,
      ph: Math.random() * Math.PI * 2,
      sp: 0.000018 + Math.random() * 0.00005,
      sz: 0.4 + Math.random() * 2.8,
      tilt: 0.22 + Math.random() * 0.18,
      bright: Math.random()
    };
  });

  /* ── Pulses ─────────────────────────────────────────────── */
  var pulses = [];
  window.KD_pulse = function (label) {
    for (var i = 0; i < 6; i++) {
      (function (ii) {
        setTimeout(function () {
          pulses.push({ x: cx, y: cy, r: 0, maxR: S * (0.35 + ii * 0.14), alpha: 0.9 - ii * 0.1, color: ii % 2 === 0 ? [232, 192, 120] : [45, 212, 191] });
        }, ii * 65);
      })(i);
    }
  };

  /* ── Mouse ──────────────────────────────────────────────── */
  var mx = -9999, my = -9999;
  canvas.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
  canvas.addEventListener('click', function (e) {
    var ts = performance.now() - t0;
    for (var i = 0; i < NODES.length; i++) {
      var pos = nodeXY(NODES[i], ts);
      if (Math.hypot(e.clientX - pos.x, e.clientY - pos.y) < NODES[i].r * 4) {
        window.KD_pulse(NODES[i].label);
        break;
      }
    }
  });

  /* ── 3D orbit projection ────────────────────────────────── */
  /* Each orbit is a tilted ellipse. We simulate perspective by
     compressing the y-axis by cos(tilt) and shifting z-depth. */
  function nodeXY(n, ts) {
    var ang = (ts / n.period) * Math.PI * 2 + n.phase;
    var cosA = Math.cos(ang), sinA = Math.sin(ang);
    /* ellipse in orbital plane */
    var ox = cosA * n.a * S;
    var oy = sinA * n.b * S;
    /* tilt around X-axis by n.tilt, rotated by n.inc */
    var ti = n.tilt, ni = n.inc;
    var rx = ox * Math.cos(ni) - oy * Math.sin(ni);
    var ry = ox * Math.sin(ni) + oy * Math.cos(ni);
    var rz = ry * Math.sin(ti);
    var py = ry * Math.cos(ti);
    /* perspective scale (very subtle) */
    var perspScale = 1 + rz / (S * 4.5);
    return {
      x: cx + rx * perspScale,
      y: cy + py * perspScale,
      z: rz,
      ang: ang,
      scale: perspScale
    };
  }

  /* orbit path: draw the actual 3D-projected ellipse as 180 segments */
  function drawOrbitPath(n) {
    ctx.beginPath();
    for (var k = 0; k <= 180; k++) {
      var ang = (k / 180) * Math.PI * 2;
      var cosA = Math.cos(ang), sinA = Math.sin(ang);
      var ox = cosA * n.a * S;
      var oy = sinA * n.b * S;
      var ti = n.tilt, ni = n.inc;
      var rx = ox * Math.cos(ni) - oy * Math.sin(ni);
      var ry = ox * Math.sin(ni) + oy * Math.cos(ni);
      var rz = ry * Math.sin(ti);
      var py = ry * Math.cos(ti);
      var ps = 1 + rz / (S * 4.5);
      if (k === 0) ctx.moveTo(cx + rx * ps, cy + py * ps);
      else ctx.lineTo(cx + rx * ps, cy + py * ps);
    }
    ctx.closePath();
  }

  /* ── DRAW FUNCTIONS ─────────────────────────────────────── */

  function drawBackground() {
    ctx.fillStyle = '#010009';
    ctx.fillRect(0, 0, W, H);
  }

  function drawMilkyBand(ts) {
    ctx.save();
    ctx.translate(W * 0.18, H * 0.05);
    ctx.rotate(-0.38 + Math.sin(ts * 0.000018) * 0.01);
    var bw = Math.max(W, H) * 2.0, bh = H * 0.62;
    ctx.globalCompositeOperation = 'screen';
    var g = ctx.createLinearGradient(0, -bh * 0.5, 0, bh * 0.5);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.25, 'rgba(100,60,180,0.14)');
    g.addColorStop(0.48, 'rgba(25,180,165,0.18)');
    g.addColorStop(0.62, 'rgba(240,150,80,0.14)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-bw * 0.15, -bh, bw, bh * 2);
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawNebula() {
    var blobs = [
      { ox: 0.30, oy: 0.65, r: 0.48, c: 'rgba(40,200,180,0.22)' },
      { ox: 0.75, oy: 0.25, r: 0.38, c: 'rgba(255,90,35,0.20)' },
      { ox: 0.50, oy: 0.48, r: 0.82, c: 'rgba(110,55,200,0.13)' },
      { ox: 0.10, oy: 0.32, r: 0.30, c: 'rgba(255,165,75,0.18)' },
      { ox: 0.85, oy: 0.62, r: 0.28, c: 'rgba(55,130,255,0.16)' },
      { ox: 0.06, oy: 0.82, r: 0.34, c: 'rgba(190,70,255,0.14)' },
    ];
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i], nx = b.ox * W, ny = b.oy * H, rad = Math.max(W, H) * b.r;
      var gr = ctx.createRadialGradient(nx, ny, 0, nx, ny, rad);
      gr.addColorStop(0, b.c);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.ellipse(nx, ny, rad * 0.80, rad * 0.50, 0.42, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawStars(ts) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var par = s.layer === 0 ? 0.009 : s.layer === 1 ? 0.020 : 0.036;
      var px = ((s.x + ts * 0.000013 * par) % 1 + 1) % 1 * W, py = s.y * H;
      var tw = 0.5 + 0.5 * Math.sin(ts * s.sp + s.tw);
      var sc = Math.max(0.35, s.s * s.z * tw);
      var al = Math.min(1, 0.18 + 0.82 * s.z * tw);
      var r = s.warm ? 255 : 200 - Math.floor(28 * s.z);
      var g = s.warm ? 225 - Math.floor(38 * s.z) : 230 - Math.floor(18 * s.z);
      var b = s.warm ? 180 - Math.floor(75 * s.z) : 255;
      ctx.beginPath();
      ctx.arc(px, py, sc, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + al + ')';
      ctx.fill();
      /* bright star cross-bloom */
      if (s.bloom && s.z > 0.82 && tw > 0.80) {
        var bloomLen = sc * 3.2;
        ctx.strokeStyle = 'rgba(255,252,240,' + (0.18 * al) + ')';
        ctx.lineWidth = 0.45;
        ctx.beginPath();
        ctx.moveTo(px - bloomLen, py); ctx.lineTo(px + bloomLen, py);
        ctx.moveTo(px, py - bloomLen); ctx.lineTo(px, py + bloomLen);
        ctx.stroke();
      }
    }
  }

  /* ── VOLUMETRIC SUN ─────────────────────────────────────── */
  function drawSun(ts) {
    var beat = 1 + 0.038 * Math.sin(ts * 0.00088) + 0.018 * Math.sin(ts * 0.00214);
    var R = S * 0.148 * beat;

    /* ── 1. Outer diffuse corona (very large, very faint) ── */
    ctx.globalCompositeOperation = 'screen';
    var outerCorona = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 5.5);
    outerCorona.addColorStop(0, 'rgba(255,180,80,0.12)');
    outerCorona.addColorStop(0.3, 'rgba(255,80,20,0.06)');
    outerCorona.addColorStop(0.7, 'rgba(120,30,0,0.025)');
    outerCorona.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(cx, cy, R * 5.5, 0, Math.PI * 2);
    ctx.fillStyle = outerCorona; ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    /* ── 2. Corona ray spikes ── */
    ctx.save();
    ctx.translate(cx, cy);
    var rot1 = (ts / 85000) * Math.PI * 2;
    var rot2 = -(ts / 120000) * Math.PI * 2;

    /* outer long rays */
    ctx.globalCompositeOperation = 'lighter';
    ctx.save(); ctx.rotate(rot1);
    for (var i = 0; i < 24; i++) {
      var a = (i / 24) * Math.PI * 2;
      var rayLen = R * (2.4 + 0.55 * Math.sin(i * 2.3 + ts * 0.00018));
      var grd = ctx.createLinearGradient(
        Math.cos(a) * R * 0.25, Math.sin(a) * R * 0.25,
        Math.cos(a) * rayLen, Math.sin(a) * rayLen
      );
      grd.addColorStop(0, 'rgba(255,200,100,0.32)');
      grd.addColorStop(0.35, 'rgba(255,100,30,0.11)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = grd; ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * R * 0.25, Math.sin(a) * R * 0.25);
      ctx.lineTo(Math.cos(a) * rayLen, Math.sin(a) * rayLen);
      ctx.stroke();
    }
    ctx.restore();
    /* inner short bright rays */
    ctx.save(); ctx.rotate(rot2);
    for (var i = 0; i < 48; i++) {
      var a = (i / 48) * Math.PI * 2;
      var rayLen = R * (1.25 + 0.22 * Math.sin(i * 3.1 + ts * 0.00032));
      var grd = ctx.createLinearGradient(
        Math.cos(a) * R * 0.6, Math.sin(a) * R * 0.6,
        Math.cos(a) * rayLen, Math.sin(a) * rayLen
      );
      grd.addColorStop(0, 'rgba(255,240,180,0.45)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = grd; ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * R * 0.6, Math.sin(a) * R * 0.6);
      ctx.lineTo(Math.cos(a) * rayLen, Math.sin(a) * rayLen);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';

    /* ── 3. Mid corona glowing shell ── */
    ctx.globalCompositeOperation = 'screen';
    var midCor = ctx.createRadialGradient(0, 0, R * 0.55, 0, 0, R * 2.6);
    midCor.addColorStop(0, 'rgba(255,255,240,0.88)');
    midCor.addColorStop(0.06, 'rgba(255,210,110,0.78)');
    midCor.addColorStop(0.20, 'rgba(255,130,40,0.50)');
    midCor.addColorStop(0.44, 'rgba(200,50,10,0.22)');
    midCor.addColorStop(0.72, 'rgba(80,8,0,0.08)');
    midCor.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(0, 0, R * 2.6, 0, Math.PI * 2);
    ctx.fillStyle = midCor; ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    /* ── 4. Chromosphere (subtle limb brightening ring) ── */
    ctx.globalCompositeOperation = 'screen';
    var limb = ctx.createRadialGradient(0, 0, R * 0.72, 0, 0, R * 1.04);
    limb.addColorStop(0, 'rgba(255,180,80,0)');
    limb.addColorStop(0.7, 'rgba(255,160,60,0.28)');
    limb.addColorStop(1, 'rgba(255,80,10,0.55)');
    ctx.beginPath(); ctx.arc(0, 0, R * 1.04, 0, Math.PI * 2);
    ctx.fillStyle = limb; ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    /* ── 5. Photosphere (main solar disk) ── */
    /* limb darkening: edge darker than center — realistic */
    var core = ctx.createRadialGradient(-R * 0.22, -R * 0.22, 0, 0, 0, R);
    core.addColorStop(0, '#fffef6');
    core.addColorStop(0.12, '#fff5d0');
    core.addColorStop(0.32, '#ffd870');
    core.addColorStop(0.56, '#ff9020');
    core.addColorStop(0.78, '#e03a00');
    core.addColorStop(0.92, '#7a1000');
    core.addColorStop(1, '#3a0800');
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = core; ctx.fill();

    /* ── 6. Surface convection cells (subtle texture) ── */
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.22;
    for (var i = 0; i < 7; i++) {
      var ca = (i / 7) * Math.PI * 2 + ts * 0.00004;
      var cr = R * (0.15 + 0.35 * (i % 3) / 3);
      var cellGrd = ctx.createRadialGradient(
        Math.cos(ca) * cr, Math.sin(ca) * cr, 0,
        Math.cos(ca) * cr, Math.sin(ca) * cr, R * 0.22
      );
      cellGrd.addColorStop(0, 'rgba(255,240,180,0.6)');
      cellGrd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(Math.cos(ca) * cr, Math.sin(ca) * cr, R * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = cellGrd; ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    /* ── 7. LYLA label ── */
    ctx.fillStyle = 'rgba(255,240,200,0.60)';
    ctx.font = 'bold ' + Math.max(9, Math.floor(R * 0.30)) + 'px "Share Tech Mono",monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('LYLA', 0, 0);

    ctx.restore();

    /* ── 8. Concentric faint rings (resonance) ── */
    ctx.strokeStyle = 'rgba(232,192,120,0.09)'; ctx.lineWidth = 0.7;
    for (var i = 1; i <= 4; i++) {
      ctx.beginPath(); ctx.arc(cx, cy, R * (1.22 + i * 0.38), 0, Math.PI * 2); ctx.stroke();
    }
  }

  /* ── 3D orbit ellipses ──────────────────────────────────── */
  function drawOrbits() {
    ctx.save();
    for (var i = 0; i < NODES.length; i++) {
      var n = NODES[i];
      ctx.strokeStyle = 'rgba(' + n.color[0] + ',' + n.color[1] + ',' + n.color[2] + ',0.065)';
      ctx.lineWidth = 0.7;
      ctx.setLineDash([3, 9]);
      drawOrbitPath(n);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawBelt(ts) {
    for (var i = 0; i < BELT.length; i++) {
      var b = BELT[i];
      var ang = b.ph + ts * b.sp;
      var rr = b.g * S;
      var ox = Math.cos(ang) * rr;
      var oy = Math.sin(ang) * rr;
      var ti = b.tilt;
      var py = oy * Math.cos(ti);
      var rz = oy * Math.sin(ti);
      var ps = 1 + rz / (S * 5);
      var bx = cx + ox * ps, by = cy + py * ps;
      var al = b.bright > 0.85 ? 0.45 : 0.18;
      ctx.fillStyle = 'rgba(215,210,255,' + al + ')';
      ctx.fillRect(bx - b.sz / 2, by - b.sz / 2, b.sz, b.sz);
    }
  }

  /* ── Planet nodes with long trails ─────────────────────── */
  function drawNodes(ts) {
    var tip = document.getElementById('kd-tip');
    var hoveredAny = false;
    for (var i = 0; i < NODES.length; i++) {
      var n = NODES[i];
      var pos = nodeXY(n, ts);
      var dist = Math.hypot(mx - pos.x, my - pos.y);
      var isHover = dist < n.r * 4.2;
      if (isHover) hoveredAny = true;

      /* ── Trail (long, fading) ── */
      var TRAIL_LEN = 52;
      var TRAIL_STEP = n.period / 520;
      ctx.save();
      for (var j = TRAIL_LEN; j >= 1; j--) {
        var prevTs = ts - j * TRAIL_STEP;
        var pp = nodeXY(n, prevTs);
        var frac = j / TRAIL_LEN;
        var al = (1 - frac) * (1 - frac) * 0.55;
        var r2 = n.r * 0.18 * (1 - frac * 0.7);
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, r2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + n.color[0] + ',' + n.color[1] + ',' + n.color[2] + ',' + al + ')';
        ctx.fill();
      }
      ctx.restore();

      /* ── Planet glow ── */
      ctx.globalCompositeOperation = 'lighter';
      var glowR = n.r * (isHover ? 5.8 : 3.5) * pos.scale;
      var glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowR);
      glow.addColorStop(0, 'rgba(' + n.color[0] + ',' + n.color[1] + ',' + n.color[2] + ',' + (isHover ? 0.65 : 0.35) + ')');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(pos.x, pos.y, glowR, 0, Math.PI * 2);
      ctx.fillStyle = glow; ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      /* ── Planet body (3D sphere shading) ── */
      /* Light comes from direction of sun (cx,cy) */
      var dx = cx - pos.x, dy = cy - pos.y, dd = Math.hypot(dx, dy) || 1;
      var lx = dx / dd, ly = dy / dd;
      var pr = n.r * pos.scale;
      var pg = ctx.createRadialGradient(
        pos.x + lx * pr * 0.38, pos.y + ly * pr * 0.38, pr * 0.04,
        pos.x, pos.y, pr
      );
      pg.addColorStop(0, 'rgba(255,255,255,0.95)');
      pg.addColorStop(0.18, 'rgba(' + n.color[0] + ',' + n.color[1] + ',' + n.color[2] + ',1)');
      pg.addColorStop(0.65, 'rgba(' + Math.floor(n.color[0] * 0.55) + ',' + Math.floor(n.color[1] * 0.55) + ',' + Math.floor(n.color[2] * 0.55) + ',1)');
      pg.addColorStop(1, 'rgba(' + Math.floor(n.color[0] * 0.10) + ',' + Math.floor(n.color[1] * 0.10) + ',' + Math.floor(n.color[2] * 0.10) + ',1)');
      ctx.beginPath(); ctx.arc(pos.x, pos.y, pr, 0, Math.PI * 2);
      ctx.fillStyle = pg; ctx.fill();

      /* ── Atmospheric rim light (backlighting from star field) ── */
      ctx.globalCompositeOperation = 'screen';
      var rim = ctx.createRadialGradient(pos.x, pos.y, pr * 0.75, pos.x, pos.y, pr * 1.18);
      rim.addColorStop(0, 'rgba(0,0,0,0)');
      rim.addColorStop(0.65, 'rgba(' + Math.floor(n.color[0] * 0.4) + ',' + Math.floor(n.color[1] * 0.4) + ',' + Math.floor(n.color[2] * 0.4) + ',0.22)');
      rim.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(pos.x, pos.y, pr * 1.18, 0, Math.PI * 2);
      ctx.fillStyle = rim; ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      /* ── Saturn ring ── */
      if (n.ring) {
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(pos.ang * 0.45 + 0.5);
        ctx.scale(1, 0.28);
        ctx.strokeStyle = 'rgba(245,220,180,0.60)'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(0, 0, pr * 2.6, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(210,185,140,0.35)'; ctx.lineWidth = 3.2;
        ctx.beginPath(); ctx.arc(0, 0, pr * 2.1, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }

      /* ── Connector line to sun ── */
      ctx.save();
      ctx.strokeStyle = 'rgba(' + n.color[0] + ',' + n.color[1] + ',' + n.color[2] + ',0.055)';
      ctx.lineWidth = 0.55; ctx.setLineDash([2, 13]);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(pos.x, pos.y); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();

      /* ── Label ── */
      var fontSize = Math.max(7, pr * 0.85);
      ctx.save();
      ctx.fillStyle = 'rgba(' + n.color[0] + ',' + n.color[1] + ',' + n.color[2] + ',' + (isHover ? 1 : 0.72) + ')';
      ctx.font = (isHover ? 'bold ' : '') + fontSize + 'px "Share Tech Mono",monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(n.label, pos.x, pos.y + pr + 4);
      ctx.restore();

      /* ── Tooltip ── */
      if (tip && isHover) {
        tip.style.opacity = '1';
        var tx = pos.x + 20, ty = pos.y - 20;
        if (tx + 240 > W) tx = pos.x - 248;
        if (ty + 90 > H) ty = pos.y - 98;
        tip.style.left = tx + 'px'; tip.style.top = ty + 'px';
        tip.innerHTML =
          '<span style="color:rgba(' + n.color[0] + ',' + n.color[1] + ',' + n.color[2] + ',1);font-size:9px;">' + n.key + '</span><br>' +
          '<strong style="color:#e8f4ff;font-size:12px;">' + n.label + '</strong><br>' +
          '<span style="color:rgba(180,212,232,.65);font-size:10px;">' + n.desc.replace(/\n/g, '<br>') + '</span>';
      }
    }
    if (tip && !hoveredAny) tip.style.opacity = '0';
  }

  function drawPulses() {
    pulses = pulses.filter(function (p) { return p.alpha > 0.008; });
    for (var i = 0; i < pulses.length; i++) {
      var p = pulses[i];
      p.r += (p.maxR - p.r) * 0.028;
      p.alpha *= 0.951;
      ctx.save();
      ctx.strokeStyle = 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + p.alpha * 0.55 + ')';
      ctx.lineWidth = 1.5 * p.alpha;
      ctx.beginPath(); ctx.arc(cx, cy, p.r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  /* ── Floating words ─────────────────────────────────────── */
  var BDWORDS = ['DRIFT·ZERO', 'KING DIADEM', 'LYLA', 'WATERLINE', 'FAIL·LESS', 'RESTORE', 'ENTROPY'];
  var floaters = Array.from({ length: 8 }, function (_, i) {
    return {
      word: BDWORDS[i % BDWORDS.length],
      x: Math.random(), y: Math.random() + 0.15,
      speed: 0.000022 + Math.random() * 0.000038,
      alpha: 0.04 + Math.random() * 0.09,
      size: 9 + Math.random() * 7,
      color: i % 3 === 0 ? [232, 192, 120] : i % 3 === 1 ? [45, 212, 191] : [160, 130, 255]
    };
  });
  function drawFloaters(ts) {
    for (var i = 0; i < floaters.length; i++) {
      var f = floaters[i];
      f.y = ((f.y - f.speed + 1) % 1);
      ctx.save();
      ctx.fillStyle = 'rgba(' + f.color[0] + ',' + f.color[1] + ',' + f.color[2] + ',' + f.alpha + ')';
      ctx.font = f.size + 'px "Share Tech Mono",monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(f.word, f.x * W, f.y * H);
      ctx.restore();
    }
  }

  /* ── Tooltip DOM ────────────────────────────────────────── */
  if (!document.getElementById('kd-tip')) {
    var tip = document.createElement('div'); tip.id = 'kd-tip';
    tip.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;padding:10px 15px;' +
      'border-radius:10px;background:rgba(4,2,20,0.94);backdrop-filter:blur(16px);' +
      'border:1px solid rgba(232,192,120,0.28);color:#e8f4ff;max-width:230px;line-height:1.7;' +
      'font-family:"Share Tech Mono",monospace;font-size:11px;opacity:0;transition:opacity .16s;';
    document.body.appendChild(tip);
  }

  /* ── Main render loop ───────────────────────────────────── */
  function frame(now) {
    var ts = now - t0;
    drawBackground();
    drawMilkyBand(ts);
    drawNebula();
    drawStars(ts);
    drawFloaters(ts);
    drawBelt(ts);
    drawOrbits();
    drawPulses();
    drawNodes(ts);
    drawSun(ts);  /* sun drawn LAST so it renders on top */
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
