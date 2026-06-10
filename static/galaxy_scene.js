/**
 * galaxy_scene.js — KING DIADEM v5.0
 * - ระบบสุริยะโคจรจริง perspective tilt
 * - เลือก route → ดาวนั้นวิ่งมาหาผู้ใช้ (bottom center)
 * - กลับสู่ idle → ดาววนกลับ orbit
 * - canvas z-index ต่ำ ไม่บัง UI เด็ดขาด
 * - ไม่ใช้ filter/blur → ไม่ lag
 */
(function () {
  'use strict';

  const cv = document.getElementById('galaxy');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, CX, CY;

  function resize() {
    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width   = W * dpr;
    cv.height  = H * dpr;
    cv.style.width  = W + 'px';
    cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    CX = W / 2;
    CY = H / 2;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ══════════════════════════════════════
     STAR FIELD — 3 layers, mostly static
  ══════════════════════════════════════ */
  const STARS = [];
  for (let i = 0; i < 800; i++) {
    const b = Math.random();
    STARS.push({
      nx: Math.random(), ny: Math.random(),
      r:  b < .025 ? 1.4 + Math.random() * .7
        : b < .12  ? .55 + Math.random() * .45
        :             .12 + Math.random() * .32,
      a:   .08 + Math.random() * .55,
      tw:  Math.random() < .10,
      ph:  Math.random() * Math.PI * 2,
      ps:  (.05 + Math.random() * .18) * .0005,
      hue: Math.random() < .07 ? 'w' : Math.random() < .06 ? 'b' : 'n',
    });
  }

  /* ══════════════════════════════════════
     PLANET DEFINITIONS
     role ตรงกับ route ใน index.html
  ══════════════════════════════════════ */
  const TILT  = 0.36;
  const BASE_SPEED = 0.000048; // Earth period ref

  const PLANETS = [
    {
      name: 'MERCURY', role: 'general',
      orbit: 80,  r: 4.2,  period: 0.241, angle: 0.8,
      color: '#b0a898', glow: [176, 168, 152],
      desc: 'ตั้งต้น · รับฟัง · ทั่วไป',
      act: 0, homing: false, homeX: 0, homeY: 0,
    },
    {
      name: 'VENUS', role: 'risk',
      orbit: 115, r: 5.5,  period: 0.615, angle: 2.2,
      color: '#f59e0b', glow: [245, 158, 11],
      desc: 'ประเมินความเสี่ยง · อันตราย',
      act: 0, homing: false, homeX: 0, homeY: 0,
    },
    {
      name: 'EARTH',  role: 'survival',
      orbit: 152, r: 6.0,  period: 1.000, angle: 3.8,
      color: '#4488cc', glow: [68, 136, 204],
      desc: 'LYLA · เอาตัวรอด · waterline',
      act: 0, homing: false, homeX: 0, homeY: 0, isLyla: true,
    },
    {
      name: 'MARS',   role: 'collapse',
      orbit: 192, r: 5.0,  period: 1.881, angle: 1.0,
      color: '#ef4444', glow: [239, 68, 68],
      desc: 'วิกฤต · ฟื้นฟู · collapse chain',
      act: 0, homing: false, homeX: 0, homeY: 0,
    },
    {
      name: 'JUPITER', role: 'civil',
      orbit: 242, r: 10.0, period: 11.86, angle: 4.5,
      color: '#a78bfa', glow: [167, 139, 250],
      desc: 'สังคม · ธรรมาภิบาล · civil work',
      act: 0, homing: false, homeX: 0, homeY: 0, band: true,
    },
    {
      name: 'SATURN',  role: 'vega',
      orbit: 295, r: 8.5,  period: 29.46, angle: 2.8,
      color: '#e8c078', glow: [232, 192, 120],
      desc: 'VEGA · วิเคราะห์ · strategy',
      act: 0, homing: false, homeX: 0, homeY: 0, ring: true,
    },
  ];

  /* ══════════════════════════════════════
     STATE
  ══════════════════════════════════════ */
  let activeRoute  = 'general';
  let lylaThinking = false;
  let lylaThinkT   = 0;
  let burstT       = 0;
  let councilMode  = false; // ถ้า true = ทุกดาวกลับ orbit + sun pulse
  let t            = 0;
  let lastTs       = 0;

  // target ที่ดาว active จะวิ่งมา (near bottom input area)
  function getHomeTarget() {
    return {
      x: CX,
      y: H - 140,  // เหนือ input dock
    };
  }

  /* ══════════════════════════════════════
     SCALE
  ══════════════════════════════════════ */
  function sc() { return Math.min(W, H) / 820 * 0.82; }

  /* ══════════════════════════════════════
     DRAW — background
  ══════════════════════════════════════ */
  function drawBg() {
    ctx.fillStyle = '#02010a';
    ctx.fillRect(0, 0, W, H);
    // nebula
    [
      [0.18, 0.22, 0.28, 'rgba(45,10,95,.08)'],
      [0.78, 0.68, 0.24, 'rgba(90,20,8,.07)'],
      [0.60, 0.15, 0.18, 'rgba(55,12,110,.06)'],
    ].forEach(([nx, ny, rr, c]) => {
      const g = ctx.createRadialGradient(
        nx*W, ny*H, 0, nx*W, ny*H, rr*Math.max(W,H)
      );
      g.addColorStop(0, c);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });
  }

  function drawStars() {
    STARS.forEach(s => {
      let a = s.a;
      if (s.tw) { s.ph += s.ps; a *= .62 + .38 * Math.sin(s.ph); }
      ctx.beginPath();
      ctx.arc(s.nx * W, s.ny * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.hue === 'w' ? `rgba(255,232,205,${a})`
                    : s.hue === 'b' ? `rgba(205,220,255,${a})`
                    :                  `rgba(195,212,255,${a})`;
      ctx.fill();
    });
  }

  /* ══════════════════════════════════════
     DRAW — Sun
  ══════════════════════════════════════ */
  function drawSun(scale) {
    const r  = 18 * scale;
    const pulse = councilMode ? 1 + .3 * Math.sin(t * .0012) : 1;

    // corona
    [3.5, 2.2, 1.4].forEach((m, i) => {
      const g = ctx.createRadialGradient(CX, CY, r*.4, CX, CY, r*m*pulse);
      const a = [.04, .07, .11][i] * (1 + burstT * .25) * pulse;
      g.addColorStop(0, `rgba(255,200,55,${a})`);
      g.addColorStop(1, 'rgba(255,130,0,0)');
      ctx.beginPath();
      ctx.arc(CX, CY, r*m*pulse, 0, Math.PI*2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    // core
    const cg = ctx.createRadialGradient(CX-r*.28, CY-r*.28, 0, CX, CY, r);
    cg.addColorStop(0,    '#fffbe8');
    cg.addColorStop(.35,  '#ffd040');
    cg.addColorStop(.78,  '#ff9000');
    cg.addColorStop(1,    '#cc4400');
    ctx.beginPath();
    ctx.arc(CX, CY, r, 0, Math.PI*2);
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CX, CY, r*.20, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,235,.82)';
    ctx.fill();
  }

  /* ══════════════════════════════════════
     DRAW — Planet
  ══════════════════════════════════════ */
  function drawPlanet(p, scale, dt) {
    const isActive  = p.role === activeRoute;
    const isThink   = p.isLyla && lylaThinking;
    const target    = getHomeTarget();

    // smooth activation
    p.act += ((isActive ? 1 : 0) - p.act) * .045;

    // orbital angle
    let spd = BASE_SPEED / p.period;
    if (isThink) spd *= 2.2;
    p.angle += spd * dt;

    // orbit position
    const orb     = p.orbit * scale;
    const orbitX  = CX + Math.cos(p.angle) * orb;
    const orbitY  = CY + Math.sin(p.angle) * orb * TILT;

    // homing: เคลื่อนที่ไปหา target เมื่อ active
    const shouldHome = isActive && !councilMode;
    if (shouldHome) {
      p.homeX += (target.x - p.homeX) * .04;
      p.homeY += (target.y - p.homeY) * .04;
    } else {
      p.homeX += (orbitX - p.homeX) * .04;
      p.homeY += (orbitY - p.homeY) * .04;
    }

    const px = p.homeX || orbitX;
    const py = p.homeY || orbitY;
    const pr = p.r * scale * (1 + p.act * .28);

    const [gr, gg, gb] = p.glow;

    // orbit ring (only draw when not fully homed)
    const homeDist = Math.hypot(px - orbitX, py - orbitY);
    const orbitAlpha = isActive ? .12 + (homeDist / (orb + 1)) * .10 : .06;
    ctx.save();
    ctx.translate(CX, CY);
    ctx.beginPath();
    ctx.ellipse(0, 0, orb, orb * TILT, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(100,150,200,${orbitAlpha})`;
    ctx.lineWidth   = isActive ? .65 : .30;
    ctx.stroke();
    ctx.restore();

    // glow halo
    const glowR = pr * (2.2 + p.act * 2.2 + (isThink ? 1.5 + Math.sin(lylaThinkT*.018)*.8 : 0));
    const glowA = .08 + p.act * .52 + (isThink ? .18 + Math.sin(lylaThinkT*.016)*.10 : 0);
    const gg_ = ctx.createRadialGradient(px, py, 0, px, py, glowR);
    gg_.addColorStop(0,   `rgba(${gr},${gg},${gb},${glowA})`);
    gg_.addColorStop(.55, `rgba(${gr},${gg},${gb},${glowA*.18})`);
    gg_.addColorStop(1,   `rgba(${gr},${gg},${gb},0)`);
    ctx.beginPath();
    ctx.arc(px, py, glowR, 0, Math.PI*2);
    ctx.fillStyle = gg_;
    ctx.fill();

    // Jupiter bands
    if (p.band) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI*2);
      ctx.clip();
      const ba = .12 + p.act*.08;
      [-0.3, 0, .3].forEach(dy => {
        ctx.fillStyle = `rgba(170,130,70,${ba})`;
        ctx.fillRect(px-pr, py+dy*pr-pr*.12, pr*2, pr*.24);
      });
      ctx.restore();
    }

    // Saturn ring
    if (p.ring) {
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(1, .28);
      ctx.beginPath();
      ctx.arc(0, 0, pr*1.95, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(${gr},${gg},${gb},${.20+p.act*.22})`;
      ctx.lineWidth   = pr * .46;
      ctx.stroke();
      ctx.restore();
    }

    // planet body
    const pb = ctx.createRadialGradient(px-pr*.28, py-pr*.28, 0, px, py, pr);
    pb.addColorStop(0,   '#ffffff');
    pb.addColorStop(.26, p.color);
    pb.addColorStop(1,   `rgb(${Math.max(0,gr-55)},${Math.max(0,gg-55)},${Math.max(0,gb-42)})`);
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI*2);
    ctx.fillStyle = pb;
    ctx.fill();

    // pulse ring when active
    if (p.act > .08) {
      const pu  = (t * .00042 + p.orbit * .006) % 1;
      const pa  = (1 - pu) * .22 * p.act;
      if (pa > .004) {
        ctx.beginPath();
        ctx.arc(px, py, pr*(1.5 + pu*2.5), 0, Math.PI*2);
        ctx.strokeStyle = `rgba(${gr},${gg},${gb},${pa})`;
        ctx.lineWidth   = .65;
        ctx.stroke();
      }
    }

    // LYLA thinking rings
    if (isThink) {
      const pulse = .5 + .5 * Math.sin(lylaThinkT * .010);
      ctx.beginPath();
      ctx.arc(px, py, pr*(1.45 + pulse*.7), 0, Math.PI*2);
      ctx.strokeStyle = `rgba(0,205,225,${.10+pulse*.18})`;
      ctx.lineWidth   = .9;
      ctx.stroke();
    }

    // alignment line to sun when active
    if (p.act > .06 && !councilMode) {
      const g = ctx.createLinearGradient(CX, CY, px, py);
      g.addColorStop(0,   `rgba(255,210,55,${p.act*.28})`);
      g.addColorStop(.6,  `rgba(0,185,215,${p.act*.20})`);
      g.addColorStop(1,   `rgba(0,185,215,${p.act*.05})`);
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(px, py);
      ctx.strokeStyle = g;
      ctx.lineWidth   = .45 + p.act * .45;
      ctx.stroke();
    }

    // label — แสดงเสมอ ขนาดตามระยะ
    const labelAlpha = .22 + p.act * .60;
    const fontSize   = Math.max(7, (isActive ? 9.5 : 7.5) * scale);
    ctx.font         = `500 ${fontSize}px 'DM Mono', monospace`;
    ctx.textAlign    = 'center';
    ctx.fillStyle    = `rgba(${gr},${gg},${gb},${labelAlpha})`;
    ctx.fillText(p.name, px, py - pr - 5 * scale);

    // desc เฉพาะ active
    if (p.act > .35 && W > 600) {
      ctx.font      = `${Math.max(6, 6.5*scale)}px 'DM Mono', monospace`;
      ctx.fillStyle = `rgba(180,210,240,${p.act * .45})`;
      ctx.fillText(p.desc, px, py - pr - 13 * scale);
    }

    return { x: px, y: py, r: pr, act: p.act };
  }

  /* ══════════════════════════════════════
     DRAW — burst on answer
  ══════════════════════════════════════ */
  function drawBurst(scale) {
    if (burstT <= 0) return;
    burstT = Math.max(0, burstT - .007);
    const br = (1 - burstT) * 260 * scale;
    const bg = ctx.createRadialGradient(CX, CY, 0, CX, CY, br);
    bg.addColorStop(0,   `rgba(0,195,215,${burstT*.16})`);
    bg.addColorStop(.65, `rgba(0,175,205,${burstT*.05})`);
    bg.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(CX, CY, br, 0, Math.PI*2);
    ctx.fillStyle = bg;
    ctx.fill();
  }

  /* ══════════════════════════════════════
     MAIN LOOP
  ══════════════════════════════════════ */
  function frame(ts) {
    const dt = Math.min(ts - lastTs, 40);
    lastTs = ts;
    t     += dt;
    if (lylaThinking) lylaThinkT += dt;

    const scale = sc();
    ctx.clearRect(0, 0, W, H);
    drawBg();
    drawStars();
    drawBurst(scale);
    drawSun(scale);

    PLANETS.forEach(p => {
      if (!p.homeX) { p.homeX = CX + Math.cos(p.angle) * p.orbit * scale; }
      if (!p.homeY) { p.homeY = CY + Math.sin(p.angle) * p.orbit * scale * TILT; }
    });
    PLANETS.forEach(p => drawPlanet(p, scale, dt));

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ══════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════ */
  window.LYLA_thinking = function () {
    lylaThinking = true;
    lylaThinkT   = 0;
  };

  window.LYLA_answered = function () {
    lylaThinking = false;
    burstT       = 1.0;
  };

  window.KD_pulse = function (route) {
    if (route) activeRoute = route;
  };

  window.KD_councilMode = function (on) {
    councilMode = !!on;
  };

  // hook setRoute
  const _os = window.setRoute;
  window.setRoute = function (r) {
    activeRoute = r;
    councilMode = false;
    if (_os) _os.apply(this, arguments);
  };

  // hook addThinking / removeThinking
  const _ot = window.addThinking;
  window.addThinking = function () {
    window.LYLA_thinking();
    if (_ot) _ot.apply(this, arguments);
  };
  const _or = window.removeThinking;
  window.removeThinking = function () {
    window.LYLA_answered();
    if (_or) _or.apply(this, arguments);
  };

})();
