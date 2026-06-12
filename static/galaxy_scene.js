/* ============================================================
   KING DIADEM — galaxy_scene.js v22 "FATE Deterministic"
   Reference: LYLA solar system diagram
   
   - Sun ใหญ่ ซ้าย corona เต็ม warm orange
   - Orbits เส้นประแบน มองจากด้านข้าง
   - Planets มี texture gradient เหมือนดาวจริง labels ใต้
   - Comet ผ่านด้านบน
   - "Choice(t) >= 1 → collapse = False" ล่างซ้าย
   - Deep navy space + red/orange nebula sun + blue right
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('galaxy');
  if (!cv) return;
  if (!window.KD) window.KD = {};

  var ctx = cv.getContext('2d', { alpha: true });
  var W = 0, H = 0;
  var activeRoute = 'general';
  var lastTime = 0;

  var _logo = new Image();
  _logo.src = '/static/logo.png';
  _logo.onerror = function () { _logo = null; };

  cv.style.cssText = 'display:block;width:100%;height:100%;';

  var _rT;
  function doResize() {
    var p = cv.parentElement;
    W = cv.width  = p ? p.offsetWidth  : 900;
    H = cv.height = p ? p.offsetHeight : 110;
    buildStars();
  }
  var ro = window.ResizeObserver
    ? new ResizeObserver(function () { clearTimeout(_rT); _rT = setTimeout(doResize, 60); })
    : null;
  if (ro && cv.parentElement) ro.observe(cv.parentElement);
  window.addEventListener('resize', function () { clearTimeout(_rT); _rT = setTimeout(doResize, 80); }, { passive: true });
  setTimeout(doResize, 10);

  var TILT = 0.14;

  var PLANET_DEFS = [
    { id:'general',  label:'GENERAL',  ang: 0.55, spd:0.00022, orb:0.115, sz:6.5,
      c0:'#c8d8e8', c1:'#6a8fa8', c2:'#2a4560', atm:'rgba(140,180,220,' },
    { id:'risk',     label:'RISK',     ang: 2.20, spd:0.00015, orb:0.175, sz:5.5,
      c0:'#d4785a', c1:'#8a3820', c2:'#3a1508', atm:'rgba(180,80,40,' },
    { id:'survival', label:'SURVIVAL', ang: 3.60, spd:0.00010, orb:0.240, sz:7.0,
      c0:'#b8c878', c1:'#5a7830', c2:'#253010', atm:'rgba(120,170,80,' },
    { id:'collapse', label:'COLLAPSE', ang: 5.00, spd:0.00006, orb:0.310, sz:5.8,
      c0:'#c08858', c1:'#7a5030', c2:'#302010', atm:'rgba(160,100,40,' },
    { id:'civil',    label:'CIVIL',    ang: 1.20, spd:0.00004, orb:0.400, sz:6.8,
      c0:'#a8c8d8', c1:'#5888a8', c2:'#203850', atm:'rgba(100,150,200,' },
    { id:'vega',     label:'VEGA',     ang: 4.20, spd:0.00002, orb:0.490, sz:9.0,
      c0:'#d8c8a8', c1:'#a89060', c2:'#504028', atm:'rgba(180,150,80,' },
    { id:'a1', ang:1.60, spd:0.00032, orb:0.082, sz:1.8, c0:'#8899aa', c1:'#445566', c2:'#223344' },
    { id:'a2', ang:3.10, spd:0.00020, orb:0.140, sz:1.5, c0:'#998877', c1:'#554433', c2:'#221811' },
    { id:'a3', ang:5.50, spd:0.00008, orb:0.270, sz:1.6, c0:'#889977', c1:'#445533', c2:'#223311' },
    { id:'a4', ang:2.80, spd:0.00003, orb:0.455, sz:2.0, c0:'#99aabb', c1:'#556677', c2:'#223344' },
  ];

  var PLANETS = PLANET_DEFS.map(function (d) { return Object.assign({}, d); });

  var STARS = [];
  function buildStars() {
    STARS = [];
    for (var i = 0; i < 1400; i++) {
      STARS.push({ x:Math.random()*W, y:Math.random()*H, r:0.06+Math.random()*0.20,
        a:0.08+Math.random()*0.30, col:Math.random()>0.6?'220,205,170':'200,215,235', tw:false });
    }
    for (var j = 0; j < 250; j++) {
      STARS.push({ x:Math.random()*W, y:Math.random()*H, r:0.18+Math.random()*0.40,
        a:0.22+Math.random()*0.38, col:Math.random()>0.5?'225,210,175':'195,210,235',
        tw:true, tS:0.00015+Math.random()*0.00022, tO:Math.random()*Math.PI*2, tA:0.06 });
    }
    for (var k = 0; k < 60; k++) {
      STARS.push({ x:Math.random()*W, y:Math.random()*H, r:0.50+Math.random()*0.75,
        a:0.45+Math.random()*0.38, col:Math.random()>0.4?'240,225,185':'200,215,245',
        tw:true, tS:0.00008+Math.random()*0.00015, tO:Math.random()*Math.PI*2, tA:0.10, bloom:true });
    }
  }

  function getSunX() { return Math.min(W * 0.20, 180); }
  function getSunY() { return H * 0.50; }
  function getSunR() { return Math.min(H * 0.55, 30); }

  var COMET = { x:-200, y:0, vx:0, vy:0, active:false, life:0, maxLife:0 };
  var nextComet = 8000;

  function spawnComet(t) {
    COMET.x=W*0.25+Math.random()*W*0.30; COMET.y=-10;
    COMET.vx=0.8+Math.random()*0.8; COMET.vy=0.6+Math.random()*0.6;
    COMET.life=0; COMET.maxLife=1.6+Math.random()*1.0; COMET.active=true;
    nextComet=t+20000+Math.random()*28000;
  }

  function drawComet(t, dt) {
    if (t > nextComet && !COMET.active) spawnComet(t);
    if (!COMET.active) return;
    COMET.life += dt;
    if (COMET.life > COMET.maxLife || COMET.y > H+40) { COMET.active=false; return; }
    COMET.x += COMET.vx*dt*60*0.016; COMET.y += COMET.vy*dt*60*0.016;
    var prog=COMET.life/COMET.maxLife;
    var al=prog<0.15?prog/0.15:Math.max(0,1-(prog-0.15)/0.85);
    var tailLen=80+Math.random()*20;
    var tx=COMET.x-COMET.vx*tailLen*0.016, ty=COMET.y-COMET.vy*tailLen*0.016;
    var gr=ctx.createLinearGradient(tx,ty,COMET.x,COMET.y);
    gr.addColorStop(0,'rgba(200,220,255,0)');
    gr.addColorStop(0.5,'rgba(210,225,255,'+(al*0.22)+')');
    gr.addColorStop(1,'rgba(235,245,255,'+(al*0.68)+')');
    ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(COMET.x,COMET.y);
    ctx.strokeStyle=gr; ctx.lineWidth=1.0; ctx.stroke();
    ctx.beginPath(); ctx.arc(COMET.x,COMET.y,1.4,0,Math.PI*2);
    ctx.fillStyle='rgba(235,245,255,'+(al*0.88)+')'; ctx.fill();
  }

  function drawBg() {
    ctx.clearRect(0,0,W,H);
    var bg=ctx.createLinearGradient(0,0,W,0);
    bg.addColorStop(0,'#100808'); bg.addColorStop(0.18,'#0c0a10');
    bg.addColorStop(0.55,'#080810'); bg.addColorStop(1,'#060810');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    var sx=getSunX(), sy=getSunY();
    ctx.globalCompositeOperation='screen';
    var nr=ctx.createRadialGradient(sx*0.45,sy*0.55,0,sx*0.45,sy*0.55,W*0.26);
    nr.addColorStop(0,'rgba(155,55,18,0.30)'); nr.addColorStop(0.4,'rgba(110,35,12,0.12)'); nr.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(sx*0.45,sy*0.55,W*0.26,H*1.1,-0.18,0,Math.PI*2); ctx.fillStyle=nr; ctx.fill();
    var na=ctx.createRadialGradient(sx,sy,getSunR()*0.4,sx,sy,W*0.30);
    na.addColorStop(0,'rgba(175,95,18,0.24)'); na.addColorStop(0.35,'rgba(130,65,10,0.10)'); na.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(sx,sy,W*0.30,H*0.88,0,0,Math.PI*2); ctx.fillStyle=na; ctx.fill();
    var nb=ctx.createRadialGradient(W*0.88,H*0.42,0,W*0.88,H*0.42,W*0.20);
    nb.addColorStop(0,'rgba(35,55,115,0.20)'); nb.addColorStop(0.5,'rgba(18,30,75,0.08)'); nb.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(W*0.88,H*0.42,W*0.20,H*0.82,0,0,Math.PI*2); ctx.fillStyle=nb; ctx.fill();
    ctx.globalCompositeOperation='source-over';
  }

  function drawStars(t) {
    for (var i=0;i<STARS.length;i++) {
      var s=STARS[i], al=s.a;
      if (s.tw) al=s.a*(1+Math.sin(t*s.tS+s.tO)*s.tA);
      al=Math.max(0.02,Math.min(1,al));
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle='rgba('+s.col+','+al.toFixed(3)+')'; ctx.fill();
      if (s.bloom&&al>0.55) {
        var sp=s.r*3.8;
        ctx.strokeStyle='rgba('+s.col+','+(al*0.07).toFixed(3)+')'; ctx.lineWidth=0.28;
        ctx.beginPath(); ctx.moveTo(s.x-sp,s.y); ctx.lineTo(s.x+sp,s.y);
        ctx.moveTo(s.x,s.y-sp); ctx.lineTo(s.x,s.y+sp); ctx.stroke();
      }
    }
  }

  function drawOrbits() {
    var sx=getSunX(), sy=getSunY(), seen={};
    PLANETS.forEach(function(p) {
      var orb=p.orb*W, key=Math.round(orb/5)*5;
      if (seen[key]) return; seen[key]=true;
      var isA=p.id===activeRoute;
      ctx.beginPath(); ctx.ellipse(sx,sy,orb,orb*TILT,0,0,Math.PI*2);
      ctx.strokeStyle=isA?'rgba(200,180,120,0.28)':'rgba(160,170,200,0.11)';
      ctx.lineWidth=isA?0.75:0.40; ctx.setLineDash(isA?[5,12]:[3,10]); ctx.stroke(); ctx.setLineDash([]);
    });
  }

  function drawOnePlanet(x,y,p,isActive,t) {
    var sz=p.sz;
    if (p.atm) {
      var atmA=isActive?0.20:0.14;
      var atm=ctx.createRadialGradient(x,y,sz*0.5,x,y,sz*2.5+(isActive?4:0));
      atm.addColorStop(0,p.atm+atmA+')'); atm.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x,y,sz*2.5+(isActive?4:0),0,Math.PI*2); ctx.fillStyle=atm; ctx.fill();
    }
    if (isActive) {
      ctx.globalCompositeOperation='screen';
      var pulse=1+Math.sin(t*0.0012)*0.08;
      var glow=ctx.createRadialGradient(x,y,sz,x,y,sz*5.5*pulse);
      glow.addColorStop(0,'rgba(200,180,120,0.28)'); glow.addColorStop(0.4,'rgba(180,150,80,0.07)'); glow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x,y,sz*5.5*pulse,0,Math.PI*2); ctx.fillStyle=glow; ctx.fill();
      ctx.globalCompositeOperation='source-over';
    }
    var body=ctx.createRadialGradient(x-sz*0.32,y-sz*0.32,0,x+sz*0.10,y+sz*0.10,sz*1.12);
    body.addColorStop(0,p.c0); body.addColorStop(0.45,p.c1); body.addColorStop(1,p.c2);
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fillStyle=body; ctx.fill();
    var spec=ctx.createRadialGradient(x-sz*0.38,y-sz*0.38,0,x-sz*0.20,y-sz*0.20,sz*0.60);
    spec.addColorStop(0,'rgba(255,252,240,'+(isActive?0.52:0.28)+')'); spec.addColorStop(1,'rgba(255,252,240,0)');
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fillStyle=spec; ctx.fill();
    var limb=ctx.createRadialGradient(x,y,sz*0.18,x,y,sz*1.06);
    limb.addColorStop(0,'rgba(0,0,0,0)'); limb.addColorStop(0.55,'rgba(0,0,0,0.18)'); limb.addColorStop(1,'rgba(0,0,0,0.72)');
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fillStyle=limb; ctx.fill();
    if (p.label) {
      var fs=Math.max(6,Math.round(sz*0.70));
      ctx.save();
      if (isActive) { ctx.globalCompositeOperation='screen'; ctx.shadowColor='rgba(220,200,140,0.70)'; ctx.shadowBlur=7; ctx.fillStyle='rgba(240,225,175,0.95)'; }
      else ctx.fillStyle='rgba(185,198,215,0.58)';
      ctx.font='500 '+fs+'px "DM Mono",monospace'; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText(p.label,x,y+sz+4); ctx.restore();
    }
  }

  function drawPlanets(dt,t) {
    var sx=getSunX(), sy=getSunY();
    var items=PLANETS.map(function(p) {
      p.ang+=p.spd*dt*60;
      return { p:p, x:sx+Math.cos(p.ang)*p.orb*W, y:sy+Math.sin(p.ang)*p.orb*W*TILT };
    }).sort(function(a,b){return a.y-b.y;});
    items.forEach(function(item) {
      if (item.x<-30||item.x>W+30) return;
      drawOnePlanet(item.x,item.y,item.p,item.p.id===activeRoute,t);
    });
  }

  function drawSun(t) {
    var sx=getSunX(), sy=getSunY(), R=getSunR();
    var gm=_STATE.thinking?1+Math.sin(t*0.005)*0.18:1;
    ctx.globalCompositeOperation='lighter';
    var fc=ctx.createRadialGradient(sx,sy,R*0.15,sx,sy,R*11);
    fc.addColorStop(0,'rgba(220,140,30,'+(0.30*gm)+')'); fc.addColorStop(0.18,'rgba(180,90,15,'+(0.12*gm)+')');
    fc.addColorStop(0.45,'rgba(130,55,10,'+(0.06*gm)+')'); fc.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(sx,sy,R*11,R*5,0,0,Math.PI*2); ctx.fillStyle=fc; ctx.fill();
    ctx.save(); ctx.translate(sx,sy); ctx.rotate(t*0.000030);
    for (var i=0;i<16;i++) {
      var a=(i/16)*Math.PI*2, rl=R*(2.4+0.35*Math.sin(i*2.5+t*0.00022))*gm;
      var gr=ctx.createLinearGradient(Math.cos(a)*R*0.25,Math.sin(a)*R*0.25,Math.cos(a)*rl,Math.sin(a)*rl);
      gr.addColorStop(0,'rgba(255,210,80,'+(0.26*gm)+')'); gr.addColorStop(0.4,'rgba(220,130,30,0.05)'); gr.addColorStop(1,'rgba(0,0,0,0)');
      ctx.strokeStyle=gr; ctx.lineWidth=1.0; ctx.beginPath();
      ctx.moveTo(Math.cos(a)*R*0.25,Math.sin(a)*R*0.25); ctx.lineTo(Math.cos(a)*rl,Math.sin(a)*rl); ctx.stroke();
    }
    ctx.restore();
    var ih=ctx.createRadialGradient(sx,sy,R*0.30,sx,sy,R*2.8);
    ih.addColorStop(0,'rgba(255,240,160,0.90)'); ih.addColorStop(0.20,'rgba(255,190,60,0.62)');
    ih.addColorStop(0.55,'rgba(200,100,20,0.20)'); ih.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(sx,sy,R*2.8,0,Math.PI*2); ctx.fillStyle=ih; ctx.fill();
    ctx.globalCompositeOperation='source-over';
    var body=ctx.createRadialGradient(sx-R*0.25,sy-R*0.25,0,sx,sy,R);
    body.addColorStop(0,'#fff8d0'); body.addColorStop(0.25,'#ffd040'); body.addColorStop(0.65,'#e07010'); body.addColorStop(1,'#803008');
    ctx.beginPath(); ctx.arc(sx,sy,R,0,Math.PI*2); ctx.fillStyle=body; ctx.fill();
    var lr=R*0.88;
    if (_logo&&_logo.complete&&_logo.naturalWidth>0) {
      ctx.save(); ctx.globalAlpha=0.82; ctx.beginPath(); ctx.arc(sx,sy,lr,0,Math.PI*2); ctx.clip();
      ctx.drawImage(_logo,sx-lr,sy-lr,lr*2,lr*2); ctx.restore(); ctx.globalAlpha=1;
    }
    ctx.save(); ctx.globalCompositeOperation='screen';
    ctx.shadowColor='rgba(255,200,80,0.80)'; ctx.shadowBlur=10;
    ctx.fillStyle='rgba(255,235,140,0.90)';
    ctx.font='600 '+Math.max(8,Math.round(R*0.50))+'px "DM Mono",monospace';
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText('LYLA \u2666',sx,sy-R-5); ctx.restore();
  }

  function drawAxiom() {
    ctx.save();
    ctx.font='400 9px "DM Mono",monospace'; ctx.fillStyle='rgba(155,170,210,0.26)';
    ctx.textAlign='left'; ctx.textBaseline='bottom';
    ctx.fillText('Choice(t) >= 1  \u2192  collapse = False',getSunX()+getSunR()+8,H-7); ctx.restore();
  }

  function drawFateBadge() {
    ctx.save();
    ctx.font='500 7px "DM Mono",monospace'; ctx.fillStyle='rgba(170,185,220,0.20)';
    ctx.textAlign='right'; ctx.textBaseline='bottom';
    ctx.fillText('FATE\u2122  DETERMINISTIC DECISION INFRASTRUCTURE  v22',W-8,H-7); ctx.restore();
  }

  var _STATE={thinking:false};

  function loop(ts) {
    if (!lastTime) lastTime=ts;
    var dt=Math.min((ts-lastTime)/1000,0.05); lastTime=ts;
    drawBg(); drawStars(ts); drawComet(ts,dt); drawOrbits(); drawPlanets(dt,ts); drawSun(ts); drawAxiom(); drawFateBadge();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  window.LYLA_thinking=function(){_STATE.thinking=true;};
  window.LYLA_answered=function(){_STATE.thinking=false;};
  window.KD_pulse=function(route){_STATE.thinking=false;if(route)activeRoute=route;};
  window.KD_setRoute=function(route){activeRoute=route;};
  window.KD_council=function(){_STATE.thinking=true;};
  window.KD_councilEnd=function(){_STATE.thinking=false;};
  window.KD.safeVal=function(v,d){var n=+v,dec=typeof d==='number'?d:2;return(isFinite(n)&&!isNaN(n))?n.toFixed(dec):'0.00';};
})();
