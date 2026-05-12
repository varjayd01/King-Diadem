// static/galaxy.js — KING DIADEM Solar System
(function () {
  const canvas = document.getElementById("galaxy") || document.getElementById("solar");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); addEventListener("resize", resize);

  // ── STARS ─────────────────────────────────────────────────────
  const STARS = Array.from({length:700}, () => ({
    x: Math.random()*4000-2000, y: Math.random()*4000-2000,
    s: Math.random()*1.6+0.2,
    a: Math.random()*0.8+0.1,
    f: (Math.random()-0.5)*0.005,
    c: Math.random()>0.85?"255,160,60":Math.random()>0.6?"180,200,255":"255,255,255"
  }));

  // ── MILKY WAY BAND ────────────────────────────────────────────
  const BAND = Array.from({length:400}, () => ({
    x: (Math.random()-0.5)*5000, y: (Math.random()-0.5)*600,
    s: Math.random()*1.0+0.2,
    a: Math.random()*0.2+0.02,
    c: Math.random()>0.5?"200,180,255":"255,220,180"
  }));

  // ── NEBULA CLOUDS ─────────────────────────────────────────────
  const NEBULA = [
    {x:-320,y:-180,r:200,c:"255,60,0",  a:0.07},
    {x:380, y:160, r:240,c:"0,80,200",  a:0.08},
    {x:-80, y:280, r:160,c:"120,0,200", a:0.06},
    {x:580, y:-80, r:210,c:"0,140,80",  a:0.05},
    {x:-480,y:120, r:270,c:"200,100,0", a:0.06},
    {x:200, y:-300,r:180,c:"0,180,255", a:0.04},
  ];

  // ── SOLAR SYSTEM ──────────────────────────────────────────────
  const PLANETS = [
    {name:"",         color:"#b5b5b5", size:4,  orbit:75,  speed:0.0045, angle:0,    rings:false},
    {name:"",         color:"#e8c570", size:7,  orbit:120, speed:0.0035, angle:1.2,  rings:false},
    {name:"",         color:"#4488ff", size:8,  orbit:175, speed:0.0025, angle:2.5,  rings:false, moon:true},
    {name:"",         color:"#cc4422", size:5,  orbit:230, speed:0.002,  angle:4.0,  rings:false},
    {name:"",         color:"#c8a060", size:17, orbit:320, speed:0.001,  angle:1.8,  rings:false},
    {name:"",         color:"#e8d090", size:13, orbit:420, speed:0.0007, angle:3.2,  rings:true},
    {name:"",         color:"#88ddee", size:10, orbit:510, speed:0.0005, angle:5.5,  rings:false},
    {name:"",         color:"#2244cc", size:9,  orbit:590, speed:0.0003, angle:2.8,  rings:false},
    // KD nodes
    {name:"LYLA",     color:"#00d4ff", size:6,  orbit:155, speed:0.0018, angle:0.5,  rings:false, kd:true},
    {name:"VEGA",     color:"#ffd27f", size:5,  orbit:275, speed:0.0014, angle:3.5,  rings:false, kd:true},
    {name:"DRIFTZERO",color:"#ff6a00", size:3,  orbit:200, speed:0.003,  angle:1.0,  rings:false, kd:true},
    {name:"CIVIL",    color:"#9999ff", size:4,  orbit:460, speed:0.0004, angle:4.5,  rings:false, kd:true},
  ];

  const SUN_R = 26, SUN_GLOW = 85;
  let frame = 0;

  function draw() {
    frame++;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const cx = canvas.width/2, cy = canvas.height/2;

    // Milky Way band
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(0.28);
    for(const b of BAND){
      ctx.beginPath();
      ctx.arc(b.x,b.y,b.s,0,Math.PI*2);
      ctx.fillStyle=`rgba(${b.c},${b.a})`;
      ctx.fill();
    }
    ctx.restore();

    // Nebula
    for(const n of NEBULA){
      const g=ctx.createRadialGradient(cx+n.x,cy+n.y,0,cx+n.x,cy+n.y,n.r);
      g.addColorStop(0,`rgba(${n.c},${n.a})`);
      g.addColorStop(0.5,`rgba(${n.c},${n.a*0.3})`);
      g.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(cx+n.x,cy+n.y,n.r,0,Math.PI*2);
      ctx.fillStyle=g; ctx.fill();
    }

    // Stars
    for(const s of STARS){
      s.a=Math.max(0.05,Math.min(0.9,s.a+s.f));
      if(s.a<=0.05||s.a>=0.9) s.f*=-1;
      ctx.beginPath();
      ctx.arc((cx+s.x)%canvas.width,(cy+s.y)%canvas.height,s.s,0,Math.PI*2);
      ctx.fillStyle=`rgba(${s.c},${s.a*0.65})`;
      ctx.fill();
    }

    // Orbit rings
    for(const p of PLANETS){
      ctx.beginPath();
      ctx.ellipse(cx,cy,p.orbit,p.orbit*0.28,0,0,Math.PI*2);
      ctx.strokeStyle=p.kd?"rgba(0,212,255,0.07)":"rgba(255,255,255,0.035)";
      ctx.lineWidth=1; ctx.stroke();
    }

    // Sun rays
    for(let i=0;i<12;i++){
      const a=(frame*0.002)+i*(Math.PI*2/12);
      const len=SUN_GLOW+Math.sin(frame*0.01+i)*18;
      ctx.beginPath();
      ctx.moveTo(cx+Math.cos(a)*SUN_R,cy+Math.sin(a)*SUN_R);
      ctx.lineTo(cx+Math.cos(a)*len,cy+Math.sin(a)*len);
      ctx.strokeStyle=`rgba(255,200,80,${0.04+Math.sin(frame*0.02+i)*0.015})`;
      ctx.lineWidth=1.5; ctx.stroke();
    }

    // Sun corona
    const corona=ctx.createRadialGradient(cx,cy,SUN_R*0.5,cx,cy,SUN_GLOW*2);
    corona.addColorStop(0,"rgba(255,200,50,0.22)");
    corona.addColorStop(0.3,"rgba(255,100,20,0.10)");
    corona.addColorStop(1,"transparent");
    ctx.beginPath(); ctx.arc(cx,cy,SUN_GLOW*2,0,Math.PI*2);
    ctx.fillStyle=corona; ctx.fill();

    // Sun body
    const sunG=ctx.createRadialGradient(cx-SUN_R*0.3,cy-SUN_R*0.3,0,cx,cy,SUN_R);
    sunG.addColorStop(0,"#fff8e0");
    sunG.addColorStop(0.4,"#ffcc44");
    sunG.addColorStop(0.7,"#ff8800");
    sunG.addColorStop(1,"#cc4400");
    ctx.beginPath(); ctx.arc(cx,cy,SUN_R,0,Math.PI*2);
    ctx.fillStyle=sunG; ctx.fill();

    // Planets
    for(const p of PLANETS){
      p.angle+=p.speed;
      const x=cx+Math.cos(p.angle)*p.orbit;
      const y=cy+Math.sin(p.angle)*p.orbit*0.28;

      // Atmosphere glow
      const ag=ctx.createRadialGradient(x,y,0,x,y,p.size*3.5);
      ag.addColorStop(0,p.color+"44");
      ag.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(x,y,p.size*3.5,0,Math.PI*2);
      ctx.fillStyle=ag; ctx.fill();

      // Body
      const pg=ctx.createRadialGradient(x-p.size*0.3,y-p.size*0.3,0,x,y,p.size);
      pg.addColorStop(0,p.color+"ff");
      pg.addColorStop(0.6,p.color+"cc");
      pg.addColorStop(1,p.color+"44");
      ctx.beginPath(); ctx.arc(x,y,p.size,0,Math.PI*2);
      ctx.fillStyle=pg; ctx.fill();

      // Saturn rings
      if(p.rings){
        ctx.save();
        ctx.translate(x,y); ctx.scale(1,0.28);
        ctx.beginPath(); ctx.ellipse(0,0,p.size*2.4,p.size*2.4,0,0,Math.PI*2);
        ctx.strokeStyle="rgba(232,208,144,0.55)"; ctx.lineWidth=3; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(0,0,p.size*3.0,p.size*3.0,0,0,Math.PI*2);
        ctx.strokeStyle="rgba(232,208,144,0.25)"; ctx.lineWidth=2; ctx.stroke();
        ctx.restore();
      }

      // Moon (Earth)
      if(p.moon){
        const ma=p.angle*8;
        const mx=x+Math.cos(ma)*20, my=y+Math.sin(ma)*6;
        ctx.beginPath(); ctx.arc(mx,my,2.5,0,Math.PI*2);
        ctx.fillStyle="rgba(200,200,200,0.75)"; ctx.fill();
      }

      // KD labels
      if(p.kd){
        ctx.fillStyle="rgba(200,240,255,0.5)";
        ctx.font="7px 'Share Tech Mono',monospace";
        ctx.fillText(p.name,x+p.size+3,y+3);
      }
    }

    // Supply chain pulse every 200 frames
    if(frame%200===0){
      let ripR=0, ripA=0.12;
      (function ripple(){
        ripR+=4; ripA-=0.003;
        if(ripR<500&&ripA>0){
          ctx.beginPath(); ctx.arc(cx,cy,ripR,0,Math.PI*2);
          ctx.strokeStyle=`rgba(0,212,255,${ripA})`;
          ctx.lineWidth=1; ctx.stroke();
          requestAnimationFrame(ripple);
        }
      })();
    }

    requestAnimationFrame(draw);
  }

  draw();
})();
