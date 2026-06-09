/* ============================================================
   KING DIADEM — galaxy_scene.js v12
   ★ Deep dark space — original vision
   ★ Dual orbital rings: teal/blue + gold/orange
   ★ Nebula: violet + warm rust
   ★ Crown/trident symbol at center — LYLA ◈
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

  /* ── init ── */
  W = cv.width  = window.innerWidth;
  H = cv.height = window.innerHeight;
  CX = W * 0.50; CY = H * 0.50;

  /* ── DRAG / ZOOM ── */
  var CAM = { yaw: 0, pitch: 0.18, fov: 420, auto: true };
  var drag = { on: false, x: 0, y: 0 };
  function dn(x,y){ drag.on=true; drag.x=x; drag.y=y; CAM.auto=false; }
  function mv(x,y){ if(!drag.on)return; CAM.yaw-=(x-drag.x)*.003; CAM.pitch+=(y-drag.y)*.002; CAM.pitch=Math.max(-.5,Math.min(.7,CAM.pitch)); drag.x=x; drag.y=y; }
  function up(){ drag.on=false; }
  cv.addEventListener('mousedown',  function(e){ dn(e.clientX,e.clientY); });
  cv.addEventListener('mousemove',  function(e){ mv(e.clientX,e.clientY); });
  cv.addEventListener('mouseup',    up); cv.addEventListener('mouseleave', up);
  cv.addEventListener('touchstart', function(e){ if(e.touches.length===1) dn(e.touches[0].clientX,e.touches[0].clientY); e.preventDefault(); },{passive:false});
  cv.addEventListener('touchmove',  function(e){ if(e.touches.length===1) mv(e.touches[0].clientX,e.touches[0].clientY); e.preventDefault(); },{passive:false});
  cv.addEventListener('touchend',   up);
  cv.addEventListener('wheel', function(e){ CAM.fov=Math.max(180,Math.min(750,CAM.fov+e.deltaY*.3)); e.preventDefault(); },{passive:false});

  /* ════════════════════════════════════════════════
     BACKGROUND — deep void
  ════════════════════════════════════════════════ */
  function drawBg() {
    ctx.clearRect(0, 0, W, H);

    /* base void — near black */
    ctx.globalCompositeOperation = 'source-over';
    var base = ctx.createRadialGradient(CX, CY*0.7, 0, CX, CY, Math.max(W,H)*0.85);
    base.addColorStop(0,   'rgba(8,4,22,0.92)');
    base.addColorStop(0.5, 'rgba(3,2,12,0.96)');
    base.addColorStop(1,   'rgba(0,0,4,1)');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    var now = (performance.now()-t0)*.001;

    /* nebula layer — additive screen blend */
    ctx.globalCompositeOperation = 'screen';

    /* violet nebula — left/top */
    var nv1 = ctx.createRadialGradient(
      W*.15 + Math.sin(now*.008)*W*.04, H*.25 + Math.cos(now*.006)*H*.03, 0,
      W*.15, H*.25, Math.max(W,H)*.55
    );
    nv1.addColorStop(0,   'rgba(80,30,160,0.22)');
    nv1.addColorStop(0.4, 'rgba(50,15,100,0.12)');
    nv1.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = nv1; ctx.fillRect(0,0,W,H);

    /* violet nebula — right */
    var nv2 = ctx.createRadialGradient(
      W*.82 + Math.cos(now*.007)*W*.03, H*.35 + Math.sin(now*.009)*H*.025, 0,
      W*.82, H*.35, Math.max(W,H)*.48
    );
    nv2.addColorStop(0,   'rgba(100,20,180,0.18)');
    nv2.addColorStop(0.35,'rgba(60,10,120,0.10)');
    nv2.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = nv2; ctx.fillRect(0,0,W,H);

    /* warm rust/orange nebula — bottom right */
    var nr1 = ctx.createRadialGradient(
      W*.80 + Math.sin(now*.011)*W*.025, H*.70 + Math.cos(now*.008)*H*.02, 0,
      W*.80, H*.70, Math.max(W,H)*.42
    );
    nr1.addColorStop(0,   'rgba(160,55,10,0.20)');
    nr1.addColorStop(0.4, 'rgba(100,30,5,0.10)');
    nr1.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = nr1; ctx.fillRect(0,0,W,H);

    /* warm amber — center glow (sun halo bleeds here) */
    var nc = ctx.createRadialGradient(CX, CY, 0, CX, CY, Math.max(W,H)*.35);
    nc.addColorStop(0,   'rgba(200,100,20,0.10)');
    nc.addColorStop(0.5, 'rgba(120,50,8,0.05)');
    nc.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = nc; ctx.fillRect(0,0,W,H);

    /* teal accent — upper center (LYLA trace) */
    var nt = ctx.createRadialGradient(CX+W*.08, CY*.45, 0, CX+W*.08, CY*.45, Math.max(W,H)*.3);
    nt.addColorStop(0,   'rgba(0,200,200,0.08)');
    nt.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = nt; ctx.fillRect(0,0,W,H);

    ctx.globalCompositeOperation = 'source-over';
  }

  /* ════════════════════════════════════════════════
     MILKY WAY
  ════════════════════════════════════════════════ */
  var MW = [];
  [{angle:0,n:500},{angle:Math.PI*.5,n:440},{angle:Math.PI,n:400},{angle:Math.PI*1.5,n:360}].forEach(function(arm){
    for(var i=0;i<arm.n;i++){
      var r=400+Math.random()*1800, th=arm.angle+r/360+(Math.random()-.5)*1.1, sp=45+r*.05;
      MW.push({x:Math.cos(th)*r+(Math.random()-.5)*sp, y:(Math.random()-.5)*sp*.1, z:Math.sin(th)*r+(Math.random()-.5)*sp*.35, s:.18+Math.random()*.65, a:.06+Math.random()*.30});
    }
  });
  for(var i=0;i<700;i++){
    var r=2000+Math.random()*4000, th=Math.random()*Math.PI*2, ph=(Math.random()-.5)*Math.PI;
    MW.push({x:r*Math.cos(th)*Math.cos(ph), y:r*Math.sin(ph)*.08, z:r*Math.sin(th)*Math.cos(ph), s:.10+Math.random()*.35, a:.02+Math.random()*.12});
  }
  var MW_N = MW.length;

  function drawMW(){
    var cyaw=Math.cos(CAM.yaw), syaw=Math.sin(CAM.yaw), cp=Math.cos(CAM.pitch), sp=Math.sin(CAM.pitch);
    for(var i=0;i<MW_N;i++){
      var s=MW[i];
      var rx=s.x*cyaw-s.z*syaw, rz=s.x*syaw+s.z*cyaw;
      var ry=s.y*cp-rz*sp, rz2=s.y*sp+rz*cp;
      var d=rz2+CAM.fov*1.3; if(d<40) continue;
      var sc2=Math.max(.08,s.s*Math.min(1,420/d));
      var al=s.a*Math.min(1,280/d); if(al<.01) continue;
      var px=CX+rx*(CAM.fov/d), py=CY-ry*(CAM.fov/d);
      ctx.beginPath(); ctx.arc(px,py,sc2,0,Math.PI*2);
      /* warm tint for MW in dark bg */
      ctx.fillStyle='rgba(160,170,220,'+al+')'; ctx.fill();
    }
  }

  /* ── foreground stars ── */
  var NEAR = [];
  for(var i=0;i<700;i++){
    var bright = Math.random()>.90;
    var t2 = Math.random();
    /* dark bg → more blue-white and warm gold stars visible */
    var r2 = t2>.90?255: t2>.70?255: t2>.45?200: 180;
    var g2 = t2>.90?140: t2>.70?210: t2>.45?200: 210;
    var b2 = t2>.90?80:  t2>.70?140: t2>.45?255: 255;
    NEAR.push({
      x:Math.random(), y:Math.random(),
      s: bright?.9+Math.random()*.8 : .12+Math.random()*.42,
      a: bright?.55+Math.random()*.35 : .08+Math.random()*.25,
      r:r2, g:g2, b:b2,
      bloom: bright&&Math.random()>.30,
      twinkle: Math.random()*Math.PI*2,
      twinkleSpeed: .012+Math.random()*.022,
      twinkleAmp: bright?.18+Math.random()*.22 : .04+Math.random()*.08,
      vx:(Math.random()-.5)*.0000035, vy:(Math.random()-.5)*.0000022,
    });
  }
  function drawNear(){
    var now=(performance.now()-t0)*.001;
    for(var i=0;i<NEAR.length;i++){
      var s=NEAR[i];
      s.x=((s.x+s.vx+1)%1); s.y=((s.y+s.vy+1)%1);
      var tw=s.a*(1+Math.sin(now*s.twinkleSpeed*60+s.twinkle)*s.twinkleAmp);
      var px=s.x*W, py=s.y*H;
      ctx.beginPath(); ctx.arc(px,py,s.s,0,Math.PI*2);
      ctx.fillStyle='rgba('+s.r+','+s.g+','+s.b+','+Math.min(1,tw)+')'; ctx.fill();
      if(s.bloom){
        var bl=s.s*3.2;
        ctx.strokeStyle='rgba('+s.r+','+s.g+','+s.b+','+(tw*.12)+')';
        ctx.lineWidth=.4; ctx.beginPath();
        ctx.moveTo(px-bl,py); ctx.lineTo(px+bl,py);
        ctx.moveTo(px,py-bl); ctx.lineTo(px,py+bl); ctx.stroke();
        ctx.strokeStyle='rgba('+s.r+','+s.g+','+s.b+','+(tw*.05)+')';
        ctx.lineWidth=.2; ctx.beginPath();
        ctx.moveTo(px-bl*.7,py-bl*.7); ctx.lineTo(px+bl*.7,py+bl*.7);
        ctx.moveTo(px+bl*.7,py-bl*.7); ctx.lineTo(px-bl*.7,py+bl*.7); ctx.stroke();
      }
    }
  }

  /* ════════════════════════════════════════════════
     PLANETS
  ════════════════════════════════════════════════ */
  var PLANETS = [];
  var TILT = 0.24;

  function rebuildPlanets(){
    var prev = PLANETS;
    var bodies = [
      {color:'#7788aa', sz:sc(3.2), orb:sc(55),  spd:.0046, ring:false, moon:false},
      {color:'#c4955a', sz:sc(6),   orb:sc(88),  spd:.0034, ring:false, moon:false},
      {color:'#1e44aa', sz:sc(7),   orb:sc(128), spd:.0024, ring:false, moon:true },
      {color:'#882211', sz:sc(5.2), orb:sc(172), spd:.0020, ring:false, moon:false},
      {color:'#aa7722', sz:sc(14),  orb:sc(244), spd:.0011, ring:false, moon:false},
      {color:'#bbaa66', sz:sc(11),  orb:sc(318), spd:.0008, ring:true,  moon:false},
      {color:'#336688', sz:sc(8.5), orb:sc(385), spd:.0006, ring:false, moon:false},
      {color:'#112288', sz:sc(7.5), orb:sc(448), spd:.0004, ring:false, moon:false},
    ];
    var kdNodes = [
      {color:'#00ffdd', sz:sc(8.5), orb:sc(105), spd:.0018, ring:false, moon:false,
       kd:'WATERLINE', kdColor:'#00ffdd', kdGlow:'rgba(0,255,221,0.65)'},
      {color:'#ffdd88', sz:sc(8),   orb:sc(208), spd:.0015, ring:false, moon:false,
       kd:'VEGA ◆',   kdColor:'#ffdd88', kdGlow:'rgba(255,221,136,0.60)'},
      {color:'#ff5555', sz:sc(6.5), orb:sc(148), spd:.0030, ring:false, moon:false,
       kd:'HALT',     kdColor:'#ff7777', kdGlow:'rgba(255,80,80,0.55)'},
      {color:'#bb88ff', sz:sc(7),   orb:sc(348), spd:.0006, ring:false, moon:false,
       kd:'CIVIL',    kdColor:'#cc99ff', kdGlow:'rgba(180,136,255,0.55)'},
      {color:'#ffaa44', sz:sc(6),   orb:sc(278), spd:.0009, ring:false, moon:false,
       kd:'FATE',     kdColor:'#ffcc77', kdGlow:'rgba(255,170,68,0.50)'},
    ];
    PLANETS = bodies.concat(kdNodes);
    var defaults=[0,1.2,2.5,4.0,1.8,3.2,5.5,2.8,0.5,3.5,1.0,4.5,2.1];
    PLANETS.forEach(function(p,i){
      p.ang=(prev[i]&&prev[i].ang!=null)?prev[i].ang:(defaults[i]||Math.random()*Math.PI*2);
    });
  }
  rebuildPlanets();

  function drawOrbitRings(){
    PLANETS.forEach(function(p){
      ctx.beginPath();
      ctx.ellipse(CX,CY,p.orb,p.orb*TILT,0,0,Math.PI*2);
      ctx.strokeStyle=p.kd?'rgba('+hexRgb(p.kdColor||'#ffffff')+',0.14)':'rgba(120,140,200,0.06)';
      ctx.lineWidth=p.kd?1:.6; ctx.stroke();
    });
  }

  function hexRgb(hex){
    return parseInt(hex.slice(1,3),16)+','+parseInt(hex.slice(3,5),16)+','+parseInt(hex.slice(5,7),16);
  }

  function drawPlanet(x,y,p){
    var sz=p.sz;
    var rgb=[parseInt(p.color.slice(1,3),16),parseInt(p.color.slice(3,5),16),parseInt(p.color.slice(5,7),16)];
    var R=rgb[0],G=rgb[1],B=rgb[2];

    if(p.kd&&p.kdGlow){
      ctx.globalCompositeOperation='screen';
      var halo=ctx.createRadialGradient(x,y,sz*.4,x,y,sz*5);
      halo.addColorStop(0,p.kdGlow);
      halo.addColorStop(.35,p.kdGlow.replace(/[\d.]+\)$/,'0.20)'));
      halo.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath();ctx.arc(x,y,sz*5,0,Math.PI*2);ctx.fillStyle=halo;ctx.fill();
      ctx.globalCompositeOperation='source-over';
    }

    var atm=ctx.createRadialGradient(x,y,sz*.75,x,y,sz*1.65);
    atm.addColorStop(0,'rgba('+R+','+G+','+B+',0)');
    atm.addColorStop(.5,'rgba('+R+','+G+','+B+',0.14)');
    atm.addColorStop(1,'rgba('+R+','+G+','+B+',0.32)');
    ctx.beginPath();ctx.arc(x,y,sz*1.65,0,Math.PI*2);ctx.fillStyle=atm;ctx.fill();

    ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);
    ctx.fillStyle='rgb('+Math.round(R*.08)+','+Math.round(G*.08)+','+Math.round(B*.08)+')';ctx.fill();

    var dx=CX-x,dy=CY-y,dd=Math.hypot(dx,dy)||1,lx=dx/dd,ly=dy/dd;
    var lit=ctx.createRadialGradient(x+lx*sz*.5,y+ly*sz*.5,0,x,y,sz*1.05);
    lit.addColorStop(0,'rgba(255,255,255,0.90)');
    lit.addColorStop(.12,'rgba('+Math.min(255,R+100)+','+Math.min(255,G+100)+','+Math.min(255,B+100)+',0.95)');
    lit.addColorStop(.40,'rgba('+R+','+G+','+B+',0.88)');
    lit.addColorStop(.70,'rgba('+Math.round(R*.45)+','+Math.round(G*.45)+','+Math.round(B*.45)+',0.60)');
    lit.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);ctx.fillStyle=lit;ctx.fill();

    var shd=ctx.createRadialGradient(x-lx*sz*.35,y-ly*sz*.35,sz*.1,x-lx*sz*.35,y-ly*sz*.35,sz*1.1);
    shd.addColorStop(0,'rgba(0,0,8,0)');shd.addColorStop(.5,'rgba(0,0,8,0.38)');shd.addColorStop(1,'rgba(0,0,8,0.85)');
    ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);ctx.fillStyle=shd;ctx.fill();

    var spec=ctx.createRadialGradient(x+lx*sz*.38,y+ly*sz*.38,0,x+lx*sz*.38,y+ly*sz*.38,sz*.28);
    spec.addColorStop(0,'rgba(255,255,255,0.65)');spec.addColorStop(.5,'rgba(255,255,255,0.06)');spec.addColorStop(1,'rgba(255,255,255,0)');
    ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);ctx.fillStyle=spec;ctx.fill();
  }

  function drawPlanets(){
    var rendered=PLANETS.map(function(p){
      p.ang+=p.spd;
      return{p:p,x:CX+Math.cos(p.ang)*p.orb,y:CY+Math.sin(p.ang)*p.orb*TILT};
    }).sort(function(a,b){return a.y-b.y;});

    rendered.forEach(function(item){
      var p=item.p,x=item.x,y=item.y;
      drawPlanet(x,y,p);
      if(p.ring){
        ctx.save();ctx.translate(x,y);ctx.scale(1,TILT*.72);
        var rg=ctx.createRadialGradient(0,0,p.sz*1.8,0,0,p.sz*3.3);
        rg.addColorStop(0,'rgba(220,195,120,0)');rg.addColorStop(.18,'rgba(220,195,120,0.52)');rg.addColorStop(.65,'rgba(200,165,90,0.30)');rg.addColorStop(1,'rgba(180,145,70,0)');
        ctx.beginPath();ctx.arc(0,0,p.sz*3.3,0,Math.PI*2);ctx.fillStyle=rg;ctx.fill();
        ctx.restore();
      }
      if(p.moon){
        var ma=p.ang*8,mx=x+Math.cos(ma)*sc(16),my=y+Math.sin(ma)*sc(4.2);
        var msz=sc(1.8),mdx=CX-mx,mdy=CY-my,mdd=Math.hypot(mdx,mdy)||1;
        var mlx=mdx/mdd,mly=mdy/mdd;
        var mg=ctx.createRadialGradient(mx+mlx*msz*.4,my+mly*msz*.4,0,mx,my,msz);
        mg.addColorStop(0,'rgba(240,245,255,0.95)');mg.addColorStop(.5,'rgba(150,158,175,0.75)');mg.addColorStop(1,'rgba(15,18,28,0.20)');
        ctx.beginPath();ctx.arc(mx,my,msz,0,Math.PI*2);ctx.fillStyle=mg;ctx.fill();
      }
      if(p.kd){
        var fontSize=Math.max(9,Math.round(p.sz*.75));
        ctx.shadowColor=p.kdColor||'#ffffff';ctx.shadowBlur=12;
        ctx.fillStyle=p.kdColor||'#ffffff';
        ctx.font='600 '+fontSize+'px "DM Mono",monospace';
        ctx.textAlign='center';ctx.textBaseline='bottom';
        ctx.fillText(p.kd,x,y-p.sz-7);
        ctx.shadowBlur=0;ctx.textBaseline='alphabetic';
      }
    });
  }

  /* ════════════════════════════════════════════════
     ORBITAL LIGHT RINGS — ★ key feature
     Blue ring + Gold ring orbiting center
  ════════════════════════════════════════════════ */
  function drawOrbitalRings(){
    var now=(performance.now()-t0)*.001;
    var R1=sc(155), R2=sc(165); /* ring radii */
    var tilt=0.38; /* ellipse tilt */

    /* ── BLUE ring — teal ── */
    var blueAng=now*.22; /* rotation angle */
    var bx=CX+Math.cos(blueAng)*R1;
    var by=CY+Math.sin(blueAng)*R1*tilt;

    ctx.globalCompositeOperation='screen';

    /* blue orbital streak */
    var blueAlpha=0.75+Math.sin(now*.8)*.15;
    ctx.save();
    ctx.translate(CX,CY);ctx.scale(1,tilt);
    var blueGrad=ctx.createConicalGradient?null:null;

    /* draw as arc segment — sweeping light trail */
    var arcStart=blueAng-1.8, arcEnd=blueAng;
    for(var i=0;i<60;i++){
      var t3=i/60;
      var a=arcStart+t3*(arcEnd-arcStart);
      var nx2=Math.cos(a)*R1, ny2=Math.sin(a)*R1;
      var alpha=t3*blueAlpha*0.9;
      var width=1.2+t3*2.5;
      ctx.beginPath();ctx.arc(nx2,ny2,width*.5,0,Math.PI*2);
      ctx.fillStyle='rgba(0,210,255,'+alpha+')';ctx.fill();
    }
    /* bright head */
    ctx.beginPath();ctx.arc(Math.cos(blueAng)*R1,Math.sin(blueAng)*R1,sc(3.5),0,Math.PI*2);
    var headB=ctx.createRadialGradient(Math.cos(blueAng)*R1,Math.sin(blueAng)*R1,0,Math.cos(blueAng)*R1,Math.sin(blueAng)*R1,sc(3.5));
    headB.addColorStop(0,'rgba(180,240,255,0.95)');headB.addColorStop(.5,'rgba(0,180,255,0.5)');headB.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=headB;ctx.fill();
    ctx.restore();

    /* ── GOLD ring — offset phase ── */
    var goldAng=now*.22+Math.PI*.65;
    ctx.save();
    ctx.translate(CX,CY);ctx.scale(1,tilt);
    var arcStartG=goldAng-1.8, arcEndG=goldAng;
    for(var i=0;i<60;i++){
      var t3=i/60;
      var a=arcStartG+t3*(arcEndG-arcStartG);
      var nx2=Math.cos(a)*R2, ny2=Math.sin(a)*R2;
      var alpha=t3*0.85;
      var width=1.2+t3*2.5;
      ctx.beginPath();ctx.arc(nx2,ny2,width*.5,0,Math.PI*2);
      ctx.fillStyle='rgba(255,175,30,'+alpha+')';ctx.fill();
    }
    /* bright head gold */
    ctx.beginPath();ctx.arc(Math.cos(goldAng)*R2,Math.sin(goldAng)*R2,sc(3.5),0,Math.PI*2);
    var headG=ctx.createRadialGradient(Math.cos(goldAng)*R2,Math.sin(goldAng)*R2,0,Math.cos(goldAng)*R2,Math.sin(goldAng)*R2,sc(3.5));
    headG.addColorStop(0,'rgba(255,240,180,0.95)');headG.addColorStop(.5,'rgba(255,165,30,0.5)');headG.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=headG;ctx.fill();
    ctx.restore();

    /* full ring outlines — faint */
    ctx.save();ctx.translate(CX,CY);ctx.scale(1,tilt);
    ctx.beginPath();ctx.arc(0,0,R1,0,Math.PI*2);
    ctx.strokeStyle='rgba(0,180,220,0.12)';ctx.lineWidth=1;ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,R2,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,160,20,0.10)';ctx.lineWidth=1;ctx.stroke();
    ctx.restore();

    ctx.globalCompositeOperation='source-over';
  }

  /* ════════════════════════════════════════════════
     SUN — LYLA ◈ crown symbol
  ════════════════════════════════════════════════ */
  function drawSun(){
    var R=sc(28);
    var now=(performance.now()-t0)*.001;

    /* outer corona — additive */
    ctx.globalCompositeOperation='lighter';
    var corona=ctx.createRadialGradient(CX,CY,R*.4,CX,CY,R*8);
    corona.addColorStop(0,'rgba(255,170,60,0.20)');
    corona.addColorStop(.22,'rgba(255,90,20,0.08)');
    corona.addColorStop(.5,'rgba(180,50,5,0.03)');
    corona.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(CX,CY,R*8,0,Math.PI*2);ctx.fillStyle=corona;ctx.fill();

    /* rays */
    ctx.save();ctx.translate(CX,CY);ctx.rotate(now*.0007);
    for(var i=0;i<20;i++){
      var a=(i/20)*Math.PI*2;
      var rLen=R*(3.0+.4*Math.sin(i*2.5+now*.5));
      var grd=ctx.createLinearGradient(Math.cos(a)*R*.2,Math.sin(a)*R*.2,Math.cos(a)*rLen,Math.sin(a)*rLen);
      grd.addColorStop(0,'rgba(255,220,100,0.22)');grd.addColorStop(.4,'rgba(255,130,35,0.06)');grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.strokeStyle=grd;ctx.lineWidth=1.6;
      ctx.beginPath();ctx.moveTo(Math.cos(a)*R*.2,Math.sin(a)*R*.2);ctx.lineTo(Math.cos(a)*rLen,Math.sin(a)*rLen);ctx.stroke();
    }
    ctx.restore();
    ctx.globalCompositeOperation='source-over';

    /* halo */
    ctx.globalCompositeOperation='lighter';
    var halo=ctx.createRadialGradient(CX,CY,R*.5,CX,CY,R*3);
    halo.addColorStop(0,'rgba(255,255,240,0.95)');halo.addColorStop(.07,'rgba(255,220,110,0.78)');halo.addColorStop(.25,'rgba(255,130,40,0.42)');halo.addColorStop(.52,'rgba(160,38,5,0.14)');halo.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(CX,CY,R*3,0,Math.PI*2);ctx.fillStyle=halo;ctx.fill();
    ctx.globalCompositeOperation='source-over';

    /* solar disk */
    var disk=ctx.createRadialGradient(CX-R*.18,CY-R*.18,0,CX,CY,R);
    disk.addColorStop(0,'#fffef8');disk.addColorStop(.10,'#fff4a0');disk.addColorStop(.32,'#ffcc55');disk.addColorStop(.58,'#ff7c18');disk.addColorStop(.80,'#c02500');disk.addColorStop(1,'#1a0200');
    ctx.beginPath();ctx.arc(CX,CY,R,0,Math.PI*2);ctx.fillStyle=disk;ctx.fill();

    /* ★ CROWN / trident symbol — drawn with canvas paths */
    drawCrownSymbol(CX, CY, R);

    /* LYLA ◈ text */
    var fs=Math.max(8,Math.floor(R*.27));
    ctx.shadowColor='rgba(255,220,100,0.95)';ctx.shadowBlur=14;
    ctx.fillStyle='rgba(255,252,230,0.90)';
    ctx.font='600 '+fs+'px "DM Mono",monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('LYLA ◈',CX,CY+R*1.45);
    ctx.shadowBlur=0;ctx.textBaseline='alphabetic';
  }

  function drawCrownSymbol(cx,cy,R){
    /* simple trident/crown shape drawn above sun */
    var s=R*.55; /* scale */
    var baseY=cy-R*.15;

    ctx.save();
    ctx.globalCompositeOperation='screen';
    ctx.shadowColor='rgba(200,230,255,0.8)';ctx.shadowBlur=18;

    /* gradient fill: silver-blue to gold */
    var symGrad=ctx.createLinearGradient(cx,baseY-s*1.6,cx,baseY+s*.5);
    symGrad.addColorStop(0,'rgba(220,240,255,0.90)');
    symGrad.addColorStop(.4,'rgba(180,210,255,0.80)');
    symGrad.addColorStop(.7,'rgba(255,200,80,0.75)');
    symGrad.addColorStop(1,'rgba(255,160,40,0.60)');

    ctx.strokeStyle=symGrad;ctx.lineWidth=Math.max(1.5,s*.12);
    ctx.lineCap='round';ctx.lineJoin='round';

    /* center spike */
    ctx.beginPath();ctx.moveTo(cx,baseY+s*.4);ctx.lineTo(cx,baseY-s*1.5);ctx.stroke();

    /* left spike */
    ctx.beginPath();ctx.moveTo(cx,baseY+s*.2);
    ctx.lineTo(cx-s*.55,baseY-s*.4);
    ctx.lineTo(cx-s*.55,baseY-s*.9);
    ctx.stroke();

    /* right spike */
    ctx.beginPath();ctx.moveTo(cx,baseY+s*.2);
    ctx.lineTo(cx+s*.55,baseY-s*.4);
    ctx.lineTo(cx+s*.55,baseY-s*.9);
    ctx.stroke();

    /* base horizontal bar */
    ctx.beginPath();ctx.moveTo(cx-s*.7,baseY+s*.4);ctx.lineTo(cx+s*.7,baseY+s*.4);ctx.stroke();

    /* small decorative arcs on side spikes */
    ctx.lineWidth=Math.max(1,s*.08);
    ctx.beginPath();ctx.arc(cx-s*.55,baseY-s*.9,s*.12,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.arc(cx+s*.55,baseY-s*.9,s*.12,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.arc(cx,baseY-s*1.5,s*.14,0,Math.PI*2);ctx.stroke();

    ctx.shadowBlur=0;ctx.restore();
    ctx.globalCompositeOperation='source-over';
  }

  /* ── PULSES ── */
  var pulses=[];
  var ROUTE_COL={general:[96,165,250],risk:[248,113,113],survival:[52,211,153],collapse:[251,146,60],civil:[167,139,250],vega:[255,220,140],crisis:[239,68,68]};
  window.KD_pulse=function(route){
    var col=ROUTE_COL[route]||[96,165,250];
    for(var i=0;i<5;i++){
      (function(ii,c){setTimeout(function(){pulses.push({r:0,maxR:Math.min(W,H)*(.06+ii*.13),alpha:.65-ii*.10,col:c});},ii*70);})(i,col);
    }
  };
  window.addEventListener('KD:response',function(e){
    if(e.detail){window.KD.state=e.detail;window.KD_pulse((e.detail.output&&e.detail.output.action)||'general');}
  });
  function drawPulses(){
    pulses=pulses.filter(function(p){return p.alpha>.004;});
    pulses.forEach(function(p){
      p.r+=(p.maxR-p.r)*.020;p.alpha*=.942;
      ctx.strokeStyle='rgba('+p.col[0]+','+p.col[1]+','+p.col[2]+','+p.alpha*.5+')';
      ctx.lineWidth=1.4*p.alpha;
      ctx.beginPath();ctx.arc(CX,CY,p.r,0,Math.PI*2);ctx.stroke();
    });
  }

  /* ── RENDER LOOP ── */
  function frame(){
    if(CAM.auto) CAM.yaw+=.00008;
    drawBg();
    drawNear();
    drawMW();
    drawOrbitRings();    /* ★ orbital rings before planets */
    drawOrbitRings_bg(); /* faint orbit ellipses */
    drawPulses();
    drawPlanets();
    drawSun();
    requestAnimationFrame(frame);
  }

  function drawOrbitRings_bg(){
    PLANETS.forEach(function(p){
      ctx.beginPath();
      ctx.ellipse(CX,CY,p.orb,p.orb*TILT,0,0,Math.PI*2);
      ctx.strokeStyle=p.kd?'rgba('+hexRgb(p.kdColor||'#ffffff')+',0.10)':'rgba(140,160,220,0.05)';
      ctx.lineWidth=p.kd?0.8:0.5;ctx.stroke();
    });
  }

  requestAnimationFrame(frame);
})();
