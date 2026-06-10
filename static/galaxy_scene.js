/* ============================================================
   KING DIADEM — galaxy_scene.js v16 ★ GHOST EDITION
   คอนเซ็บ: Dark Energy · Sunyata · ไม่เกิดไม่ดับ
   กลิ่นอาย: Justin Bieber - Ghost (2021)
   — โลโก้มงกุฏเป็นศูนย์กลาง ดาวโคจรรอบ
   — Route เรืองแสง เมื่อถูกเลือก
   — Council mode → ดาวรวมกัน
   — Dark energy particles คงอยู่ตลอด
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('galaxy');
  if (!cv) return;
  if (!window.KD) window.KD = {};
  if (!window.KD.state) window.KD.state = {};

  var ctx = cv.getContext('2d', { alpha: true });
  var W = 0, H = 0, CX = 0, CY = 0;
  var lastTime = 0, now = 0;
  var mouseX = 0, mouseY = 0;
  var activeRoute = 'general';

  /* ── Logo ── */
  var _logo = new Image();
  _logo.src = '/static/logo.png';

  /* ── Mouse parallax ── */
  window.addEventListener('mousemove', function(e) {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ════════════════════════════════════════
     RESIZE — ★ FIX: canvas อยู่ fixed ไม่ถูก
     stacking context ของ #app บัง
  ════════════════════════════════════════ */
  function doResize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    CX = W * 0.5;
    CY = H * 0.5;
    buildStars();
    buildDarkEnergy();
  }
  window.addEventListener('resize', function(){ clearTimeout(_rT); _rT = setTimeout(doResize,120); }, {passive:true});
  var _rT;
  doResize();

  function sc(v) { return v * Math.min(W,H) / 800; }

  /* ════════════════════════════════════════
     STATE
  ════════════════════════════════════════ */
  var STATE = {
    mode: 'idle',           // idle | thinking | council | answering
    converge: 0,            // 0→1 council progress
    routeGlow: {},          // route → glow intensity 0-1
    tilt: 0.22,
  };

  /* ════════════════════════════════════════
     ROUTE → PLANET MAP
     ดาวแต่ละดวงผูกกับ route
  ════════════════════════════════════════ */
  var ROUTE_COLORS = {
    general:  { rgb:'0,200,220',  glow:'rgba(0,200,220,0.7)',  name:'GENERAL',  orb: 0 },
    risk:     { rgb:'255,80,80',  glow:'rgba(255,80,80,0.7)',  name:'RISK',     orb: 1 },
    survival: { rgb:'0,255,150',  glow:'rgba(0,255,150,0.7)', name:'SURVIVAL', orb: 2 },
    collapse: { rgb:'200,100,255',glow:'rgba(200,100,255,0.7)',name:'COLLAPSE', orb: 3 },
    civil:    { rgb:'200,160,255',glow:'rgba(180,130,255,0.7)',name:'CIVIL',    orb: 4 },
    vega:     { rgb:'255,220,80', glow:'rgba(255,220,80,0.7)', name:'VEGA',     orb: 5 },
  };

  /* ════════════════════════════════════════
     PLANETS — orbit data
  ════════════════════════════════════════ */
  function makePlanets() {
    return [
      // route-linked planets
      { id:'general',  route:'general',  ang:0.5,  spd:0.0028, baseOrb:0.16, sz:5.5,  type:'teal'   },
      { id:'risk',     route:'risk',     ang:1.8,  spd:0.0019, baseOrb:0.22, sz:5.0,  type:'red'    },
      { id:'survival', route:'survival', ang:3.2,  spd:0.0014, baseOrb:0.29, sz:5.8,  type:'green'  },
      { id:'collapse', route:'collapse', ang:4.5,  spd:0.0010, baseOrb:0.36, sz:5.3,  type:'purple' },
      { id:'civil',    route:'civil',    ang:0.9,  spd:0.0007, baseOrb:0.43, sz:6.0,  type:'violet' },
      { id:'vega',     route:'vega',     ang:2.6,  spd:0.0005, baseOrb:0.50, sz:6.5,  type:'gold'   },
      // ambient background planets (no route)
      { id:'a1', ang:1.1,  spd:0.0035, baseOrb:0.12, sz:2.8, type:'dust' },
      { id:'a2', ang:2.9,  spd:0.0022, baseOrb:0.19, sz:2.2, type:'dust' },
      { id:'a3', ang:4.2,  spd:0.0016, baseOrb:0.26, sz:2.5, type:'dust' },
      { id:'a4', ang:5.5,  spd:0.0013, baseOrb:0.33, sz:2.0, type:'dust' },
      { id:'a5', ang:0.3,  spd:0.0009, baseOrb:0.40, sz:2.4, type:'dust' },
      { id:'a6', ang:3.7,  spd:0.0006, baseOrb:0.47, sz:2.1, type:'dust' },
    ];
  }
  var PLANETS = makePlanets();

  /* planet type colors */
  var P_COLORS = {
    teal:   { base:'#00ccdd', atm:'0,200,220'   },
    red:    { base:'#ff5555', atm:'255,80,80'   },
    green:  { base:'#00ff99', atm:'0,255,150'   },
    purple: { base:'#cc66ff', atm:'200,100,255' },
    violet: { base:'#bb88ff', atm:'180,140,255' },
    gold:   { base:'#ffcc44', atm:'255,200,60'  },
    dust:   { base:'#8899bb', atm:'120,140,180' },
  };

  /* ════════════════════════════════════════
     STAR FIELD — 3 layers
     Cosmic Latte (#FFF8F0) + void teal
  ════════════════════════════════════════ */
  var STARS = [];
  function buildStars() {
    STARS = [];
    for (var i = 0; i < 720; i++) {
      var layer = i < 400 ? 0 : i < 600 ? 1 : 2;
      var isLatte = Math.random() > 0.38;
      STARS.push({
        x: Math.random(), y: Math.random(),
        s: 0.12 + Math.random() * (layer * 0.18 + 0.28),
        a: 0.05 + Math.random() * (layer * 0.06 + 0.18),
        isLatte: isLatte,
        tw: Math.random() * Math.PI * 2,
        tws: 0.004 + Math.random() * 0.018,
        twa: 0.04 + Math.random() * 0.14,
        bloom: Math.random() > 0.88,
        par: (layer + 1) * 0.0003,
      });
    }
  }

  /* ════════════════════════════════════════
     DARK ENERGY PARTICLES
     "ไม่เกิดไม่ดับ" — อนุภาคลอยคงอยู่
     บางส่วน flicker ระหว่าง exist/void
  ════════════════════════════════════════ */
  var DE = []; // dark energy particles
  function buildDarkEnergy() {
    DE = [];
    for (var i = 0; i < 180; i++) {
      var angle = Math.random() * Math.PI * 2;
      var dist  = 0.08 + Math.random() * 0.55;
      DE.push({
        x: 0.5 + Math.cos(angle) * dist * 0.5,
        y: 0.5 + Math.sin(angle) * dist * 0.28,
        s: 0.3 + Math.random() * 1.2,
        a: 0,          // current alpha
        peak: 0.12 + Math.random() * 0.32,
        phase: Math.random() * Math.PI * 2,
        // 'ghost' frequency — slow, haunting like the song
        freq: 0.0003 + Math.random() * 0.0012,
        type: Math.random() > 0.6 ? 'void' : 'energy',
        drift: (Math.random() - 0.5) * 0.00008,
        driftY: (Math.random() - 0.5) * 0.00004,
      });
    }
  }

  /* ════════════════════════════════════════
     SHOOTING STARS (ghosts passing through)
  ════════════════════════════════════════ */
  var SHOOTS = [];
  var nextShoot = 3000;

  function spawnShoot(t) {
    var fromLeft = Math.random() > 0.5;
    SHOOTS.push({
      x:    fromLeft ? W * -0.05 : W * 1.05,
      y:    H * (0.1 + Math.random() * 0.5),
      vx:   fromLeft ? 3 + Math.random() * 5 : -(3 + Math.random() * 5),
      vy:   (Math.random() - 0.5) * 2,
      life: 0, maxLife: 1.2 + Math.random() * 1.0,
      len:  80 + Math.random() * 140,
      alpha: 0.5 + Math.random() * 0.45,
    });
    nextShoot = t + 4000 + Math.random() * 10000;
  }

  /* ════════════════════════════════════════
     DRAW LAYERS
  ════════════════════════════════════════ */

  /* ── Background: deep void, Ghost-toned ── */
  function drawBg(t) {
    ctx.clearRect(0, 0, W, H);

    /* base — near-black, slight purple undertone (Ghost song palette) */
    ctx.fillStyle = '#02010a';
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'screen';
    var pmt = mouseX * 14;
    var pmty = mouseY * 10;

    /* nebula clouds — slow drift */
    var nt = t * 0.00028;
    var clouds = [
      // deep violet — longing / memory (Ghost)
      { x: W*(0.12 + Math.sin(nt)*0.025) + pmt*0.25,
        y: H*(0.20 + Math.cos(nt*0.7)*0.020) + pmty*0.25,
        r: Math.max(W,H)*0.60, c:'rgba(55,8,130,0.18)' },
      { x: W*(0.82 + Math.cos(nt*0.8)*0.020) + pmt*0.25,
        y: H*(0.22 + Math.sin(nt)*0.018) + pmty*0.25,
        r: Math.max(W,H)*0.50, c:'rgba(70,10,148,0.14)' },
      // muted orange — warmth of what was (Ghost: "I'm not afraid to disappear")
      { x: W*(0.72 + Math.sin(nt*1.1)*0.018) + pmt*0.55,
        y: H*(0.70 + Math.cos(nt*0.9)*0.020) + pmty*0.55,
        r: Math.max(W,H)*0.45, c:'rgba(110,38,6,0.18)' },
      { x: W*(0.24 + Math.cos(nt*1.2)*0.022) + pmt*0.55,
        y: H*(0.74 + Math.sin(nt)*0.022) + pmty*0.55,
        r: Math.max(W,H)*0.40, c:'rgba(80,22,4,0.14)' },
      // teal void center — sunyata
      { x: CX + pmt*0.80, y: CY*0.88 + pmty*0.80,
        r: Math.max(W,H)*0.30, c:'rgba(0,80,110,0.08)' },
      // cosmic latte warm center
      { x: CX, y: CY, r: Math.max(W,H)*0.18, c:'rgba(160,100,18,0.06)' },
    ];

    clouds.forEach(function(c) {
      var g = ctx.createRadialGradient(c.x,c.y,0, c.x,c.y,c.r);
      g.addColorStop(0, c.c);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    ctx.globalCompositeOperation = 'source-over';
  }

  /* ── Stars ── */
  function drawStars(t) {
    var cos = ctx;
    for (var i = 0; i < STARS.length; i++) {
      var s = STARS[i];
      var px = ((s.x * W + mouseX * s.par * W * 55) % W + W) % W;
      var py = ((s.y * H + mouseY * s.par * H * 55) % H + H) % H;
      var tw = s.a * (1 + Math.sin(t * s.tws + s.tw) * s.twa);
      var rgb = s.isLatte ? '255,248,240' : '0,200,220';
      ctx.beginPath(); ctx.arc(px, py, s.s, 0, Math.PI*2);
      ctx.fillStyle = 'rgba('+rgb+','+Math.min(1,tw)+')';
      ctx.fill();
      if (s.bloom) {
        var bl = s.s * 3.8;
        ctx.strokeStyle = 'rgba('+rgb+','+(tw*0.09)+')';
        ctx.lineWidth = 0.35;
        ctx.beginPath();
        ctx.moveTo(px-bl,py); ctx.lineTo(px+bl,py);
        ctx.moveTo(px,py-bl); ctx.lineTo(px,py+bl);
        ctx.stroke();
      }
    }
  }

  /* ── Dark Energy ── */
  function drawDarkEnergy(t) {
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < DE.length; i++) {
      var p = DE[i];
      // drift slowly
      p.x += p.drift;
      p.y += p.driftY;
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
      // ghost flicker — sin wave, very slow
      var wave = Math.sin(t * p.freq * 1000 + p.phase);
      p.a = Math.max(0, wave) * p.peak;
      if (p.a < 0.005) continue;
      var px = p.x * W;
      var py = p.y * H;
      var rgb = p.type === 'void' ? '80,0,160' : '0,180,200';
      var g = ctx.createRadialGradient(px,py,0, px,py,p.s*4);
      g.addColorStop(0, 'rgba('+rgb+','+p.a+')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(px,py,p.s*4,0,Math.PI*2);
      ctx.fillStyle = g; ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ── Shooting stars / ghost streaks ── */
  function drawShoots(t, dt) {
    if (t > nextShoot) spawnShoot(t);
    for (var i = SHOOTS.length-1; i >= 0; i--) {
      var s = SHOOTS[i];
      s.life += dt;
      if (s.life > s.maxLife) { SHOOTS.splice(i,1); continue; }
      var prog = s.life / s.maxLife;
      var al = prog < 0.15 ? prog/0.15 : 1 - ((prog-0.15)/0.85);
      al *= s.alpha;
      s.x += s.vx * dt * 60 * 0.016;
      s.y += s.vy * dt * 60 * 0.016;
      var x2 = s.x - s.vx * s.len * 0.016;
      var y2 = s.y - s.vy * s.len * 0.016;
      var gr = ctx.createLinearGradient(x2,y2,s.x,s.y);
      gr.addColorStop(0, 'rgba(255,255,255,0)');
      gr.addColorStop(0.7,'rgba(200,230,255,'+(al*0.45)+')');
      gr.addColorStop(1, 'rgba(255,255,255,'+(al*0.90)+')');
      ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(s.x,s.y);
      ctx.strokeStyle = gr; ctx.lineWidth = 1.4; ctx.stroke();
      // head
      var hg = ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,5);
      hg.addColorStop(0,'rgba(220,245,255,'+(al*0.88)+')');
      hg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(s.x,s.y,5,0,Math.PI*2);
      ctx.fillStyle = hg; ctx.fill();
    }
  }

  /* ── Orbit rings ── */
  function drawOrbits(tilt) {
    var usedOrbs = {};
    PLANETS.forEach(function(p) {
      var orb = getOrb(p);
      if (usedOrbs[orb]) return;
      usedOrbs[orb] = true;
      var rc = p.route ? ROUTE_COLORS[p.route] : null;
      var glow = (rc && STATE.routeGlow[p.route] > 0.02);
      var gl = glow ? STATE.routeGlow[p.route] : 0;

      ctx.beginPath();
      ctx.ellipse(CX, CY, orb, orb * tilt, 0, 0, Math.PI*2);

      if (glow) {
        // glowing orbit when route active
        ctx.strokeStyle = 'rgba('+rc.rgb+','+(0.08 + gl*0.28)+')';
        ctx.lineWidth = 0.8 + gl * 1.8;
        ctx.shadowColor = 'rgba('+rc.rgb+','+gl+')';
        ctx.shadowBlur = 8 + gl * 14;
      } else {
        ctx.strokeStyle = 'rgba(140,160,220,0.042)';
        ctx.lineWidth = 0.5;
        ctx.shadowBlur = 0;
      }
      ctx.setLineDash(p.route ? [6,10] : []);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    });
  }

  /* orbit size (in px) from baseOrb fraction of min(W,H) */
  function getOrb(p) {
    var base = p.baseOrb * Math.min(W, H);
    if (STATE.mode === 'council' || STATE.mode === 'thinking') {
      // converge — all planets pull toward center
      return base * (1 - STATE.converge * 0.55);
    }
    return base;
  }

  /* ── Planets ── */
  function drawPlanets(dt, t, tilt) {
    var isCouncil = STATE.mode === 'council' || STATE.mode === 'thinking';
    var boost = isCouncil ? (1 + STATE.converge * 5) : 1;

    // sort by y for depth
    var items = PLANETS.map(function(p) {
      p.ang += p.spd * boost * dt * 60;
      var orb = getOrb(p);
      return {
        p: p,
        x: CX + Math.cos(p.ang) * orb,
        y: CY + Math.sin(p.ang) * orb * tilt,
        orb: orb,
      };
    }).sort(function(a,b){ return a.y - b.y; });

    items.forEach(function(item) {
      var p = item.p, x = item.x, y = item.y;
      var pc = P_COLORS[p.type] || P_COLORS.dust;
      var sz = p.sz * (STATE.mode==='council' ? (0.8 + STATE.converge*0.5) : 1);
      sz = sc(sz);

      // route glow
      var gl = p.route ? (STATE.routeGlow[p.route] || 0) : 0;
      var rc = p.route ? ROUTE_COLORS[p.route] : null;

      // outer halo glow — route active
      if (gl > 0.02 && rc) {
        ctx.globalCompositeOperation = 'screen';
        var pulse = 1 + Math.sin(t * 0.003 + p.ang) * 0.22;
        var hg = ctx.createRadialGradient(x,y, sz*0.5, x,y, sz*7*pulse);
        hg.addColorStop(0, 'rgba('+rc.rgb+','+(gl*0.65)+')');
        hg.addColorStop(0.3,'rgba('+rc.rgb+','+(gl*0.18)+')');
        hg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(x,y,sz*7*pulse,0,Math.PI*2);
        ctx.fillStyle = hg; ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }

      // atmosphere
      var atm = ctx.createRadialGradient(x,y, sz*0.7, x,y, sz*2.2);
      atm.addColorStop(0, 'rgba('+pc.atm+',0)');
      atm.addColorStop(0.5,'rgba('+pc.atm+',0.08)');
      atm.addColorStop(1, 'rgba('+pc.atm+','+(0.18+gl*0.20)+')');
      ctx.beginPath(); ctx.arc(x,y,sz*2.2,0,Math.PI*2);
      ctx.fillStyle = atm; ctx.fill();

      // planet body — radial gradient
      var body = ctx.createRadialGradient(x-sz*0.3,y-sz*0.3,0, x,y,sz);
      // base color lightened if active
      var lf = 1 + gl * 0.5;
      body.addColorStop(0, brighten(pc.base, 0.5 + gl*0.3));
      body.addColorStop(0.5, pc.base);
      body.addColorStop(1, darken(pc.base, 0.4));
      ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2);
      ctx.fillStyle = body; ctx.fill();

      // specular
      var spec = ctx.createRadialGradient(x-sz*0.4,y-sz*0.4,0, x-sz*0.4,y-sz*0.4, sz*0.6);
      spec.addColorStop(0,'rgba(255,255,255,'+(0.45+gl*0.2)+')');
      spec.addColorStop(1,'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2);
      ctx.fillStyle = spec; ctx.fill();

      // limb dark
      var limb = ctx.createRadialGradient(x,y,sz*0.3,x,y,sz*1.1);
      limb.addColorStop(0,'rgba(0,0,8,0)');
      limb.addColorStop(0.7,'rgba(0,0,8,0.28)');
      limb.addColorStop(1,'rgba(0,0,8,0.72)');
      ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2);
      ctx.fillStyle = limb; ctx.fill();

      // route label — only when active
      if (rc && gl > 0.1) {
        var fs = Math.max(8, Math.round(sz * 0.70));
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.shadowColor = 'rgba('+rc.rgb+','+(gl)+')';
        ctx.shadowBlur = 12 + gl * 10;
        ctx.fillStyle = 'rgba('+rc.rgb+','+Math.min(1, gl*1.4)+')';
        ctx.font = '600 '+fs+'px "DM Mono",monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(rc.name, x, y - sz - 6);
        ctx.restore();
      }
    });
  }

  /* ── Orbital comet rings ── */
  function drawComets(t, tilt) {
    var r1 = sc(95), r2 = sc(106);
    ctx.globalCompositeOperation = 'screen';
    ctx.save(); ctx.translate(CX,CY); ctx.scale(1,tilt);

    // blue comet
    var ba = t * 0.00022;
    for (var i=0;i<55;i++){
      var f=i/55, a=ba-1.7*f+1.7;
      ctx.beginPath(); ctx.arc(Math.cos(a)*r1,Math.sin(a)*r1, 0.5+f*2.2,0,Math.PI*2);
      ctx.fillStyle='rgba(0,200,255,'+(f*0.80)+')'; ctx.fill();
    }
    var bx=Math.cos(ba)*r1, by=Math.sin(ba)*r1;
    var bh=ctx.createRadialGradient(bx,by,0,bx,by,sc(4.5));
    bh.addColorStop(0,'rgba(180,250,255,0.95)'); bh.addColorStop(0.5,'rgba(0,190,255,0.5)'); bh.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(bx,by,sc(4.5),0,Math.PI*2); ctx.fillStyle=bh; ctx.fill();

    // gold comet
    var ga = t * 0.00022 + Math.PI * 0.62;
    for (var i=0;i<55;i++){
      var f=i/55, a=ga-1.7*f+1.7;
      ctx.beginPath(); ctx.arc(Math.cos(a)*r2,Math.sin(a)*r2, 0.5+f*2.2,0,Math.PI*2);
      ctx.fillStyle='rgba(255,185,30,'+(f*0.76)+')'; ctx.fill();
    }
    var gx=Math.cos(ga)*r2, gy=Math.sin(ga)*r2;
    var gh=ctx.createRadialGradient(gx,gy,0,gx,gy,sc(4.5));
    gh.addColorStop(0,'rgba(255,248,180,0.95)'); gh.addColorStop(0.5,'rgba(255,168,28,0.50)'); gh.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(gx,gy,sc(4.5),0,Math.PI*2); ctx.fillStyle=gh; ctx.fill();

    // trace rings
    ctx.beginPath(); ctx.arc(0,0,r1,0,Math.PI*2);
    ctx.strokeStyle='rgba(0,180,220,0.09)'; ctx.lineWidth=0.7; ctx.stroke();
    ctx.beginPath(); ctx.arc(0,0,r2,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,160,24,0.07)'; ctx.lineWidth=0.7; ctx.stroke();

    ctx.restore();
    ctx.globalCompositeOperation='source-over';
  }

  /* ── Sun / LYLA ── */
  function drawSun(t) {
    var R = sc(26);
    var isThink = STATE.mode === 'thinking' || STATE.mode === 'council';
    var gMul = isThink ? (1 + Math.sin(t*0.009)*0.4) : 1;

    // corona
    ctx.globalCompositeOperation = 'lighter';
    var cor = ctx.createRadialGradient(CX,CY,R*0.3, CX,CY,R*9.5);
    cor.addColorStop(0, 'rgba(255,160,50,'+(0.20*gMul)+')');
    cor.addColorStop(0.3,'rgba(255,75,15,'+(0.07*gMul)+')');
    cor.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CX,CY,R*9.5,0,Math.PI*2); ctx.fillStyle=cor; ctx.fill();

    // rays
    ctx.save(); ctx.translate(CX,CY); ctx.rotate(t*0.00007);
    for (var i=0;i<20;i++){
      var a=(i/20)*Math.PI*2;
      var rlen=R*(2.6+0.5*Math.sin(i*2.1+t*0.0005))*gMul;
      var gr=ctx.createLinearGradient(Math.cos(a)*R*0.3,Math.sin(a)*R*0.3,Math.cos(a)*rlen,Math.sin(a)*rlen);
      gr.addColorStop(0,'rgba(255,210,90,'+(0.22*gMul)+')');
      gr.addColorStop(0.5,'rgba(255,120,30,0.05)');
      gr.addColorStop(1,'rgba(0,0,0,0)');
      ctx.strokeStyle=gr; ctx.lineWidth=1.6;
      ctx.beginPath(); ctx.moveTo(Math.cos(a)*R*0.3,Math.sin(a)*R*0.3); ctx.lineTo(Math.cos(a)*rlen,Math.sin(a)*rlen); ctx.stroke();
    }
    ctx.restore();
    ctx.globalCompositeOperation='source-over';

    // halo bloom
    ctx.globalCompositeOperation='lighter';
    var halo=ctx.createRadialGradient(CX,CY,R*0.5,CX,CY,R*3.2);
    halo.addColorStop(0,'rgba(255,255,245,0.92)');
    halo.addColorStop(0.2,'rgba(255,218,118,0.76)');
    halo.addColorStop(0.55,'rgba(255,138,38,0.30)');
    halo.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CX,CY,R*3.2,0,Math.PI*2); ctx.fillStyle=halo; ctx.fill();
    ctx.globalCompositeOperation='source-over';

    // logo
    if (_logo.complete && _logo.naturalWidth > 0) {
      var lr = R * 1.55;
      ctx.save();
      ctx.beginPath(); ctx.arc(CX,CY,lr,0,Math.PI*2); ctx.clip();
      ctx.globalAlpha = 0.92;
      ctx.drawImage(_logo, CX-lr, CY-lr, lr*2, lr*2);
      ctx.restore(); ctx.globalAlpha = 1;
    }

    // LYLA label
    ctx.globalCompositeOperation='screen';
    ctx.shadowColor='#ffdd88'; ctx.shadowBlur=20;
    ctx.fillStyle='rgba(255,220,120,0.85)';
    ctx.font='600 '+Math.max(9,Math.round(sc(9.5)))+'px "DM Mono",monospace';
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText('LYLA ◈', CX, CY - R*1.78 - 4);
    ctx.shadowBlur=0; ctx.textBaseline='alphabetic';
    ctx.globalCompositeOperation='source-over';
  }

  /* ════════════════════════════════════════
     TILT (camera angle)
     council → top-down (tilt → 1)
  ════════════════════════════════════════ */
  function getTilt() {
    if (STATE.mode === 'council' || STATE.mode === 'thinking') {
      return STATE.tilt + STATE.converge * (0.85 - STATE.tilt);
    }
    return STATE.tilt;
  }

  /* ════════════════════════════════════════
     ROUTE GLOW — fade in/out
  ════════════════════════════════════════ */
  function updateRouteGlow(dt) {
    Object.keys(ROUTE_COLORS).forEach(function(r) {
      if (!STATE.routeGlow[r]) STATE.routeGlow[r] = 0;
      var target = (r === activeRoute) ? 1 : 0;
      STATE.routeGlow[r] += (target - STATE.routeGlow[r]) * Math.min(1, dt * 3.5);
    });
  }

  /* ════════════════════════════════════════
     COUNCIL / CONVERGE STATE
  ════════════════════════════════════════ */
  function updateState(dt) {
    if (STATE.mode === 'thinking' || STATE.mode === 'council') {
      STATE.converge = Math.min(1, STATE.converge + dt * 0.8);
    } else if (STATE.mode === 'answering') {
      STATE.converge = Math.max(0, STATE.converge - dt * 1.2);
      if (STATE.converge <= 0) STATE.mode = 'idle';
    } else {
      STATE.converge = Math.max(0, STATE.converge - dt * 0.4);
    }
  }

  /* ════════════════════════════════════════
     MAIN LOOP
  ════════════════════════════════════════ */
  function loop(ts) {
    if (!lastTime) lastTime = ts;
    var dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    now = ts;

    updateState(dt);
    updateRouteGlow(dt);

    var tilt = getTilt();

    drawBg(ts);
    drawStars(ts);
    drawDarkEnergy(ts);
    drawShoots(ts, dt);
    drawOrbits(tilt);
    drawComets(ts, tilt);
    drawPlanets(dt, ts, tilt);
    drawSun(ts);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ════════════════════════════════════════
     HELPERS — color utils
  ════════════════════════════════════════ */
  function hexToRgb(h) {
    h = h.replace('#','');
    if (h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)};
  }
  function brighten(hex, f) {
    var c=hexToRgb(hex);
    return 'rgb('+Math.min(255,Math.round(c.r*(1+f)))+','+Math.min(255,Math.round(c.g*(1+f)))+','+Math.min(255,Math.round(c.b*(1+f)))+')';
  }
  function darken(hex, f) {
    var c=hexToRgb(hex);
    return 'rgb('+Math.round(c.r*(1-f))+','+Math.round(c.g*(1-f))+','+Math.round(c.b*(1-f))+')';
  }

  /* ════════════════════════════════════════
     PUBLIC API
  ════════════════════════════════════════ */
  window.LYLA_thinking = function() { STATE.mode='thinking'; STATE.converge=0; };
  window.LYLA_answered = function() { STATE.mode='answering'; };
  window.KD_pulse      = function(route) {
    STATE.mode='answering';
    if (route) activeRoute = route;
  };

  /* ★ Route glow hook — เรียกเมื่อ user เปลี่ยน route ★ */
  window.KD_setRoute = function(route) {
    activeRoute = route;
  };

  /* ★ Council mode hook ★ */
  window.KD_council = function() {
    STATE.mode = 'council';
    STATE.converge = 0;
  };
  window.KD_councilEnd = function() {
    STATE.mode = 'answering';
  };

  /* ★ FIX: canvas visibility check ★
     ถ้า canvas ถูกบัง opacity:0 หรือ hidden จาก
     parent stacking context — force visible       */
  cv.style.cssText = [
    'position:fixed',
    'inset:0',
    'width:100%',
    'height:100%',
    'z-index:0',
    'pointer-events:auto',
    'display:block',
  ].join(';');

})();
