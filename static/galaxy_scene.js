/* ============================================================
   KING DIADEM — galaxy_scene.js v15 ★ CINEMATIC EDITION
   ★ TRUE Solar System proportions: Mercury→Neptune + KD nodes
   ★ LYLA = Sun with trident corona glyph
   ★ Nebula parallax 3-layer depth
   ★ KD Nodes: WATERLINE, VEGA, HALT, CIVIL, FATE as named planets
   ★ Cosmic Latte K-stars + Teal D-stars
   ★ Full planet textures: surface bands, atmosphere, specular
   ★ Saturn-style rings on Jupiter + Saturn nodes
   ★ LYLA thinking → ALL planets speed up + converge to top-down
   ★ On answer → planets align radially then scatter
   ★ Shooting stars periodically
   ★ Mouse/touch parallax on nebula layers
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
  var mouseX = 0, mouseY = 0;

  /* ── Logo image preload ── */
  var _logoImg = new Image();
  _logoImg.src = '/static/logo.png';

  /* ── Mouse parallax ── */
  window.addEventListener('mousemove', function(e) {
    mouseX = (e.clientX / window.innerWidth  - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  /* ════════════════════════════════════════════════
     RESIZE
  ════════════════════════════════════════════════ */
  var resizeTimer = 0;
  function onResize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(doResize, 120); }
  function doResize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    CX = W * 0.5; CY = H * 0.5;
    rebuildPlanets();
    buildStarField();
    buildShootingStars();
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
    baseTilt: 0.26,
    alignPhase: 0,
  };

  /* ════════════════════════════════════════════════
     PLANETS — TRUE solar order + KD nodes woven in
     Colors match real planetary palette
  ════════════════════════════════════════════════ */
  var PLANETS = [];

  /* Texture painter per planet type */
  function makePlanetCanvas(size, type) {
    var pc = document.createElement('canvas');
    pc.width = pc.height = size * 2;
    var px = pc.getContext('2d');
    var R = size, cx = size, cy = size;

    if (type === 'sun') {
      var g = px.createRadialGradient(cx*0.7,cy*0.7,0,cx,cy,R);
      g.addColorStop(0,'#ffffee'); g.addColorStop(0.2,'#ffe066');
      g.addColorStop(0.6,'#ff9900'); g.addColorStop(1,'#cc4400');
      px.beginPath(); px.arc(cx,cy,R,0,Math.PI*2); px.fillStyle=g; px.fill();
      /* sunspot swirls */
      for(var i=0;i<6;i++){
        var sx=cx+(Math.random()-0.5)*R*0.8, sy=cy+(Math.random()-0.5)*R*0.8;
        var sg=px.createRadialGradient(sx,sy,0,sx,sy,R*0.08);
        sg.addColorStop(0,'rgba(180,60,0,0.45)'); sg.addColorStop(1,'rgba(0,0,0,0)');
        px.beginPath(); px.arc(sx,sy,R*0.08,0,Math.PI*2); px.fillStyle=sg; px.fill();
      }
    } else if (type === 'mercury') {
      var g=px.createRadialGradient(cx*0.7,cy*0.7,0,cx,cy,R);
      g.addColorStop(0,'#ccbbaa'); g.addColorStop(0.5,'#887766'); g.addColorStop(1,'#554433');
      px.beginPath(); px.arc(cx,cy,R,0,Math.PI*2); px.fillStyle=g; px.fill();
      /* craters */
      for(var i=0;i<8;i++){
        var cr=R*(0.06+Math.random()*0.1), ccx=cx+(Math.random()-0.5)*R*1.5, ccy=cy+(Math.random()-0.5)*R*1.5;
        px.beginPath(); px.arc(ccx,ccy,cr,0,Math.PI*2);
        px.strokeStyle='rgba(80,60,40,0.5)'; px.lineWidth=1; px.stroke();
      }
    } else if (type === 'venus') {
      var g=px.createRadialGradient(cx*0.7,cy*0.7,0,cx,cy,R);
      g.addColorStop(0,'#fff0aa'); g.addColorStop(0.5,'#e8c060'); g.addColorStop(1,'#aa7020');
      px.beginPath(); px.arc(cx,cy,R,0,Math.PI*2); px.fillStyle=g; px.fill();
      /* cloud bands */
      for(var i=0;i<5;i++){
        var by=cy-R*0.7+i*R*0.35;
        px.beginPath(); px.ellipse(cx,by,R*0.9,R*0.08,0,0,Math.PI*2);
        px.fillStyle='rgba(255,255,200,0.15)'; px.fill();
      }
    } else if (type === 'earth') {
      var g=px.createRadialGradient(cx*0.7,cy*0.7,0,cx,cy,R);
      g.addColorStop(0,'#88ccff'); g.addColorStop(0.4,'#2266aa'); g.addColorStop(1,'#002244');
      px.beginPath(); px.arc(cx,cy,R,0,Math.PI*2); px.fillStyle=g; px.fill();
      /* continents */
      px.fillStyle='rgba(40,140,60,0.70)';
      px.beginPath(); px.ellipse(cx-R*0.2,cy-R*0.1,R*0.28,R*0.38,0.4,0,Math.PI*2); px.fill();
      px.beginPath(); px.ellipse(cx+R*0.22,cy+R*0.1,R*0.20,R*0.30,-0.3,0,Math.PI*2); px.fill();
      /* clouds */
      px.fillStyle='rgba(255,255,255,0.20)';
      for(var i=0;i<4;i++){
        var by=cy-R*0.6+i*R*0.4;
        px.beginPath(); px.ellipse(cx,by,R*0.8,R*0.07,-0.2,0,Math.PI*2); px.fill();
      }
    } else if (type === 'mars') {
      var g=px.createRadialGradient(cx*0.7,cy*0.7,0,cx,cy,R);
      g.addColorStop(0,'#ffaa88'); g.addColorStop(0.5,'#cc4422'); g.addColorStop(1,'#661100');
      px.beginPath(); px.arc(cx,cy,R,0,Math.PI*2); px.fillStyle=g; px.fill();
      /* polar cap */
      var pg=px.createRadialGradient(cx,cy-R*0.8,0,cx,cy-R*0.8,R*0.28);
      pg.addColorStop(0,'rgba(255,255,255,0.80)'); pg.addColorStop(1,'rgba(255,255,255,0)');
      px.beginPath(); px.arc(cx,cy-R*0.8,R*0.25,0,Math.PI*2); px.fillStyle=pg; px.fill();
    } else if (type === 'jupiter') {
      var g=px.createRadialGradient(cx*0.7,cy*0.7,0,cx,cy,R);
      g.addColorStop(0,'#f0d890'); g.addColorStop(0.5,'#c8943a'); g.addColorStop(1,'#7a4a10');
      px.beginPath(); px.arc(cx,cy,R,0,Math.PI*2); px.fillStyle=g; px.fill();
      /* bands */
      var bands=['rgba(120,60,20,0.55)','rgba(200,160,80,0.35)','rgba(100,50,15,0.50)','rgba(180,140,60,0.30)'];
      var by_=[-0.55,-0.22,0.12,0.42];
      bands.forEach(function(c,i){
        px.beginPath(); px.ellipse(cx,cy+R*by_[i],R*1.0,R*(0.08+i*0.01),0,0,Math.PI*2);
        px.fillStyle=c; px.fill();
      });
      /* great red spot */
      var rs=px.createRadialGradient(cx+R*0.3,cy+R*0.15,0,cx+R*0.3,cy+R*0.15,R*0.18);
      rs.addColorStop(0,'rgba(200,60,30,0.80)'); rs.addColorStop(1,'rgba(200,60,30,0)');
      px.beginPath(); px.ellipse(cx+R*0.3,cy+R*0.15,R*0.18,R*0.11,0,0,Math.PI*2); px.fillStyle=rs; px.fill();
    } else if (type === 'saturn') {
      var g=px.createRadialGradient(cx*0.7,cy*0.7,0,cx,cy,R);
      g.addColorStop(0,'#f5e8b0'); g.addColorStop(0.5,'#d4a84b'); g.addColorStop(1,'#8a6020');
      px.beginPath(); px.arc(cx,cy,R,0,Math.PI*2); px.fillStyle=g; px.fill();
      var bands2=['rgba(160,110,40,0.35)','rgba(200,160,80,0.25)'];
      [−0.3,0.2].forEach(function(yy,i){ px.beginPath(); px.ellipse(cx,cy+R*yy,R,R*0.09,0,0,Math.PI*2); px.fillStyle=bands2[i%2]; px.fill(); });
    } else if (type === 'uranus') {
      var g=px.createRadialGradient(cx*0.7,cy*0.7,0,cx,cy,R);
      g.addColorStop(0,'#b0eeff'); g.addColorStop(0.5,'#55aacc'); g.addColorStop(1,'#226688');
      px.beginPath(); px.arc(cx,cy,R,0,Math.PI*2); px.fillStyle=g; px.fill();
    } else if (type === 'neptune') {
      var g=px.createRadialGradient(cx*0.7,cy*0.7,0,cx,cy,R);
      g.addColorStop(0,'#8899ff'); g.addColorStop(0.5,'#3344cc'); g.addColorStop(1,'#111166');
      px.beginPath(); px.arc(cx,cy,R,0,Math.PI*2); px.fillStyle=g; px.fill();
      var storm=px.createRadialGradient(cx-R*0.25,cy+R*0.2,0,cx-R*0.25,cy+R*0.2,R*0.2);
      storm.addColorStop(0,'rgba(100,150,255,0.60)'); storm.addColorStop(1,'rgba(0,0,0,0)');
      px.beginPath(); px.arc(cx-R*0.25,cy+R*0.2,R*0.2,0,Math.PI*2); px.fillStyle=storm; px.fill();
    } else if (type === 'waterline') {
      var g=px.createRadialGradient(cx*0.7,cy*0.7,0,cx,cy,R);
      g.addColorStop(0,'#aaffee'); g.addColorStop(0.5,'#00ddcc'); g.addColorStop(1,'#006655');
      px.beginPath(); px.arc(cx,cy,R,0,Math.PI*2); px.fillStyle=g; px.fill();
      /* water ripples */
      for(var i=1;i<=3;i++){
        px.beginPath(); px.arc(cx,cy,R*(0.3+i*0.2),0,Math.PI*2);
        px.strokeStyle='rgba(0,255,220,'+(0.15-i*0.03)+')'; px.lineWidth=1; px.stroke();
      }
    } else if (type === 'vega') {
      var g=px.createRadialGradient(cx*0.7,cy*0.7,0,cx,cy,R);
      g.addColorStop(0,'#ffffcc'); g.addColorStop(0.5,'#ffdd66'); g.addColorStop(1,'#aa8800');
      px.beginPath(); px.arc(cx,cy,R,0,Math.PI*2); px.fillStyle=g; px.fill();
      /* diamond glyph */
      px.fillStyle='rgba(255,255,255,0.45)';
      px.beginPath(); px.moveTo(cx,cy-R*0.4); px.lineTo(cx+R*0.25,cy); px.lineTo(cx,cy+R*0.4); px.lineTo(cx-R*0.25,cy); px.closePath(); px.fill();
    } else if (type === 'halt') {
      var g=px.createRadialGradient(cx*0.7,cy*0.7,0,cx,cy,R);
      g.addColorStop(0,'#ffaaaa'); g.addColorStop(0.5,'#dd3333'); g.addColorStop(1,'#660000');
      px.beginPath(); px.arc(cx,cy,R,0,Math.PI*2); px.fillStyle=g; px.fill();
      /* octagon stop mark */
      px.fillStyle='rgba(255,200,200,0.35)';
      px.beginPath();
      for(var i=0;i<8;i++){
        var a=i/8*Math.PI*2-Math.PI/8;
        if(i===0) px.moveTo(cx+Math.cos(a)*R*0.45,cy+Math.sin(a)*R*0.45);
        else px.lineTo(cx+Math.cos(a)*R*0.45,cy+Math.sin(a)*R*0.45);
      }
      px.closePath(); px.fill();
    } else if (type === 'civil') {
      var g=px.createRadialGradient(cx*0.7,cy*0.7,0,cx,cy,R);
      g.addColorStop(0,'#ddbbff'); g.addColorStop(0.5,'#9955dd'); g.addColorStop(1,'#330066');
      px.beginPath(); px.arc(cx,cy,R,0,Math.PI*2); px.fillStyle=g; px.fill();
      /* scale balance lines */
      px.strokeStyle='rgba(220,180,255,0.40)'; px.lineWidth=1.5;
      px.beginPath(); px.moveTo(cx-R*0.4,cy); px.lineTo(cx+R*0.4,cy); px.stroke();
      px.beginPath(); px.moveTo(cx,cy-R*0.1); px.lineTo(cx-R*0.28,cy+R*0.3); px.stroke();
      px.beginPath(); px.moveTo(cx,cy-R*0.1); px.lineTo(cx+R*0.28,cy+R*0.3); px.stroke();
    } else if (type === 'fate') {
      var g=px.createRadialGradient(cx*0.7,cy*0.7,0,cx,cy,R);
      g.addColorStop(0,'#ffddaa'); g.addColorStop(0.5,'#ff8833'); g.addColorStop(1,'#772200');
      px.beginPath(); px.arc(cx,cy,R,0,Math.PI*2); px.fillStyle=g; px.fill();
      /* infinity swirl */
      px.strokeStyle='rgba(255,220,150,0.40)'; px.lineWidth=1.5;
      px.beginPath(); px.ellipse(cx-R*0.22,cy,R*0.22,R*0.14,0,0,Math.PI*2); px.stroke();
      px.beginPath(); px.ellipse(cx+R*0.22,cy,R*0.22,R*0.14,0,0,Math.PI*2); px.stroke();
    }

    /* limb darkening overlay */
    var ld=px.createRadialGradient(cx,cy,R*0.3,cx,cy,R);
    ld.addColorStop(0,'rgba(0,0,0,0)'); ld.addColorStop(0.7,'rgba(0,0,0,0.15)'); ld.addColorStop(1,'rgba(0,0,0,0.65)');
    px.beginPath(); px.arc(cx,cy,R,0,Math.PI*2); px.fillStyle=ld; px.fill();

    return pc;
  }

  var _planetTextures = {};
  function getPlanetTexture(type, size) {
    var key = type+'_'+Math.round(size);
    if (!_planetTextures[key]) _planetTextures[key] = makePlanetCanvas(size, type);
    return _planetTextures[key];
  }

  function rebuildPlanets() {
    _planetTextures = {};
    var prev = PLANETS;

    /* ── Solar planets (real order, real color, scaled orbit+size) ── */
    var solar = [
      { type:'mercury', color:'#bbaa99', sz:sc(3.2),  orb:sc(48),  baseSpd:0.0052, label:'Mercury' },
      { type:'venus',   color:'#e8c060', sz:sc(5.0),  orb:sc(72),  baseSpd:0.0038, label:'Venus'   },
      { type:'earth',   color:'#4499dd', sz:sc(5.2),  orb:sc(100), baseSpd:0.0028, label:'Earth'   },
      { type:'mars',    color:'#cc4422', sz:sc(3.8),  orb:sc(132), baseSpd:0.0022, label:'Mars'    },
      { type:'jupiter', color:'#c89040', sz:sc(11.5), orb:sc(198), baseSpd:0.0010, label:'Jupiter', ring:false },
      { type:'saturn',  color:'#d4a84b', sz:sc(9.5),  orb:sc(256), baseSpd:0.0007, label:'Saturn',  ring:true  },
      { type:'uranus',  color:'#88ccdd', sz:sc(7.0),  orb:sc(316), baseSpd:0.0005, label:'Uranus'  },
      { type:'neptune', color:'#3344cc', sz:sc(6.8),  orb:sc(370), baseSpd:0.0003, label:'Neptune' },
    ];

    /* ── KD Governance nodes woven between solar orbits ── */
    var kdNodes = [
      { type:'waterline', color:'#00ffee', sz:sc(7.5),  orb:sc(84),  baseSpd:0.0032,
        kd:'WATERLINE', kdColor:'#00ffee', kdGlow:'rgba(0,255,238,0.65)' },
      { type:'vega',      color:'#ffdd88', sz:sc(8.0),  orb:sc(154), baseSpd:0.0019,
        kd:'VEGA ◆',    kdColor:'#ffdd88', kdGlow:'rgba(255,221,136,0.60)' },
      { type:'halt',      color:'#ff5555', sz:sc(6.0),  orb:sc(116), baseSpd:0.0026,
        kd:'HALT',      kdColor:'#ff8888', kdGlow:'rgba(255,80,80,0.55)'  },
      { type:'civil',     color:'#bb88ff', sz:sc(6.5),  orb:sc(240), baseSpd:0.0008,
        kd:'CIVIL',     kdColor:'#cc99ff', kdGlow:'rgba(180,140,255,0.55)' },
      { type:'fate',      color:'#ffaa44', sz:sc(5.8),  orb:sc(290), baseSpd:0.0006,
        kd:'FATE',      kdColor:'#ffcc77', kdGlow:'rgba(255,170,68,0.55)'  },
    ];

    PLANETS = solar.concat(kdNodes);

    var defaults=[0.4,2.1,1.2,4.6,3.3,0.9,5.5,1.8,2.2,3.8,5.0,0.6,4.2];
    PLANETS.forEach(function(p, i) {
      p.ang     = (prev[i] && prev[i].ang != null) ? prev[i].ang : (defaults[i] || Math.random()*Math.PI*2);
      p.spd     = p.baseSpd;
      p.tiltOff = (Math.random()-0.5)*0.04;
      p.tex     = getPlanetTexture(p.type, Math.ceil(p.sz));
    });
  }

  /* ════════════════════════════════════════════════
     STAR FIELD — 3 depth layers + parallax
  ════════════════════════════════════════════════ */
  var STARS = [];

  function buildStarField() {
    STARS = [];
    /* layer 0 = far (small, slow parallax), layer 1 = mid, layer 2 = near */
    for (var i = 0; i < 680; i++) {
      var layer  = i < 380 ? 0 : i < 580 ? 1 : 2;
      var bright = Math.random() > (layer===2 ? 0.75 : 0.88);
      var isK    = Math.random() > 0.35;
      STARS.push({
        x: Math.random(), y: Math.random(),
        s: bright ? 0.7+Math.random()*1.1 : 0.08+Math.random()*(layer*0.15+0.22),
        a: bright ? 0.45+Math.random()*0.40 : 0.06+Math.random()*(layer*0.05+0.14),
        isK: isK,
        bloom: bright && Math.random()>0.38,
        tw: Math.random()*Math.PI*2,
        tws: 0.008+Math.random()*0.022,
        twa: bright ? 0.12+Math.random()*0.24 : 0.03+Math.random()*0.07,
        parallax: (layer+1)*0.0004,
        layer: layer,
      });
    }
  }

  /* ════════════════════════════════════════════════
     SHOOTING STARS
  ════════════════════════════════════════════════ */
  var SHOOTS = [];
  var nextShoot = 0;

  function buildShootingStars() { SHOOTS = []; nextShoot = 0; }

  function spawnShoot(now) {
    SHOOTS.push({
      x: Math.random()*W*0.7,
      y: Math.random()*H*0.3,
      vx: 6+Math.random()*8,
      vy: 2+Math.random()*4,
      life: 0,
      maxLife: 0.6+Math.random()*0.5,
      len: 90+Math.random()*120,
    });
    nextShoot = now + 3000 + Math.random()*8000;
  }

  function drawShootingStars(now, dt) {
    if (now > nextShoot) spawnShoot(now);
    for (var i = SHOOTS.length-1; i >= 0; i--) {
      var s = SHOOTS[i];
      s.life += dt;
      if (s.life > s.maxLife) { SHOOTS.splice(i,1); continue; }
      var prog = s.life/s.maxLife;
      var alpha = prog < 0.2 ? prog/0.2 : 1-((prog-0.2)/0.8);
      var x1 = s.x + s.vx*s.life*60*0.016;
      var y1 = s.y + s.vy*s.life*60*0.016;
      var grad = ctx.createLinearGradient(x1-s.len*0.8,y1-s.len*0.35,x1,y1);
      grad.addColorStop(0,'rgba(255,255,255,0)');
      grad.addColorStop(0.6,'rgba(200,230,255,'+(alpha*0.5)+')');
      grad.addColorStop(1,'rgba(255,255,255,'+(alpha*0.95)+')');
      ctx.beginPath(); ctx.moveTo(x1-s.len*0.8,y1-s.len*0.35); ctx.lineTo(x1,y1);
      ctx.strokeStyle=grad; ctx.lineWidth=1.5; ctx.stroke();
      /* head glow */
      var hg=ctx.createRadialGradient(x1,y1,0,x1,y1,4);
      hg.addColorStop(0,'rgba(220,240,255,'+(alpha*0.9)+')');
      hg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x1,y1,4,0,Math.PI*2); ctx.fillStyle=hg; ctx.fill();
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
    CAM.yaw   -= (x-drag.x)*0.003;
    CAM.pitch += (y-drag.y)*0.002;
    CAM.pitch  = Math.max(-0.5,Math.min(0.7,CAM.pitch));
    drag.x=x; drag.y=y;
  }
  function up(){ drag.on=false; }

  cv.addEventListener('mousedown',  function(e){ dn(e.clientX,e.clientY); });
  cv.addEventListener('mousemove',  function(e){ mv(e.clientX,e.clientY); });
  cv.addEventListener('mouseup',    up);
  cv.addEventListener('mouseleave', up);
  cv.addEventListener('touchstart', function(e){ if(e.touches.length===1)dn(e.touches[0].clientX,e.touches[0].clientY); e.preventDefault(); },{passive:false});
  cv.addEventListener('touchmove',  function(e){ if(e.touches.length===1)mv(e.touches[0].clientX,e.touches[0].clientY); e.preventDefault(); },{passive:false});
  cv.addEventListener('touchend',   up);
  cv.addEventListener('wheel',      function(e){ CAM.fov=Math.max(180,Math.min(750,CAM.fov+e.deltaY*0.3)); e.preventDefault(); },{passive:false});

  /* ════════════════════════════════════════════════
     DRAW BACKGROUND
  ════════════════════════════════════════════════ */
  function drawBg(now) {
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation='source-over';

    /* deep space base */
    var base=ctx.createRadialGradient(CX,CY*0.6,0,CX,CY,Math.max(W,H)*0.95);
    base.addColorStop(0,  'rgba(8,4,24,0.96)');
    base.addColorStop(0.45,'rgba(3,1,12,0.98)');
    base.addColorStop(1,  'rgba(0,0,3,1)');
    ctx.fillStyle=base; ctx.fillRect(0,0,W,H);

    /* nebula wisps — 3-layer parallax */
    ctx.globalCompositeOperation='screen';
    var t=now*0.001;
    var mxf=mouseX*18, myf=mouseY*12; /* parallax offset */

    var clouds=[
      /* layer 0 — farthest, purple */
      {x:W*0.10+Math.sin(t*0.006)*W*0.025+mxf*0.3,
       y:H*0.18+Math.cos(t*0.004)*H*0.018+myf*0.3,
       r:Math.max(W,H)*0.55, c:'rgba(65,10,145,0.22)'},
      {x:W*0.85+Math.cos(t*0.005)*W*0.020+mxf*0.3,
       y:H*0.25+Math.sin(t*0.007)*H*0.018+myf*0.3,
       r:Math.max(W,H)*0.48, c:'rgba(85,15,160,0.17)'},
      /* layer 1 — mid, orange/rust nebula like wallpaper */
      {x:W*0.75+Math.sin(t*0.008)*W*0.018+mxf*0.6,
       y:H*0.68+Math.cos(t*0.006)*H*0.018+myf*0.6,
       r:Math.max(W,H)*0.42, c:'rgba(130,48,8,0.20)'},
      {x:W*0.28+Math.cos(t*0.007)*W*0.022+mxf*0.6,
       y:H*0.72+Math.sin(t*0.005)*H*0.022+myf*0.6,
       r:Math.max(W,H)*0.38, c:'rgba(90,25,8,0.16)'},
      /* layer 2 — near, teal/cyan */
      {x:CX+Math.cos(t*0.009)*W*0.04+mxf*0.9,
       y:CY*0.5+Math.sin(t*0.007)*H*0.03+myf*0.9,
       r:Math.max(W,H)*0.28, c:'rgba(0,120,160,0.10)'},
      /* warm gold center glow */
      {x:CX,y:CY,r:Math.max(W,H)*0.22,c:'rgba(200,120,20,0.07)'},
    ];
    clouds.forEach(function(c){
      var g=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,c.r);
      g.addColorStop(0,c.c); g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    });
    ctx.globalCompositeOperation='source-over';
  }

  /* ════════════════════════════════════════════════
     DRAW STARS — parallax
  ════════════════════════════════════════════════ */
  function drawStars(now) {
    for (var i=0;i<STARS.length;i++){
      var s=STARS[i];
      var px2=s.x*W + mouseX*s.parallax*W*60;
      var py2=s.y*H + mouseY*s.parallax*H*60;
      /* wrap */
      px2=((px2%W)+W)%W; py2=((py2%H)+H)%H;
      var tw=s.a*(1+Math.sin(now*s.tws*0.06+s.tw)*s.twa);
      var rgb=s.isK?'255,248,231':'0,210,255';
      ctx.beginPath(); ctx.arc(px2,py2,s.s,0,Math.PI*2);
      ctx.fillStyle='rgba('+rgb+','+Math.min(1,tw)+')'; ctx.fill();
      if(s.bloom){
        var bl=s.s*3.5;
        ctx.strokeStyle='rgba('+rgb+','+(tw*0.08)+')';
        ctx.lineWidth=0.4; ctx.beginPath();
        ctx.moveTo(px2-bl,py2); ctx.lineTo(px2+bl,py2);
        ctx.moveTo(px2,py2-bl); ctx.lineTo(px2,py2+bl);
        ctx.stroke();
      }
    }
  }

  /* ════════════════════════════════════════════════
     ORBIT RINGS
  ════════════════════════════════════════════════ */
  function drawOrbitRings(tilt) {
    PLANETS.forEach(function(p){
      ctx.beginPath();
      ctx.ellipse(CX,CY,p.orb,p.orb*tilt,0,0,Math.PI*2);
      if(p.kd){
        ctx.strokeStyle='rgba('+hexRgb(p.kdColor||'#fff')+',0.14)';
        ctx.lineWidth=0.9;
        /* dashed KD orbit */
        ctx.setLineDash([8,10]);
      } else {
        ctx.strokeStyle='rgba(150,170,230,0.045)';
        ctx.lineWidth=0.5;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  function hexRgb(h){
    h=h.replace('#','');
    if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16);
  }

  /* ════════════════════════════════════════════════
     DRAW PLANET (texture + glow + atmosphere)
  ════════════════════════════════════════════════ */
  function drawPlanetAt(x, y, p, now) {
    var sz=p.sz;
    var R2=parseInt(p.color.slice(1,3),16), G2=parseInt(p.color.slice(3,5),16), B2=parseInt(p.color.slice(5,7),16);

    /* KD glow pulse */
    if(p.kd && p.kdGlow){
      ctx.globalCompositeOperation='screen';
      var pulse = 1+Math.sin(now*0.002+p.ang)*0.3;
      var halo=ctx.createRadialGradient(x,y,sz*0.5,x,y,sz*6.5*pulse);
      halo.addColorStop(0,p.kdGlow);
      halo.addColorStop(0.3,p.kdGlow.replace(/[\d.]+\)$/,'0.14)'));
      halo.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x,y,sz*6.5*pulse,0,Math.PI*2);
      ctx.fillStyle=halo; ctx.fill();
      ctx.globalCompositeOperation='source-over';
    }

    /* atmosphere haze */
    var atm=ctx.createRadialGradient(x,y,sz*0.8,x,y,sz*2.0);
    atm.addColorStop(0,'rgba('+R2+','+G2+','+B2+',0)');
    atm.addColorStop(0.5,'rgba('+R2+','+G2+','+B2+',0.10)');
    atm.addColorStop(1,'rgba('+R2+','+G2+','+B2+',0.22)');
    ctx.beginPath(); ctx.arc(x,y,sz*2.0,0,Math.PI*2); ctx.fillStyle=atm; ctx.fill();

    /* texture sphere */
    ctx.save();
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.clip();
    if(p.tex){
      var ts=p.tex.width/2;
      /* slow rotation offset based on ang */
      var rot = p.ang * 0.8;
      ctx.translate(x,y);
      ctx.rotate(rot * 0.05);
      ctx.drawImage(p.tex, -ts, -ts, ts*2, ts*2);
      ctx.rotate(-rot * 0.05);
      ctx.translate(-x,-y);
    }
    ctx.restore();

    /* specular highlight */
    var dx2=CX-x, dy2=CY-y, dd=Math.hypot(dx2,dy2)||1, lx=dx2/dd, ly=dy2/dd;
    var spec=ctx.createRadialGradient(x+lx*sz*0.42,y+ly*sz*0.42,0,x+lx*sz*0.42,y+ly*sz*0.42,sz*0.32);
    spec.addColorStop(0,'rgba(255,255,255,0.55)'); spec.addColorStop(0.5,'rgba(255,255,255,0.04)'); spec.addColorStop(1,'rgba(255,255,255,0)');
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fillStyle=spec; ctx.fill();

    /* limb shadow */
    var shd=ctx.createRadialGradient(x-lx*sz*0.3,y-ly*sz*0.3,sz*0.2,x-lx*sz*0.3,y-ly*sz*0.3,sz*1.15);
    shd.addColorStop(0,'rgba(0,0,8,0)'); shd.addColorStop(0.5,'rgba(0,0,8,0.32)'); shd.addColorStop(1,'rgba(0,0,8,0.78)');
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fillStyle=shd; ctx.fill();
  }

  /* ════════════════════════════════════════════════
     DRAW ALL PLANETS
  ════════════════════════════════════════════════ */
  function drawPlanets(dt, now, tilt) {
    var isThinking   = STATE.mode==='thinking';
    var isConverging = STATE.mode==='converging';
    var isAlign      = STATE.mode==='answering';

    PLANETS.forEach(function(p){
      var boost=1;
      if(isThinking||isConverging) boost=1+STATE.convergeProgress*6;
      p.ang += p.spd * boost * dt * 60;
    });

    /* alignment: planets radially spread out from CX,CY on answer */
    var items=PLANETS.map(function(p){
      var orb=p.orb;
      var x=CX+Math.cos(p.ang)*orb;
      var y=CY+Math.sin(p.ang)*orb*tilt;
      return {p:p,x:x,y:y};
    }).sort(function(a,b){ return a.y-b.y; });

    items.forEach(function(item){
      var p=item.p, x=item.x, y=item.y;

      /* saturn ring — back half */
      if(p.ring){
        ctx.save(); ctx.translate(x,y); ctx.scale(1,tilt*0.40);
        var rg=ctx.createRadialGradient(0,0,p.sz*1.5,0,0,p.sz*3.8);
        rg.addColorStop(0,'rgba(215,190,120,0)');
        rg.addColorStop(0.18,'rgba(215,190,120,0.38)');
        rg.addColorStop(0.55,'rgba(195,165,90,0.22)');
        rg.addColorStop(0.75,'rgba(215,180,100,0.15)');
        rg.addColorStop(1,'rgba(175,145,70,0)');
        ctx.beginPath(); ctx.arc(0,0,p.sz*3.8,Math.PI,Math.PI*2); ctx.fillStyle=rg; ctx.fill();
        /* ring edge lines */
        ctx.strokeStyle='rgba(200,170,90,0.20)'; ctx.lineWidth=0.8;
        for(var ri=0;ri<3;ri++){
          var rr=p.sz*(1.8+ri*0.65);
          ctx.beginPath(); ctx.ellipse(0,0,rr,rr*0.22,0,0,Math.PI); ctx.stroke();
        }
        ctx.restore();
      }

      drawPlanetAt(x,y,p,now);

      /* saturn ring — front half */
      if(p.ring){
        ctx.save(); ctx.translate(x,y); ctx.scale(1,tilt*0.40);
        var rg2=ctx.createRadialGradient(0,0,p.sz*1.5,0,0,p.sz*3.8);
        rg2.addColorStop(0,'rgba(215,190,120,0)');
        rg2.addColorStop(0.18,'rgba(215,190,120,0.45)');
        rg2.addColorStop(0.55,'rgba(195,165,90,0.30)');
        rg2.addColorStop(1,'rgba(175,145,70,0)');
        ctx.beginPath(); ctx.arc(0,0,p.sz*3.8,0,Math.PI); ctx.fillStyle=rg2; ctx.fill();
        ctx.restore();
      }

      /* KD label */
      if(p.kd){
        var fs=Math.max(9,Math.round(p.sz*0.78));
        ctx.shadowColor=p.kdColor||'#fff'; ctx.shadowBlur=14;
        ctx.fillStyle=p.kdColor||'#fff';
        ctx.font='600 '+fs+'px "DM Mono",monospace';
        ctx.textAlign='center'; ctx.textBaseline='bottom';
        ctx.fillText(p.kd,x,y-p.sz-7);
        ctx.shadowBlur=0; ctx.textBaseline='alphabetic';
      }
    });
  }

  /* ════════════════════════════════════════════════
     ORBITAL LIGHT RINGS
  ════════════════════════════════════════════════ */
  function drawOrbitalRings(now, tilt){
    var t=now*0.001;
    var R1=sc(130), R2=sc(143);
    ctx.globalCompositeOperation='screen';
    ctx.save(); ctx.translate(CX,CY); ctx.scale(1,tilt);

    /* blue comet sweep */
    var bAng=t*0.22;
    for(var i=0;i<60;i++){
      var f=i/60,a=bAng-1.9*f+1.9;
      ctx.beginPath(); ctx.arc(Math.cos(a)*R1,Math.sin(a)*R1,0.5+f*2.4,0,Math.PI*2);
      ctx.fillStyle='rgba(0,210,255,'+(f*0.88)+')'; ctx.fill();
    }
    var bx=Math.cos(bAng)*R1, by=Math.sin(bAng)*R1;
    var bh=ctx.createRadialGradient(bx,by,0,bx,by,sc(5));
    bh.addColorStop(0,'rgba(180,248,255,0.95)'); bh.addColorStop(0.5,'rgba(0,195,255,0.55)'); bh.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(bx,by,sc(5),0,Math.PI*2); ctx.fillStyle=bh; ctx.fill();

    /* gold comet sweep */
    var gAng=t*0.22+Math.PI*0.65;
    for(var i=0;i<60;i++){
      var f=i/60,a=gAng-1.9*f+1.9;
      ctx.beginPath(); ctx.arc(Math.cos(a)*R2,Math.sin(a)*R2,0.5+f*2.4,0,Math.PI*2);
      ctx.fillStyle='rgba(255,178,30,'+(f*0.82)+')'; ctx.fill();
    }
    var gx=Math.cos(gAng)*R2, gy=Math.sin(gAng)*R2;
    var gh=ctx.createRadialGradient(gx,gy,0,gx,gy,sc(5));
    gh.addColorStop(0,'rgba(255,245,185,0.95)'); gh.addColorStop(0.5,'rgba(255,170,30,0.55)'); gh.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(gx,gy,sc(5),0,Math.PI*2); ctx.fillStyle=gh; ctx.fill();

    /* ring traces */
    ctx.beginPath(); ctx.arc(0,0,R1,0,Math.PI*2);
    ctx.strokeStyle='rgba(0,185,225,0.11)'; ctx.lineWidth=0.8; ctx.stroke();
    ctx.beginPath(); ctx.arc(0,0,R2,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,165,25,0.09)'; ctx.lineWidth=0.8; ctx.stroke();

    ctx.restore();
    ctx.globalCompositeOperation='source-over';
  }

  /* ════════════════════════════════════════════════
     SUN — LYLA with trident corona
  ════════════════════════════════════════════════ */
  function drawSun(now){
    var R=sc(28);
    var t=now*0.001;
    var isT=STATE.mode==='thinking'||STATE.mode==='converging';
    var thinkGlow=isT?(1+Math.sin(t*9)*0.35):1;

    /* deep corona */
    ctx.globalCompositeOperation='lighter';
    var corona=ctx.createRadialGradient(CX,CY,R*0.3,CX,CY,R*9);
    corona.addColorStop(0,'rgba(255,165,55,'+(0.22*thinkGlow)+')');
    corona.addColorStop(0.3,'rgba(255,80,15,'+(0.08*thinkGlow)+')');
    corona.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CX,CY,R*9,0,Math.PI*2); ctx.fillStyle=corona; ctx.fill();

    /* rays */
    ctx.save(); ctx.translate(CX,CY); ctx.rotate(t*0.0008);
    for(var i=0;i<24;i++){
      var a=(i/24)*Math.PI*2;
      var rLen=R*(2.8+0.5*Math.sin(i*2.3+t*0.55))*thinkGlow;
      var grd=ctx.createLinearGradient(Math.cos(a)*R*0.25,Math.sin(a)*R*0.25,Math.cos(a)*rLen,Math.sin(a)*rLen);
      grd.addColorStop(0,'rgba(255,220,100,'+(0.25*thinkGlow)+')');
      grd.addColorStop(0.4,'rgba(255,130,35,0.07)');
      grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.strokeStyle=grd; ctx.lineWidth=1.8;
      ctx.beginPath(); ctx.moveTo(Math.cos(a)*R*0.25,Math.sin(a)*R*0.25); ctx.lineTo(Math.cos(a)*rLen,Math.sin(a)*rLen); ctx.stroke();
    }
    ctx.restore();
    ctx.globalCompositeOperation='source-over';

    /* halo */
    ctx.globalCompositeOperation='lighter';
    var halo=ctx.createRadialGradient(CX,CY,R*0.5,CX,CY,R*3.2);
    halo.addColorStop(0,'rgba(255,255,240,0.95)');
    halo.addColorStop(0.22,'rgba(255,220,120,0.78)');
    halo.addColorStop(0.55,'rgba(255,140,40,0.32)');
    halo.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CX,CY,R*3.2,0,Math.PI*2); ctx.fillStyle=halo; ctx.fill();
    ctx.globalCompositeOperation='source-over';

    /* logo or sun sphere */
    if(_logoImg.complete && _logoImg.naturalWidth>0){
      var logoR=R*1.6;
      ctx.save();
      ctx.beginPath(); ctx.arc(CX,CY,logoR,0,Math.PI*2); ctx.clip();
      ctx.globalAlpha=0.94;
      ctx.drawImage(_logoImg,CX-logoR,CY-logoR,logoR*2,logoR*2);
      ctx.restore(); ctx.globalAlpha=1;
    } else {
      var tex=getPlanetTexture('sun',Math.ceil(R));
      ctx.save();
      ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2); ctx.clip();
      ctx.drawImage(tex,CX-R,CY-R,R*2,R*2);
      ctx.restore();
    }

    /* LYLA label */
    ctx.globalCompositeOperation='screen';
    ctx.shadowColor='#ffdd88'; ctx.shadowBlur=22;
    ctx.fillStyle='#ffdd88';
    ctx.font='600 '+Math.max(10,Math.round(sc(10.5)))+'px "DM Mono",monospace';
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText('LYLA ◈',CX,CY-R*1.75-5);
    ctx.shadowBlur=0; ctx.textBaseline='alphabetic';
    ctx.globalCompositeOperation='source-over';
  }

  /* ════════════════════════════════════════════════
     MAIN LOOP
  ════════════════════════════════════════════════ */
  function loop(now){
    if(!lastTime) lastTime=now;
    var dt=Math.min((now-lastTime)/1000,0.05);
    lastTime=now;

    if(CAM.auto){
      CAM.yaw+=0.00007;
      CAM.pitch=0.24+Math.sin(now*0.000085)*0.07;
    }

    if(STATE.mode==='thinking'){
      STATE.convergeProgress=Math.min(1,STATE.convergeProgress+dt*0.9);
    } else if(STATE.mode==='answering'){
      STATE.convergeProgress=Math.max(0,STATE.convergeProgress-dt*1.4);
      if(STATE.convergeProgress<=0) STATE.mode='idle';
    } else if(STATE.mode==='idle'){
      STATE.convergeProgress=Math.max(0,STATE.convergeProgress-dt*0.5);
    }

    var tilt=STATE.baseTilt+STATE.convergeProgress*(0.88-STATE.baseTilt);

    drawBg(now);
    drawStars(now);
    drawShootingStars(now,dt);
    drawOrbitRings(tilt);
    drawOrbitalRings(now,tilt);
    drawPlanets(dt,now,tilt);
    drawSun(now);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ════════════════════════════════════════════════
     PUBLIC API
  ════════════════════════════════════════════════ */
  window.LYLA_thinking=function(){ STATE.mode='thinking'; STATE.convergeProgress=0; };
  window.LYLA_answered=function(){ STATE.mode='answering'; };
  window.KD_pulse=function(route){ STATE.mode='answering'; };

})();
