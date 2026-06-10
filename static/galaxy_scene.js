/* ============================================================
   KING DIADEM — galaxy_scene.js v14
   ★ Solar system only — no Milky Way arm / Bermuda Triangle
   ★ LYLA = Sun (center)
   ★ KD Nodes: WATERLINE, VEGA, HALT, CIVIL, FATE orbit as planets
   ★ Solar planets fill the rest of the orbits
   ★ Logo image replaces crown emoji in intro
   ★ LYLA thinking mode — all planets speed up + converge
   ★ On answer — planets align then scatter back
   ★ K stars = Cosmic Latte #FFF8E7 | D stars = teal #00D2FF
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('galaxy');
  if (!cv) return;
  if (!window.KD) window.KD = {};
  if (!window.KD.state) window.KD.state = {};

  var ctx = cv.getContext('2d', { alpha: true, desynchronized: true });
  var W = 0, H = 0, CX = 0, CY = 0;
  var lastTime = 0;

  /* ── Logo image preload ── */
  var _logoImg = new Image();
  _logoImg.src = '/static/logo.png';

  /* ════════════════════════════════════════════════
     RESIZE
  ════════════════════════════════════════════════ */
  var resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(doResize, 120);
  }
  function doResize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    CX = W * 0.5; CY = H * 0.5;
    rebuildPlanets();
    buildStarField();
  }
  window.addEventListener('resize', onResize, { passive: true });
  doResize();

  function sc(v) { return v * Math.min(W, H) / 768; }

  /* ════════════════════════════════════════════════
     STATE MACHINE
  ════════════════════════════════════════════════ */
  var STATE = {
    mode: 'idle',
    convergeProgress: 0,
    baseTilt: 0.25,
    currentTilt: 0.25,
  };

  /* ════════════════════════════════════════════════
     PLANETS — KD System + Solar fill
     LYLA is the Sun (drawn separately at center)
  ════════════════════════════════════════════════ */
  var PLANETS = [];

  function rebuildPlanets() {
    var prev = PLANETS;

    /* ── KD Governance nodes ── */
    var kdNodes = [
      { color: '#00ffee', sz: sc(8.5), orb: sc(80),  baseSpd: 0.0030,
        kd: 'WATERLINE', kdColor: '#00ffee', kdGlow: 'rgba(0,255,238,0.60)' },
      { color: '#ffdd88', sz: sc(8.5), orb: sc(148), baseSpd: 0.0020,
        kd: 'VEGA ◆',   kdColor: '#ffdd88', kdGlow: 'rgba(255,221,136,0.55)' },
      { color: '#ff5555', sz: sc(6.5), orb: sc(116), baseSpd: 0.0028,
        kd: 'HALT',     kdColor: '#ff8888', kdGlow: 'rgba(255,80,80,0.50)'   },
      { color: '#bb88ff', sz: sc(7.0), orb: sc(240), baseSpd: 0.0008,
        kd: 'CIVIL',    kdColor: '#cc99ff', kdGlow: 'rgba(180,140,255,0.50)' },
      { color: '#ffaa44', sz: sc(6.0), orb: sc(196), baseSpd: 0.0012,
        kd: 'FATE',     kdColor: '#ffcc77', kdGlow: 'rgba(255,170,68,0.50)'  },
    ];

    /* ── Solar filler planets ── */
    var solar = [
      { color: '#8899bb', sz: sc(3.0), orb: sc(50),  baseSpd: 0.0048 },
      { color: '#c4956a', sz: sc(5.5), orb: sc(170), baseSpd: 0.0016 },
      { color: '#993322', sz: sc(4.8), orb: sc(290), baseSpd: 0.0006, ring: false },
      { color: '#ccbb66', sz: sc(9.5), orb: sc(340), baseSpd: 0.0004, ring: true  },
      { color: '#336688', sz: sc(7.5), orb: sc(400), baseSpd: 0.0003 },
    ];

    PLANETS = kdNodes.concat(solar);

    var defaults = [0.4, 2.1, 1.2, 4.6, 3.3, 0.9, 5.5, 1.8, 3.0, 2.4];
    PLANETS.forEach(function (p, i) {
      p.ang     = (prev[i] && prev[i].ang != null) ? prev[i].ang : (defaults[i] || Math.random() * Math.PI * 2);
      p.spd     = p.baseSpd;
      p.tiltOff = (Math.random() - 0.5) * 0.06;
    });
  }

  /* ════════════════════════════════════════════════
     STAR FIELD — foreground only, no Milky Way arms
     K stars = Cosmic Latte, D stars = teal
  ════════════════════════════════════════════════ */
  var STARS = [];

  function buildStarField() {
    STARS = [];
    for (var i = 0; i < 520; i++) {
      var bright = Math.random() > 0.88;
      /* alternate K (warm/cosmic latte) and D (teal) distribution */
      var isK = Math.random() > 0.35; /* ~65% K stars (warmer), 35% D stars */
      STARS.push({
        x: Math.random(), y: Math.random(),
        s: bright ? 0.80 + Math.random() * 0.9 : 0.10 + Math.random() * 0.38,
        a: bright ? 0.50 + Math.random() * 0.38 : 0.07 + Math.random() * 0.20,
        isK: isK,
        bloom: bright && Math.random() > 0.40,
        tw: Math.random() * Math.PI * 2,
        tws: 0.010 + Math.random() * 0.025,
        twa: bright ? 0.14 + Math.random() * 0.22 : 0.03 + Math.random() * 0.08,
        vx: (Math.random() - 0.5) * 0.0000025,
        vy: (Math.random() - 0.5) * 0.0000015,
      });
    }
  }

  /* ════════════════════════════════════════════════
     CAMERA
  ════════════════════════════════════════════════ */
  var CAM = { yaw: 0, pitch: 0.14, fov: 420, auto: true };
  var drag = { on: false, x: 0, y: 0 };

  function dn(x,y){ drag.on=true; drag.x=x; drag.y=y; CAM.auto=false; }
  function mv(x,y){
    if (!drag.on) return;
    CAM.yaw   -= (x - drag.x) * 0.003;
    CAM.pitch += (y - drag.y) * 0.002;
    CAM.pitch  = Math.max(-0.5, Math.min(0.7, CAM.pitch));
    drag.x = x; drag.y = y;
  }
  function up(){ drag.on = false; }

  cv.addEventListener('mousedown',  function(e){ dn(e.clientX,e.clientY); });
  cv.addEventListener('mousemove',  function(e){ mv(e.clientX,e.clientY); });
  cv.addEventListener('mouseup',    up);
  cv.addEventListener('mouseleave', up);
  cv.addEventListener('touchstart', function(e){ if(e.touches.length===1) dn(e.touches[0].clientX,e.touches[0].clientY); e.preventDefault(); },{ passive:false });
  cv.addEventListener('touchmove',  function(e){ if(e.touches.length===1) mv(e.touches[0].clientX,e.touches[0].clientY); e.preventDefault(); },{ passive:false });
  cv.addEventListener('touchend',   up);
  cv.addEventListener('wheel',      function(e){ CAM.fov=Math.max(180,Math.min(750,CAM.fov+e.deltaY*0.3)); e.preventDefault(); },{ passive:false });

  /* ════════════════════════════════════════════════
     DRAW HELPERS
  ════════════════════════════════════════════════ */
  function drawBg(now) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    var base = ctx.createRadialGradient(CX, CY*0.65, 0, CX, CY, Math.max(W,H)*0.9);
    base.addColorStop(0,   'rgba(10,5,28,0.94)');
    base.addColorStop(0.5, 'rgba(4,2,14,0.97)');
    base.addColorStop(1,   'rgba(0,0,4,1)');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    /* nebula wisps */
    ctx.globalCompositeOperation = 'screen';
    var t = now * 0.001;
    var clouds = [
      { x: W*0.12+Math.sin(t*0.007)*W*0.03, y: H*0.22+Math.cos(t*0.005)*H*0.02, r: Math.max(W,H)*0.50, c: 'rgba(70,15,150,0.18)' },
      { x: W*0.84+Math.cos(t*0.006)*W*0.025,y: H*0.28+Math.sin(t*0.008)*H*0.02, r: Math.max(W,H)*0.42, c: 'rgba(90,20,160,0.14)' },
      { x: W*0.78+Math.sin(t*0.009)*W*0.02, y: H*0.72+Math.cos(t*0.007)*H*0.02, r: Math.max(W,H)*0.38, c: 'rgba(120,42,8,0.16)'  },
      { x: CX+Math.cos(t*0.008)*W*0.04,     y: CY+Math.sin(t*0.006)*H*0.03,     r: Math.max(W,H)*0.30, c: 'rgba(160,80,12,0.09)'  },
    ];
    clouds.forEach(function(c) {
      var g = ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,c.r);
      g.addColorStop(0, c.c); g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawStars(now) {
    for (var i = 0; i < STARS.length; i++) {
      var s = STARS[i];
      s.x = ((s.x + s.vx + 1) % 1);
      s.y = ((s.y + s.vy + 1) % 1);
      var tw = s.a * (1 + Math.sin(now * s.tws * 0.06 + s.tw) * s.twa);
      var px = s.x*W, py = s.y*H;
      /* K = Cosmic Latte 255,248,231 | D = teal 0,210,255 */
      var rgb = s.isK ? '255,248,231' : '0,210,255';
      ctx.beginPath(); ctx.arc(px, py, s.s, 0, Math.PI*2);
      ctx.fillStyle = 'rgba('+rgb+','+Math.min(1,tw)+')';
      ctx.fill();
      if (s.bloom) {
        var bl = s.s * 3.2;
        ctx.strokeStyle = 'rgba('+rgb+','+(tw*0.10)+')';
        ctx.lineWidth = 0.35; ctx.beginPath();
        ctx.moveTo(px-bl,py); ctx.lineTo(px+bl,py);
        ctx.moveTo(px,py-bl); ctx.lineTo(px,py+bl);
        ctx.stroke();
      }
    }
  }

  function drawOrbitRings(tilt) {
    PLANETS.forEach(function(p) {
      ctx.beginPath();
      ctx.ellipse(CX, CY, p.orb, p.orb*tilt, 0, 0, Math.PI*2);
      ctx.strokeStyle = p.kd
        ? 'rgba('+hexRgb(p.kdColor||'#ffffff')+',0.12)'
        : 'rgba(150,165,220,0.04)';
      ctx.lineWidth = p.kd ? 0.8 : 0.4;
      ctx.stroke();
    });
  }

  function hexRgb(h) {
    return parseInt(h.slice(1,3),16)+','+parseInt(h.slice(3,5),16)+','+parseInt(h.slice(5,7),16);
  }

  function drawPlanetAt(x, y, p) {
    var sz = p.sz;
    var R=parseInt(p.color.slice(1,3),16), G=parseInt(p.color.slice(3,5),16), B=parseInt(p.color.slice(5,7),16);

    if (p.kd && p.kdGlow) {
      ctx.globalCompositeOperation = 'screen';
      var halo = ctx.createRadialGradient(x,y,sz*0.4,x,y,sz*5.5);
      halo.addColorStop(0, p.kdGlow);
      halo.addColorStop(0.35, p.kdGlow.replace(/[\d.]+\)$/, '0.16)'));
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x,y,sz*5.5,0,Math.PI*2);
      ctx.fillStyle = halo; ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    var atm = ctx.createRadialGradient(x,y,sz*0.75,x,y,sz*1.65);
    atm.addColorStop(0,   'rgba('+R+','+G+','+B+',0)');
    atm.addColorStop(0.55,'rgba('+R+','+G+','+B+',0.12)');
    atm.addColorStop(1,   'rgba('+R+','+G+','+B+',0.28)');
    ctx.beginPath(); ctx.arc(x,y,sz*1.65,0,Math.PI*2); ctx.fillStyle=atm; ctx.fill();

    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2);
    ctx.fillStyle='rgb('+Math.round(R*0.07)+','+Math.round(G*0.07)+','+Math.round(B*0.07)+')';
    ctx.fill();

    var dx=CX-x, dy=CY-y, dd=Math.hypot(dx,dy)||1, lx=dx/dd, ly=dy/dd;
    var lit = ctx.createRadialGradient(x+lx*sz*0.5,y+ly*sz*0.5,0,x,y,sz*1.05);
    lit.addColorStop(0,    'rgba(255,255,255,0.90)');
    lit.addColorStop(0.12, 'rgba('+Math.min(255,R+100)+','+Math.min(255,G+100)+','+Math.min(255,B+100)+',0.95)');
    lit.addColorStop(0.40, 'rgba('+R+','+G+','+B+',0.88)');
    lit.addColorStop(0.70, 'rgba('+Math.round(R*0.42)+','+Math.round(G*0.42)+','+Math.round(B*0.42)+',0.55)');
    lit.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fillStyle=lit; ctx.fill();

    var shd = ctx.createRadialGradient(x-lx*sz*0.35,y-ly*sz*0.35,sz*0.1,x-lx*sz*0.35,y-ly*sz*0.35,sz*1.1);
    shd.addColorStop(0,'rgba(0,0,8,0)'); shd.addColorStop(0.5,'rgba(0,0,8,0.36)'); shd.addColorStop(1,'rgba(0,0,8,0.82)');
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fillStyle=shd; ctx.fill();

    var spec = ctx.createRadialGradient(x+lx*sz*0.38,y+ly*sz*0.38,0,x+lx*sz*0.38,y+ly*sz*0.38,sz*0.28);
    spec.addColorStop(0,'rgba(255,255,255,0.62)'); spec.addColorStop(0.5,'rgba(255,255,255,0.05)'); spec.addColorStop(1,'rgba(255,255,255,0)');
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fillStyle=spec; ctx.fill();
  }

  function drawPlanets(dt, now, tilt) {
    var isThinking   = STATE.mode === 'thinking';
    var isConverging = STATE.mode === 'converging';

    PLANETS.forEach(function(p) {
      var boost = 1;
      if (isThinking || isConverging) boost = 1 + STATE.convergeProgress * 5;
      p.ang += p.spd * boost * dt * 60;
    });

    var items = PLANETS.map(function(p) {
      var x = CX + Math.cos(p.ang) * p.orb;
      var y = CY + Math.sin(p.ang) * p.orb * tilt;
      return { p:p, x:x, y:y };
    }).sort(function(a,b){ return a.y - b.y; });

    items.forEach(function(item) {
      var p=item.p, x=item.x, y=item.y;
      drawPlanetAt(x, y, p);

      /* saturn ring */
      if (p.ring) {
        ctx.save(); ctx.translate(x,y); ctx.scale(1, tilt*0.72);
        var rg = ctx.createRadialGradient(0,0,p.sz*1.8,0,0,p.sz*3.3);
        rg.addColorStop(0,   'rgba(215,190,120,0)');
        rg.addColorStop(0.18,'rgba(215,190,120,0.48)');
        rg.addColorStop(0.65,'rgba(195,165,90,0.28)');
        rg.addColorStop(1,   'rgba(175,145,70,0)');
        ctx.beginPath(); ctx.arc(0,0,p.sz*3.3,0,Math.PI*2); ctx.fillStyle=rg; ctx.fill();
        ctx.restore();
      }

      /* KD label */
      if (p.kd) {
        var fs = Math.max(9, Math.round(p.sz * 0.80));
        ctx.shadowColor = p.kdColor||'#ffffff'; ctx.shadowBlur = 12;
        ctx.fillStyle   = p.kdColor||'#ffffff';
        ctx.font        = '600 '+fs+'px "DM Mono",monospace';
        ctx.textAlign   = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(p.kd, x, y - p.sz - 6);
        ctx.shadowBlur  = 0; ctx.textBaseline = 'alphabetic';
      }
    });
  }

  /* ════════════════════════════════════════════════
     ORBITAL LIGHT RINGS — blue + gold sweep
  ════════════════════════════════════════════════ */
  function drawOrbitalRings(now, tilt) {
    var t = now * 0.001;
    var R1 = sc(130), R2 = sc(142);

    ctx.globalCompositeOperation = 'screen';
    ctx.save(); ctx.translate(CX,CY); ctx.scale(1,tilt);

    var bAng = t * 0.22;
    for (var i = 0; i < 55; i++) {
      var f = i/55, a = bAng - 1.75*f + 1.75;
      ctx.beginPath(); ctx.arc(Math.cos(a)*R1, Math.sin(a)*R1, 0.6+f*2.2, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(0,210,255,'+(f*0.85)+')'; ctx.fill();
    }
    var bx=Math.cos(bAng)*R1, by=Math.sin(bAng)*R1;
    var bh=ctx.createRadialGradient(bx,by,0,bx,by,sc(4));
    bh.addColorStop(0,'rgba(180,245,255,0.95)'); bh.addColorStop(0.5,'rgba(0,190,255,0.5)'); bh.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(bx,by,sc(4),0,Math.PI*2); ctx.fillStyle=bh; ctx.fill();

    var gAng = t * 0.22 + Math.PI * 0.65;
    for (var i = 0; i < 55; i++) {
      var f = i/55, a = gAng - 1.75*f + 1.75;
      ctx.beginPath(); ctx.arc(Math.cos(a)*R2, Math.sin(a)*R2, 0.6+f*2.2, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,178,30,'+(f*0.80)+')'; ctx.fill();
    }
    var gx=Math.cos(gAng)*R2, gy=Math.sin(gAng)*R2;
    var gh=ctx.createRadialGradient(gx,gy,0,gx,gy,sc(4));
    gh.addColorStop(0,'rgba(255,242,180,0.95)'); gh.addColorStop(0.5,'rgba(255,170,30,0.5)'); gh.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(gx,gy,sc(4),0,Math.PI*2); ctx.fillStyle=gh; ctx.fill();

    ctx.beginPath(); ctx.arc(0,0,R1,0,Math.PI*2);
    ctx.strokeStyle='rgba(0,180,220,0.09)'; ctx.lineWidth=0.7; ctx.stroke();
    ctx.beginPath(); ctx.arc(0,0,R2,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,160,20,0.07)'; ctx.lineWidth=0.7; ctx.stroke();

    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════════════════════════════════════════════
     SUN — LYLA ◈  (center, draws logo image if loaded)
  ════════════════════════════════════════════════ */
  function drawSun(now) {
    var R   = sc(26);
    var t   = now * 0.001;
    var isT = STATE.mode === 'thinking' || STATE.mode === 'converging';
    var thinkGlow = isT ? (1 + Math.sin(t * 8) * 0.3) : 1;

    ctx.globalCompositeOperation = 'lighter';

    /* outer corona */
    var corona = ctx.createRadialGradient(CX,CY,R*0.4,CX,CY,R*8);
    corona.addColorStop(0,  'rgba(255,165,55,'+(0.20*thinkGlow)+')');
    corona.addColorStop(0.25,'rgba(255,80,15,'+(0.07*thinkGlow)+')');
    corona.addColorStop(1,  'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CX,CY,R*8,0,Math.PI*2); ctx.fillStyle=corona; ctx.fill();

    /* rays */
    ctx.save(); ctx.translate(CX,CY); ctx.rotate(t*0.0008);
    for (var i = 0; i < 20; i++) {
      var a = (i/20)*Math.PI*2;
      var rLen = R*(3.0 + 0.4*Math.sin(i*2.5+t*0.5));
      var grd = ctx.createLinearGradient(Math.cos(a)*R*0.2,Math.sin(a)*R*0.2,Math.cos(a)*rLen,Math.sin(a)*rLen);
      grd.addColorStop(0,'rgba(255,220,100,'+(0.22*thinkGlow)+')');
      grd.addColorStop(0.4,'rgba(255,130,35,0.06)');
      grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.strokeStyle=grd; ctx.lineWidth=1.6;
      ctx.beginPath(); ctx.moveTo(Math.cos(a)*R*0.2,Math.sin(a)*R*0.2); ctx.lineTo(Math.cos(a)*rLen,Math.sin(a)*rLen); ctx.stroke();
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';

    /* halo */
    ctx.globalCompositeOperation = 'lighter';
    var halo = ctx.createRadialGradient(CX,CY,R*0.5,CX,CY,R*3);
    halo.addColorStop(0,  'rgba(255,255,240,0.94)');
    halo.addColorStop(0.25,'rgba(255,220,120,0.75)');
    halo.addColorStop(0.55,'rgba(255,140,40,0.30)');
    halo.addColorStop(1,  'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CX,CY,R*3,0,Math.PI*2); ctx.fillStyle=halo; ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    /* draw logo image if loaded, else fallback sphere */
    if (_logoImg.complete && _logoImg.naturalWidth > 0) {
      var logoR = R * 1.55;
      ctx.save();
      ctx.beginPath(); ctx.arc(CX,CY,logoR,0,Math.PI*2); ctx.clip();
      ctx.globalAlpha = 0.92;
      ctx.drawImage(_logoImg, CX-logoR, CY-logoR, logoR*2, logoR*2);
      ctx.restore();
      ctx.globalAlpha = 1;
    } else {
      /* fallback: gold sphere */
      var sunGrad = ctx.createRadialGradient(CX-R*0.3,CY-R*0.3,0,CX,CY,R);
      sunGrad.addColorStop(0,'rgba(255,255,220,1)');
      sunGrad.addColorStop(0.3,'rgba(255,220,100,1)');
      sunGrad.addColorStop(0.7,'rgba(255,150,30,0.95)');
      sunGrad.addColorStop(1,'rgba(200,80,10,0.85)');
      ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2); ctx.fillStyle=sunGrad; ctx.fill();
    }

    /* LYLA label */
    ctx.globalCompositeOperation = 'screen';
    ctx.shadowColor = '#ffdd88'; ctx.shadowBlur = 20;
    ctx.fillStyle   = '#ffdd88';
    ctx.font        = '600 '+Math.max(10,Math.round(sc(10.5)))+'px "DM Mono",monospace';
    ctx.textAlign   = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('LYLA ◈', CX, CY - R * 1.7 - 4);
    ctx.shadowBlur  = 0; ctx.textBaseline = 'alphabetic';
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════════════════════════════════════════════
     MAIN LOOP
  ════════════════════════════════════════════════ */
  function loop(now) {
    if (!lastTime) lastTime = now;
    var dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    /* auto camera drift */
    if (CAM.auto) {
      CAM.yaw   += 0.00008;
      CAM.pitch  = 0.24 + Math.sin(now * 0.00009) * 0.06;
    }

    /* STATE transitions */
    if (STATE.mode === 'thinking') {
      STATE.convergeProgress = Math.min(1, STATE.convergeProgress + dt * 0.8);
    } else if (STATE.mode === 'answering') {
      STATE.convergeProgress = Math.max(0, STATE.convergeProgress - dt * 1.2);
      if (STATE.convergeProgress <= 0) STATE.mode = 'idle';
    } else if (STATE.mode === 'idle') {
      STATE.convergeProgress = Math.max(0, STATE.convergeProgress - dt * 0.5);
    }

    var tilt = STATE.baseTilt + STATE.convergeProgress * (0.85 - STATE.baseTilt);

    drawBg(now);
    drawStars(now);
    drawOrbitRings(tilt);
    drawOrbitalRings(now, tilt);
    drawPlanets(dt, now, tilt);
    drawSun(now);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ════════════════════════════════════════════════
     PUBLIC API — LYLA thinking hooks
  ════════════════════════════════════════════════ */
  window.LYLA_thinking = function() {
    STATE.mode = 'thinking';
    STATE.convergeProgress = 0;
  };
  window.LYLA_answered = function() {
    STATE.mode = 'answering';
  };
  window.KD_pulse = function(route) {
    /* brief flash based on route */
    STATE.mode = 'answering';
  };

})();
