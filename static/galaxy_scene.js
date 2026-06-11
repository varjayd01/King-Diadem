/* ============================================================
   KING DIADEM — galaxy_scene.js v17
   ★ LYLA Sun = logo อันเดียว ไม่ซ้ำกับ HTML
   ★ Solar System orbit style (เอียง 3D perspective)
   ★ พื้นหลังดำลึกมีมิติ nebula เบาๆ
   ★ ดาวกระจายบางๆ ไม่แสบตา
   ★ Route planet เรืองแสงเมื่อเลือก
   ★ Council mode → ดาวรวมศูนย์
   ★ Dark energy particles ไม่เกิดไม่ดับ
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('galaxy');
  if (!cv) return;
  if (!window.KD) window.KD = {};
  if (!window.KD.state) window.KD.state = {};

  var ctx = cv.getContext('2d', { alpha: true });
  var W = 0, H = 0, CX = 0, CY = 0;
  var lastTime = 0;
  var mouseX = 0, mouseY = 0;
  var activeRoute = 'general';

  /* ── Logo preload (used as LYLA sun — อันเดียว) ── */
  var _logo = new Image();
  _logo.src = '/static/logo.png';

  /* ── CSS: force canvas behind app but visible ── */
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;display:block;';

  /* ── Mouse parallax ── */
  window.addEventListener('mousemove', function(e) {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ════════ RESIZE ════════ */
  var _rT;
  function doResize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    CX = W * 0.5;
    CY = H * 0.5;
    buildStars();
    buildDE();
  }
  window.addEventListener('resize', function(){ clearTimeout(_rT); _rT = setTimeout(doResize,100); }, {passive:true});
  doResize();

  /* sc = scale helper — proportional to viewport */
  function sc(v) { return v * Math.min(W,H) / 800; }

  /* ════════ STATE ════════ */
  var STATE = {
    mode: 'idle',       // idle | thinking | council | answering
    converge: 0,
    routeGlow: {},
    tilt: 0.28,         // orbit tilt — solar system perspective
  };

  /* ════════ ROUTE → PLANET ════════ */
  var ROUTES = {
    general:  { rgb:'168,230,255', name:'GENERAL'  },   /* sky */
    risk:     { rgb:'255,143,171', name:'RISK'     },   /* pink */
    survival: { rgb:'179,245,210', name:'SURVIVAL' },   /* mint */
    collapse: { rgb:'212,179,255', name:'COLLAPSE' },   /* lavender */
    civil:    { rgb:'240,200,255', name:'CIVIL'    },   /* lilac */
    vega:     { rgb:'255,224,130', name:'VEGA'     },   /* butter */
  };

  /* ════════ PLANETS ════════
     baseOrb = fraction ของ min(W,H)
     tiltOff = orbit tilt variation per planet
     inc     = orbital inclination offset (เพื่อให้ดูเหมือน solar system poster)
  ════════ */
  function mkPlanets() {
    return [
      /* ── Route planets ── */
      { id:'general',  route:'general',  ang:0.52, spd:0.0030, baseOrb:0.155, sz:5.2,  type:'teal',   inc: 0.00  },
      { id:'risk',     route:'risk',     ang:1.85, spd:0.0020, baseOrb:0.210, sz:4.8,  type:'red',    inc: 0.015 },
      { id:'survival', route:'survival', ang:3.10, spd:0.0015, baseOrb:0.275, sz:5.6,  type:'green',  inc:-0.010 },
      { id:'collapse', route:'collapse', ang:4.55, spd:0.0011, baseOrb:0.340, sz:5.0,  type:'purple', inc: 0.020 },
      { id:'civil',    route:'civil',    ang:0.85, spd:0.0007, baseOrb:0.405, sz:5.8,  type:'violet', inc:-0.008 },
      { id:'vega',     route:'vega',     ang:2.65, spd:0.0005, baseOrb:0.475, sz:6.2,  type:'gold',   inc: 0.012 },
      /* ── Ambient dust planets ── */
      { id:'d1', ang:1.10, spd:0.0038, baseOrb:0.115, sz:2.6, type:'dust', inc: 0.008 },
      { id:'d2', ang:2.90, spd:0.0025, baseOrb:0.185, sz:2.1, type:'dust', inc:-0.012 },
      { id:'d3', ang:4.20, spd:0.0018, baseOrb:0.250, sz:2.4, type:'dust', inc: 0.018 },
      { id:'d4', ang:5.50, spd:0.0014, baseOrb:0.315, sz:1.9, type:'dust', inc:-0.006 },
      { id:'d5', ang:0.30, spd:0.0010, baseOrb:0.380, sz:2.3, type:'dust', inc: 0.022 },
      { id:'d6', ang:3.70, spd:0.0006, baseOrb:0.445, sz:2.0, type:'dust', inc:-0.016 },
    ];
  }
  var PLANETS = mkPlanets();

  var PCLR = {
    teal:   { base:'#a8e6ff', atm:'168,230,255' },   /* sky pastel */
    red:    { base:'#ffb3c6', atm:'255,160,190' },   /* pink pastel */
    green:  { base:'#b3f5e0', atm:'179,245,224' },   /* mint pastel */
    purple: { base:'#d4b3ff', atm:'212,179,255' },   /* lavender */
    violet: { base:'#f0c8ff', atm:'240,200,255' },   /* lilac */
    gold:   { base:'#ffe082', atm:'255,224,130' },   /* butter */
    dust:   { base:'#ddd0ee', atm:'210,195,240' },   /* soft purple dust */
  };

  /* ════════ STAR FIELD ════════
     3 depth layers · Cosmic Latte warm + teal cold
     ขนาดและ alpha เบา — ไม่แสบตา
  ════════ */
  var STARS = [];
  function buildStars() {
    STARS = [];
    for (var i = 0; i < 680; i++) {
      var layer   = i < 380 ? 0 : i < 580 ? 1 : 2;
      var isWarm  = Math.random() > 0.40;
      /* bright star โอกาสน้อย */
      var bright  = Math.random() > 0.91;
      STARS.push({
        x:      Math.random(),
        y:      Math.random(),
        s:      bright ? 0.55 + Math.random()*0.90 : 0.08 + Math.random()*(layer*0.12+0.18),
        a:      bright ? 0.30 + Math.random()*0.28 : 0.04 + Math.random()*(layer*0.04+0.10),
        warm:   isWarm,
        tw:     Math.random() * Math.PI * 2,
        tws:    0.003 + Math.random() * 0.014,
        twa:    bright ? 0.10 + Math.random()*0.18 : 0.02 + Math.random()*0.08,
        bloom:  bright && Math.random() > 0.50,
        par:    (layer + 1) * 0.00025,
      });
    }
  }

  /* ════════ DARK ENERGY ════════
     อนุภาค flicker ช้า "ไม่เกิดไม่ดับ"
  ════════ */
  var DE = [];
  function buildDE() {
    DE = [];
    for (var i = 0; i < 160; i++) {
      var a2 = Math.random() * Math.PI * 2;
      var d  = 0.08 + Math.random() * 0.52;
      DE.push({
        x:     0.5 + Math.cos(a2)*d*0.50,
        y:     0.5 + Math.sin(a2)*d*0.26,
        s:     0.25 + Math.random()*1.0,
        a:     0,
        peak:  0.08 + Math.random()*0.22,
        phase: Math.random()*Math.PI*2,
        freq:  0.00025 + Math.random()*0.00090,
        void_: Math.random() > 0.58,
        dx:    (Math.random()-0.5)*0.00006,
        dy:    (Math.random()-0.5)*0.00003,
      });
    }
  }

  /* ════════ SHOOTING STARS ════════ */
  var SHOOTS = [], nextShoot = 3500;
  function spawnShoot(t) {
    var fl = Math.random() > 0.5;
    SHOOTS.push({
      x: fl ? W*-0.04 : W*1.04,
      y: H*(0.08 + Math.random()*0.48),
      vx: fl ? 2.5+Math.random()*4.5 : -(2.5+Math.random()*4.5),
      vy: (Math.random()-0.5)*1.8,
      life:0, maxLife:1.0+Math.random()*0.9,
      len: 70+Math.random()*120,
      al:  0.40+Math.random()*0.38,
    });
    nextShoot = t + 5000 + Math.random()*12000;
  }

  /* ════════════════════════════════════════
     DRAW — BACKGROUND
     ดำลึก มีมิติ nebula เบาๆ ไม่จัด
  ════════════════════════════════════════ */
  function drawBg(t) {
    ctx.clearRect(0,0,W,H);

    /* pastel aurora night — dark but dreamy */
    var base = ctx.createRadialGradient(CX, CY*0.65, 0, CX, CY, Math.max(W,H)*0.9);
    base.addColorStop(0, '#0f0820');
    base.addColorStop(0.4,'#08051a');
    base.addColorStop(0.75,'#060310');
    base.addColorStop(1, '#030208');
    ctx.fillStyle = base;
    ctx.fillRect(0,0,W,H);

    ctx.globalCompositeOperation = 'screen';
    var nt  = t * 0.00020;
    var pmx = mouseX * 12, pmy = mouseY * 8;

    /* nebula wisps — very subtle, 4 clouds */
    [
      /* pink aurora upper-left */
      { x:W*(0.10+Math.sin(nt)*0.022)+pmx*0.22,
        y:H*(0.18+Math.cos(nt*0.7)*0.018)+pmy*0.22,
        r:Math.max(W,H)*0.58, c:'rgba(220,100,180,0.16)' },
      /* lavender upper-right */
      { x:W*(0.84+Math.cos(nt*0.85)*0.018)+pmx*0.22,
        y:H*(0.20+Math.sin(nt)*0.016)+pmy*0.22,
        r:Math.max(W,H)*0.50, c:'rgba(140,90,255,0.13)' },
      /* sky blue lower-right */
      { x:W*(0.72+Math.sin(nt*1.05)*0.016)+pmx*0.50,
        y:H*(0.65+Math.cos(nt*0.9)*0.018)+pmy*0.50,
        r:Math.max(W,H)*0.44, c:'rgba(80,160,255,0.12)' },
      /* mint lower-left */
      { x:W*(0.22+Math.cos(nt*1.15)*0.018)+pmx*0.50,
        y:H*(0.72+Math.sin(nt)*0.020)+pmy*0.50,
        r:Math.max(W,H)*0.38, c:'rgba(100,220,180,0.10)' },
      /* soft pink center glow */
      { x:CX+pmx*0.72, y:CY*0.88+pmy*0.72,
        r:Math.max(W,H)*0.28, c:'rgba(255,160,210,0.07)' },
      /* butter yellow tiny accent */
      { x:W*(0.55+Math.sin(nt*0.8)*0.015)+pmx*0.40,
        y:H*(0.35+Math.cos(nt*0.6)*0.012)+pmy*0.40,
        r:Math.max(W,H)*0.20, c:'rgba(255,220,120,0.05)' },
    ].forEach(function(c) {
      var g = ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,c.r);
      g.addColorStop(0, c.c); g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    });

    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════ DRAW STARS ════════ */
  function drawStars(t) {
    for (var i = 0; i < STARS.length; i++) {
      var s  = STARS[i];
      var px = ((s.x*W + mouseX*s.par*W*50) % W + W) % W;
      var py = ((s.y*H + mouseY*s.par*H*50) % H + H) % H;
      var tw = s.a * (1 + Math.sin(t*s.tws + s.tw)*s.twa);
      var rgb = s.warm ? '255,235,245' : '168,225,255';
      ctx.beginPath(); ctx.arc(px,py,s.s,0,Math.PI*2);
      ctx.fillStyle = 'rgba('+rgb+','+Math.min(1,tw)+')';
      ctx.fill();
      if (s.bloom) {
        var bl = s.s * 3.5;
        ctx.strokeStyle = 'rgba('+rgb+','+(tw*0.07)+')';
        ctx.lineWidth = 0.30;
        ctx.beginPath();
        ctx.moveTo(px-bl,py); ctx.lineTo(px+bl,py);
        ctx.moveTo(px,py-bl); ctx.lineTo(px,py+bl);
        ctx.stroke();
      }
    }
  }

  /* ════════ DRAW DARK ENERGY ════════ */
  function drawDE(t) {
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < DE.length; i++) {
      var p = DE[i];
      p.x += p.dx; p.y += p.dy;
      if (p.x<0)p.x=1; if(p.x>1)p.x=0;
      if (p.y<0)p.y=1; if(p.y>1)p.y=0;
      var wave = Math.sin(t * p.freq * 1000 + p.phase);
      p.a = Math.max(0, wave) * p.peak;
      if (p.a < 0.004) continue;
      var px = p.x*W, py = p.y*H;
      var rgb = p.void_ ? '180,100,255' : '140,210,255';
      var g = ctx.createRadialGradient(px,py,0,px,py,p.s*4.5);
      g.addColorStop(0,'rgba('+rgb+','+p.a+')');
      g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(px,py,p.s*4.5,0,Math.PI*2);
      ctx.fillStyle=g; ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════ DRAW SHOOTS ════════ */
  function drawShoots(t, dt) {
    if (t > nextShoot) spawnShoot(t);
    for (var i = SHOOTS.length-1; i >= 0; i--) {
      var s = SHOOTS[i];
      s.life += dt;
      if (s.life > s.maxLife) { SHOOTS.splice(i,1); continue; }
      var prog = s.life/s.maxLife;
      var al   = (prog<0.15 ? prog/0.15 : 1-((prog-0.15)/0.85)) * s.al;
      s.x += s.vx*dt*60*0.016; s.y += s.vy*dt*60*0.016;
      var x2=s.x-s.vx*s.len*0.016, y2=s.y-s.vy*s.len*0.016;
      var gr=ctx.createLinearGradient(x2,y2,s.x,s.y);
      gr.addColorStop(0,'rgba(255,255,255,0)');
      gr.addColorStop(0.65,'rgba(195,225,255,'+(al*0.40)+')');
      gr.addColorStop(1,'rgba(255,255,255,'+(al*0.85)+')');
      ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(s.x,s.y);
      ctx.strokeStyle=gr; ctx.lineWidth=1.3; ctx.stroke();
      var hg=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,4.5);
      hg.addColorStop(0,'rgba(215,242,255,'+(al*0.85)+')');
      hg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(s.x,s.y,4.5,0,Math.PI*2);
      ctx.fillStyle=hg; ctx.fill();
    }
  }

  /* ════════════════════════════════════════
     ORBIT SIZE
  ════════════════════════════════════════ */
  function getOrb(p) {
    var base = p.baseOrb * Math.min(W,H);
    if (STATE.mode==='council' || STATE.mode==='thinking')
      return base * (1 - STATE.converge*0.55);
    return base;
  }

  /* ════════════════════════════════════════
     DRAW ORBIT RINGS
     Solar System style — ellipse เอียง
     orbit แต่ละวงมี inc ต่างกันเล็กน้อย
  ════════════════════════════════════════ */
  function drawOrbits(tilt) {
    var seen = {};
    PLANETS.forEach(function(p) {
      var orb = getOrb(p);
      var key = Math.round(orb);
      if (seen[key]) return;
      seen[key] = true;

      var rc = p.route ? ROUTES[p.route] : null;
      var gl = rc ? (STATE.routeGlow[p.route]||0) : 0;

      /* per-planet tilt tweak */
      var t2 = tilt + (p.inc||0);

      ctx.beginPath();
      ctx.ellipse(CX, CY, orb, orb*t2, 0, 0, Math.PI*2);

      if (gl > 0.02) {
        ctx.strokeStyle = 'rgba('+rc.rgb+','+(0.06+gl*0.26)+')';
        ctx.lineWidth   = 0.7 + gl*1.6;
        ctx.shadowColor = 'rgba('+rc.rgb+','+(gl*0.8)+')';
        ctx.shadowBlur  = 6 + gl*12;
        ctx.setLineDash([5,9]);
      } else {
        /* solar system poster style — thin solid */
        ctx.strokeStyle = 'rgba(130,155,210,0.038)';
        ctx.lineWidth   = 0.5;
        ctx.shadowBlur  = 0;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    });
  }

  /* ════════════════════════════════════════
     DRAW PLANETS
  ════════════════════════════════════════ */
  function drawPlanets(dt, t, tilt) {
    var isC   = STATE.mode==='council' || STATE.mode==='thinking';
    var boost = isC ? 1+STATE.converge*5 : 1;

    var items = PLANETS.map(function(p) {
      p.ang += p.spd * boost * dt * 60;
      var orb  = getOrb(p);
      var t2   = tilt + (p.inc||0);
      return { p:p,
        x: CX + Math.cos(p.ang)*orb,
        y: CY + Math.sin(p.ang)*orb*t2 };
    }).sort(function(a,b){ return a.y-b.y; }); /* painter's order */

    items.forEach(function(item) {
      var p=item.p, x=item.x, y=item.y;
      var pc = PCLR[p.type] || PCLR.dust;
      var sz = sc(p.sz) * (isC ? 0.82+STATE.converge*0.42 : 1);
      var gl = p.route ? (STATE.routeGlow[p.route]||0) : 0;
      var rc = p.route ? ROUTES[p.route] : null;

      /* ── glow halo when route active ── */
      if (gl > 0.02 && rc) {
        ctx.globalCompositeOperation = 'screen';
        var pulse = 1 + Math.sin(t*0.0025+p.ang)*0.20;
        var hg = ctx.createRadialGradient(x,y,sz*0.5,x,y,sz*7.5*pulse);
        hg.addColorStop(0,'rgba('+rc.rgb+','+(gl*0.60)+')');
        hg.addColorStop(0.28,'rgba('+rc.rgb+','+(gl*0.15)+')');
        hg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(x,y,sz*7.5*pulse,0,Math.PI*2);
        ctx.fillStyle=hg; ctx.fill();
        ctx.globalCompositeOperation='source-over';
      }

      /* ── atmosphere ── */
      var atm=ctx.createRadialGradient(x,y,sz*0.75,x,y,sz*2.4);
      atm.addColorStop(0,'rgba('+pc.atm+',0)');
      atm.addColorStop(0.5,'rgba('+pc.atm+',0.07)');
      atm.addColorStop(1,'rgba('+pc.atm+','+(0.16+gl*0.18)+')');
      ctx.beginPath(); ctx.arc(x,y,sz*2.4,0,Math.PI*2);
      ctx.fillStyle=atm; ctx.fill();

      /* ── planet body ── */
      var body=ctx.createRadialGradient(x-sz*0.32,y-sz*0.32,0,x,y,sz);
      body.addColorStop(0,brighten(pc.base, 0.48+gl*0.28));
      body.addColorStop(0.55,pc.base);
      body.addColorStop(1,darken(pc.base,0.42));
      ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2);
      ctx.fillStyle=body; ctx.fill();

      /* ── specular highlight ── */
      var spec=ctx.createRadialGradient(x-sz*0.38,y-sz*0.38,0,x-sz*0.38,y-sz*0.38,sz*0.58);
      spec.addColorStop(0,'rgba(255,255,255,'+(0.42+gl*0.18)+')');
      spec.addColorStop(1,'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2);
      ctx.fillStyle=spec; ctx.fill();

      /* ── limb darkening ── */
      var limb=ctx.createRadialGradient(x,y,sz*0.28,x,y,sz*1.08);
      limb.addColorStop(0,'rgba(0,0,8,0)');
      limb.addColorStop(0.65,'rgba(0,0,8,0.25)');
      limb.addColorStop(1,'rgba(0,0,8,0.70)');
      ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2);
      ctx.fillStyle=limb; ctx.fill();

      /* ── route label (active only) ── */
      if (rc && gl > 0.08) {
        var fs=Math.max(7,Math.round(sz*0.68));
        ctx.save();
        ctx.globalCompositeOperation='screen';
        ctx.shadowColor='rgba('+rc.rgb+','+gl+')';
        ctx.shadowBlur=10+gl*8;
        ctx.fillStyle='rgba('+rc.rgb+','+Math.min(1,gl*1.35)+')';
        ctx.font='600 '+fs+'px "DM Mono",monospace';
        ctx.textAlign='center'; ctx.textBaseline='bottom';
        ctx.fillText(rc.name, x, y-sz-5);
        ctx.restore();
      }
    });
  }

  /* ════════════════════════════════════════
     DRAW COMET RINGS (inner orbit tracers)
  ════════════════════════════════════════ */
  function drawComets(t, tilt) {
    var r1=sc(88), r2=sc(98);
    ctx.globalCompositeOperation='screen';
    ctx.save(); ctx.translate(CX,CY); ctx.scale(1,tilt);

    /* teal comet */
    var ba=t*0.00020;
    for(var i=0;i<50;i++){
      var f=i/50,a=ba-1.6*f+1.6;
      ctx.beginPath(); ctx.arc(Math.cos(a)*r1,Math.sin(a)*r1,0.4+f*2.0,0,Math.PI*2);
      ctx.fillStyle='rgba(168,220,255,'+(f*0.75)+')'; ctx.fill();
    }
    var bx=Math.cos(ba)*r1,by=Math.sin(ba)*r1;
    var bh=ctx.createRadialGradient(bx,by,0,bx,by,sc(4));
    bh.addColorStop(0,'rgba(220,240,255,0.92)'); bh.addColorStop(0.5,'rgba(160,210,255,0.50)'); bh.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(bx,by,sc(4),0,Math.PI*2); ctx.fillStyle=bh; ctx.fill();

    /* gold comet */
    var ga=t*0.00020+Math.PI*0.60;
    for(var i=0;i<50;i++){
      var f=i/50,a=ga-1.6*f+1.6;
      ctx.beginPath(); ctx.arc(Math.cos(a)*r2,Math.sin(a)*r2,0.4+f*2.0,0,Math.PI*2);
      ctx.fillStyle='rgba(255,210,180,'+(f*0.72)+')'; ctx.fill();
    }
    var gx=Math.cos(ga)*r2,gy=Math.sin(ga)*r2;
    var gh=ctx.createRadialGradient(gx,gy,0,gx,gy,sc(4));
    gh.addColorStop(0,'rgba(255,245,200,0.92)'); gh.addColorStop(0.5,'rgba(255,200,150,0.50)'); gh.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(gx,gy,sc(4),0,Math.PI*2); ctx.fillStyle=gh; ctx.fill();

    ctx.beginPath(); ctx.arc(0,0,r1,0,Math.PI*2);
    ctx.strokeStyle='rgba(168,220,255,0.10)'; ctx.lineWidth=0.6; ctx.stroke();
    ctx.beginPath(); ctx.arc(0,0,r2,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,210,180,0.08)'; ctx.lineWidth=0.6; ctx.stroke();

    ctx.restore();
    ctx.globalCompositeOperation='source-over';
  }

  /* ════════════════════════════════════════
     DRAW SUN — LYLA
     ★ โลโก้อันเดียว ไม่ซ้ำกับ HTML
     corona + rays + halo + logo image
  ════════════════════════════════════════ */
  function drawSun(t) {
    var R   = sc(24);
    var isT = STATE.mode==='thinking' || STATE.mode==='council';
    var gm  = isT ? 1+Math.sin(t*0.008)*0.38 : 1;

    /* deep corona — lighter mode */
    ctx.globalCompositeOperation='lighter';
    var cor=ctx.createRadialGradient(CX,CY,R*0.25,CX,CY,R*10);
    cor.addColorStop(0,'rgba(255,155,45,'+(0.18*gm)+')');
    cor.addColorStop(0.28,'rgba(255,70,12,'+(0.06*gm)+')');
    cor.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CX,CY,R*10,0,Math.PI*2);
    ctx.fillStyle=cor; ctx.fill();

    /* rays — slow rotate */
    ctx.save(); ctx.translate(CX,CY); ctx.rotate(t*0.000065);
    for(var i=0;i<18;i++){
      var a=(i/18)*Math.PI*2;
      var rl=R*(2.4+0.5*Math.sin(i*2.2+t*0.00045))*gm;
      var gr=ctx.createLinearGradient(Math.cos(a)*R*0.28,Math.sin(a)*R*0.28,Math.cos(a)*rl,Math.sin(a)*rl);
      gr.addColorStop(0,'rgba(255,190,220,'+(0.20*gm)+')');
      gr.addColorStop(0.5,'rgba(255,115,28,0.04)');
      gr.addColorStop(1,'rgba(0,0,0,0)');
      ctx.strokeStyle=gr; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(Math.cos(a)*R*0.28,Math.sin(a)*R*0.28); ctx.lineTo(Math.cos(a)*rl,Math.sin(a)*rl); ctx.stroke();
    }
    ctx.restore();
    ctx.globalCompositeOperation='source-over';

    /* inner halo bloom */
    ctx.globalCompositeOperation='lighter';
    var halo=ctx.createRadialGradient(CX,CY,R*0.45,CX,CY,R*3.0);
    halo.addColorStop(0,'rgba(255,240,250,0.90)');
    halo.addColorStop(0.18,'rgba(255,200,230,0.72)');
    halo.addColorStop(0.52,'rgba(200,150,255,0.25)');
    halo.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CX,CY,R*3.0,0,Math.PI*2);
    ctx.fillStyle=halo; ctx.fill();
    ctx.globalCompositeOperation='source-over';

    /* ★ LOGO — อันเดียว ไม่ซ้ำ
       clip เป็นวงกลม วาด logo ตรงกลาง
       ขนาด R*1.50 ให้เหมาะสม          */
    var lr = R * 1.50;
    if (_logo.complete && _logo.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath(); ctx.arc(CX,CY,lr,0,Math.PI*2); ctx.clip();
      ctx.globalAlpha = 0.92;
      ctx.drawImage(_logo, CX-lr, CY-lr, lr*2, lr*2);
      ctx.restore();
      ctx.globalAlpha = 1;
    } else {
      /* fallback — ถ้าโลโก้ยังโหลดไม่เสร็จ วาดวงสีทอง */
      var fb=ctx.createRadialGradient(CX-R*0.3,CY-R*0.3,0,CX,CY,R);
      fb.addColorStop(0,'#ffe580'); fb.addColorStop(0.5,'#ffaa20'); fb.addColorStop(1,'#cc5500');
      ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2);
      ctx.fillStyle=fb; ctx.fill();
    }

    /* LYLA label ใต้โลโก้ */
    ctx.globalCompositeOperation='screen';
    ctx.shadowColor='#ffb3d9'; ctx.shadowBlur=20;
    ctx.fillStyle='rgba(255,220,240,0.88)';
    ctx.font='600 '+Math.max(8,Math.round(sc(9)))+'px "DM Mono",monospace';
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText('LYLA ◈', CX, CY - lr - 5);
    ctx.shadowBlur=0; ctx.textBaseline='alphabetic';
    ctx.globalCompositeOperation='source-over';
  }

  /* ════════ TILT ════════ */
  function getTilt() {
    if (STATE.mode==='council'||STATE.mode==='thinking')
      return STATE.tilt + STATE.converge*(0.82-STATE.tilt);
    return STATE.tilt;
  }

  /* ════════ ROUTE GLOW UPDATE ════════ */
  function updateGlow(dt) {
    Object.keys(ROUTES).forEach(function(r) {
      if (!STATE.routeGlow[r]) STATE.routeGlow[r]=0;
      var target = r===activeRoute ? 1 : 0;
      STATE.routeGlow[r] += (target-STATE.routeGlow[r]) * Math.min(1, dt*3.2);
    });
  }

  /* ════════ STATE UPDATE ════════ */
  function updateState(dt) {
    if (STATE.mode==='thinking'||STATE.mode==='council')
      STATE.converge = Math.min(1, STATE.converge+dt*0.75);
    else if (STATE.mode==='answering') {
      STATE.converge = Math.max(0, STATE.converge-dt*1.1);
      if (STATE.converge<=0) STATE.mode='idle';
    } else {
      STATE.converge = Math.max(0, STATE.converge-dt*0.35);
    }
  }

  /* ════════════════════════════════════════
     COLOR HELPERS
  ════════════════════════════════════════ */
  function hexRGB(h){
    h=h.replace('#','');
    if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)};
  }
  function brighten(hex,f){var c=hexRGB(hex);return 'rgb('+Math.min(255,Math.round(c.r*(1+f)))+','+Math.min(255,Math.round(c.g*(1+f)))+','+Math.min(255,Math.round(c.b*(1+f)))+')'}
  function darken(hex,f){var c=hexRGB(hex);return 'rgb('+Math.round(c.r*(1-f))+','+Math.round(c.g*(1-f))+','+Math.round(c.b*(1-f))+')';}

  /* ════════════════════════════════════════
     MAIN LOOP
  ════════════════════════════════════════ */
  function loop(ts) {
    if (!lastTime) lastTime=ts;
    var dt = Math.min((ts-lastTime)/1000, 0.05);
    lastTime = ts;

    updateState(dt);
    updateGlow(dt);

    var tilt = getTilt();

    drawBg(ts);
    drawStars(ts);
    drawDE(ts);
    drawShoots(ts, dt);
    drawOrbits(tilt);
    drawComets(ts, tilt);
    drawPlanets(dt, ts, tilt);
    drawSun(ts);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ════════════════════════════════════════
     PUBLIC API
  ════════════════════════════════════════ */
  window.LYLA_thinking  = function(){ STATE.mode='thinking'; STATE.converge=0; };
  window.LYLA_answered  = function(){ STATE.mode='answering'; };
  window.KD_pulse       = function(route){ STATE.mode='answering'; if(route) activeRoute=route; };
  window.KD_setRoute    = function(route){ activeRoute=route; };
  window.KD_council     = function(){ STATE.mode='council'; STATE.converge=0; };
  window.KD_councilEnd  = function(){ STATE.mode='answering'; };

})();
