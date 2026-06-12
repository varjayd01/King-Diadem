/* ============================================================
   KING DIADEM — galaxy_scene.js v25
   Cosmic Indigo theme — deep purple/blue nebula
   Sun smaller, stars full width, softer palette
   ============================================================ */
(function () {
  'use strict';
  var cv = document.getElementById('galaxy');
  if (!cv) return;
  if (!window.KD) window.KD = {};

  var ctx = cv.getContext('2d', { alpha: true });
  var W = 0, H = 0, lastTime = 0;
  var activeRoute = 'general';

  cv.style.cssText = 'display:block;width:100%;height:100%;';

  var _rT;
  function doResize() {
    var p = cv.parentElement;
    W = cv.width  = p ? p.offsetWidth  : 900;
    H = cv.height = p ? p.offsetHeight : 130;
    buildStars();
  }
  var ro = window.ResizeObserver
    ? new ResizeObserver(function () { clearTimeout(_rT); _rT = setTimeout(doResize, 60); })
    : null;
  if (ro && cv.parentElement) ro.observe(cv.parentElement);
  window.addEventListener('resize', function () { clearTimeout(_rT); _rT = setTimeout(doResize, 80); }, { passive: true });
  setTimeout(doResize, 10);

  /* Sun — smaller, more centered vertically */
  function SX() { return Math.max(H * 0.40, Math.min(W * 0.055, 52)); }
  function SY() { return H * 0.50; }
  function SR() { return Math.min(H * 0.13, 11); }

  var TILT = 0.16;

  var PDEFS = [
    { id:'general',  label:'GENERAL',  ang:0.60, spd:0.00022, orb:0.12, sz:4.4,
      c0:'#a0bcd8', c1:'#3a6088', c2:'#142040', atm:'rgba(80,130,200,' },
    { id:'risk',     label:'RISK',     ang:2.30, spd:0.00015, orb:0.20, sz:3.8,
      c0:'#c87060', c1:'#782818', c2:'#2c0808', atm:'rgba(160,60,30,' },
    { id:'survival', label:'SURVIVAL', ang:3.80, spd:0.00010, orb:0.30, sz:4.8,
      c0:'#90b855', c1:'#3e6018', c2:'#162208', atm:'rgba(90,140,50,' },
    { id:'collapse', label:'COLLAPSE', ang:5.10, spd:0.00007, orb:0.40, sz:4.0,
      c0:'#a87848', c1:'#604018', c2:'#241408', atm:'rgba(130,75,25,' },
    { id:'civil',    label:'CIVIL',    ang:1.20, spd:0.00004, orb:0.53, sz:5.2,
      c0:'#88b0cc', c1:'#386080', c2:'#12243c', atm:'rgba(70,120,175,' },
    { id:'vega',     label:'VEGA',     ang:4.20, spd:0.00002, orb:0.72, sz:6.8,
      c0:'#c8bc90', c1:'#887840', c2:'#322808', atm:'rgba(150,125,60,' },
    { id:'a1', ang:1.60, spd:0.00032, orb:0.07, sz:1.3,
      c0:'#6878a0', c1:'#384060', c2:'#181828' },
    { id:'a2', ang:3.20, spd:0.00019, orb:0.16, sz:1.1,
      c0:'#807060', c1:'#483828', c2:'#180c04' },
    { id:'a3', ang:5.60, spd:0.00009, orb:0.36, sz:1.2,
      c0:'#708070', c1:'#384830', c2:'#141e10' },
    { id:'a4', ang:2.80, spd:0.00003, orb:0.62, sz:1.4,
      c0:'#8090a8', c1:'#405060', c2:'#181c28' },
  ];
  var PLANETS = PDEFS.map(function (d) { return Object.assign({}, d); });

  function buildStars() {
    STARS = [];
    for (var i = 0; i < 1300; i++)
      STARS.push({ x:Math.random()*W, y:Math.random()*H,
        r:0.04+Math.random()*0.15, a:0.04+Math.random()*0.18,
        col: Math.random()>0.5 ? '200,210,240' : '215,210,255', tw:false });
    for (var j = 0; j < 200; j++)
      STARS.push({ x:Math.random()*W, y:Math.random()*H,
        r:0.12+Math.random()*0.30, a:0.14+Math.random()*0.26,
        col: Math.random()>0.5 ? '208,215,255' : '178,198,240',
        tw:true, tS:0.00010+Math.random()*0.00018, tO:Math.random()*Math.PI*2, tA:0.08 });
    for (var k = 0; k < 55; k++)
      STARS.push({ x:Math.random()*W, y:Math.random()*H,
        r:0.32+Math.random()*0.58, a:0.30+Math.random()*0.34,
        col: Math.random()>0.4 ? '222,218,255' : '188,212,255',
        tw:true, tS:0.00005+Math.random()*0.00010, tO:Math.random()*Math.PI*2, tA:0.12, bloom:true });
  }

  var COMET = { x:0, y:0, vx:0, vy:0, active:false, life:0, maxLife:0 };
  var nextComet = 10000;
  function spawnComet(t) {
    COMET.x = W*0.20 + Math.random()*W*0.40;
    COMET.y = -4;
    COMET.vx = 0.5 + Math.random()*0.7;
    COMET.vy = 0.4 + Math.random()*0.5;
    COMET.life = 0;
    COMET.maxLife = 1.5 + Math.random()*1.4;
    COMET.active = true;
    nextComet = t + 18000 + Math.random()*30000;
  }
  function drawComet(t, dt) {
    if (t > nextComet && !COMET.active) spawnComet(t);
    if (!COMET.active) return;
    COMET.life += dt;
    if (COMET.life > COMET.maxLife || COMET.y > H+20) { COMET.active = false; return; }
    COMET.x += COMET.vx * dt * 60 * 0.013;
    COMET.y += COMET.vy * dt * 60 * 0.013;
    var prog = COMET.life / COMET.maxLife;
    var al = prog < 0.15 ? prog/0.15 : Math.max(0, 1-(prog-0.15)/0.85);
    var tl = 70, tx = COMET.x - COMET.vx*tl*0.013, ty = COMET.y - COMET.vy*tl*0.013;
    var g = ctx.createLinearGradient(tx, ty, COMET.x, COMET.y);
    g.addColorStop(0, 'rgba(180,190,255,0)');
    g.addColorStop(0.5, 'rgba(200,210,255,'+(al*0.22)+')');
    g.addColorStop(1, 'rgba(220,230,255,'+(al*0.68)+')');
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(COMET.x, COMET.y);
    ctx.strokeStyle = g; ctx.lineWidth = 0.75; ctx.stroke();
    ctx.beginPath(); ctx.arc(COMET.x, COMET.y, 1.2, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(220,230,255,'+(al*0.85)+')'; ctx.fill();
  }

  function drawBg() {
    ctx.clearRect(0, 0, W, H);
    /* deep cosmic indigo base */
    var bg = ctx.createLinearGradient(0, 0, W, 0);
    bg.addColorStop(0,    '#060410');
    bg.addColorStop(0.20, '#080618');
    bg.addColorStop(0.55, '#050510');
    bg.addColorStop(1,    '#040408');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    var sx = SX(), sy = SY();
    ctx.globalCompositeOperation = 'screen';

    /* warm red nebula — sun side (v21 style) */
    var n1 = ctx.createRadialGradient(sx*0.5, sy*0.5, 0, sx*0.5, sy*0.5, W*0.22);
    n1.addColorStop(0,   'rgba(140,42,12,0.34)');
    n1.addColorStop(0.5, 'rgba(95,25,8,0.12)');
    n1.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(sx*0.5, sy*0.5, W*0.22, H*1.15, -0.12, 0, Math.PI*2);
    ctx.fillStyle = n1; ctx.fill();

    /* amber halo behind sun */
    var n2 = ctx.createRadialGradient(sx, sy, SR()*0.3, sx, sy, W*0.28);
    n2.addColorStop(0,   'rgba(162,82,12,0.24)');
    n2.addColorStop(0.4, 'rgba(115,52,6,0.08)');
    n2.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(sx, sy, W*0.28, H*0.90, 0, 0, Math.PI*2);
    ctx.fillStyle = n2; ctx.fill();

    /* cold blue far right — contrast */
    var n3 = ctx.createRadialGradient(W*0.90, H*0.40, 0, W*0.90, H*0.40, W*0.20);
    n3.addColorStop(0,   'rgba(28,45,105,0.22)');
    n3.addColorStop(0.5, 'rgba(12,25,65,0.08)');
    n3.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(W*0.90, H*0.40, W*0.20, H*0.85, 0, 0, Math.PI*2);
    ctx.fillStyle = n3; ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
  }

  function drawStars(t) {
    for (var i = 0; i < STARS.length; i++) {
      var s = STARS[i], al = s.a;
      if (s.tw) al = s.a * (1 + Math.sin(t*s.tS + s.tO) * s.tA);
      al = Math.max(0.02, Math.min(1, al));
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba('+s.col+','+al.toFixed(3)+')'; ctx.fill();
      if (s.bloom && al > 0.48) {
        var sp = s.r*3.2;
        ctx.strokeStyle = 'rgba('+s.col+','+(al*0.048).toFixed(3)+')';
        ctx.lineWidth = 0.22;
        ctx.beginPath();
        ctx.moveTo(s.x-sp, s.y); ctx.lineTo(s.x+sp, s.y);
        ctx.moveTo(s.x, s.y-sp); ctx.lineTo(s.x, s.y+sp);
        ctx.stroke();
      }
    }
  }

  function drawOrbits() {
    var sx = SX(), sy = SY();
    var available = W - sx;
    var seen = {};
    ctx.setLineDash([3, 10]);
    PLANETS.forEach(function (p) {
      var orb = Math.round(p.orb * available / 3) * 3;
      if (seen[orb]) return; seen[orb] = true;
      var isA = p.id === activeRoute;
      ctx.beginPath();
      ctx.ellipse(sx, sy, p.orb*available, p.orb*available*TILT, 0, 0, Math.PI*2);
      ctx.strokeStyle = isA ? 'rgba(160,140,220,0.28)' : 'rgba(120,130,180,0.09)';
      ctx.lineWidth   = isA ? 0.70 : 0.35;
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  function drawPlanet(x, y, p, isA, t) {
    var sz = Math.max(p.sz * (H/130), p.sz * 0.65);

    if (p.atm) {
      var atmA = isA ? 0.20 : 0.10;
      var atmR = sz * 2.6 + (isA ? 5 : 0);
      var atm = ctx.createRadialGradient(x, y, sz*0.4, x, y, atmR);
      atm.addColorStop(0, p.atm + atmA + ')');
      atm.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x, y, atmR, 0, Math.PI*2);
      ctx.fillStyle = atm; ctx.fill();
    }

    if (isA) {
      ctx.globalCompositeOperation = 'screen';
      var pulse = 1 + Math.sin(t*0.0011) * 0.07;
      var glow = ctx.createRadialGradient(x, y, sz, x, y, sz*5.5*pulse);
      glow.addColorStop(0,   'rgba(160,140,220,0.28)');
      glow.addColorStop(0.4, 'rgba(120,100,180,0.07)');
      glow.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x, y, sz*5.5*pulse, 0, Math.PI*2);
      ctx.fillStyle = glow; ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    var body = ctx.createRadialGradient(x - sz*0.30, y - sz*0.28, 0, x + sz*0.08, y + sz*0.08, sz*1.08);
    body.addColorStop(0,    p.c0);
    body.addColorStop(0.45, p.c1);
    body.addColorStop(1,    p.c2);
    ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI*2);
    ctx.fillStyle = body; ctx.fill();

    var spec = ctx.createRadialGradient(x - sz*0.34, y - sz*0.34, 0, x - sz*0.16, y - sz*0.16, sz*0.52);
    spec.addColorStop(0, 'rgba(240,240,255,'+(isA ? 0.48 : 0.22)+')');
    spec.addColorStop(1, 'rgba(240,240,255,0)');
    ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI*2);
    ctx.fillStyle = spec; ctx.fill();

    var limb = ctx.createRadialGradient(x, y, sz*0.15, x, y, sz*1.05);
    limb.addColorStop(0,   'rgba(0,0,0,0)');
    limb.addColorStop(0.5, 'rgba(0,0,0,0.12)');
    limb.addColorStop(1,   'rgba(0,0,0,0.70)');
    ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI*2);
    ctx.fillStyle = limb; ctx.fill();

    if (p.label) {
      var fs = Math.max(5.5, Math.round(sz * 0.60));
      ctx.save();
      if (isA) {
        ctx.globalCompositeOperation = 'screen';
        ctx.shadowColor = 'rgba(180,160,255,0.65)'; ctx.shadowBlur = 6;
        ctx.fillStyle = 'rgba(210,200,255,0.94)';
      } else {
        ctx.fillStyle = 'rgba(150,160,200,0.42)';
      }
      ctx.font = '500 '+fs+'px "DM Mono",monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(p.label, x, y + sz + 2);
      ctx.restore();
    }
  }

  function drawPlanets(dt, t) {
    var sx = SX(), sy = SY();
    var available = W - sx;
    var items = PLANETS.map(function (p) {
      p.ang += p.spd * dt * 60;
      var orb = p.orb * available;
      return { p: p, x: sx + Math.cos(p.ang) * orb, y: sy + Math.sin(p.ang) * orb * TILT };
    }).sort(function (a, b) { return a.y - b.y; });
    items.forEach(function (item) {
      if (item.x < -30 || item.x > W+30) return;
      drawPlanet(item.x, item.y, item.p, item.p.id === activeRoute, t);
    });
  }

  var _S = { thinking: false };

  function drawSun(t) {
    var sx = SX(), sy = SY(), R = SR();
    var gm = _S.thinking ? 1 + Math.sin(t*0.005)*0.18 : 1;

    ctx.globalCompositeOperation = 'lighter';

    /* corona — soft blue-white */
    var fc = ctx.createRadialGradient(sx, sy, R*0.10, sx, sy, R*9);
    fc.addColorStop(0,    'rgba(160,180,255,'+(0.25*gm)+')');
    fc.addColorStop(0.20, 'rgba(100,120,220,'+(0.09*gm)+')');
    fc.addColorStop(0.50, 'rgba(60,80,160,'+(0.03*gm)+')');
    fc.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.ellipse(sx, sy, R*9, R*3.2, 0, 0, Math.PI*2);
    ctx.fillStyle = fc; ctx.fill();

    /* rays */
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(t*0.000020);
    for (var i = 0; i < 10; i++) {
      var a = (i/10)*Math.PI*2;
      var rl = R * (1.8 + 0.24*Math.sin(i*2.4 + t*0.00016)) * gm;
      var gr = ctx.createLinearGradient(
        Math.cos(a)*R*0.18, Math.sin(a)*R*0.18,
        Math.cos(a)*rl, Math.sin(a)*rl);
      gr.addColorStop(0,    'rgba(252,202,70,'+(0.22*gm)+')');
      gr.addColorStop(0.45, 'rgba(215,120,25,0.04)');
      gr.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.strokeStyle = gr; ctx.lineWidth = 0.80;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*R*0.18, Math.sin(a)*R*0.18);
      ctx.lineTo(Math.cos(a)*rl, Math.sin(a)*rl);
      ctx.stroke();
    }
    ctx.restore();

    /* inner halo */
    var ih = ctx.createRadialGradient(sx, sy, R*0.25, sx, sy, R*2.4);
    ih.addColorStop(0,    'rgba(255,235,148,0.92)');
    ih.addColorStop(0.22, 'rgba(252,182,50,0.62)');
    ih.addColorStop(0.56, 'rgba(195,90,16,0.20)');
    ih.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(sx, sy, R*2.4, 0, Math.PI*2);
    ctx.fillStyle = ih; ctx.fill();

    ctx.globalCompositeOperation = 'source-over';

    /* LYLA — warm gold star เหมือน reference v21 */
    var body = ctx.createRadialGradient(sx - R*0.22, sy - R*0.22, 0, sx, sy, R);
    body.addColorStop(0,    '#fff8c8');
    body.addColorStop(0.25, '#ffd035');
    body.addColorStop(0.65, '#dc6a0c');
    body.addColorStop(1,    '#7c2a06');
    ctx.beginPath(); ctx.arc(sx, sy, R, 0, Math.PI*2);
    ctx.fillStyle = body; ctx.fill();


    /* specular warm */
    var spec = ctx.createRadialGradient(sx - R*0.34, sy - R*0.34, 0, sx - R*0.16, sy - R*0.16, R*0.56);
    spec.addColorStop(0, 'rgba(255,250,235,0.52)');
    spec.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.beginPath(); ctx.arc(sx, sy, R, 0, Math.PI*2);
    ctx.fillStyle = spec; ctx.fill();

    /* limb darkening */
    var limb = ctx.createRadialGradient(sx, sy, R*0.15, sx, sy, R*1.05);
    limb.addColorStop(0,   'rgba(0,0,0,0)');
    limb.addColorStop(0.5, 'rgba(0,0,0,0.14)');
    limb.addColorStop(1,   'rgba(0,0,0,0.72)');
    ctx.beginPath(); ctx.arc(sx, sy, R, 0, Math.PI*2);
    ctx.fillStyle = limb; ctx.fill();

    /* LYLA name — อยู่เหนือดาว */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.shadowColor = 'rgba(252,192,72,0.82)'; ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(252,230,135,0.92)';
    var fs = Math.max(6, Math.round(R*0.48));
    ctx.font = '600 '+fs+'px "DM Mono",monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('LYLA \u25c6', sx, sy - R - 2);
    ctx.restore();
  }

  function drawAxiom() {
    ctx.save();
    ctx.font = '400 7.5px "DM Mono",monospace';
    ctx.fillStyle = 'rgba(140,150,220,0.18)';
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('Choice(t) \u2265 1  \u2192  collapse = False', SX()+SR()+8, H-4);
    ctx.restore();
  }
  function drawBadge() {
    ctx.save();
    ctx.font = '500 5.5px "DM Mono",monospace';
    ctx.fillStyle = 'rgba(140,150,220,0.14)';
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
    ctx.fillText('FATE\u2122  DETERMINISTIC DECISION INFRASTRUCTURE  v25', W-5, H-4);
    ctx.restore();
  }

  function loop(ts) {
    if (!lastTime) lastTime = ts;
    var dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    drawBg();
    drawStars(ts);
    drawComet(ts, dt);
    drawOrbits();
    drawPlanets(dt, ts);
    drawSun(ts);
    drawAxiom();
    drawBadge();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  window.LYLA_thinking  = function () { _S.thinking = true; };
  window.LYLA_answered  = function () { _S.thinking = false; };
  window.KD_pulse       = function (r) { _S.thinking = false; if (r) activeRoute = r; };
  window.KD_setRoute    = function (r) { activeRoute = r; };
  window.KD_council     = function () { _S.thinking = true; };
  window.KD_councilEnd  = function () { _S.thinking = false; };
  window.KD.safeVal     = function (v, d) {
    var n = +v, dec = typeof d === 'number' ? d : 2;
    return (isFinite(n) && !isNaN(n)) ? n.toFixed(dec) : '0.00';
  };
})();
