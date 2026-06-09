/**
 * galaxy_scene.js — KING DIADEM · MILKY SCOPE
 * Solar system + LYLA thinking mode + 240fps
 * Dark space aesthetic — no blue warp
 */

(function () {
  'use strict';

  /* ─── canvas setup ─── */
  const cv = document.getElementById('galaxy');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, CX, CY, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.width  = window.innerWidth  * dpr;
    H = cv.height = window.innerHeight * dpr;
    CX = W / 2; CY = H / 2;
    ctx.scale(dpr, dpr);
    W /= dpr; H /= dpr; CX = W / 2; CY = H / 2;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ─── stars (background) ─── */
  const STAR_COUNT = 320;
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * 2000 - 1000,
      y: Math.random() * 1400 - 700,
      r: Math.random() * 1.1 + 0.2,
      a: Math.random() * 0.6 + 0.2,
      tw: Math.random() * Math.PI * 2,
      tws: (Math.random() * 0.4 + 0.15) * 0.001,
    });
  }

  /* ─── planet definitions ─── */
  // orbit radius is in "scene units" — scaled to screen each frame
  const SUN_R = 28;
  const planets = [
    { name:'MERCURY', orbit:72,  r:4,   speed:1.607, color:'#b0a090', glow:'rgba(176,160,144,0.3)',  angle:0.5  },
    { name:'VENUS',   orbit:105, r:6,   speed:1.174, color:'#e8c878', glow:'rgba(232,200,120,0.3)',  angle:1.8  },
    { name:'EARTH',   orbit:145, r:7,   speed:1.000, color:'#4488cc', glow:'rgba(68,136,204,0.4)',   angle:3.2  },
    { name:'MARS',    orbit:190, r:5,   speed:0.802, color:'#cc6644', glow:'rgba(204,102,68,0.35)',  angle:0.9  },
    { name:'LYLA',    orbit:248, r:10,  speed:0.434, color:'#00ccdd', glow:'rgba(0,204,221,0.55)',   angle:2.1, isLyla:true },
    { name:'SATURN',  orbit:308, r:9,   speed:0.325, color:'#d4b870', glow:'rgba(212,184,112,0.3)',  angle:4.5, hasRing:true },
    { name:'URANUS',  orbit:360, r:7,   speed:0.228, color:'#88ddee', glow:'rgba(136,221,238,0.25)', angle:1.4  },
    { name:'NEPTUNE', orbit:405, r:7,   speed:0.182, color:'#4466cc', glow:'rgba(68,102,204,0.25)',  angle:3.8  },
  ];

  /* ─── state ─── */
  let lylaMode = 'idle';  // 'idle' | 'thinking' | 'answering'
  let lylaThinkT = 0;
  let answerBurst = 0;    // 0→1 burst when answer arrives
  let answerBurstT = 0;
  let baseScale = 1;
  let lastTs = 0;
  let frameId = null;

  /* ─── scale helper ─── */
  function getScale() {
    const minDim = Math.min(W, H);
    return (minDim / 900) * 0.88;
  }

  /* ─── draw star field ─── */
  function drawStars(t) {
    for (const s of stars) {
      s.tw += s.tws;
      const twinkle = 0.5 + 0.5 * Math.sin(s.tw);
      const alpha = s.a * (0.6 + 0.4 * twinkle);
      ctx.beginPath();
      ctx.arc(
        CX + s.x * (W / 2000),
        CY + s.y * (H / 1400),
        s.r, 0, Math.PI * 2
      );
      ctx.fillStyle = `rgba(200,220,255,${alpha})`;
      ctx.fill();
    }
  }

  /* ─── draw sun ─── */
  function drawSun(sc) {
    const r = SUN_R * sc;
    // corona
    for (let i = 3; i > 0; i--) {
      const g = ctx.createRadialGradient(CX, CY, r * 0.5, CX, CY, r * (1 + i * 0.7));
      g.addColorStop(0, `rgba(255,200,60,${0.07 / i})`);
      g.addColorStop(1, 'rgba(255,140,0,0)');
      ctx.beginPath();
      ctx.arc(CX, CY, r * (1 + i * 0.7), 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
    // core
    const g2 = ctx.createRadialGradient(CX - r * 0.3, CY - r * 0.3, 0, CX, CY, r);
    g2.addColorStop(0, '#fffbe0');
    g2.addColorStop(0.4, '#ffd040');
    g2.addColorStop(1, '#ff8800');
    ctx.beginPath();
    ctx.arc(CX, CY, r, 0, Math.PI * 2);
    ctx.fillStyle = g2;
    ctx.fill();
  }

  /* ─── draw orbit ring ─── */
  function drawOrbit(r, alpha) {
    ctx.beginPath();
    ctx.arc(CX, CY, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(100,160,200,${alpha})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  /* ─── draw planet ─── */
  function drawPlanet(p, sc, t) {
    const orbit = p.orbit * sc;
    let speed = p.speed;
    let pr = p.r * sc;

    // LYLA thinking mode — faster + brighter
    if (p.isLyla) {
      if (lylaMode === 'thinking') {
        speed *= 3.5 + 1.5 * Math.sin(lylaThinkT * 0.008);
        pr *= 1.4 + 0.3 * Math.sin(lylaThinkT * 0.02);
      } else if (lylaMode === 'answering') {
        speed *= 1.5;
        pr *= 1.2;
      }
    }

    p.angle += speed * 0.0004;
    const x = CX + Math.cos(p.angle) * orbit;
    const y = CY + Math.sin(p.angle) * orbit * 0.38; // perspective tilt

    // orbit ring
    drawOrbit(orbit, p.isLyla ? 0.18 : 0.08);

    // glow
    const glowR = pr * (p.isLyla && lylaMode === 'thinking' ? 3.5 : 2.5);
    const gGlow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    let glowAlpha = p.isLyla && lylaMode === 'thinking'
      ? 0.55 + 0.3 * Math.sin(lylaThinkT * 0.025)
      : 0.22;
    gGlow.addColorStop(0, p.glow.replace(/[\d.]+\)$/, `${glowAlpha})`));
    gGlow.addColorStop(1, p.glow.replace(/[\d.]+\)$/, '0)'));
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fillStyle = gGlow;
    ctx.fill();

    // Saturn ring
    if (p.hasRing) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, pr * 2.2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(212,184,112,0.35)';
      ctx.lineWidth = pr * 0.6;
      ctx.stroke();
      ctx.restore();
    }

    // planet body
    const gBody = ctx.createRadialGradient(x - pr * 0.3, y - pr * 0.3, 0, x, y, pr);
    gBody.addColorStop(0, '#ffffff');
    gBody.addColorStop(0.3, p.color);
    gBody.addColorStop(1, shadeColor(p.color, -40));
    ctx.beginPath();
    ctx.arc(x, y, pr, 0, Math.PI * 2);
    ctx.fillStyle = gBody;
    ctx.fill();

    // LYLA special: energy ring when thinking
    if (p.isLyla && lylaMode === 'thinking') {
      const pulse = Math.sin(lylaThinkT * 0.03) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, pr * (2.0 + pulse * 1.2), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,220,240,${0.15 + pulse * 0.35})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // inner spark
      ctx.beginPath();
      ctx.arc(x, y, pr * (1.3 + pulse * 0.4), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(160,255,255,${0.25 + pulse * 0.4})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // label
    if (W > 600) {
      ctx.font = `${Math.max(8, 8 * sc)}px 'DM Mono', monospace`;
      ctx.fillStyle = p.isLyla ? `rgba(0,220,240,0.70)` : 'rgba(160,190,220,0.38)';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, x, y - pr - 5 * sc);
    }

    return { x, y, r: pr };
  }

  /* ─── answer burst: planets converge then scatter ─── */
  let burstPhase = 0; // 0=idle 1=converge 2=scatter
  let burstPlanetPositions = null;

  function drawAnswerBurst(sc) {
    if (answerBurst <= 0) return;
    answerBurst = Math.max(0, answerBurst - 0.012);

    // radial burst from sun
    const burstR = (1 - answerBurst) * 500 * sc;
    const alpha = answerBurst * 0.4;
    const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, burstR);
    g.addColorStop(0, `rgba(0,200,220,${alpha * 0.3})`);
    g.addColorStop(0.5, `rgba(0,180,200,${alpha * 0.15})`);
    g.addColorStop(1, 'rgba(0,180,200,0)');
    ctx.beginPath();
    ctx.arc(CX, CY, burstR, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // alignment lines
    if (answerBurst > 0.3) {
      const lineAlpha = (answerBurst - 0.3) / 0.7 * 0.5;
      ctx.beginPath();
      ctx.moveTo(0, CY);
      ctx.lineTo(W, CY);
      ctx.strokeStyle = `rgba(0,210,230,${lineAlpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  /* ─── main loop ─── */
  function frame(ts) {
    frameId = requestAnimationFrame(frame);
    const dt = Math.min(ts - lastTs, 32);
    lastTs = ts;

    if (lylaMode === 'thinking') lylaThinkT += dt;

    const sc = getScale();
    ctx.clearRect(0, 0, W, H);

    drawStars(ts);
    drawAnswerBurst(sc);
    drawSun(sc);

    for (const p of planets) {
      drawPlanet(p, sc, ts);
    }

    frameId = null; // will be set next RAF
  }

  frameId = requestAnimationFrame(frame);

  /* ─── public API ─── */
  window.KD_pulse = function (route) {
    if (route === 'vega' || route === 'crisis') {
      // brief flash
    }
  };

  window.LYLA_thinking = function () {
    lylaMode = 'thinking';
    lylaThinkT = 0;
  };

  window.LYLA_answered = function () {
    lylaMode = 'answering';
    answerBurst = 1.0;
    setTimeout(() => { lylaMode = 'idle'; }, 3000);
  };

  // hook into existing run() events
  const origAddThinking = window.addThinking;
  window.addThinking = function () {
    window.LYLA_thinking();
    if (origAddThinking) origAddThinking.apply(this, arguments);
  };

  const origRemoveThinking = window.removeThinking;
  window.removeThinking = function () {
    window.LYLA_answered();
    if (origRemoveThinking) origRemoveThinking.apply(this, arguments);
  };

  /* ─── util ─── */
  function shadeColor(hex, amt) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, Math.min(255, r + amt));
    g = Math.max(0, Math.min(255, g + amt));
    b = Math.max(0, Math.min(255, b + amt));
    return `rgb(${r},${g},${b})`;
  }

})();
