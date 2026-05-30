/* ============================================================
   galaxy_scene.js — KING DIADEM v7 FINAL
   3D cosmos · LYLA sun · decision nodes orbit · MW arms
   Connects: window.KD.state → visual response
   ============================================================ */
(function () {
  var cv = document.getElementById('galaxy');
  if (!cv) return;

  /* ── KD state bridge ─────────────────────────────────────── */
  if (!window.KD) window.KD = {};
  if (!window.KD.state) window.KD.state = {};

  /* resizeCanvas helper used by ai_brain.js / ai_orbit.js */
  window.KD.resizeCanvas = function(c) {
    c.width  = window.innerWidth;
    c.height = window.innerHeight;
    return c.getContext('2d');
  };

  var ctx = cv.getContext('2d', { alpha: false });
  var W, H, CX, CY;
  var t0 = performance.now();

  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    CX = W * 0.50; CY = H * 0.44;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── CAMERA ──────────────────────────────────────────────── */
  var CAM = { yaw:0, pitch:0.18, fov:460, auto:true };
  var drag = { on:false, x:0, y:0 };

  function dn(x,y){ drag.on=true; drag.x=x; drag.y=y; CAM.auto=false; }
  function mv(x,y){
    if(!drag.on)return;
    CAM.yaw   -= (x-drag.x)*0.004;
    CAM.pitch += (y-drag.y)*0.003;
    CAM.pitch = Math.max(-0.55, Math.min(0.75, CAM.pitch));
    drag.x=x; drag.y=y;
  }
  function up(){ drag.on=false; }

  cv.addEventListener('mousedown',  function(e){ dn(e.clientX,e.clientY); });
  cv.addEventListener('mousemove',  function(e){ mv(e.clientX,e.clientY); });
  cv.addEventListener('mouseup',    up);
  cv.addEventListener('mouseleave', up);
  cv.addEventListener('touchstart', function(e){ dn(e.touches[0].clientX,e.touches[0].clientY); e.preventDefault(); },{passive:false});
  cv.addEventListener('touchmove',  function(e){ mv(e.touches[0].clientX,e.touches[0].clientY); e.preventDefault(); },{passive:false});
  cv.addEventListener('touchend',   up);
  cv.addEventListener('wheel', function(e){ CAM.fov=Math.max(200,Math.min(800,CAM.fov+e.deltaY*0.35)); e.preventDefault(); },{passive:false});

  /* ── PROJECTION ──────────────────────────────────────────── */
  function proj(x,y,z){
    var cy=Math.cos(CAM.yaw),sy=Math.sin(CAM.yaw);
    var rx=x*cy-z*sy, rz=x*sy+z*cy;
    var cp=Math.cos(CAM.pitch),sp=Math.sin(CAM.pitch);
    var ry=y*cp-rz*sp, rz2=y*sp+rz*cp;
    var d=rz2+CAM.fov*1.35;
    if(d<8)return null;
    var s=CAM.fov/d;
    return{x:CX+rx*s, y:CY-ry*s, z:d, s:s};
  }

  /* ── MILKY WAY ARMS ──────────────────────────────────────── */
  var ARMS=[
    {name:'DriftZero Arm', angle:0,              hue:210, n:1500},
    {name:'Waterline Arm', angle:Math.PI*0.5,    hue:185, n:1300},
    {name:'FATE Arm',      angle:Math.PI,         hue:255, n:1200},
    {name:'LYLA Arm',      angle:Math.PI*1.5,    hue:170, n:1100},
  ];
  var MW=[];
  ARMS.forEach(function(arm){
    for(var i=0;i<arm.n;i++){
      var r=500+Math.random()*2000;
      var th=arm.angle+r/380+(Math.random()-.5)*1.1;
      var sp=50+r*0.055;
      MW.push({
        x:Math.cos(th)*r+(Math.random()-.5)*sp,
        y:(Math.random()-.5)*sp*0.12,
        z:Math.sin(th)*r+(Math.random()-.5)*sp*0.4,
        s:0.28+Math.random()*1.0,
        a:0.10+Math.random()*0.50,
        hue:arm.hue+(Math.random()-.5)*28
      });
    }
  });
  for(var i=0;i<2200;i++){
    var r=2200+Math.random()*4800,th=Math.random()*Math.PI*2,ph=(Math.random()-.5)*Math.PI;
    MW.push({x:r*Math.cos(th)*Math.cos(ph),y:r*Math.sin(ph)*0.10,z:r*Math.sin(th)*Math.cos(ph),
             s:0.15+Math.random()*0.55,a:0.05+Math.random()*0.20,hue:210+Math.random()*50});
  }

  /* ── DECISION NODES (LYLA Kernels as planets) ───────────── */
  var NODES=[
    {label:'WATERLINE', key:'K5',  rgb:[45,212,191],  orbit:58,  r:5.5, spd:4.10, tilt:0.10, ph:0,   ring:false, desc:'ฐานขั้นต่ำ\nTreat · Trace · Stop'},
    {label:'STOP LINE', key:'K13', rgb:[255,65,65],   orbit:108, r:4.5, spd:1.60, tilt:0.08, ph:1.2, ring:false, desc:'หยุดทันที\nHarm → HALT'},
    {label:'STABILITY', key:'K11', rgb:[232,192,120], orbit:150, r:7.0, spd:1.00, tilt:0.42, ph:2.5, ring:true,  desc:'เสถียรก่อน optimize'},
    {label:'AUDIT',     key:'K10', rgb:[155,125,255], orbit:228, r:5.5, spd:0.53, tilt:0.45, ph:0.8, ring:false, desc:'หลักฐานก่อนเชื่อ'},
    {label:'COMPASSION',key:'K2',  rgb:[255,140,50],  orbit:320, r:6.5, spd:0.084,tilt:0.05, ph:3.2, ring:false, desc:'ลดอันตราย default'},
    {label:'ENTROPY',   key:'DHD', rgb:[140,185,255], orbit:420, r:5.8, spd:0.034,tilt:0.46, ph:1.9, ring:true,  desc:'0.1% drift รายวัน'},
    {label:'RESTORE',   key:'K6',  rgb:[60,245,160],  orbit:520, r:5.2, spd:0.012,tilt:1.72, ph:4.3, ring:false, desc:'ซ่อมก่อน normalize'},
  ];

  /* asteroid belt */
  var BELT=[];
  for(var i=0;i<450;i++){
    BELT.push({a:Math.random()*Math.PI*2, r:260+Math.random()*55,
               y:(Math.random()-.5)*6, sp:0.00018+Math.random()*0.00042, sz:0.5+Math.random()*2.0});
  }

  /* near-field fixed stars (2D overlay, no flicker) */
  var NEAR=[];
  for(var i=0;i<700;i++){
    var bright=Math.random()>0.95;
    NEAR.push({
      x:Math.random(),y:Math.random(),
      s:bright?0.9+Math.random()*1.0:0.18+Math.random()*0.50,
      a:bright?0.55+Math.random()*0.35:0.07+Math.random()*0.25,
      warm:Math.random()>0.55,
      bloom:bright&&Math.random()>0.45,
      vx:(Math.random()-.5)*0.000007,vy:(Math.random()-.5)*0.000004
    });
  }

  /* ── PULSES ──────────────────────────────────────────────── */
  var pulses=[];

  /* route → color map */
  var ROUTE_COL={
    general:[45,212,191], risk:[255,80,80], survival:[80,220,160],
    collapse:[255,130,60], civil:[155,125,255], vega:[232,192,120],
    crisis:[255,60,60]
  };

  window.KD_pulse = function(route){
    var col=ROUTE_COL[route]||[232,192,120];
    for(var i=0;i<5;i++){
      (function(ii,c){
        setTimeout(function(){
          pulses.push({r:0,maxR:Math.min(W,H)*(0.10+ii*0.13),alpha:0.65-ii*0.1,col:c});
        },ii*75);
      })(i,col);
    }
  };

  /* listen for KD:response from app.js */
  window.addEventListener('KD:response',function(e){
    if(e.detail){
      window.KD.state=e.detail;
      var route=(e.detail.output&&e.detail.output.action)||'general';
      window.KD_pulse(route);
    }
  });

  /* ── MOUSE HOVER ─────────────────────────────────────────── */
  var mx=-9999,my=-9999;
  cv.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;});
  cv.addEventListener('click',function(e){
    var ts=performance.now()-t0;
    for(var i=0;i<NODES.length;i++){
      var pos=npos(NODES[i],ts),pp=proj(pos.x,pos.y,pos.z);
      if(pp&&Math.hypot(e.clientX-pp.x,e.clientY-pp.y)<NODES[i].r*pp.s*4){
        window.KD_pulse('general');break;
      }
    }
  });

  /* ── HELPERS ─────────────────────────────────────────────── */
  function npos(n,ts){
    var a=n.ph+ts*n.spd*0.000075;
    return{x:Math.cos(a)*n.orbit,y:Math.sin(a)*n.orbit*Math.sin(n.tilt)*0.14,z:Math.sin(a)*n.orbit,a:a};
  }
  function oPt(n,ang){
    var pp=proj(Math.cos(ang)*n.orbit,Math.sin(ang)*n.orbit*Math.sin(n.tilt)*0.14,Math.sin(ang)*n.orbit);
    return pp;
  }

  /* ── DRAW ────────────────────────────────────────────────── */
  function drawBg(){
    var bg=ctx.createRadialGradient(CX,CY,0,CX,CY,Math.max(W,H)*0.9);
    bg.addColorStop(0,'rgba(8,7,22,1)');
    bg.addColorStop(0.6,'rgba(4,3,14,1)');
    bg.addColorStop(1,'rgba(1,1,6,1)');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  }

  function drawNebula(){
    ctx.globalCompositeOperation='screen';
    [{x:CX*.6,y:CY*1.2,r:Math.max(W,H)*.55,c:'rgba(18,65,95,0.16)'},
     {x:W*.82,y:H*.22,r:Math.max(W,H)*.42,c:'rgba(85,38,8,0.14)'},
     {x:W*.14,y:H*.75,r:Math.max(W,H)*.35,c:'rgba(48,18,88,0.12)'},
     {x:W*.50,y:H*.05,r:Math.max(W,H)*.50,c:'rgba(12,50,80,0.10)'}
    ].forEach(function(b){
      var gr=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
      gr.addColorStop(0,b.c);gr.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    });
    ctx.globalCompositeOperation='source-over';
  }

  function drawNear(){
    for(var i=0;i<NEAR.length;i++){
      var s=NEAR[i];
      s.x=((s.x+s.vx+1)%1);s.y=((s.y+s.vy+1)%1);
      var px=s.x*W,py=s.y*H;
      var r=s.warm?245:210,g=s.warm?235:225,b=s.warm?200:255;
      ctx.beginPath();ctx.arc(px,py,s.s,0,Math.PI*2);
      ctx.fillStyle='rgba('+r+','+g+','+b+','+s.a+')';ctx.fill();
      if(s.bloom){
        var bl=s.s*2.6;
        ctx.strokeStyle='rgba(255,252,245,'+s.a*0.12+')';ctx.lineWidth=0.3;
        ctx.beginPath();ctx.moveTo(px-bl,py);ctx.lineTo(px+bl,py);
        ctx.moveTo(px,py-bl);ctx.lineTo(px,py+bl);ctx.stroke();
      }
    }
  }

  function drawMW(){
    var vis=[];
    for(var i=0;i<MW.length;i++){
      var pp=proj(MW[i].x,MW[i].y,MW[i].z);
      if(pp&&pp.z>0)vis.push({s:MW[i],pp:pp});
    }
    vis.sort(function(a,b){return b.pp.z-a.pp.z;});
    for(var i=0;i<vis.length;i++){
      var v=vis[i],pp=v.pp,st=v.s;
      var sc=Math.max(0.15,st.s*Math.min(1,500/pp.z));
      var al=st.a*Math.min(1,350/pp.z);
      if(al<0.022)continue;
      var rc=st.hue<195?175:st.hue<225?200:215;
      var gc=st.hue<195?205:218;
      var bc=255;
      ctx.beginPath();ctx.arc(pp.x,pp.y,sc,0,Math.PI*2);
      ctx.fillStyle='rgba('+rc+','+gc+','+bc+','+al+')';ctx.fill();
    }
    /* arm labels */
    ARMS.forEach(function(arm,ai){
      var r=1100,th=arm.angle+0.4;
      var pp=proj(Math.cos(th)*r,0,Math.sin(th)*r);
      if(!pp)return;
      ctx.fillStyle='rgba(150,165,210,0.22)';
      ctx.font='9px "Share Tech Mono","DM Mono",monospace';
      ctx.textAlign='center';
      ctx.fillText(arm.name,pp.x,pp.y);
    });
  }

  function drawOrbits(){
    NODES.forEach(function(n){
      ctx.strokeStyle='rgba('+n.rgb[0]+','+n.rgb[1]+','+n.rgb[2]+',0.05)';
      ctx.lineWidth=0.6;ctx.setLineDash([3,11]);
      ctx.beginPath();
      var first=true;
      for(var k=0;k<=120;k++){
        var pp=oPt(n,(k/120)*Math.PI*2);
        if(!pp)continue;
        first?ctx.moveTo(pp.x,pp.y):ctx.lineTo(pp.x,pp.y);first=false;
      }
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  function drawBelt(){
    BELT.forEach(function(b){
      b.a+=b.sp;
      var pp=proj(Math.cos(b.a)*b.r,b.y,Math.sin(b.a)*b.r);
      if(!pp)return;
      var sz=Math.max(0.25,b.sz*pp.s*0.14);
      ctx.fillStyle='rgba(155,150,135,0.25)';
      ctx.fillRect(pp.x-sz*.5,pp.y-sz*.5,sz,sz);
    });
  }

  function drawSun(){
    var pp=proj(0,0,0);if(!pp)return;
    var R=Math.max(18,22*pp.s*0.38);

    /* outer corona */
    ctx.globalCompositeOperation='lighter';
    var oc=ctx.createRadialGradient(pp.x,pp.y,R*.4,pp.x,pp.y,R*6.5);
    oc.addColorStop(0,'rgba(255,150,50,0.10)');
    oc.addColorStop(0.3,'rgba(255,80,15,0.04)');
    oc.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(pp.x,pp.y,R*6.5,0,Math.PI*2);ctx.fillStyle=oc;ctx.fill();
    ctx.globalCompositeOperation='source-over';

    /* rays */
    ctx.save();ctx.translate(pp.x,pp.y);
    ctx.globalCompositeOperation='lighter';
    var rot=(performance.now()-t0)/110000*Math.PI*2;
    ctx.rotate(rot);
    for(var i=0;i<18;i++){
      var a=(i/18)*Math.PI*2,rLen=R*(2.6+0.4*Math.sin(i*2.3));
      var grd=ctx.createLinearGradient(Math.cos(a)*R*.25,Math.sin(a)*R*.25,Math.cos(a)*rLen,Math.sin(a)*rLen);
      grd.addColorStop(0,'rgba(255,210,110,0.25)');grd.addColorStop(.4,'rgba(255,130,35,0.07)');grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.strokeStyle=grd;ctx.lineWidth=2.2;
      ctx.beginPath();ctx.moveTo(Math.cos(a)*R*.25,Math.sin(a)*R*.25);ctx.lineTo(Math.cos(a)*rLen,Math.sin(a)*rLen);ctx.stroke();
    }
    ctx.restore();ctx.globalCompositeOperation='source-over';

    /* halo */
    ctx.globalCompositeOperation='lighter';
    var halo=ctx.createRadialGradient(pp.x,pp.y,R*.55,pp.x,pp.y,R*2.6);
    halo.addColorStop(0,'rgba(255,255,235,0.82)');halo.addColorStop(.08,'rgba(255,215,120,0.70)');
    halo.addColorStop(.24,'rgba(255,130,42,0.42)');halo.addColorStop(.50,'rgba(180,42,8,0.16)');
    halo.addColorStop(.78,'rgba(55,5,0,0.05)');halo.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(pp.x,pp.y,R*2.6,0,Math.PI*2);ctx.fillStyle=halo;ctx.fill();
    ctx.globalCompositeOperation='source-over';

    /* disk */
    var disk=ctx.createRadialGradient(pp.x-R*.18,pp.y-R*.18,0,pp.x,pp.y,R);
    disk.addColorStop(0,'#fffef4');disk.addColorStop(.14,'#fff2c0');
    disk.addColorStop(.38,'#ffcc60');disk.addColorStop(.62,'#ff8018');
    disk.addColorStop(.82,'#c82e00');disk.addColorStop(1,'#280500');
    ctx.beginPath();ctx.arc(pp.x,pp.y,R,0,Math.PI*2);ctx.fillStyle=disk;ctx.fill();

    /* LYLA */
    if(R>8){
      ctx.fillStyle='rgba(255,240,200,0.58)';
      ctx.font='bold '+Math.max(8,Math.floor(R*.28))+'px "Share Tech Mono","DM Mono",monospace';
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('LYLA',pp.x,pp.y);
    }
    ctx.strokeStyle='rgba(232,192,120,0.06)';ctx.lineWidth=0.55;
    for(var i=1;i<=3;i++){ctx.beginPath();ctx.arc(pp.x,pp.y,R*(1.3+i*.42),0,Math.PI*2);ctx.stroke();}
  }

  function drawNodes(ts){
    var tip=document.getElementById('kd-tip');
    var anyHov=false;
    var risk=Number((window.KD.state&&window.KD.state.risk&&window.KD.state.risk.risk_score)||0);

    NODES.forEach(function(n){
      var pos=npos(n,ts),pp=proj(pos.x,pos.y,pos.z);
      if(!pp)return;
      var pr=Math.max(0.8,n.r*pp.s*0.18);
      var hov=Math.hypot(mx-pp.x,my-pp.y)<pr*4.5;
      if(hov)anyHov=true;

      /* speed up trails with risk score */
      var speedMul=1+risk/120;
      var TRAIL=55,STEP=n.orbit*0.06/Math.max(0.01,n.spd)*0.000075;
      for(var j=TRAIL;j>=1;j--){
        var pp2=proj(npos(n,ts-j*STEP*speedMul).x,npos(n,ts-j*STEP*speedMul).y,npos(n,ts-j*STEP*speedMul).z);
        if(!pp2)continue;
        var frac=j/TRAIL,ta=(1-frac)*(1-frac)*0.42,tr=pr*0.15*(1-frac*.65);
        ctx.beginPath();ctx.arc(pp2.x,pp2.y,tr,0,Math.PI*2);
        ctx.fillStyle='rgba('+n.rgb[0]+','+n.rgb[1]+','+n.rgb[2]+','+ta+')';ctx.fill();
      }

      /* glow — brighter when risk high */
      ctx.globalCompositeOperation='lighter';
      var gR=pr*(hov?5.8:3.2)*(1+risk/200);
      var glow=ctx.createRadialGradient(pp.x,pp.y,0,pp.x,pp.y,gR);
      glow.addColorStop(0,'rgba('+n.rgb[0]+','+n.rgb[1]+','+n.rgb[2]+','+(hov?.55:.28)+')');
      glow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath();ctx.arc(pp.x,pp.y,gR,0,Math.PI*2);ctx.fillStyle=glow;ctx.fill();
      ctx.globalCompositeOperation='source-over';

      /* sphere */
      var sp0=proj(0,0,0),lx=sp0?(sp0.x-pp.x):0,ly=sp0?(sp0.y-pp.y):0,ld=Math.hypot(lx,ly)||1;
      lx/=ld;ly/=ld;
      var pg=ctx.createRadialGradient(pp.x+lx*pr*.35,pp.y+ly*pr*.35,pr*.04,pp.x,pp.y,pr);
      pg.addColorStop(0,'rgba(255,255,255,.92)');
      pg.addColorStop(.2,'rgba('+n.rgb[0]+','+n.rgb[1]+','+n.rgb[2]+',1)');
      pg.addColorStop(.65,'rgba('+Math.floor(n.rgb[0]*.5)+','+Math.floor(n.rgb[1]*.5)+','+Math.floor(n.rgb[2]*.5)+',1)');
      pg.addColorStop(1,'rgba('+Math.floor(n.rgb[0]*.08)+','+Math.floor(n.rgb[1]*.08)+','+Math.floor(n.rgb[2]*.08)+',1)');
      ctx.beginPath();ctx.arc(pp.x,pp.y,pr,0,Math.PI*2);ctx.fillStyle=pg;ctx.fill();

      /* rim */
      ctx.globalCompositeOperation='screen';
      var rim=ctx.createRadialGradient(pp.x,pp.y,pr*.72,pp.x,pp.y,pr*1.22);
      rim.addColorStop(0,'rgba(0,0,0,0)');
      rim.addColorStop(.55,'rgba('+Math.floor(n.rgb[0]*.38)+','+Math.floor(n.rgb[1]*.38)+','+Math.floor(n.rgb[2]*.38)+',0.18)');
      rim.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath();ctx.arc(pp.x,pp.y,pr*1.22,0,Math.PI*2);ctx.fillStyle=rim;ctx.fill();
      ctx.globalCompositeOperation='source-over';

      /* ring */
      if(n.ring){
        ctx.save();ctx.translate(pp.x,pp.y);ctx.rotate(pos.a*.4+0.5);ctx.scale(1,0.28);
        ctx.strokeStyle='rgba(245,220,175,0.52)';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.arc(0,0,pr*2.55,0,Math.PI*2);ctx.stroke();
        ctx.strokeStyle='rgba(200,175,130,0.25)';ctx.lineWidth=2.8;
        ctx.beginPath();ctx.arc(0,0,pr*2.05,0,Math.PI*2);ctx.stroke();
        ctx.restore();
      }

      /* label */
      if(pr>2.5){
        ctx.save();
        ctx.fillStyle='rgba('+n.rgb[0]+','+n.rgb[1]+','+n.rgb[2]+','+(hov?1:.65)+')';
        ctx.font=(hov?'bold ':'')+Math.max(7,pr*.82)+'px "Share Tech Mono","DM Mono",monospace';
        ctx.textAlign='center';ctx.textBaseline='top';
        ctx.fillText(n.label,pp.x,pp.y+pr+4);
        ctx.restore();
      }

      /* tooltip */
      if(tip&&hov){
        tip.style.opacity='1';
        var tx=pp.x+22,ty=pp.y-18;
        if(tx+240>W)tx=pp.x-248;if(ty+90>H)ty=pp.y-100;
        tip.style.left=tx+'px';tip.style.top=ty+'px';
        tip.innerHTML='<span style="color:rgba('+n.rgb+',1);font-size:9px">'+n.key+'</span><br>'+
          '<strong style="color:#e8f4ff;font-size:12px">'+n.label+'</strong><br>'+
          '<span style="color:rgba(180,210,230,.6);font-size:10px">'+n.desc.replace(/\n/g,'<br>')+'</span>';
      }
    });
    if(tip&&!anyHov)tip.style.opacity='0';
  }

  function drawPulses(){
    pulses=pulses.filter(function(p){return p.alpha>0.006;});
    pulses.forEach(function(p){
      p.r+=(p.maxR-p.r)*0.025;p.alpha*=0.948;
      ctx.strokeStyle='rgba('+p.col[0]+','+p.col[1]+','+p.col[2]+','+p.alpha*.5+')';
      ctx.lineWidth=1.4*p.alpha;
      ctx.beginPath();ctx.arc(CX,CY,p.r,0,Math.PI*2);ctx.stroke();
    });
  }

  /* ── TOOLTIP DOM ─────────────────────────────────────────── */
  if(!document.getElementById('kd-tip')){
    var tip=document.createElement('div');tip.id='kd-tip';
    tip.style.cssText='position:fixed;pointer-events:none;z-index:9999;padding:10px 16px;'+
      'border-radius:10px;background:rgba(3,2,18,.95);backdrop-filter:blur(18px);'+
      'border:1px solid rgba(232,192,120,.22);color:#e8f4ff;max-width:232px;line-height:1.72;'+
      'font-family:"Share Tech Mono","DM Mono",monospace;font-size:11px;opacity:0;transition:opacity .15s;';
    document.body.appendChild(tip);
  }

  /* ── RENDER LOOP ─────────────────────────────────────────── */
  function frame(now){
    var ts=now-t0;
    var conf=Number((window.KD.state&&window.KD.state.consensus&&window.KD.state.consensus.confidence)||50);
    /* auto rotate — slow down with confidence */
    if(CAM.auto) CAM.yaw+=0.00012*(2-conf/100);
    drawBg();
    drawNebula();
    drawNear();
    drawMW();
    drawBelt();
    drawOrbits();
    drawPulses();
    drawNodes(ts);
    drawSun();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
