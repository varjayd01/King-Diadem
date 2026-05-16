/* ============================================================
   KING DIADEM — galaxy_scene.js v3.0
   จักรวาลสวย nebula มีสี ดาวเห็นชัด ไม่บังระบบสุริยะ
   ============================================================ */
(function () {
  if (typeof THREE !== 'undefined') return;
  var canvas = document.getElementById('galaxy');
  if (!canvas) return;
  var ctx = canvas.getContext('2d', { alpha: false });
  var W, H, cx, cy, S;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W * 0.52; cy = H * 0.38;
    S  = Math.min(W, H) * 0.44;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Stars ── */
  var STAR_N = Math.min(7000, 4000 + Math.floor((W * H) / 2200));
  var stars = [];
  for (var i = 0; i < STAR_N; i++) {
    var z = 0.08 + Math.random() * 0.92;
    stars.push({
      x: Math.random(), y: Math.random(), z: z,
      layer: z < 0.35 ? 0 : z < 0.7 ? 1 : 2,
      s: 0.45 + Math.pow(Math.random(), 1.1) * 3.2,
      tw: Math.random() * Math.PI * 2,
      sp: 0.008 + Math.random() * 0.035,
      warm: Math.random() > 0.40,
      vx: (Math.random() - 0.5) * 0.00004
    });
  }

  /* ── Planets ── */
  var ORBIT_REF_MS = 60000, refIdx = 2;
  var planets = [
    {a:0.19,b:0.165,orn:0.11,r:4.2,rgb:[200,210,255],ring:0,phase:Math.random()*6.283},
    {a:0.27,b:0.225,orn:0.04,r:4.8,rgb:[255,120,85], ring:0,phase:Math.random()*6.283},
    {a:0.34,b:0.30, orn:0.12,r:7.2,rgb:[210,175,120],ring:1,phase:Math.random()*6.283},
    {a:0.44,b:0.36, orn:0.06,r:5.6,rgb:[70,130,255], ring:0,phase:Math.random()*6.283},
    {a:0.56,b:0.42, orn:0.03,r:4.1,rgb:[200,110,200],ring:0,phase:Math.random()*6.283},
    {a:0.70,b:0.50, orn:0.14,r:3.4,rgb:[150,210,255],ring:0,phase:Math.random()*6.283},
    {a:0.86,b:0.58, orn:0.07,r:2.9,rgb:[175,185,215],ring:0,phase:Math.random()*6.283}
  ];
  var refMean = (planets[refIdx].a + planets[refIdx].b) * 0.5;
  for (var i = 0; i < planets.length; i++) {
    var m = (planets[i].a + planets[i].b) * 0.5;
    planets[i].periodMs = ORBIT_REF_MS * Math.pow(Math.max(0.08, m) / Math.max(0.08, refMean), 1.5);
  }

  /* ── Asteroid belt ── */
  var belt = [];
  for (var i = 0; i < 500; i++) {
    belt.push({ g: 0.48 + Math.random()*0.14, ph: Math.random()*6.283,
      sp: 0.00004 + Math.random()*0.00007, a: 0.025 + Math.random()*0.06 });
  }

  /* ── Nebula blobs (drawn ON canvas, not div overlay) ── */
  var neblaBlobs = [
    {ox:0.15, oy:0.20, rx:0.55, ry:0.38, rot:0.3,  c1:'rgba(80,40,180,0.22)',  c2:'rgba(0,0,0,0)'},
    {ox:0.80, oy:0.18, rx:0.48, ry:0.32, rot:-0.2, c1:'rgba(255,80,30,0.20)',  c2:'rgba(0,0,0,0)'},
    {ox:0.50, oy:0.75, rx:0.70, ry:0.40, rot:0.1,  c1:'rgba(20,180,160,0.18)', c2:'rgba(0,0,0,0)'},
    {ox:0.88, oy:0.60, rx:0.38, ry:0.28, rot:0.5,  c1:'rgba(160,80,255,0.16)', c2:'rgba(0,0,0,0)'},
    {ox:0.10, oy:0.65, rx:0.42, ry:0.30, rot:-0.4, c1:'rgba(255,160,60,0.14)', c2:'rgba(0,0,0,0)'},
    {ox:0.55, oy:0.10, rx:0.60, ry:0.25, rot:0.05, c1:'rgba(40,120,255,0.12)', c2:'rgba(0,0,0,0)'}
  ];

  /* ── Draw functions ── */
  function drawDeepSpace() {
    /* rich dark base — not pure black */
    var bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W,H)*0.8);
    bg.addColorStop(0, '#03010e');
    bg.addColorStop(0.5,'#010108');
    bg.addColorStop(1, '#000005');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  }

  function drawMilkyWay(tt) {
    ctx.save();
    ctx.translate(W*0.18, H*0.06);
    ctx.rotate(-0.38 + Math.sin(tt*0.000018)*0.014);
    var bw = Math.max(W,H)*2.0, bh = H*0.62;
    var g = ctx.createLinearGradient(0,-bh*0.5,0,bh*0.5);
    g.addColorStop(0,    'rgba(255,240,220,0)');
    g.addColorStop(0.25, 'rgba(100,60,180,0.14)');
    g.addColorStop(0.50, 'rgba(25,180,160,0.22)');
    g.addColorStop(0.65, 'rgba(255,150,60,0.16)');
    g.addColorStop(0.85, 'rgba(200,180,255,0.08)');
    g.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-bw*0.15, -bh, bw, bh*2);
    ctx.globalCompositeOperation = 'lighter';
    var g2 = ctx.createLinearGradient(bw*0.25,0,bw*0.75,0);
    g2.addColorStop(0,   'rgba(255,200,120,0)');
    g2.addColorStop(0.5, 'rgba(255,255,255,0.07)');
    g2.addColorStop(1,   'rgba(100,220,255,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(-bw*0.15, -bh, bw, bh*2);
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawNebulae() {
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < neblaBlobs.length; i++) {
      var b = neblaBlobs[i];
      var nx = b.ox*W, ny = b.oy*H;
      var rx = Math.max(W,H)*b.rx, ry = Math.max(W,H)*b.ry;
      ctx.save();
      ctx.translate(nx, ny);
      ctx.rotate(b.rot);
      var gr = ctx.createRadialGradient(0,0,0,0,0,rx);
      gr.addColorStop(0, b.c1);
      gr.addColorStop(1, b.c2);
      ctx.fillStyle = gr;
      ctx.scale(1, ry/rx);
      ctx.beginPath();
      ctx.arc(0,0,rx,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawStars(tt) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var par = s.layer===0 ? 0.010 : s.layer===1 ? 0.022 : 0.040;
      var px  = ((s.x + tt*0.000016*par + s.vx*tt)%1+1)%1*W;
      var py  = s.y*H;
      var tw  = 0.5 + 0.5*Math.sin(tt*s.sp+s.tw);
      var sc  = Math.max(0.42, s.s*s.z*tw*(0.9+s.layer*0.12));
      var a   = Math.min(1, 0.22 + 0.78*s.z*tw);
      var r,g,b;
      if (s.warm) { r=255; g=230-Math.floor(38*s.z); b=185-Math.floor(75*s.z); }
      else        { r=210-Math.floor(28*s.z); g=236-Math.floor(18*s.z); b=255; }
      ctx.beginPath();
      ctx.arc(px,py,sc,0,Math.PI*2);
      ctx.fillStyle='rgba('+r+','+g+','+b+','+a+')';
      ctx.fill();
      if (s.z > 0.72 && tw > 0.80) {
        ctx.strokeStyle='rgba(255,252,240,'+(0.22*a)+')';
        ctx.lineWidth=0.5;
        ctx.beginPath();
        ctx.moveTo(px-sc*2.5,py); ctx.lineTo(px+sc*2.5,py);
        ctx.moveTo(px,py-sc*2.5); ctx.lineTo(px,py+sc*2.5);
        ctx.stroke();
      }
    }
  }

  function drawSun(tt) {
    var pulse = 1 + 0.048*Math.sin(tt*0.00082);
    var R = Math.min(W,H)*0.138*pulse;
    var spin = (tt/ORBIT_REF_MS)*Math.PI*2;
    /* rays */
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(spin*0.35);
    ctx.globalCompositeOperation='lighter';
    for (var i=0;i<48;i++) {
      var a=(i/48)*Math.PI*2, w=R*(1.95+0.45*Math.sin(i*1.8));
      var x0=Math.cos(a)*R*0.20, y0=Math.sin(a)*R*0.20;
      var x1=Math.cos(a)*w, y1=Math.sin(a)*w;
      var grd=ctx.createLinearGradient(x0,y0,x1,y1);
      grd.addColorStop(0,'rgba(255,245,220,0.28)');
      grd.addColorStop(0.4,'rgba(255,110,30,0.10)');
      grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.strokeStyle=grd; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
    }
    ctx.restore(); ctx.globalCompositeOperation='source-over';
    /* corona halo */
    var cor=ctx.createRadialGradient(cx,cy,R*0.05,cx,cy,R*2.4);
    cor.addColorStop(0,'rgba(255,255,252,0.95)');
    cor.addColorStop(0.06,'#ffe8a0');
    cor.addColorStop(0.18,'#ffb035');
    cor.addColorStop(0.40,'#ff5515');
    cor.addColorStop(0.65,'#aa0e00');
    cor.addColorStop(1,'rgba(20,0,15,0)');
    ctx.globalCompositeOperation='lighter';
    ctx.beginPath(); ctx.arc(cx,cy,R*2.3,0,Math.PI*2);
    ctx.fillStyle=cor; ctx.fill();
    ctx.globalCompositeOperation='source-over';
    /* core */
    var core=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.65);
    core.addColorStop(0,'#fffef8');
    core.addColorStop(0.20,'#ffd055');
    core.addColorStop(0.50,'#ff6e0e');
    core.addColorStop(1,'#780c00');
    ctx.beginPath(); ctx.arc(cx,cy,R*0.60,0,Math.PI*2);
    ctx.fillStyle=core; ctx.fill();
  }

  function pXY(p,tt) {
    var ang=(tt/p.periodMs)*(Math.PI*2)+p.phase;
    var xe=Math.cos(ang)*p.a*S, ye=Math.sin(ang)*p.b*S;
    var co=Math.cos(p.orn), si=Math.sin(p.orn);
    return {x:cx+xe*co-ye*si, y:cy+xe*si+ye*co, ang:ang};
  }

  function drawOrbits() {
    for (var i=0;i<planets.length;i++) {
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(planets[i].orn);
      ctx.strokeStyle='rgba(255,245,230,0.13)'; ctx.lineWidth=0.9;
      ctx.beginPath(); ctx.ellipse(0,0,planets[i].a*S,planets[i].b*S,0,0,Math.PI*2);
      ctx.stroke(); ctx.restore();
    }
  }

  function drawBelt(tt) {
    ctx.fillStyle='rgba(230,220,255,0.40)';
    for (var i=0;i<belt.length;i++) {
      var ro=belt[i], ang=ro.ph+tt*ro.sp, rr=ro.g*S;
      var xe=Math.cos(ang)*rr, ye=Math.sin(ang)*rr*0.88;
      var co=Math.cos(0.09),si=Math.sin(0.09);
      ctx.fillRect(cx+xe*co-ye*si,cy+xe*si+ye*co,ro.a,ro.a);
    }
  }

  function drawPlanet(x,y,r,rgb,p,ang) {
    var dx=cx-x,dy=cy-y,dist=Math.hypot(dx,dy)||1;
    var lx=dx/dist,ly=dy/dist,gx=x-lx*r*0.85,gy=y-ly*r*0.85;
    var lit=ctx.createRadialGradient(gx,gy,r*0.1,x,y,r*1.15);
    lit.addColorStop(0,'rgba(255,255,255,0.95)');
    lit.addColorStop(0.35,'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',1)');
    lit.addColorStop(1,'rgba('+Math.floor(rgb[0]*0.22)+','+Math.floor(rgb[1]*0.20)+','+Math.floor(rgb[2]*0.25)+',1)');
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=lit; ctx.fill();
    /* shadow */
    ctx.save(); ctx.translate(x,y); ctx.rotate(ang*0.4+p.phase);
    ctx.globalCompositeOperation='multiply';
    ctx.fillStyle='rgba(0,4,16,0.42)';
    ctx.beginPath(); ctx.ellipse(-r*0.35,0,r*1.05,r*0.92,0,0,Math.PI*2); ctx.fill();
    ctx.restore(); ctx.globalCompositeOperation='source-over';
    /* glow */
    var glow=ctx.createRadialGradient(x,y,0,x,y,r*5.5);
    glow.addColorStop(0,'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0.40)');
    glow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(x,y,r*5.5,0,Math.PI*2); ctx.fillStyle=glow; ctx.fill();
  }

  function drawRings(x,y,r,ang) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(ang*0.62+0.5); ctx.scale(1,0.34);
    ctx.strokeStyle='rgba(245,225,185,0.52)'; ctx.lineWidth=1.8;
    ctx.beginPath(); ctx.arc(0,0,r*2.60,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle='rgba(180,155,115,0.30)'; ctx.lineWidth=3.2;
    ctx.beginPath(); ctx.arc(0,0,r*2.22,0,Math.PI*2); ctx.stroke();
    ctx.restore();
  }

  function drawPlanets(tt) {
    var order=planets.map(function(p,i){return{i:i,p:p,y:pXY(p,tt).y};}).sort(function(a,b){return a.y-b.y;});
    for (var i=0;i<order.length;i++) {
      var pos=pXY(order[i].p,tt);
      if (order[i].p.ring) drawRings(pos.x,pos.y,order[i].p.r,pos.ang);
      drawPlanet(pos.x,pos.y,order[i].p.r,order[i].p.rgb,order[i].p,pos.ang);
    }
  }

  /* ── Main loop ── */
  function frame(t) {
    drawDeepSpace();
    drawMilkyWay(t);
    drawNebulae();
    drawStars(t);

    var deck=(t/ORBIT_REF_MS)*(Math.PI*2);
    ctx.save();
    ctx.translate(cx,cy); ctx.rotate(deck); ctx.translate(-cx,-cy);
    drawSun(t);
    drawOrbits();
    drawBelt(t);
    drawPlanets(t);
    ctx.restore();

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
