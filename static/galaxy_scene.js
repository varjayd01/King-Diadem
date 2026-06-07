/* ============================================================
   KING DIADEM — galaxy_scene.js v9 ULTIMATE
   ★ 2D solar system (ดาวใหญ่ เห็นชัด mobile) +
     3D Milky Way arms + warp pulses + cosmic blue theme
   ★ 60fps · drag to orbit · pinch zoom
   ============================================================ */
(function () {
  var cv = document.getElementById('galaxy');
  if (!cv) return;
  if (!window.KD) window.KD = {};
  if (!window.KD.state) window.KD.state = {};

  var ctx = cv.getContext('2d', { alpha: false });
  var W, H, CX, CY, t0 = performance.now();

  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    CX = W * 0.50; CY = H * 0.50;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── CAMERA (for 3D MW layer) ── */
  var CAM = { yaw:0, pitch:0.15, fov:420, auto:true };
  var drag = { on:false, x:0, y:0, dist:0 };
  function dn(x,y){drag.on=true;drag.x=x;drag.y=y;CAM.auto=false;}
  function mv(x,y){if(!drag.on)return;CAM.yaw-=(x-drag.x)*.003;CAM.pitch+=(y-drag.y)*.002;CAM.pitch=Math.max(-.5,Math.min(.7,CAM.pitch));drag.x=x;drag.y=y;}
  function up(){drag.on=false;}
  cv.addEventListener('mousedown',function(e){dn(e.clientX,e.clientY);});
  cv.addEventListener('mousemove',function(e){mv(e.clientX,e.clientY);});
  cv.addEventListener('mouseup',up);cv.addEventListener('mouseleave',up);
  cv.addEventListener('touchstart',function(e){if(e.touches.length===1)dn(e.touches[0].clientX,e.touches[0].clientY);e.preventDefault();},{passive:false});
  cv.addEventListener('touchmove',function(e){if(e.touches.length===1)mv(e.touches[0].clientX,e.touches[0].clientY);e.preventDefault();},{passive:false});
  cv.addEventListener('touchend',up);
  cv.addEventListener('wheel',function(e){CAM.fov=Math.max(180,Math.min(750,CAM.fov+e.deltaY*.3));e.preventDefault();},{passive:false});

  function proj(x,y,z){
    var cy=Math.cos(CAM.yaw),sy=Math.sin(CAM.yaw);
    var rx=x*cy-z*sy,rz=x*sy+z*cy;
    var cp=Math.cos(CAM.pitch),sp=Math.sin(CAM.pitch);
    var ry=y*cp-rz*sp,rz2=y*sp+rz*cp;
    var d=rz2+CAM.fov*1.3;if(d<5)return null;
    var s=CAM.fov/d;return{x:CX+rx*s,y:CY-ry*s,z:d,s:s};
  }

  /* ══════════════════════════════════════════════════════
     LAYER 1: BACKGROUND — deep space gradient
  ══════════════════════════════════════════════════════ */
  function drawBg(){
    var bg=ctx.createRadialGradient(CX,CY*.8,0,CX,CY*.8,Math.max(W,H)*.95);
    bg.addColorStop(0,'#05091a');bg.addColorStop(.4,'#030610');bg.addColorStop(1,'#010208');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation='screen';
    [{x:W*.18,y:H*.22,r:Math.max(W,H)*.6,c:'rgba(15,35,90,0.20)'},
     {x:W*.80,y:H*.18,r:Math.max(W,H)*.45,c:'rgba(60,20,10,0.18)'},
     {x:W*.12,y:H*.72,r:Math.max(W,H)*.4,c:'rgba(25,10,75,0.18)'},
     {x:W*.55,y:H*.88,r:Math.max(W,H)*.5,c:'rgba(8,25,60,0.14)'}
    ].forEach(function(b){
      var gr=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
      gr.addColorStop(0,b.c);gr.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    });
    ctx.globalCompositeOperation='source-over';
  }

  /* ══════════════════════════════════════════════════════
     LAYER 2: 3D MILKY WAY
  ══════════════════════════════════════════════════════ */
  var MW=[];
  [{angle:0,n:600},{angle:Math.PI*.5,n:520},{angle:Math.PI,n:480},{angle:Math.PI*1.5,n:440}].forEach(function(arm){
    for(var i=0;i<arm.n;i++){
      var r=400+Math.random()*1800,th=arm.angle+r/360+(Math.random()-.5)*1.1,sp=45+r*.05;
      MW.push({x:Math.cos(th)*r+(Math.random()-.5)*sp,y:(Math.random()-.5)*sp*.1,z:Math.sin(th)*r+(Math.random()-.5)*sp*.35,s:.22+Math.random()*.75,a:.07+Math.random()*.35});
    }
  });
  for(var i=0;i<800;i++){var r=2000+Math.random()*4000,th=Math.random()*Math.PI*2,ph=(Math.random()-.5)*Math.PI;MW.push({x:r*Math.cos(th)*Math.cos(ph),y:r*Math.sin(ph)*.08,z:r*Math.sin(th)*Math.cos(ph),s:.12+Math.random()*.4,a:.03+Math.random()*.14});}
  var MW_N=MW.length;

  function drawMW(){
    var cyaw=Math.cos(CAM.yaw),syaw=Math.sin(CAM.yaw),cp=Math.cos(CAM.pitch),sp=Math.sin(CAM.pitch);
    for(var i=0;i<MW_N;i++){
      var s=MW[i];
      var rx=s.x*cyaw-s.z*syaw,rz=s.x*syaw+s.z*cyaw;
      var ry=s.y*cp-rz*sp,rz2=s.y*sp+rz*cp;
      var d=rz2+CAM.fov*1.3;if(d<40)continue;
      var sc=Math.max(.1,s.s*Math.min(1,420/d));
      var al=s.a*Math.min(1,280/d);if(al<.015)continue;
      var px=CX+rx*(CAM.fov/d),py=CY-ry*(CAM.fov/d);
      ctx.beginPath();ctx.arc(px,py,sc,0,Math.PI*2);
      ctx.fillStyle='rgba(130,170,255,'+al+')';ctx.fill();
    }
  }

  /* ══════════════════════════════════════════════════════
     LAYER 3: NEAR STARS
  ══════════════════════════════════════════════════════ */
  var NEAR=[];
  for(var i=0;i<600;i++){
    var bright=Math.random()>.94;
    NEAR.push({x:Math.random(),y:Math.random(),s:bright?.8+Math.random()*.9:.15+Math.random()*.4,a:bright?.45+Math.random()*.35:.06+Math.random()*.2,warm:Math.random()>.55,bloom:bright&&Math.random()>.45,vx:(Math.random()-.5)*.000005,vy:(Math.random()-.5)*.000003});
  }
  function drawNear(){
    for(var i=0;i<NEAR.length;i++){
      var s=NEAR[i];s.x=((s.x+s.vx+1)%1);s.y=((s.y+s.vy+1)%1);
      var px=s.x*W,py=s.y*H;
      var r=s.warm?245:180,g=s.warm?220:200,b=s.warm?180:255;
      ctx.beginPath();ctx.arc(px,py,s.s,0,Math.PI*2);ctx.fillStyle='rgba('+r+','+g+','+b+','+s.a+')';ctx.fill();
      if(s.bloom){var bl=s.s*2.2;ctx.strokeStyle='rgba('+r+','+g+','+b+','+s.a*.09+')';ctx.lineWidth=.3;ctx.beginPath();ctx.moveTo(px-bl,py);ctx.lineTo(px+bl,py);ctx.moveTo(px,py-bl);ctx.lineTo(px,py+bl);ctx.stroke();}
    }
  }

  /* ══════════════════════════════════════════════════════
     LAYER 4: 2D SOLAR SYSTEM — ดาวมี depth จริง
  ══════════════════════════════════════════════════════ */
  function scale(v){return v*(Math.min(W,H)/768);}

  var PLANETS=[
    {color:'#b0b8cc',sz:scale(4),   orb:scale(62),  spd:.0042, ang:0,   ring:false, moon:false, name:'Mercury'},
    {color:'#e8c87a',sz:scale(7),   orb:scale(98),  spd:.0032, ang:1.2, ring:false, moon:false, name:'Venus'},
    {color:'#3a7bd5',sz:scale(8),   orb:scale(142), spd:.0022, ang:2.5, ring:false, moon:true,  name:'Earth'},
    {color:'#cc5533',sz:scale(6),   orb:scale(190), spd:.0018, ang:4.0, ring:false, moon:false, name:'Mars'},
    {color:'#d4a060',sz:scale(17),  orb:scale(268), spd:.0009, ang:1.8, ring:false, moon:false, name:'Jupiter'},
    {color:'#eedd98',sz:scale(14),  orb:scale(350), spd:.0006, ang:3.2, ring:true,  moon:false, name:'Saturn'},
    {color:'#88dde8',sz:scale(10),  orb:scale(425), spd:.0004, ang:5.5, ring:false, moon:false, name:'Uranus'},
    {color:'#2244cc',sz:scale(9),   orb:scale(490), spd:.0002, ang:2.8, ring:false, moon:false, name:'Neptune'},
    /* KD governance nodes */
    {color:'#60a5fa',sz:scale(5),   orb:scale(118), spd:.0016, ang:.5,  ring:false, moon:false, kd:'WATERLINE'},
    {color:'#fff8e7',sz:scale(4.5), orb:scale(228), spd:.0013, ang:3.5, ring:false, moon:false, kd:'VEGA'},
    {color:'#f87171',sz:scale(3.5), orb:scale(162), spd:.0028, ang:1.0, ring:false, moon:false, kd:'HALT'},
    {color:'#a78bfa',sz:scale(4),   orb:scale(382), spd:.0004, ang:4.5, ring:false, moon:false, kd:'CIVIL'},
  ];

  var TILT=0.26;

  function drawOrbitRings(){
    PLANETS.forEach(function(p){
      ctx.beginPath();
      ctx.ellipse(CX,CY,p.orb,p.orb*TILT,0,0,Math.PI*2);
      ctx.strokeStyle=p.kd?'rgba(96,165,250,0.10)':'rgba(255,255,255,0.05)';
      ctx.lineWidth=.8;ctx.stroke();
    });
  }

  /* ── hex to rgb helper ── */
  function hexRgb(hex){
    var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return [r,g,b];
  }

  function drawPlanet(x,y,p){
    var sz=p.sz;
    var rgb=hexRgb(p.color);
    var R=rgb[0],G=rgb[1],B=rgb[2];

    /* 1. far atmosphere haze */
    var haze=ctx.createRadialGradient(x,y,sz*.6,x,y,sz*3.8);
    haze.addColorStop(0,'rgba('+R+','+G+','+B+',0.12)');
    haze.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(x,y,sz*3.8,0,Math.PI*2);
    ctx.fillStyle=haze;ctx.fill();

    /* 2. close atmosphere */
    var atm=ctx.createRadialGradient(x,y,sz*.85,x,y,sz*1.55);
    atm.addColorStop(0,'rgba('+R+','+G+','+B+',0)');
    atm.addColorStop(.6,'rgba('+R+','+G+','+B+',0.10)');
    atm.addColorStop(1,'rgba('+R+','+G+','+B+',0.28)');
    ctx.beginPath();ctx.arc(x,y,sz*1.55,0,Math.PI*2);
    ctx.fillStyle=atm;ctx.fill();

    /* 3. planet base — dark side first */
    ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);
    ctx.fillStyle='rgb('+Math.round(R*.12)+','+Math.round(G*.12)+','+Math.round(B*.12)+')';
    ctx.fill();

    /* 4. lit hemisphere — light from sun (CX,CY) */
    var dx=CX-x,dy=CY-y,dd=Math.hypot(dx,dy)||1;
    var lx=dx/dd,ly=dy/dd;
    var litX=x+lx*sz*.5,litY=y+ly*sz*.5;

    var lit=ctx.createRadialGradient(litX,litY,0,x,y,sz*1.05);
    lit.addColorStop(0,'rgba(255,255,255,0.85)');
    lit.addColorStop(0.12,'rgba('+Math.min(255,R+80)+','+Math.min(255,G+80)+','+Math.min(255,B+80)+',0.95)');
    lit.addColorStop(0.35,'rgba('+R+','+G+','+B+',0.90)');
    lit.addColorStop(0.62,'rgba('+Math.round(R*.6)+','+Math.round(G*.6)+','+Math.round(B*.6)+',0.70)');
    lit.addColorStop(0.85,'rgba('+Math.round(R*.2)+','+Math.round(G*.2)+','+Math.round(B*.2)+',0.40)');
    lit.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);
    ctx.fillStyle=lit;ctx.fill();

    /* 5. terminator — dark limb */
    var darkX=x-lx*sz*.35,darkY=y-ly*sz*.35;
    var shadow=ctx.createRadialGradient(darkX,darkY,sz*.1,darkX,darkY,sz*1.1);
    shadow.addColorStop(0,'rgba(0,0,10,0)');
    shadow.addColorStop(.55,'rgba(0,0,10,0.30)');
    shadow.addColorStop(1,'rgba(0,0,10,0.72)');
    ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);
    ctx.fillStyle=shadow;ctx.fill();

    /* 6. specular glint */
    var gx=x+lx*sz*.38,gy=y+ly*sz*.38;
    var spec=ctx.createRadialGradient(gx,gy,0,gx,gy,sz*.32);
    spec.addColorStop(0,'rgba(255,255,255,0.55)');
    spec.addColorStop(.5,'rgba(255,255,255,0.08)');
    spec.addColorStop(1,'rgba(255,255,255,0)');
    ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);
    ctx.fillStyle=spec;ctx.fill();

    /* 7. edge rim light (opposite side from sun — subtle) */
    var rimX=x-lx*sz*.7,rimY=y-ly*sz*.7;
    var rim=ctx.createRadialGradient(rimX,rimY,sz*.7,rimX,rimY,sz*1.1);
    rim.addColorStop(0,'rgba('+R+','+G+','+B+',0)');
    rim.addColorStop(.7,'rgba('+Math.round(R*.4)+','+Math.round(G*.4)+','+Math.round(B*.4)+',0.10)');
    rim.addColorStop(1,'rgba('+Math.round(R*.6)+','+Math.round(G*.6)+','+Math.round(B*.6)+',0.22)');
    ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);
    ctx.fillStyle=rim;ctx.fill();
  }

  function drawPlanets(ts){
    PLANETS.forEach(function(p){
      p.ang+=p.spd;
      var x=CX+Math.cos(p.ang)*p.orb;
      var y=CY+Math.sin(p.ang)*p.orb*TILT;

      drawPlanet(x,y,p);

      /* saturn rings */
      if(p.ring){
        ctx.save();ctx.translate(x,y);ctx.scale(1,TILT*.75);
        /* outer ring */
        var rg1=ctx.createRadialGradient(0,0,p.sz*1.9,0,0,p.sz*3.4);
        rg1.addColorStop(0,'rgba(238,216,152,0)');
        rg1.addColorStop(.2,'rgba(238,216,152,0.55)');
        rg1.addColorStop(.6,'rgba(220,195,130,0.40)');
        rg1.addColorStop(1,'rgba(200,170,100,0)');
        ctx.beginPath();ctx.arc(0,0,p.sz*3.4,0,Math.PI*2);
        ctx.fillStyle=rg1;ctx.fill();
        /* ring gap line */
        ctx.beginPath();ctx.ellipse(0,0,p.sz*2.6,p.sz*2.6,0,0,Math.PI*2);
        ctx.strokeStyle='rgba(238,216,152,0.15)';ctx.lineWidth=1;ctx.stroke();
        ctx.restore();
      }

      /* moon */
      if(p.moon){
        var ma=p.ang*8;
        var mx2=x+Math.cos(ma)*scale(18),my2=y+Math.sin(ma)*scale(5);
        /* moon as small sphere */
        var msz=scale(2.2);
        var mdx=CX-mx2,mdy=CY-my2,mdd=Math.hypot(mdx,mdy)||1;
        var mlx=mdx/mdd,mly=mdy/mdd;
        var mg=ctx.createRadialGradient(mx2+mlx*msz*.4,my2+mly*msz*.4,0,mx2,my2,msz);
        mg.addColorStop(0,'rgba(240,245,255,0.95)');
        mg.addColorStop(.4,'rgba(190,200,215,0.85)');
        mg.addColorStop(.75,'rgba(120,130,145,0.60)');
        mg.addColorStop(1,'rgba(30,35,45,0.30)');
        ctx.beginPath();ctx.arc(mx2,my2,msz,0,Math.PI*2);
        ctx.fillStyle=mg;ctx.fill();
      }

      /* KD node label */
      if(p.kd){
        ctx.fillStyle='rgba(200,230,255,0.60)';
        ctx.font='bold '+Math.max(7,p.sz*.6)+'px "DM Mono",monospace';
        ctx.textAlign='center';
        ctx.fillText(p.kd,x,y-p.sz-5);
      }
    });
  }

  /* ══════════════════════════════════════════════════════
     LAYER 5: SUN (LYLA)
  ══════════════════════════════════════════════════════ */
  var SUN_R=scale(28);

  function drawSun(){
    var R=SUN_R;
    if(Math.floor((performance.now()-t0)/16)%220===0){
      var rr=0;(function ripple(){rr+=5;if(rr>Math.min(W,H)*.6)return;ctx.beginPath();ctx.arc(CX,CY,rr,0,Math.PI*2);ctx.strokeStyle='rgba(96,165,250,'+(0.12-rr/Math.min(W,H)*.18)+')';ctx.lineWidth=1.2;ctx.stroke();requestAnimationFrame(ripple);})();
    }
    ctx.globalCompositeOperation='lighter';
    var oc=ctx.createRadialGradient(CX,CY,R*.4,CX,CY,R*6.5);
    oc.addColorStop(0,'rgba(255,160,50,0.18)');oc.addColorStop(.3,'rgba(255,80,15,0.07)');oc.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(CX,CY,R*6.5,0,Math.PI*2);ctx.fillStyle=oc;ctx.fill();
    ctx.globalCompositeOperation='source-over';

    var frame=Math.floor((performance.now()-t0)/16);
    ctx.save();ctx.translate(CX,CY);ctx.globalCompositeOperation='lighter';ctx.rotate(frame*.0012);
    for(var i=0;i<16;i++){
      var a=(i/16)*Math.PI*2,rLen=R*(2.5+.4*Math.sin(i*2.3+frame*.025));
      var grd=ctx.createLinearGradient(Math.cos(a)*R*.2,Math.sin(a)*R*.2,Math.cos(a)*rLen,Math.sin(a)*rLen);
      grd.addColorStop(0,'rgba(255,200,80,0.24)');grd.addColorStop(.4,'rgba(255,120,30,0.07)');grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.strokeStyle=grd;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(Math.cos(a)*R*.2,Math.sin(a)*R*.2);ctx.lineTo(Math.cos(a)*rLen,Math.sin(a)*rLen);ctx.stroke();
    }
    ctx.restore();ctx.globalCompositeOperation='source-over';

    ctx.globalCompositeOperation='lighter';
    var halo=ctx.createRadialGradient(CX,CY,R*.5,CX,CY,R*2.6);
    halo.addColorStop(0,'rgba(255,255,235,.9)');halo.addColorStop(.08,'rgba(255,210,100,.72)');halo.addColorStop(.25,'rgba(255,120,35,.42)');halo.addColorStop(.5,'rgba(180,40,5,.15)');halo.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(CX,CY,R*2.6,0,Math.PI*2);ctx.fillStyle=halo;ctx.fill();ctx.globalCompositeOperation='source-over';

    var disk=ctx.createRadialGradient(CX-R*.2,CY-R*.2,0,CX,CY,R);
    disk.addColorStop(0,'#fffef5');disk.addColorStop(.15,'#fff0a0');disk.addColorStop(.4,'#ffcc55');disk.addColorStop(.65,'#ff7e18');disk.addColorStop(.85,'#c82d00');disk.addColorStop(1,'#270500');
    ctx.beginPath();ctx.arc(CX,CY,R,0,Math.PI*2);ctx.fillStyle=disk;ctx.fill();

    ctx.fillStyle='rgba(255,248,231,.75)';ctx.font='bold '+Math.max(9,Math.floor(R*.28))+'px "DM Mono",monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('LYLA',CX,CY);
  }

  /* ══════════════════════════════════════════════════════
     LAYER 6: PULSES
  ══════════════════════════════════════════════════════ */
  var pulses=[];
  var ROUTE_COL={general:[96,165,250],risk:[248,113,113],survival:[52,211,153],collapse:[251,146,60],civil:[167,139,250],vega:[255,248,231],crisis:[239,68,68]};
  window.KD_pulse=function(route){
    var col=ROUTE_COL[route]||[96,165,250];
    for(var i=0;i<4;i++){(function(ii,c){setTimeout(function(){pulses.push({r:0,maxR:Math.min(W,H)*(.08+ii*.14),alpha:.6-ii*.1,col:c});},ii*80);})(i,col);}
  };
  window.addEventListener('KD:response',function(e){
    if(e.detail){window.KD.state=e.detail;window.KD_pulse((e.detail.output&&e.detail.output.action)||'general');}
  });
  function drawPulses(){
    pulses=pulses.filter(function(p){return p.alpha>.006;});
    pulses.forEach(function(p){p.r+=(p.maxR-p.r)*.025;p.alpha*=.946;ctx.strokeStyle='rgba('+p.col[0]+','+p.col[1]+','+p.col[2]+','+p.alpha*.5+')';ctx.lineWidth=1.3*p.alpha;ctx.beginPath();ctx.arc(CX,CY,p.r,0,Math.PI*2);ctx.stroke();});
  }

  /* ── tooltip ── */
  if(!document.getElementById('kd-tip')){
    var tip=document.createElement('div');tip.id='kd-tip';
    tip.style.cssText='position:fixed;pointer-events:none;z-index:9999;padding:10px 16px;border-radius:10px;background:rgba(4,8,20,.96);backdrop-filter:blur(18px);border:1px solid rgba(96,165,250,.22);color:#e8f4ff;max-width:220px;line-height:1.7;font-family:"DM Mono",monospace;font-size:11px;opacity:0;transition:opacity .15s;';
    document.body.appendChild(tip);
  }

  /* ══════════════════════════════════════════════════════
     RENDER LOOP — rAF 60fps
  ══════════════════════════════════════════════════════ */
  function frame(now){
    if(CAM.auto)CAM.yaw+=.00010;
    drawBg();
    drawNear();
    drawMW();
    drawOrbitRings();
    drawPulses();
    drawPlanets(now-t0);
    drawSun();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
