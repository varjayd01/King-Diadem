/* ============================================================
   KING DIADEM — galaxy_scene.js v13
   ★ 240fps capable — requestAnimationFrame with delta time
   ★ LYLA thinking mode — all planets speed up + converge
   ★ On answer — planets align to same plane then scatter
   ★ Dark warp intro — gold/teal streaks
   ★ Zero layout thrash — single canvas, no DOM reads in loop
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('galaxy');
  if (!cv) return;
  if (!window.KD) window.KD = {};
  if (!window.KD.state) window.KD.state = {};

  /* ── 2D context, transparent so CSS bg shows through ── */
  var ctx = cv.getContext('2d', { alpha: true, desynchronized: true });
  var W = 0, H = 0, CX = 0, CY = 0;
  var lastTime = 0;
  var t0 = performance.now();

  /* ════════════════════════════════════════════════
     RESIZE — debounced, rebuild only what's needed
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
     idle → thinking → converging → answering → idle
  ════════════════════════════════════════════════ */
  var STATE = {
    mode: 'idle',          /* idle | thinking | converging | answering */
    thinkStart: 0,
    convergeStart: 0,
    answerStart: 0,
    convergeProgress: 0,   /* 0→1 tilt converging */
    answerProgress: 0,     /* 0→1 scatter back */
    baseTilt: 0.25,
    currentTilt: 0.25,
  };

  /* ════════════════════════════════════════════════
     PLANETS
  ════════════════════════════════════════════════ */
  var PLANETS = [];

  function rebuildPlanets() {
    var prev = PLANETS;

    var solar = [
      { color: '#8899bb', sz: sc(3.2), orb: sc(52),  baseSpd: 0.0046, ring: false, moon: false },
      { color: '#c4956a', sz: sc(5.8), orb: sc(84),  baseSpd: 0.0034, ring: false, moon: false },
      { color: '#1e55bb', sz: sc(6.8), orb: sc(122), baseSpd: 0.0024, ring: false, moon: true  },
      { color: '#993322', sz: sc(5),   orb: sc(164), baseSpd: 0.0020, ring: false, moon: false },
      { color: '#bb8833', sz: sc(13),  orb: sc(230), baseSpd: 0.0011, ring: false, moon: false },
      { color: '#ccbb66', sz: sc(10),  orb: sc(296), baseSpd: 0.0008, ring: true,  moon: false },
      { color: '#336688', sz: sc(8),   orb: sc(356), baseSpd: 0.0006, ring: false, moon: false },
      { color: '#1122aa', sz: sc(7),   orb: sc(410), baseSpd: 0.0004, ring: false, moon: false },
    ];

    var kd = [
      { color: '#00ffee', sz: sc(9),   orb: sc(100), baseSpd: 0.0018, ring: false, moon: false,
        kd: 'WATERLINE', kdColor: '#00ffee', kdGlow: 'rgba(0,255,238,0.60)' },
      { color: '#ffdd88', sz: sc(8.5), orb: sc(196), baseSpd: 0.0015, ring: false, moon: false,
        kd: 'VEGA ◆',   kdColor: '#ffdd88', kdGlow: 'rgba(255,221,136,0.55)' },
      { color: '#ff5555', sz: sc(6.5), orb: sc(140), baseSpd: 0.0030, ring: false, moon: false,
        kd: 'HALT',     kdColor: '#ff8888', kdGlow: 'rgba(255,80,80,0.50)'   },
      { color: '#bb88ff', sz: sc(7),   orb: sc(318), baseSpd: 0.0006, ring: false, moon: false,
        kd: 'CIVIL',    kdColor: '#cc99ff', kdGlow: 'rgba(180,140,255,0.50)' },
      { color: '#ffaa44', sz: sc(6),   orb: sc(258), baseSpd: 0.0009, ring: false, moon: false,
        kd: 'FATE',     kdColor: '#ffcc77', kdGlow: 'rgba(255,170,68,0.50)'  },
    ];

    PLANETS = solar.concat(kd);

    var defaults = [0,1.2,2.5,4.0,1.8,3.2,5.5,2.8,0.5,3.5,1.0,4.5,2.1];
    PLANETS.forEach(function (p, i) {
      p.ang     = (prev[i] && prev[i].ang  != null) ? prev[i].ang  : (defaults[i] || Math.random() * Math.PI * 2);
      p.spd     = p.baseSpd;
      p.tiltOff = (Math.random() - 0.5) * 0.08; /* subtle individual tilt offset */
    });
  }

  /* ════════════════════════════════════════════════
     STAR FIELD — built once, reused every frame
  ════════════════════════════════════════════════ */
  var STARS = [];
  var MW    = [];

  function buildStarField() {
    /* foreground stars */
    STARS = [];
    for (var i = 0; i < 650; i++) {
      var bright = Math.random() > 0.91;
      var t = Math.random();
      STARS.push({
        x: Math.random(), y: Math.random(),
        s: bright ? 0.85 + Math.random() * 0.8 : 0.12 + Math.random() * 0.40,
        a: bright ? 0.55 + Math.random() * 0.35 : 0.08 + Math.random() * 0.22,
        r: t > 0.88 ? 255 : t > 0.65 ? 200 : 170,
        g: t > 0.88 ? 150 : t > 0.65 ? 210 : 210,
        b: t > 0.88 ?  80 : t > 0.65 ? 255 : 255,
        bloom: bright && Math.random() > 0.35,
        tw: Math.random() * Math.PI * 2,
        tws: 0.012 + Math.random() * 0.022,
        twa: bright ? 0.16 + Math.random() * 0.20 : 0.03 + Math.random() * 0.07,
        vx: (Math.random() - 0.5) * 0.0000028,
        vy: (Math.random() - 0.5) * 0.0000018,
      });
    }

    /* milky way */
    MW = [];
    var arms = [{a:0,n:450},{a:Math.PI*.5,n:380},{a:Math.PI,n:340},{a:Math.PI*1.5,n:300}];
    arms.forEach(function (arm) {
      for (var i = 0; i < arm.n; i++) {
        var r = 400 + Math.random() * 1600;
        var th = arm.a + r / 360 + (Math.random() - 0.5) * 1.0;
        var sp = 40 + r * 0.05;
        MW.push({
          x: Math.cos(th)*r + (Math.random()-0.5)*sp,
          y: (Math.random()-0.5)*sp*0.1,
          z: Math.sin(th)*r + (Math.random()-0.5)*sp*0.3,
          s: 0.15 + Math.random() * 0.55,
          a: 0.05 + Math.random() * 0.25,
        });
      }
    });
    /* halo stars */
    for (var i = 0; i < 600; i++) {
      var r = 1800 + Math.random() * 3600;
      var th = Math.random() * Math.PI * 2;
      var ph = (Math.random() - 0.5) * Math.PI;
      MW.push({
        x: r*Math.cos(th)*Math.cos(ph), y: r*Math.sin(ph)*0.08,
        z: r*Math.sin(th)*Math.cos(ph),
        s: 0.08 + Math.random() * 0.28, a: 0.02 + Math.random() * 0.10,
      });
    }
  }

  /* ════════════════════════════════════════════════
     CAMERA — auto-rotate, drag override
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

    /* deep void base */
    ctx.globalCompositeOperation = 'source-over';
    var base = ctx.createRadialGradient(CX, CY*0.65, 0, CX, CY, Math.max(W,H)*0.9);
    base.addColorStop(0,   'rgba(10,5,28,0.94)');
    base.addColorStop(0.5, 'rgba(4,2,14,0.97)');
    base.addColorStop(1,   'rgba(0,0,4,1)');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    /* nebula — screen blend, animated slow drift */
    ctx.globalCompositeOperation = 'screen';
    var t = now * 0.001;
    var clouds = [
      { x: W*0.12+Math.sin(t*0.007)*W*0.03, y: H*0.22+Math.cos(t*0.005)*H*0.02, r: Math.max(W,H)*0.50, c: 'rgba(75,18,155,0.20)' },
      { x: W*0.84+Math.cos(t*0.006)*W*0.025,y: H*0.28+Math.sin(t*0.008)*H*0.02, r: Math.max(W,H)*0.44, c: 'rgba(100,22,175,0.16)' },
      { x: W*0.78+Math.sin(t*0.009)*W*0.02, y: H*0.72+Math.cos(t*0.007)*H*0.02, r: Math.max(W,H)*0.40, c: 'rgba(135,48,10,0.18)'  },
      { x: CX+Math.cos(t*0.008)*W*0.04,     y: CY+Math.sin(t*0.006)*H*0.03,     r: Math.max(W,H)*0.32, c: 'rgba(180,90,15,0.10)'  },
      { x: W*0.10+Math.cos(t*0.010)*W*0.02, y: H*0.70+Math.sin(t*0.009)*H*0.02, r: Math.max(W,H)*0.34, c: 'rgba(0,80,90,0.07)'    },
    ];
    clouds.forEach(function(c) {
      var g = ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,c.r);
      g.addColorStop(0, c.c); g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawMW() {
    var cyaw = Math.cos(CAM.yaw), syaw = Math.sin(CAM.yaw);
    var cp   = Math.cos(CAM.pitch), sp = Math.sin(CAM.pitch);
    for (var i = 0; i < MW.length; i++) {
      var s  = MW[i];
      var rx = s.x*cyaw - s.z*syaw;
      var rz = s.x*syaw + s.z*cyaw;
      var ry = s.y*cp - rz*sp;
      var rz2= s.y*sp + rz*cp;
      var d  = rz2 + CAM.fov*1.3; if (d < 40) continue;
      var sc2= Math.max(0.07, s.s*Math.min(1,400/d));
      var al = s.a*Math.min(1,260/d); if (al < 0.01) continue;
      var px = CX + rx*(CAM.fov/d);
      var py = CY - ry*(CAM.fov/d);
      ctx.beginPath(); ctx.arc(px,py,sc2,0,Math.PI*2);
      ctx.fillStyle = 'rgba(150,165,220,'+al+')'; ctx.fill();
    }
  }

  function drawStars(now) {
    for (var i = 0; i < STARS.length; i++) {
      var s  = STARS[i];
      s.x = ((s.x + s.vx + 1) % 1);
      s.y = ((s.y + s.vy + 1) % 1);
      var tw = s.a * (1 + Math.sin(now*s.tws*0.06 + s.tw)*s.twa);
      var px = s.x*W, py = s.y*H;
      ctx.beginPath(); ctx.arc(px,py,s.s,0,Math.PI*2);
      ctx.fillStyle = 'rgba('+s.r+','+s.g+','+s.b+','+Math.min(1,tw)+')';
      ctx.fill();
      if (s.bloom) {
        var bl = s.s * 3;
        ctx.strokeStyle = 'rgba('+s.r+','+s.g+','+s.b+','+(tw*0.10)+')';
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
        ? 'rgba('+hexRgb(p.kdColor||'#ffffff')+',0.13)'
        : 'rgba(150,165,220,0.05)';
      ctx.lineWidth = p.kd ? 0.9 : 0.5;
      ctx.stroke();
    });
  }

  function hexRgb(h) {
    return parseInt(h.slice(1,3),16)+','+parseInt(h.slice(3,5),16)+','+parseInt(h.slice(5,7),16);
  }

  /* ── Planet rendering — 6 passes ── */
  function drawPlanetAt(x, y, p, tiltY) {
    var sz  = p.sz;
    var R=parseInt(p.color.slice(1,3),16), G=parseInt(p.color.slice(3,5),16), B=parseInt(p.color.slice(5,7),16);

    /* KD node outer glow */
    if (p.kd && p.kdGlow) {
      ctx.globalCompositeOperation = 'screen';
      var halo = ctx.createRadialGradient(x,y,sz*0.4,x,y,sz*5.2);
      halo.addColorStop(0, p.kdGlow);
      halo.addColorStop(0.35, p.kdGlow.replace(/[\d.]+\)$/, '0.18)'));
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x,y,sz*5.2,0,Math.PI*2);
      ctx.fillStyle = halo; ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    /* atmosphere */
    var atm = ctx.createRadialGradient(x,y,sz*0.75,x,y,sz*1.65);
    atm.addColorStop(0,   'rgba('+R+','+G+','+B+',0)');
    atm.addColorStop(0.55,'rgba('+R+','+G+','+B+',0.14)');
    atm.addColorStop(1,   'rgba('+R+','+G+','+B+',0.32)');
    ctx.beginPath(); ctx.arc(x,y,sz*1.65,0,Math.PI*2); ctx.fillStyle=atm; ctx.fill();

    /* dark base */
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2);
    ctx.fillStyle='rgb('+Math.round(R*0.08)+','+Math.round(G*0.08)+','+Math.round(B*0.08)+')';
    ctx.fill();

    /* lit side */
    var dx=CX-x, dy=CY-y, dd=Math.hypot(dx,dy)||1, lx=dx/dd, ly=dy/dd;
    var lit = ctx.createRadialGradient(x+lx*sz*0.5,y+ly*sz*0.5,0,x,y,sz*1.05);
    lit.addColorStop(0,    'rgba(255,255,255,0.90)');
    lit.addColorStop(0.12, 'rgba('+Math.min(255,R+100)+','+Math.min(255,G+100)+','+Math.min(255,B+100)+',0.95)');
    lit.addColorStop(0.40, 'rgba('+R+','+G+','+B+',0.88)');
    lit.addColorStop(0.70, 'rgba('+Math.round(R*0.42)+','+Math.round(G*0.42)+','+Math.round(B*0.42)+',0.58)');
    lit.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fillStyle=lit; ctx.fill();

    /* terminator */
    var shd = ctx.createRadialGradient(x-lx*sz*0.35,y-ly*sz*0.35,sz*0.1,x-lx*sz*0.35,y-ly*sz*0.35,sz*1.1);
    shd.addColorStop(0,'rgba(0,0,8,0)'); shd.addColorStop(0.5,'rgba(0,0,8,0.38)'); shd.addColorStop(1,'rgba(0,0,8,0.85)');
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fillStyle=shd; ctx.fill();

    /* specular */
    var spec = ctx.createRadialGradient(x+lx*sz*0.38,y+ly*sz*0.38,0,x+lx*sz*0.38,y+ly*sz*0.38,sz*0.28);
    spec.addColorStop(0,'rgba(255,255,255,0.65)'); spec.addColorStop(0.5,'rgba(255,255,255,0.06)'); spec.addColorStop(1,'rgba(255,255,255,0)');
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fillStyle=spec; ctx.fill();
  }

  function drawPlanets(dt, now, tilt) {
    var isThinking   = STATE.mode === 'thinking';
    var isConverging = STATE.mode === 'converging';

    /* update angles */
    PLANETS.forEach(function(p) {
      var boost = 1;
      if (isThinking || isConverging) {
        /* all planets speed up during thinking */
        boost = 1 + STATE.convergeProgress * 5;
      }
      p.ang += p.spd * boost * dt * 60;
    });

    /* compute current tilt */
    var renderTilt = tilt;

    /* sort by y for painter's algo */
    var items = PLANETS.map(function(p) {
      var x = CX + Math.cos(p.ang) * p.orb;
      var y = CY + Math.sin(p.ang) * p.orb * renderTilt;
      return { p:p, x:x, y:y };
    }).sort(function(a,b){ return a.y - b.y; });

    items.forEach(function(item) {
      var p=item.p, x=item.x, y=item.y;
      drawPlanetAt(x, y, p, renderTilt);

      /* saturn ring */
      if (p.ring) {
        ctx.save(); ctx.translate(x,y); ctx.scale(1, renderTilt*0.72);
        var rg = ctx.createRadialGradient(0,0,p.sz*1.8,0,0,p.sz*3.3);
        rg.addColorStop(0,   'rgba(215,190,120,0)');
        rg.addColorStop(0.18,'rgba(215,190,120,0.50)');
        rg.addColorStop(0.65,'rgba(195,165,90,0.30)');
        rg.addColorStop(1,   'rgba(175,145,70,0)');
        ctx.beginPath(); ctx.arc(0,0,p.sz*3.3,0,Math.PI*2); ctx.fillStyle=rg; ctx.fill();
        ctx.restore();
      }

      /* moon */
      if (p.moon) {
        var ma=p.ang*8, mx=x+Math.cos(ma)*sc(16), my=y+Math.sin(ma)*sc(4);
        var msz=sc(1.8), mdx=CX-mx, mdy=CY-my, mdd=Math.hypot(mdx,mdy)||1;
        var mlx=mdx/mdd, mly=mdy/mdd;
        var mg=ctx.createRadialGradient(mx+mlx*msz*0.4,my+mly*msz*0.4,0,mx,my,msz);
        mg.addColorStop(0,'rgba(240,248,255,0.95)'); mg.addColorStop(0.5,'rgba(148,158,175,0.75)'); mg.addColorStop(1,'rgba(12,16,28,0.20)');
        ctx.beginPath(); ctx.arc(mx,my,msz,0,Math.PI*2); ctx.fillStyle=mg; ctx.fill();
      }

      /* KD label */
      if (p.kd) {
        var fs = Math.max(9, Math.round(p.sz*0.75));
        ctx.shadowColor = p.kdColor||'#ffffff'; ctx.shadowBlur = 14;
        ctx.fillStyle   = p.kdColor||'#ffffff';
        ctx.font        = '600 '+fs+'px "DM Mono",monospace';
        ctx.textAlign   = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(p.kd, x, y - p.sz - 7);
        ctx.shadowBlur  = 0; ctx.textBaseline = 'alphabetic';
      }
    });
  }

  /* ════════════════════════════════════════════════
     ORBITAL LIGHT RINGS — blue + gold sweep
  ════════════════════════════════════════════════ */
  function drawOrbitalRings(now, tilt) {
    var t = now * 0.001;
    var R1 = sc(148), R2 = sc(158);

    ctx.globalCompositeOperation = 'screen';
    ctx.save(); ctx.translate(CX,CY); ctx.scale(1,tilt);

    /* blue ring */
    var bAng = t * 0.22;
    for (var i = 0; i < 55; i++) {
      var f = i / 55;
      var a = bAng - 1.75*f + 1.75;
      var alpha = f * 0.85;
      ctx.beginPath(); ctx.arc(Math.cos(a)*R1, Math.sin(a)*R1, 0.6+f*2.2, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(0,210,255,'+alpha+')'; ctx.fill();
    }
    /* blue head */
    var bx=Math.cos(bAng)*R1, by=Math.sin(bAng)*R1;
    var bh=ctx.createRadialGradient(bx,by,0,bx,by,sc(4));
    bh.addColorStop(0,'rgba(180,245,255,0.95)'); bh.addColorStop(0.5,'rgba(0,190,255,0.5)'); bh.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(bx,by,sc(4),0,Math.PI*2); ctx.fillStyle=bh; ctx.fill();

    /* gold ring — offset */
    var gAng = t * 0.22 + Math.PI * 0.65;
    for (var i = 0; i < 55; i++) {
      var f = i / 55;
      var a = gAng - 1.75*f + 1.75;
      var alpha = f * 0.80;
      ctx.beginPath(); ctx.arc(Math.cos(a)*R2, Math.sin(a)*R2, 0.6+f*2.2, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,178,30,'+alpha+')'; ctx.fill();
    }
    var gx=Math.cos(gAng)*R2, gy=Math.sin(gAng)*R2;
    var gh=ctx.createRadialGradient(gx,gy,0,gx,gy,sc(4));
    gh.addColorStop(0,'rgba(255,242,180,0.95)'); gh.addColorStop(0.5,'rgba(255,170,30,0.5)'); gh.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(gx,gy,sc(4),0,Math.PI*2); ctx.fillStyle=gh; ctx.fill();

    /* faint ring outlines */
    ctx.beginPath(); ctx.arc(0,0,R1,0,Math.PI*2);
    ctx.strokeStyle='rgba(0,180,220,0.10)'; ctx.lineWidth=0.8; ctx.stroke();
    ctx.beginPath(); ctx.arc(0,0,R2,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,160,20,0.08)'; ctx.lineWidth=0.8; ctx.stroke();

    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════════════════════════════════════════════
     SUN — LYLA ◈
  ════════════════════════════════════════════════ */
  function drawSun(now) {
    var R   = sc(27);
    var t   = now * 0.001;
    var isT = STATE.mode === 'thinking' || STATE.mode === 'converging';

    /* thinking pulse — sun glows brighter */
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
    halo.addColorStop(0.07,'rgba(255,218,105,0.78)');
    halo.addColorStop(0.28,'rgba(255,130,40,0.40)');
    halo.addColorStop(0.55,'rgba(155,38,5,0.13)');
    halo.addColorStop(1,  'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CX,CY,R*3,0,Math.PI*2); ctx.fillStyle=halo; ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    /* disk */
    var disk = ctx.createRadialGradient(CX-R*0.18,CY-R*0.18,0,CX,CY,R);
    disk.addColorStop(0,   '#fffef8');
    disk.addColorStop(0.10,'#fff3a0');
    disk.addColorStop(0.32,'#ffcb52');
    disk.addColorStop(0.58,'#ff7c18');
    disk.addColorStop(0.80,'#bf2400');
    disk.addColorStop(1,   '#180200');
    ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2); ctx.fillStyle=disk; ctx.fill();

    /* LYLA ◈ label */
    var fs = Math.max(8, Math.floor(R*0.28));
    ctx.shadowColor = 'rgba(255,220,100,0.95)'; ctx.shadowBlur = isT ? 20 : 12;
    ctx.fillStyle   = 'rgba(255,252,230,0.90)';
    ctx.font        = '600 '+fs+'px "DM Mono",monospace';
    ctx.textAlign   = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('LYLA ◈', CX, CY + R*1.48);
    ctx.shadowBlur  = 0; ctx.textBaseline = 'alphabetic';

    /* thinking ring — concentric pulse */
    if (isT) {
      ctx.globalCompositeOperation = 'screen';
      var pRad = R * (1.8 + Math.sin(t*6)*0.4);
      ctx.beginPath(); ctx.arc(CX,CY,pRad,0,Math.PI*2);
      ctx.strokeStyle = 'rgba(0,220,255,'+(0.3+Math.sin(t*8)*0.2)+')';
      ctx.lineWidth   = 1.5; ctx.stroke();
      var pRad2 = R * (2.4 + Math.sin(t*6+1)*0.5);
      ctx.beginPath(); ctx.arc(CX,CY,pRad2,0,Math.PI*2);
      ctx.strokeStyle = 'rgba(255,200,60,'+(0.2+Math.sin(t*6+2)*0.15)+')';
      ctx.lineWidth   = 1; ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  /* ════════════════════════════════════════════════
     CONVERGENCE EFFECT — planets align then scatter
  ════════════════════════════════════════════════ */
  function easeInOut(t) {
    return t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
  }

  function updateState(now) {
    var t = now * 0.001;

    if (STATE.mode === 'thinking') {
      /* ramp up converge progress while thinking */
      var elapsed = (now - STATE.thinkStart) * 0.001;
      STATE.convergeProgress = Math.min(1, elapsed / 2.0);

      /* tilt slowly flattens */
      STATE.currentTilt = STATE.baseTilt * (1 - STATE.convergeProgress * 0.7);
    }
    else if (STATE.mode === 'converging') {
      var elapsed = (now - STATE.convergeStart) * 0.001;
      STATE.convergeProgress = Math.min(1, elapsed / 1.2);
      STATE.currentTilt = STATE.baseTilt * (1 - easeInOut(STATE.convergeProgress) * 0.85);

      if (STATE.convergeProgress >= 1) {
        STATE.mode = 'answering';
        STATE.answerStart = now;
      }
    }
    else if (STATE.mode === 'answering') {
      var elapsed = (now - STATE.answerStart) * 0.001;
      STATE.answerProgress = Math.min(1, elapsed / 1.5);
      /* scatter back */
      STATE.currentTilt = STATE.baseTilt * (0.15 + easeInOut(STATE.answerProgress) * 0.85);

      if (STATE.answerProgress >= 1) {
        STATE.mode = 'idle';
        STATE.currentTilt = STATE.baseTilt;
        STATE.convergeProgress = 0;
      }
    }
    else {
      STATE.currentTilt = STATE.baseTilt;
      STATE.convergeProgress = 0;
    }
  }

  /* ── Convergence flash — white flash when planets align ── */
  var flashAlpha = 0;
  var prevMode   = 'idle';

  /* ════════════════════════════════════════════════
     PULSES
  ════════════════════════════════════════════════ */
  var pulses = [];
  var ROUTE_COLORS = {
    general:[96,165,250], risk:[248,113,113], survival:[52,211,153],
    collapse:[251,146,60], civil:[167,139,250], vega:[255,220,140], crisis:[239,68,68]
  };

  window.KD_pulse = function(route) {
    var c = ROUTE_COLORS[route] || [96,165,250];
    for (var i = 0; i < 5; i++) {
      (function(ii,col){
        setTimeout(function(){
          pulses.push({ r:0, maxR:Math.min(W,H)*(0.06+ii*0.12), alpha:0.65-ii*0.10, col:col });
        }, ii*65);
      })(i, c);
    }
  };

  function drawPulses() {
    pulses = pulses.filter(function(p){ return p.alpha > 0.004; });
    pulses.forEach(function(p) {
      p.r     += (p.maxR - p.r) * 0.022;
      p.alpha *= 0.942;
      ctx.strokeStyle = 'rgba('+p.col[0]+','+p.col[1]+','+p.col[2]+','+(p.alpha*0.5)+')';
      ctx.lineWidth   = 1.3 * p.alpha;
      ctx.beginPath(); ctx.arc(CX,CY,p.r,0,Math.PI*2); ctx.stroke();
    });
  }

  /* ════════════════════════════════════════════════
     PUBLIC API — called from app.js
  ════════════════════════════════════════════════ */

  /* Call when user sends message → LYLA starts thinking */
  window.KD_thinking = function() {
    STATE.mode       = 'thinking';
    STATE.thinkStart = performance.now();
    STATE.convergeProgress = 0;
  };

  /* Call when answer arrives → converge then scatter */
  window.KD_answer = function() {
    if (STATE.mode === 'thinking' || STATE.mode === 'idle') {
      STATE.mode          = 'converging';
      STATE.convergeStart = performance.now();
      STATE.convergeProgress = 1;
      flashAlpha = 0.6; /* trigger flash */
    }
  };

  /* Legacy pulse still works */
  window.addEventListener('KD:response', function(e) {
    if (e.detail) {
      window.KD.state = e.detail;
      window.KD_answer();
      window.KD_pulse((e.detail.output && e.detail.output.action) || 'general');
    }
  });

  /* ════════════════════════════════════════════════
     MAIN RENDER LOOP — delta time, uncapped fps
  ════════════════════════════════════════════════ */
  function frame(now) {
    var dt = Math.min((now - lastTime) / 16.667, 3); /* cap dt at 3 frames */
    lastTime = now;

    if (CAM.auto) CAM.yaw += 0.000075 * dt;

    updateState(now);

    var tilt = STATE.currentTilt;

    drawBg(now);
    drawStars(now);
    drawMW();
    drawOrbitalRings(now, tilt);
    drawOrbitRings(tilt);
    drawPulses();
    drawPlanets(dt, now, tilt);
    drawSun(now);

    /* convergence flash */
    if (flashAlpha > 0.005) {
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = 'rgba(200,230,255,'+flashAlpha+')';
      ctx.fillRect(0,0,W,H);
      ctx.globalCompositeOperation = 'source-over';
      flashAlpha *= 0.88;
    }

    requestAnimationFrame(frame);
  }

  lastTime = performance.now();
  requestAnimationFrame(frame);

})();
