/* ============================================================
   KING DIADEM — galaxy_scene.js v11
   ★ สูญยตา Dark Energy — ความว่างที่มีชีวิต
   ★ KD nodes เรืองแสง + ชื่อชัด
   ★ Nebula กลางๆ ไม่บดบังข้อความ
   ★ Mobile-first responsive
   ============================================================ */
(function () {
  var cv = document.getElementById('galaxy');
  if (!cv) return;
  if (!window.KD) window.KD = {};
  if (!window.KD.state) window.KD.state = {};

  var ctx = cv.getContext('2d', { alpha: true });
  var W, H, CX, CY, t0 = performance.now();

  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    CX = W * 0.50; CY = H * 0.50;
    rebuildPlanets();
  }
  window.addEventListener('resize', resize);
  function sc(v) { return v * (Math.min(W, H) / 768); }

  /* ── PLANETS ── */
  var PLANETS = [];

  function rebuildPlanets() {
    var prev = PLANETS;

    /* ── Regular solar bodies ── */
    var bodies = [
      { color: '#8899aa', sz: sc(3.5), orb: sc(58),  spd: .0044, ring: false, moon: false },
      { color: '#d4a870', sz: sc(6.5), orb: sc(92),  spd: .0033, ring: false, moon: false },
      { color: '#2255aa', sz: sc(7.5), orb: sc(134), spd: .0023, ring: false, moon: true  },
      { color: '#993322', sz: sc(5.5), orb: sc(180), spd: .0019, ring: false, moon: false },
      { color: '#bb8833', sz: sc(15),  orb: sc(254), spd: .0010, ring: false, moon: false },
      { color: '#ccbb77', sz: sc(12),  orb: sc(330), spd: .0007, ring: true,  moon: false },
      { color: '#558899', sz: sc(9),   orb: sc(400), spd: .0005, ring: false, moon: false },
      { color: '#112299', sz: sc(8),   orb: sc(462), spd: .0003, ring: false, moon: false },
    ];

    /* ── KD nodes — ระบบ KING DIADEM — สว่างกว่า ใหญ่กว่า ── */
    var kdNodes = [
      /* WATERLINE — teal เรืองแสง */
      { color: '#00ffe0', sz: sc(8),   orb: sc(110), spd: .0017, ring: false, moon: false,
        kd: 'WATERLINE', kdColor: '#00ffe0', kdGlow: 'rgba(0,255,224,0.55)' },
      /* VEGA — warm ivory/gold */
      { color: '#ffe8a0', sz: sc(7.5), orb: sc(215), spd: .0014, ring: false, moon: false,
        kd: 'VEGA ◆',    kdColor: '#ffe8a0', kdGlow: 'rgba(255,232,160,0.55)' },
      /* HALT — red-orange */
      { color: '#ff4444', sz: sc(6),   orb: sc(152), spd: .0029, ring: false, moon: false,
        kd: 'HALT',      kdColor: '#ff6666', kdGlow: 'rgba(255,80,80,0.50)'   },
      /* CIVIL — violet */
      { color: '#aa88ff', sz: sc(6.5), orb: sc(362), spd: .0005, ring: false, moon: false,
        kd: 'CIVIL',     kdColor: '#cc99ff', kdGlow: 'rgba(170,136,255,0.50)' },
      /* FATE — amber */
      { color: '#ffaa44', sz: sc(5.5), orb: sc(292), spd: .0008, ring: false, moon: false,
        kd: 'FATE',      kdColor: '#ffcc66', kdGlow: 'rgba(255,170,68,0.45)'  },
    ];

    PLANETS = bodies.concat(kdNodes);

    var defaults = [0,1.2,2.5,4.0,1.8,3.2,5.5,2.8,0.5,3.5,1.0,4.5,2.1];
    PLANETS.forEach(function(p, i) {
      p.ang = (prev[i] && prev[i].ang != null) ? prev[i].ang : (defaults[i] || Math.random() * Math.PI * 2);
    });
  }

  W = cv.width  = window.innerWidth;
  H = cv.height = window.innerHeight;
  CX = W * 0.50; CY = H * 0.50;
  rebuildPlanets();

  var TILT = 0.26;

  /* ── CAMERA ── */
  var CAM = { yaw: 0, pitch: 0.15, fov: 420, auto: true };
  var drag = { on: false, x: 0, y: 0 };
  function dn(x,y){ drag.on=true; drag.x=x; drag.y=y; CAM.auto=false; }
  function mv(x,y){ if(!drag.on)return; CAM.yaw-=(x-drag.x)*.003; CAM.pitch+=(y-drag.y)*.002; CAM.pitch=Math.max(-.5,Math.min(.7,CAM.pitch)); drag.x=x; drag.y=y; }
  function up(){ drag.on=false; }
  cv.addEventListener('mousedown',  function(e){ dn(e.clientX,e.clientY); });
  cv.addEventListener('mousemove',  function(e){ mv(e.clientX,e.clientY); });
  cv.addEventListener('mouseup',    up); cv.addEventListener('mouseleave', up);
  cv.addEventListener('touchstart', function(e){ if(e.touches.length===1) dn(e.touches[0].clientX,e.touches[0].clientY); e.preventDefault(); },{ passive:false });
  cv.addEventListener('touchmove',  function(e){ if(e.touches.length===1) mv(e.touches[0].clientX,e.touches[0].clientY); e.preventDefault(); },{ passive:false });
  cv.addEventListener('touchend',   up);
  cv.addEventListener('wheel', function(e){ CAM.fov=Math.max(180,Math.min(750,CAM.fov+e.deltaY*.3)); e.preventDefault(); },{ passive:false });

  /* ════════════════════════════════════════════════════════
     สูญยตา BACKGROUND — ความว่างที่มีชีวิต
     ════════════════════════════════════════════════════════ */
  function drawBg() {
    ctx.clearRect(0, 0, W, H);

    /* ── deep void base — CSS handles main bg, we add depth ── */
    ctx.globalCompositeOperation = 'source-over';

    /* subtle center darkening — void feels deeper at center */
    var voidG = ctx.createRadialGradient(CX, CY, 0, CX, CY, Math.max(W, H) * .7);
    voidG.addColorStop(0, 'rgba(0,0,4,0.22)');
    voidG.addColorStop(.4, 'rgba(0,0,8,0.10)');
    voidG.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = voidG;
    ctx.fillRect(0, 0, W, H);

    /* ── nebula wisps — กลางๆ ไม่หนัก ไม่บดบัง ── */
    ctx.globalCompositeOperation = 'screen';
    var now = (performance.now() - t0) * .001;

    /* slow drifting nebula clouds */
    var clouds = [
      /* deep violet — ซ้ายบน */
      { x: W*.12 + Math.sin(now*.018)*W*.02, y: H*.18 + Math.cos(now*.013)*H*.015,
        r: Math.max(W,H)*.42, c0: 'rgba(55,20,100,0.09)', c1: 'rgba(0,0,0,0)' },
      /* warm rust — ขวาบน */
      { x: W*.82 + Math.cos(now*.015)*W*.025, y: H*.20 + Math.sin(now*.011)*H*.018,
        r: Math.max(W,H)*.38, c0: 'rgba(80,22,10,0.08)', c1: 'rgba(0,0,0,0)' },
      /* teal trace — ซ้ายล่าง — สะท้อน LYLA */
      { x: W*.08 + Math.sin(now*.012)*W*.018, y: H*.75 + Math.cos(now*.016)*H*.012,
        r: Math.max(W,H)*.36, c0: 'rgba(0,80,80,0.07)', c1: 'rgba(0,0,0,0)' },
      /* dark blue mid — ตรงกลาง subtle */
      { x: W*.55 + Math.cos(now*.009)*W*.03, y: H*.50 + Math.sin(now*.014)*H*.025,
        r: Math.max(W,H)*.55, c0: 'rgba(8,15,55,0.06)', c1: 'rgba(0,0,0,0)' },
      /* gold wisp — ขวาล่าง — VEGA trace */
      { x: W*.78 + Math.sin(now*.017)*W*.022, y: H*.78 + Math.cos(now*.010)*H*.020,
        r: Math.max(W,H)*.30, c0: 'rgba(80,50,8,0.07)', c1: 'rgba(0,0,0,0)' },
    ];

    clouds.forEach(function(b) {
      var gr = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      gr.addColorStop(0, b.c0); gr.addColorStop(1, b.c1);
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    });

    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════════════════════════════════════════════════════
     MILKY WAY — distant
     ════════════════════════════════════════════════════════ */
  var MW = [];
  [{ angle:0,n:500 },{ angle:Math.PI*.5,n:440 },{ angle:Math.PI,n:400 },{ angle:Math.PI*1.5,n:360 }].forEach(function(arm) {
    for (var i = 0; i < arm.n; i++) {
      var r = 400+Math.random()*1800, th = arm.angle+r/360+(Math.random()-.5)*1.1, sp = 45+r*.05;
      MW.push({ x:Math.cos(th)*r+(Math.random()-.5)*sp, y:(Math.random()-.5)*sp*.1, z:Math.sin(th)*r+(Math.random()-.5)*sp*.35, s:.18+Math.random()*.65, a:.05+Math.random()*.28 });
    }
  });
  for (var i = 0; i < 700; i++) {
    var r = 2000+Math.random()*4000, th = Math.random()*Math.PI*2, ph = (Math.random()-.5)*Math.PI;
    MW.push({ x:r*Math.cos(th)*Math.cos(ph), y:r*Math.sin(ph)*.08, z:r*Math.sin(th)*Math.cos(ph), s:.10+Math.random()*.35, a:.02+Math.random()*.12 });
  }
  var MW_N = MW.length;

  function drawMW() {
    var cyaw=Math.cos(CAM.yaw), syaw=Math.sin(CAM.yaw), cp=Math.cos(CAM.pitch), sp=Math.sin(CAM.pitch);
    for (var i = 0; i < MW_N; i++) {
      var s = MW[i];
      var rx=s.x*cyaw-s.z*syaw, rz=s.x*syaw+s.z*cyaw;
      var ry=s.y*cp-rz*sp, rz2=s.y*sp+rz*cp;
      var d=rz2+CAM.fov*1.3; if(d<40) continue;
      var sc2=Math.max(.08,s.s*Math.min(1,420/d));
      var al=s.a*Math.min(1,280/d); if(al<.012) continue;
      var px=CX+rx*(CAM.fov/d), py=CY-ry*(CAM.fov/d);
      ctx.beginPath(); ctx.arc(px,py,sc2,0,Math.PI*2);
      ctx.fillStyle='rgba(100,140,220,'+al+')'; ctx.fill();
    }
  }

  /* ── foreground stars — สูญยตา palette ── */
  var NEAR = [];
  for (var i = 0; i < 620; i++) {
    var bright = Math.random() > .92;
    /* สูญยตา: ส่วนใหญ่เป็นสีเย็น blue-white และ cold violet, น้อยส่วนเป็น warm */
    var t = Math.random();
    var r2 = t>.92?255: t>.78?220: t>.55?170: t>.30?140: 160;
    var g2 = t>.92?120: t>.78?200: t>.55?190: t>.30?160: 200;
    var b2 = t>.92?80:  t>.78?255: t>.55?255: t>.30?255: 240;
    NEAR.push({
      x: Math.random(), y: Math.random(),
      s: bright ? .85+Math.random()*.7 : .12+Math.random()*.38,
      a: bright ? .45+Math.random()*.3 : .05+Math.random()*.18,
      r: r2, g: g2, b: b2,
      bloom: bright && Math.random()>.35,
      twinkle: Math.random()*Math.PI*2,
      twinkleSpeed: .012+Math.random()*.022,
      twinkleAmp: bright ? .14+Math.random()*.20 : .03+Math.random()*.07,
      vx: (Math.random()-.5)*.0000035,
      vy: (Math.random()-.5)*.0000022,
    });
  }

  function drawNear() {
    var now = (performance.now()-t0)*.001;
    for (var i = 0; i < NEAR.length; i++) {
      var s = NEAR[i];
      s.x = ((s.x+s.vx+1)%1); s.y = ((s.y+s.vy+1)%1);
      var tw = s.a*(1+Math.sin(now*s.twinkleSpeed*60+s.twinkle)*s.twinkleAmp);
      var px = s.x*W, py = s.y*H;
      ctx.beginPath(); ctx.arc(px,py,s.s,0,Math.PI*2);
      ctx.fillStyle = 'rgba('+s.r+','+s.g+','+s.b+','+Math.min(1,tw)+')'; ctx.fill();
      if (s.bloom) {
        var bl = s.s*2.6;
        ctx.strokeStyle = 'rgba('+s.r+','+s.g+','+s.b+','+(tw*.09)+')';
        ctx.lineWidth = .35; ctx.beginPath();
        ctx.moveTo(px-bl,py); ctx.lineTo(px+bl,py);
        ctx.moveTo(px,py-bl); ctx.lineTo(px,py+bl); ctx.stroke();
      }
    }
  }

  /* ── orbit rings ── */
  function drawOrbitRings() {
    PLANETS.forEach(function(p) {
      ctx.beginPath();
      ctx.ellipse(CX, CY, p.orb, p.orb*TILT, 0, 0, Math.PI*2);
      /* KD nodes — brighter ring */
      ctx.strokeStyle = p.kd
        ? 'rgba('+hexToRgb(p.kdColor||'#ffffff')+',0.12)'
        : 'rgba(255,255,255,0.04)';
      ctx.lineWidth = p.kd ? 1 : .6;
      ctx.stroke();
    });
  }

  function hexToRgb(hex) {
    var r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return r+','+g+','+b;
  }

  /* ════════════════════════════════════════════════════════
     PLANET — 7-layer shading
     ════════════════════════════════════════════════════════ */
  function drawPlanet(x, y, p) {
    var sz = p.sz;
    var rgb = [parseInt(p.color.slice(1,3),16), parseInt(p.color.slice(3,5),16), parseInt(p.color.slice(5,7),16)];
    var R=rgb[0], G=rgb[1], B=rgb[2];

    /* glow haze for KD nodes */
    if (p.kd && p.kdGlow) {
      ctx.globalCompositeOperation = 'screen';
      var halo = ctx.createRadialGradient(x,y,sz*.5,x,y,sz*4.5);
      halo.addColorStop(0, p.kdGlow);
      halo.addColorStop(.4, p.kdGlow.replace(/[\d.]+\)$/, '0.18)'));
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x,y,sz*4.5,0,Math.PI*2);
      ctx.fillStyle = halo; ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    /* atmosphere haze */
    var atm = ctx.createRadialGradient(x,y,sz*.8,x,y,sz*1.6);
    atm.addColorStop(0, 'rgba('+R+','+G+','+B+',0)');
    atm.addColorStop(.55,'rgba('+R+','+G+','+B+',0.12)');
    atm.addColorStop(1,  'rgba('+R+','+G+','+B+',0.30)');
    ctx.beginPath(); ctx.arc(x,y,sz*1.6,0,Math.PI*2); ctx.fillStyle=atm; ctx.fill();

    /* dark base */
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2);
    ctx.fillStyle='rgb('+Math.round(R*.10)+','+Math.round(G*.10)+','+Math.round(B*.10)+')';
    ctx.fill();

    /* lit side from sun */
    var dx=CX-x, dy=CY-y, dd=Math.hypot(dx,dy)||1, lx=dx/dd, ly=dy/dd;
    var lit = ctx.createRadialGradient(x+lx*sz*.5,y+ly*sz*.5,0,x,y,sz*1.05);
    lit.addColorStop(0,   'rgba(255,255,255,0.88)');
    lit.addColorStop(.12, 'rgba('+Math.min(255,R+90)+','+Math.min(255,G+90)+','+Math.min(255,B+90)+',0.95)');
    lit.addColorStop(.38, 'rgba('+R+','+G+','+B+',0.90)');
    lit.addColorStop(.68, 'rgba('+Math.round(R*.5)+','+Math.round(G*.5)+','+Math.round(B*.5)+',0.65)');
    lit.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fillStyle=lit; ctx.fill();

    /* terminator shadow */
    var shd = ctx.createRadialGradient(x-lx*sz*.35,y-ly*sz*.35,sz*.1,x-lx*sz*.35,y-ly*sz*.35,sz*1.1);
    shd.addColorStop(0,  'rgba(0,0,8,0)');
    shd.addColorStop(.5, 'rgba(0,0,8,0.32)');
    shd.addColorStop(1,  'rgba(0,0,8,0.80)');
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fillStyle=shd; ctx.fill();

    /* specular */
    var spec = ctx.createRadialGradient(x+lx*sz*.38,y+ly*sz*.38,0,x+lx*sz*.38,y+ly*sz*.38,sz*.30);
    spec.addColorStop(0, 'rgba(255,255,255,0.60)');
    spec.addColorStop(.5,'rgba(255,255,255,0.06)');
    spec.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fillStyle=spec; ctx.fill();
  }

  function drawPlanets() {
    /* sort by y so closer planets render on top */
    var rendered = PLANETS.map(function(p) {
      p.ang += p.spd;
      return { p:p, x:CX+Math.cos(p.ang)*p.orb, y:CY+Math.sin(p.ang)*p.orb*TILT };
    }).sort(function(a,b){ return a.y-b.y; });

    rendered.forEach(function(item) {
      var p=item.p, x=item.x, y=item.y;

      drawPlanet(x, y, p);

      /* saturn ring */
      if (p.ring) {
        ctx.save(); ctx.translate(x,y); ctx.scale(1,TILT*.75);
        var rg = ctx.createRadialGradient(0,0,p.sz*1.85,0,0,p.sz*3.4);
        rg.addColorStop(0,  'rgba(220,195,130,0)');
        rg.addColorStop(.18,'rgba(220,195,130,0.50)');
        rg.addColorStop(.65,'rgba(200,170,100,0.32)');
        rg.addColorStop(1,  'rgba(180,150,80,0)');
        ctx.beginPath(); ctx.arc(0,0,p.sz*3.4,0,Math.PI*2); ctx.fillStyle=rg; ctx.fill();
        ctx.restore();
      }

      /* moon */
      if (p.moon) {
        var ma=p.ang*8, mx=x+Math.cos(ma)*sc(17), my=y+Math.sin(ma)*sc(4.5);
        var msz=sc(2), mdx=CX-mx, mdy=CY-my, mdd=Math.hypot(mdx,mdy)||1;
        var mlx=mdx/mdd, mly=mdy/mdd;
        var mg=ctx.createRadialGradient(mx+mlx*msz*.4,my+mly*msz*.4,0,mx,my,msz);
        mg.addColorStop(0,'rgba(240,248,255,0.95)');
        mg.addColorStop(.5,'rgba(150,160,175,0.75)');
        mg.addColorStop(1,'rgba(20,25,35,0.20)');
        ctx.beginPath(); ctx.arc(mx,my,msz,0,Math.PI*2); ctx.fillStyle=mg; ctx.fill();
      }

      /* ── KD NODE LABEL — ชัด เรืองแสง ── */
      if (p.kd) {
        var fontSize = Math.max(9, Math.round(p.sz * .72));
        var labelY   = y - p.sz - 7;
        var col      = p.kdColor || '#e8f4ff';

        /* glow shadow ด้านหลัง text */
        ctx.shadowColor   = p.kdColor || '#00ffe0';
        ctx.shadowBlur    = 10;
        ctx.fillStyle     = col;
        ctx.font          = '600 '+fontSize+'px "DM Mono",monospace';
        ctx.textAlign     = 'center';
        ctx.textBaseline  = 'bottom';
        ctx.fillText(p.kd, x, labelY);
        ctx.shadowBlur    = 0;
        ctx.textBaseline  = 'alphabetic';
      }
    });
  }

  /* ════════════════════════════════════════════════════════
     SUN — LYLA ◈ — หัวใจของระบบ
     ════════════════════════════════════════════════════════ */
  function drawSun() {
    var R  = sc(26);
    var now = (performance.now()-t0)*.001;

    /* outer corona — additive warm */
    ctx.globalCompositeOperation = 'lighter';
    var corona = ctx.createRadialGradient(CX,CY,R*.4,CX,CY,R*7);
    corona.addColorStop(0,  'rgba(255,165,55,0.16)');
    corona.addColorStop(.28,'rgba(255,80,15,0.06)');
    corona.addColorStop(.6, 'rgba(180,40,5,0.03)');
    corona.addColorStop(1,  'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CX,CY,R*7,0,Math.PI*2);
    ctx.fillStyle=corona; ctx.fill();

    /* corona rays — slow rotate */
    ctx.save(); ctx.translate(CX,CY); ctx.rotate(now*.0008);
    for (var i = 0; i < 18; i++) {
      var a = (i/18)*Math.PI*2;
      var rLen = R*(2.8+.35*Math.sin(i*2.7+now*.4));
      var grd = ctx.createLinearGradient(Math.cos(a)*R*.2,Math.sin(a)*R*.2,Math.cos(a)*rLen,Math.sin(a)*rLen);
      grd.addColorStop(0,'rgba(255,210,90,0.22)');
      grd.addColorStop(.4,'rgba(255,120,30,0.06)');
      grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.strokeStyle=grd; ctx.lineWidth=1.8;
      ctx.beginPath(); ctx.moveTo(Math.cos(a)*R*.2,Math.sin(a)*R*.2); ctx.lineTo(Math.cos(a)*rLen,Math.sin(a)*rLen); ctx.stroke();
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';

    /* halo */
    ctx.globalCompositeOperation = 'lighter';
    var halo = ctx.createRadialGradient(CX,CY,R*.5,CX,CY,R*2.8);
    halo.addColorStop(0,  'rgba(255,255,240,0.92)');
    halo.addColorStop(.08,'rgba(255,215,100,0.75)');
    halo.addColorStop(.28,'rgba(255,120,35,0.40)');
    halo.addColorStop(.55,'rgba(160,35,5,0.14)');
    halo.addColorStop(1,  'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CX,CY,R*2.8,0,Math.PI*2);
    ctx.fillStyle=halo; ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    /* solar disk */
    var disk = ctx.createRadialGradient(CX-R*.18,CY-R*.18,0,CX,CY,R);
    disk.addColorStop(0,   '#fffef8');
    disk.addColorStop(.12, '#fff5b0');
    disk.addColorStop(.35, '#ffcc55');
    disk.addColorStop(.60, '#ff7e18');
    disk.addColorStop(.82, '#c02800');
    disk.addColorStop(1,   '#200300');
    ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2);
    ctx.fillStyle=disk; ctx.fill();

    /* LYLA ◈ label */
    var fs = Math.max(9,Math.floor(R*.30));
    ctx.shadowColor='rgba(255,220,100,0.9)'; ctx.shadowBlur=12;
    ctx.fillStyle='rgba(255,252,230,0.88)';
    ctx.font='600 '+fs+'px "DM Mono",monospace';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('LYLA ◈', CX, CY);
    ctx.shadowBlur=0; ctx.textBaseline='alphabetic';
  }

  /* ── PULSES ── */
  var pulses = [];
  var ROUTE_COL = {
    general: [96,165,250], risk:[248,113,113], survival:[52,211,153],
    collapse:[251,146,60], civil:[167,139,250], vega:[255,232,160], crisis:[239,68,68]
  };
  window.KD_pulse = function(route) {
    var col = ROUTE_COL[route] || [96,165,250];
    for (var i = 0; i < 4; i++) {
      (function(ii,c){ setTimeout(function(){ pulses.push({ r:0, maxR:Math.min(W,H)*(.07+ii*.13), alpha:.55-ii*.09, col:c }); }, ii*80); })(i, col);
    }
  };
  window.addEventListener('KD:response', function(e) {
    if (e.detail) { window.KD.state=e.detail; window.KD_pulse((e.detail.output&&e.detail.output.action)||'general'); }
  });
  function drawPulses() {
    pulses = pulses.filter(function(p){ return p.alpha>.005; });
    pulses.forEach(function(p) {
      p.r  += (p.maxR-p.r)*.022; p.alpha *= .944;
      ctx.strokeStyle='rgba('+p.col[0]+','+p.col[1]+','+p.col[2]+','+p.alpha*.45+')';
      ctx.lineWidth=1.2*p.alpha;
      ctx.beginPath(); ctx.arc(CX,CY,p.r,0,Math.PI*2); ctx.stroke();
    });
  }

  /* ── RENDER LOOP ── */
  function frame(now) {
    if (CAM.auto) CAM.yaw += .00009;
    drawBg();
    drawNear();
    drawMW();
    drawOrbitRings();
    drawPulses();
    drawPlanets();
    drawSun();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
