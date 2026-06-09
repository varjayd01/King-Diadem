/**
 * galaxy_scene.js — KING DIADEM
 * Close-up Earth + sunrise glow + dense starfield
 * Earth is fixed/large — only light & atmosphere animate
 */
(function () {
  'use strict';

  const cv = document.getElementById('galaxy');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, CX, CY;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width  = window.innerWidth  * dpr;
    cv.height = window.innerHeight * dpr;
    cv.style.width  = window.innerWidth  + 'px';
    cv.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = window.innerWidth;
    H = window.innerHeight;
    CX = W / 2;
    CY = H / 2;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── stars ── */
  const stars = [];
  for (let i = 0; i < 1100; i++) {
    const b = Math.random();
    stars.push({
      nx: Math.random(), ny: Math.random(),
      r:  b < .03 ? 1.6 + Math.random() * .9
        : b < .14 ? .7  + Math.random() * .5
        :            .15 + Math.random() * .38,
      a:  .10 + Math.random() * .65,
      tw: Math.random() < .10,
      ph: Math.random() * Math.PI * 2,
      ps: (.08 + Math.random() * .22) * .0005,
      hue: Math.random() < .07 ? 'w' : Math.random() < .06 ? 'b' : 'n',
    });
  }

  /* ── small orbiting dots (route indicators) ── */
  const ROUTES = [
    { role:'general',  color:'#4488cc', angle: .8,  orbitF: .52, speed:.00018 },
    { role:'risk',     color:'#f59e0b', angle: 2.1, orbitF: .57, speed:.00013 },
    { role:'survival', color:'#00ccdd', angle: 3.5, orbitF: .62, speed:.00009 },
    { role:'collapse', color:'#ef4444', angle: 4.8, orbitF: .67, speed:.00007 },
    { role:'civil',    color:'#a78bfa', angle: 1.4, orbitF: .72, speed:.00005 },
    { role:'vega',     color:'#e8c078', angle: 5.2, orbitF: .77, speed:.00003 },
  ];
  ROUTES.forEach(r => r.act = 0);

  /* ── state ── */
  let activeRoute = 'general';
  let sunriseT    = 0;   // slow sunrise angle oscillation
  let burstT      = 0;
  let lylaThink   = false;
  let lylaThinkT  = 0;
  let t           = 0;
  let lastTs      = 0;

  /* ── scale helper ── */
  function earthRadius() {
    // close-up: Earth fills ~55% of min dimension
    return Math.min(W, H) * .55;
  }
  function earthCenter() {
    // positioned slightly below center
    return { x: CX, y: CY + Math.min(W, H) * .12 };
  }

  /* ════════════════════════
     DRAW: deep space bg
  ════════════════════════ */
  function drawSpace() {
    // deep navy → near-black
    const g = ctx.createRadialGradient(CX, CY * .6, 0, CX, CY, Math.max(W, H) * .85);
    g.addColorStop(0,   '#0a1628');
    g.addColorStop(.45, '#050b18');
    g.addColorStop(1,   '#010306');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // subtle blue nebula upper-right
    const nb = ctx.createRadialGradient(W * .72, H * .18, 0, W * .72, H * .18, W * .38);
    nb.addColorStop(0, 'rgba(30,60,140,.09)');
    nb.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = nb;
    ctx.fillRect(0, 0, W, H);

    // warm hint upper-left
    const nb2 = ctx.createRadialGradient(W * .18, H * .22, 0, W * .18, H * .22, W * .30);
    nb2.addColorStop(0, 'rgba(60,20,80,.07)');
    nb2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = nb2;
    ctx.fillRect(0, 0, W, H);
  }

  /* ════════════════════════
     DRAW: stars
  ════════════════════════ */
  function drawStars() {
    const ec = earthCenter();
    const er = earthRadius();
    stars.forEach(s => {
      const sx = s.nx * W, sy = s.ny * H;
      // hide stars inside Earth
      const dx = sx - ec.x, dy = sy - ec.y;
      if (dx * dx + dy * dy < er * er * .88) return;

      let a = s.a;
      if (s.tw) { s.ph += s.ps; a *= .62 + .38 * Math.sin(s.ph); }
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.hue === 'w' ? `rgba(255,232,205,${a})`
                    : s.hue === 'b' ? `rgba(205,222,255,${a})`
                    :                  `rgba(198,215,255,${a})`;
      ctx.fill();
    });
  }

  /* ════════════════════════
     DRAW: Earth (close-up)
  ════════════════════════ */
  function drawEarth() {
    const ec = earthCenter();
    const er = earthRadius();
    const ex = ec.x, ey = ec.y;

    // === ocean base ===
    const ocean = ctx.createRadialGradient(
      ex - er * .25, ey - er * .25, 0,
      ex, ey, er
    );
    ocean.addColorStop(0,   '#1a6090');
    ocean.addColorStop(.35, '#0f4060');
    ocean.addColorStop(.72, '#082235');
    ocean.addColorStop(1,   '#030e18');
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, Math.PI * 2);
    ctx.fillStyle = ocean;
    ctx.fill();

    // === land masses (stylized blobs) ===
    ctx.save();
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, Math.PI * 2);
    ctx.clip();

    // Europe/Africa area
    ctx.fillStyle = 'rgba(100,130,70,.55)';
    ctx.beginPath();
    ctx.ellipse(ex + er * .08, ey - er * .08, er * .22, er * .35, .3, 0, Math.PI * 2);
    ctx.fill();

    // Arabia/Middle East
    ctx.fillStyle = 'rgba(160,130,75,.60)';
    ctx.beginPath();
    ctx.ellipse(ex + er * .18, ey + er * .05, er * .10, er * .14, .5, 0, Math.PI * 2);
    ctx.fill();

    // Asia blob
    ctx.fillStyle = 'rgba(90,120,60,.50)';
    ctx.beginPath();
    ctx.ellipse(ex + er * .32, ey - er * .20, er * .28, er * .22, -.2, 0, Math.PI * 2);
    ctx.fill();

    // Americas (left side, partial)
    ctx.fillStyle = 'rgba(80,115,65,.45)';
    ctx.beginPath();
    ctx.ellipse(ex - er * .38, ey - er * .05, er * .18, er * .30, -.1, 0, Math.PI * 2);
    ctx.fill();

    // Antarctic ice
    ctx.fillStyle = 'rgba(220,235,255,.30)';
    ctx.beginPath();
    ctx.ellipse(ex, ey + er * .72, er * .55, er * .18, 0, 0, Math.PI * 2);
    ctx.fill();

    // clouds
    ctx.fillStyle = 'rgba(240,245,255,.18)';
    ctx.beginPath();
    ctx.ellipse(ex - er * .10, ey - er * .30, er * .40, er * .08, .6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ex + er * .20, ey + er * .20, er * .28, er * .06, -.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ex - er * .30, ey + er * .40, er * .25, er * .07, .4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // === atmosphere glow (blue rim) ===
    const atm = ctx.createRadialGradient(ex, ey, er * .88, ex, ey, er * 1.18);
    atm.addColorStop(0,   'rgba(60,130,220,.22)');
    atm.addColorStop(.5,  'rgba(40,90,180,.10)');
    atm.addColorStop(1,   'rgba(20,50,140,0)');
    ctx.beginPath();
    ctx.arc(ex, ey, er * 1.18, 0, Math.PI * 2);
    ctx.fillStyle = atm;
    ctx.fill();

    // === sunrise / terminator ===
    // Slowly rotate sunrise angle
    sunriseT += .000018;
    const sunAngle = Math.PI * 1.15 + Math.sin(sunriseT) * .18; // bottom-left

    const sunX = ex + Math.cos(sunAngle) * er;
    const sunY = ey + Math.sin(sunAngle) * er;

    // orange glow where sun hits
    const sunrise = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, er * .85);
    sunrise.addColorStop(0,   'rgba(255,180,50,.80)');
    sunrise.addColorStop(.12, 'rgba(255,130,30,.45)');
    sunrise.addColorStop(.35, 'rgba(200,80,10,.18)');
    sunrise.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(ex, ey, er * 1.02, 0, Math.PI * 2);
    ctx.fillStyle = sunrise;
    ctx.fill();

    // bright lens flare at sunrise point
    const fScale = .85 + .15 * Math.sin(t * .0008);
    const flare = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, er * .28 * fScale);
    flare.addColorStop(0,   `rgba(255,255,220,${.75 * fScale})`);
    flare.addColorStop(.08, `rgba(255,200,80,${.55 * fScale})`);
    flare.addColorStop(.30, `rgba(255,140,20,${.20 * fScale})`);
    flare.addColorStop(1,   'rgba(255,100,0,0)');
    ctx.beginPath();
    ctx.arc(sunX, sunY, er * .28 * fScale, 0, Math.PI * 2);
    ctx.fillStyle = flare;
    ctx.fill();

    // hard Earth edge (dark limb)
    const limb = ctx.createRadialGradient(ex, ey, er * .92, ex, ey, er);
    limb.addColorStop(0, 'rgba(0,0,0,0)');
    limb.addColorStop(1, 'rgba(0,5,15,.72)');
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, Math.PI * 2);
    ctx.fillStyle = limb;
    ctx.fill();

    // thin atmosphere ring line
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(80,160,255,.18)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /* ════════════════════════
     DRAW: orbiting route satellites
  ════════════════════════ */
  function drawSatellites(dt) {
    const ec = earthCenter();
    const er = earthRadius();

    ROUTES.forEach(r => {
      const isActive = r.role === activeRoute;
      r.act += ((isActive ? 1 : 0) - r.act) * .04;
      r.angle += r.speed * dt;

      const orb = er * r.orbitF;
      const sx = ec.x + Math.cos(r.angle) * orb;
      const sy = ec.y + Math.sin(r.angle) * orb * .38; // tilt

      const rgb = hexToRgb(r.color);
      const [rr, rg, rb] = rgb;

      // skip if behind Earth (simple z-check)
      const behind = Math.sin(r.angle) < -.1 && Math.cos(r.angle) > -.5;

      if (!behind) {
        // glow
        if (r.act > .04) {
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 18 + r.act * 14);
          g.addColorStop(0, `rgba(${rr},${rg},${rb},${r.act * .7})`);
          g.addColorStop(1, `rgba(${rr},${rg},${rb},0)`);
          ctx.beginPath();
          ctx.arc(sx, sy, 18 + r.act * 14, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        // dot
        const dotR = 2.2 + r.act * 2.5;
        ctx.beginPath();
        ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rr},${rg},${rb},${.45 + r.act * .50})`;
        ctx.fill();

        // label
        if (r.act > .15 || isActive) {
          ctx.font = `500 ${Math.max(8, 9 * (Math.min(W,H)/700))}px 'DM Mono', monospace`;
          ctx.textAlign = 'center';
          ctx.fillStyle = `rgba(${rr},${rg},${rb},${.35 + r.act * .55})`;
          ctx.fillText(r.role.toUpperCase(), sx, sy - dotR - 5);
        }
      }
    });
  }

  /* ════════════════════════
     DRAW: answer burst
  ════════════════════════ */
  function drawBurst() {
    if (burstT <= 0) return;
    burstT = Math.max(0, burstT - .007);
    const ec = earthCenter();
    const er = earthRadius();
    const br = (1 - burstT) * er * 2.2;
    const g = ctx.createRadialGradient(ec.x, ec.y, 0, ec.x, ec.y, br);
    g.addColorStop(0, `rgba(0,190,215,${burstT * .18})`);
    g.addColorStop(.6, `rgba(0,170,200,${burstT * .06})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(ec.x, ec.y, br, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  /* ════════════════════════
     MAIN LOOP
  ════════════════════════ */
  function frame(ts) {
    const dt = Math.min(ts - lastTs, 40);
    lastTs = ts;
    t += dt;
    if (lylaThink) lylaThinkT += dt;

    ctx.clearRect(0, 0, W, H);

    drawSpace();
    drawStars();
    drawBurst();
    drawEarth();
    drawSatellites(dt);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ── util ── */
  function hexToRgb(hex) {
    return [
      parseInt(hex.slice(1,3),16),
      parseInt(hex.slice(3,5),16),
      parseInt(hex.slice(5,7),16),
    ];
  }

  /* ════════════════════════
     PUBLIC API
  ════════════════════════ */
  window.LYLA_thinking = function() { lylaThink = true; lylaThinkT = 0; };
  window.LYLA_answered = function() { lylaThink = false; burstT = 1.0; };
  window.KD_pulse      = function(route) { if(route) activeRoute = route; };

  const _ot = window.addThinking;
  window.addThinking = function() { window.LYLA_thinking(); if(_ot) _ot.apply(this,arguments); };
  const _or = window.removeThinking;
  window.removeThinking = function() { window.LYLA_answered(); if(_or) _or.apply(this,arguments); };
  const _os = window.setRoute;
  window.setRoute = function(r) { activeRoute = r; if(_os) _os.apply(this,arguments); };

})();
