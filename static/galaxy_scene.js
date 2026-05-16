/* ============================================================
   KING DIADEM — galaxy_scene.js  v4.0
   Canvas-first. ไม่พึ่ง CSS overlay ใดๆ
   วาด background + nebula + stars + solar system ใน canvas ล้วนๆ
   ============================================================ */
(function () {
  if (typeof THREE !== 'undefined') return;

  /* รอ DOM พร้อม */
  function boot() {
    const canvas = document.getElementById('galaxy');
    if (!canvas) { setTimeout(boot, 80); return; }

    /* ── Force canvas ให้อยู่บนสุด ── */
    canvas.style.cssText = [
      'position:fixed','inset:0','width:100%','height:100%',
      'display:block','z-index:0','pointer-events:none'
    ].join(';');

    const ctx = canvas.getContext('2d', { alpha: false });
    let W, H, cx, cy, S;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cx = W * 0.50;
      cy = H * 0.50;
      S  = Math.min(W, H) * 0.44;
    }
    resize();
    window.addEventListener('resize', resize);

    /* ════════════════════════════════════
       STARS
    ════════════════════════════════════ */
    const STAR_N = Math.min(6500, 3600 + Math.floor(window.innerWidth * window.innerHeight / 2600));
    const stars  = Array.from({ length: STAR_N }, () => {
      const z  = 0.12 + Math.random() * 0.88;
      const lyr = z < 0.35 ? 0 : z < 0.70 ? 1 : 2;
      const t  = Math.random();
      let rc, gc, bc;
      if      (t < 0.05) { rc=160; gc=200; bc=255; }   // blue giant
      else if (t < 0.10) { rc=255; gc=160; bc=80;  }   // orange
      else if (t < 0.14) { rc=255; gc=100; bc=100; }   // red
      else if (Math.random() > 0.45) { rc=255; gc=235; bc=200; } // warm
      else               { rc=210; gc=228; bc=255; }   // cool white
      return {
        x: Math.random(), y: Math.random(), z, lyr,
        s:  0.4 + Math.pow(Math.random(), 1.15) * 2.6,
        tw: Math.random() * Math.PI * 2,
        sp: 0.007 + Math.random() * 0.035,
        vx: (Math.random() - 0.5) * 0.000042,
        rc, gc, bc,
        bright: Math.random() > 0.85
      };
    });

    /* ════════════════════════════════════
       PLANETS  (Kepler)
    ════════════════════════════════════ */
    const REF_MS = 60000;
    const refIdx = 2;
    const PLANETS = [
      { a:0.16, b:0.140, orn:0.08,  r:3.6,  rgb:[190,205,255], ring:0, ph:Math.random()*6.28 },
      { a:0.24, b:0.200, orn:0.03,  r:4.2,  rgb:[255,120,85],  ring:0, ph:Math.random()*6.28 },
      { a:0.32, b:0.275, orn:0.11,  r:6.2,  rgb:[200,165,110], ring:1, ph:Math.random()*6.28 },
      { a:0.42, b:0.345, orn:0.05,  r:4.8,  rgb:[60,125,255],  ring:0, ph:Math.random()*6.28 },
      { a:0.54, b:0.405, orn:0.025, r:3.8,  rgb:[190,100,190], ring:0, ph:Math.random()*6.28 },
      { a:0.67, b:0.490, orn:0.13,  r:3.0,  rgb:[140,205,255], ring:0, ph:Math.random()*6.28 },
      { a:0.82, b:0.560, orn:0.065, r:2.6,  rgb:[165,175,210], ring:0, ph:Math.random()*6.28 },
    ];
    const refMean = (PLANETS[refIdx].a + PLANETS[refIdx].b) * 0.5;
    for (const p of PLANETS) {
      const m = (p.a + p.b) * 0.5;
      p.period = REF_MS * Math.pow(Math.max(0.08, m) / refMean, 1.5);
    }

    /* asteroid belt */
    const BELT = Array.from({ length: 480 }, () => ({
      g:  0.475 + Math.random() * 0.13,
      ph: Math.random() * 6.28,
      sp: 0.000032 + Math.random() * 0.00006,
      sz: 0.3 + Math.random() * 0.85
    }));

    /* shooting stars */
    const SHOOTS = [];
    function spawnShoot() {
      if (SHOOTS.length < 3)
        SHOOTS.push({ x:Math.random()*W, y:Math.random()*H*0.45,
          vx:3+Math.random()*5, vy:1.4+Math.random()*2.8,
          len:55+Math.random()*95, life:1, decay:0.015+Math.random()*0.018 });
    }
    setInterval(spawnShoot, 3500 + Math.random() * 4500);

    /* ════════════════════════════════════
       DRAW — BACKGROUND
    ════════════════════════════════════ */
    function drawBG() {
      /* vignette deep space */
      const bg = ctx.createRadialGradient(cx, cy*0.6, 0, cx, cy, Math.max(W,H)*0.88);
      bg.addColorStop(0,   '#0d0818');
      bg.addColorStop(0.5, '#060412');
      bg.addColorStop(1,   '#01010a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
    }

    /* ════════════════════════════════════
       DRAW — MILKY WAY
    ════════════════════════════════════ */
    function drawMilky(t) {
      ctx.save();
      ctx.translate(W*0.12, H*0.02);
      ctx.rotate(-0.36 + Math.sin(t*0.000016)*0.009);
      const bw = Math.max(W,H)*2.1, bh = H*0.62;
      const g  = ctx.createLinearGradient(0, -bh*0.5, 0, bh*0.5);
      g.addColorStop(0,    'rgba(0,0,0,0)');
      g.addColorStop(0.25, 'rgba(100,55,175,0.12)');
      g.addColorStop(0.50, 'rgba(22,185,168,0.15)');
      g.addColorStop(0.68, 'rgba(245,155,70,0.12)');
      g.addColorStop(0.86, 'rgba(245,210,160,0.05)');
      g.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(-bw*0.18, -bh, bw, bh*2);
      ctx.globalCompositeOperation = 'lighter';
      const g2 = ctx.createLinearGradient(bw*0.25, 0, bw*0.75, 0);
      g2.addColorStop(0,   'rgba(0,0,0,0)');
      g2.addColorStop(0.5, 'rgba(255,255,255,0.045)');
      g2.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(-bw*0.18, -bh, bw, bh*2);
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';
    }

    /* ════════════════════════════════════
       DRAW — NEBULA (inside canvas, ไม่ใช่ CSS)
       โปร่งแสงมาก — เห็นดาวทะลุ
    ════════════════════════════════════ */
    function drawNebula() {
      const blobs = [
        { ox:0.08, oy:0.15, rx:0.36, ry:0.28, rot:0.28,  c:'rgba(28,150,210,0.11)'  },
        { ox:0.90, oy:0.20, rx:0.30, ry:0.25, rot:-0.18, c:'rgba(250,105,45,0.10)'  },
        { ox:0.50, oy:0.50, rx:0.70, ry:0.55, rot:0.08,  c:'rgba(110,50,180,0.07)'  },
        { ox:0.18, oy:0.80, rx:0.28, ry:0.22, rot:0.44,  c:'rgba(245,185,110,0.09)' },
        { ox:0.78, oy:0.75, rx:0.26, ry:0.20, rot:-0.38, c:'rgba(55,145,250,0.08)'  },
        { ox:0.38, oy:0.95, rx:0.42, ry:0.18, rot:0.12,  c:'rgba(40,210,190,0.08)'  },
      ];
      ctx.globalCompositeOperation = 'screen';
      for (const b of blobs) {
        const nx  = b.ox*W, ny = b.oy*H;
        const rrx = Math.max(W,H)*b.rx, rry = Math.max(W,H)*b.ry;
        const gr  = ctx.createRadialGradient(nx, ny, 0, nx, ny, rrx);
        gr.addColorStop(0, b.c);
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save();
        ctx.translate(nx, ny); ctx.rotate(b.rot);
        ctx.scale(1, rry/rrx); ctx.translate(-nx, -ny);
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(nx, ny, rrx, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    /* ════════════════════════════════════
       DRAW — STARS
    ════════════════════════════════════ */
    function drawStars(t) {
      const drift = t * 0.000014;
      for (const s of stars) {
        const par = s.lyr===0 ? 0.009 : s.lyr===1 ? 0.022 : 0.040;
        const px  = ((s.x + drift*par + s.vx*t) % 1 + 1) % 1 * W;
        const py  = s.y * H;
        const tw  = 0.5 + 0.5 * Math.sin(t * s.sp + s.tw);
        const sc  = Math.max(0.35, s.s * s.z * tw * (0.82 + s.lyr*0.12));
        const al  = Math.min(1, 0.22 + 0.76 * s.z * tw);

        ctx.beginPath();
        ctx.arc(px, py, sc, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${s.rc},${s.gc},${s.bc},${al.toFixed(2)})`;
        ctx.fill();

        /* diffraction spike สำหรับดาวสว่าง */
        if (s.bright && s.z > 0.74 && tw > 0.78) {
          const arm = sc * 2.6;
          ctx.strokeStyle = `rgba(255,248,225,${(0.14*al).toFixed(2)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(px-arm, py); ctx.lineTo(px+arm, py);
          ctx.moveTo(px, py-arm); ctx.lineTo(px, py+arm);
          ctx.stroke();
        }
      }
    }

    /* ════════════════════════════════════
       DRAW — SHOOTING STARS
    ════════════════════════════════════ */
    function drawShoots() {
      for (let i = SHOOTS.length-1; i >= 0; i--) {
        const s = SHOOTS[i];
        s.x += s.vx; s.y += s.vy; s.life -= s.decay;
        if (s.life <= 0) { SHOOTS.splice(i,1); continue; }
        const tx = s.x - s.vx*s.len*0.09, ty = s.y - s.vy*s.len*0.09;
        const tail = ctx.createLinearGradient(tx, ty, s.x, s.y);
        tail.addColorStop(0, 'rgba(255,255,255,0)');
        tail.addColorStop(1, `rgba(255,255,215,${(s.life*0.85).toFixed(2)})`);
        ctx.strokeStyle = tail; ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(s.x, s.y); ctx.stroke();
      }
    }

    /* ════════════════════════════════════
       DRAW — SUN
    ════════════════════════════════════ */
    function drawSun(t) {
      const pulse = 1 + 0.046*Math.sin(t*0.00080);
      const R     = Math.min(W,H) * 0.132 * pulse;
      const spin  = (t/REF_MS)*Math.PI*2;

      /* corona rays */
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(spin*0.30);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 48; i++) {
        const a  = (i/48)*Math.PI*2;
        const w  = R*(1.82 + 0.52*Math.sin(i*1.618 + t*0.00022));
        const x0 = Math.cos(a)*R*0.18, y0 = Math.sin(a)*R*0.18;
        const x1 = Math.cos(a)*w,      y1 = Math.sin(a)*w;
        const gr = ctx.createLinearGradient(x0,y0,x1,y1);
        gr.addColorStop(0,   'rgba(255,238,195,0.22)');
        gr.addColorStop(0.4, 'rgba(255,128,48,0.09)');
        gr.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.strokeStyle = gr; ctx.lineWidth = 1.7;
        ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
      }
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';

      /* outer halo */
      const cor = ctx.createRadialGradient(cx,cy, R*0.04, cx,cy, R*2.35);
      cor.addColorStop(0,    'rgba(255,255,245,0.94)');
      cor.addColorStop(0.06, '#ffeaa8');
      cor.addColorStop(0.18, '#ffb640');
      cor.addColorStop(0.38, '#ff5a18');
      cor.addColorStop(0.62, '#a81000');
      cor.addColorStop(1,    'rgba(18,0,12,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath(); ctx.arc(cx,cy,R*2.15,0,Math.PI*2);
      ctx.fillStyle = cor; ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      /* core */
      const core = ctx.createRadialGradient(cx-R*0.13,cy-R*0.13,0, cx,cy,R*0.58);
      core.addColorStop(0,    '#fffef6');
      core.addColorStop(0.18, '#ffde58');
      core.addColorStop(0.48, '#ff7615');
      core.addColorStop(1,    '#760b00');
      ctx.beginPath(); ctx.arc(cx,cy,R*0.56,0,Math.PI*2);
      ctx.fillStyle = core; ctx.fill();
    }

    /* ════════════════════════════════════
       DRAW — ORBITS + BELT + PLANETS
    ════════════════════════════════════ */
    function pXY(p, t) {
      const ang = (t/p.period)*Math.PI*2 + p.ph;
      const xe  = Math.cos(ang)*p.a*S, ye = Math.sin(ang)*p.b*S;
      const co  = Math.cos(p.orn), si = Math.sin(p.orn);
      return { x: cx+xe*co-ye*si, y: cy+xe*si+ye*co, ang };
    }

    function drawOrbits() {
      for (const p of PLANETS) {
        ctx.save();
        ctx.translate(cx,cy); ctx.rotate(p.orn);
        ctx.strokeStyle = 'rgba(255,242,218,0.09)';
        ctx.lineWidth = 0.75; ctx.setLineDash([3,9]);
        ctx.beginPath();
        ctx.ellipse(0,0,p.a*S,p.b*S,0,0,Math.PI*2); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
      }
    }

    function drawBelt(t) {
      ctx.fillStyle = 'rgba(215,208,240,0.28)';
      for (const ro of BELT) {
        const ang = ro.ph + t*ro.sp;
        const rr  = ro.g*S;
        const xe  = Math.cos(ang)*rr, ye = Math.sin(ang)*rr*0.88;
        const co  = Math.cos(0.09), si = Math.sin(0.09);
        ctx.fillRect(cx+xe*co-ye*si, cy+xe*si+ye*co, ro.sz, ro.sz);
      }
    }

    function drawRings(x,y,r,ang) {
      ctx.save();
      ctx.translate(x,y); ctx.rotate(ang*0.58+0.5); ctx.scale(1,0.33);
      ctx.strokeStyle='rgba(238,218,180,0.42)'; ctx.lineWidth=2.0;
      ctx.beginPath(); ctx.arc(0,0,r*2.55,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle='rgba(195,170,120,0.28)'; ctx.lineWidth=3.2;
      ctx.beginPath(); ctx.arc(0,0,r*2.14,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle='rgba(155,135,95,0.15)'; ctx.lineWidth=1.4;
      ctx.beginPath(); ctx.arc(0,0,r*1.76,0,Math.PI*2); ctx.stroke();
      ctx.restore();
    }

    function drawPlanet(x,y,r,rgb,p,ang) {
      const dx=cx-x, dy=cy-y, dist=Math.hypot(dx,dy)||1;
      const lx=dx/dist, ly=dy/dist;
      const gx=x-lx*r*0.86, gy=y-ly*r*0.86;

      /* body */
      const lit = ctx.createRadialGradient(gx,gy,r*0.07,x,y,r*1.10);
      lit.addColorStop(0,   'rgba(255,255,255,0.86)');
      lit.addColorStop(0.30,'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',1)');
      lit.addColorStop(1,   'rgba('+Math.floor(rgb[0]*0.20)+','+Math.floor(rgb[1]*0.18)+','+Math.floor(rgb[2]*0.24)+',1)');
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle=lit; ctx.fill();

      /* shadow */
      ctx.save(); ctx.translate(x,y); ctx.rotate(ang*0.36+p.ph);
      ctx.globalCompositeOperation='multiply';
      ctx.fillStyle='rgba(0,3,14,0.36)';
      ctx.beginPath(); ctx.ellipse(-r*0.30,0,r*1.02,r*0.88,0,0,Math.PI*2); ctx.fill();
      ctx.restore(); ctx.globalCompositeOperation='source-over';

      /* atmosphere rim */
      const atm=ctx.createRadialGradient(x,y,r*0.82,x,y,r*1.50);
      atm.addColorStop(0,'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0.20)');
      atm.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x,y,r*1.50,0,Math.PI*2);
      ctx.fillStyle=atm; ctx.fill();

      /* glow */
      const gw=ctx.createRadialGradient(x,y,0,x,y,r*4.5);
      gw.addColorStop(0,'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0.28)');
      gw.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x,y,r*4.5,0,Math.PI*2);
      ctx.fillStyle=gw; ctx.fill();
    }

    function drawPlanets(t) {
      const order = PLANETS.map((p,i)=>({p,y:pXY(p,t).y})).sort((a,b)=>a.y-b.y);
      for (const {p} of order) {
        const {x,y,ang} = pXY(p,t);
        if (p.ring) drawRings(x,y,p.r,ang);
        drawPlanet(x,y,p.r,p.rgb,p,ang);
      }
    }

    /* ════════════════════════════════════
       MAIN LOOP
    ════════════════════════════════════ */
    function frame(t) {
      drawBG();
      drawMilky(t);
      drawNebula();
      drawStars(t);
      drawShoots();

      /* หมุนระบบสุริยะรอบกลางจอ */
      const deck = (t/REF_MS)*0.07;
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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
