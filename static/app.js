async function runEngine() {

    const data = {
        username: "guest",
        location: location.value,
        food: food.value,
        money: money.value,
        risk: risk.value
    }

    const r = await fetch("/ENGINE", {
        method:"POST",
        headers:{ "Content-Type":"application/json"},
        body: JSON.stringify(data)
    })

    const d = await r.json()

    document.getElementById("output").innerText =
        JSON.stringify(d, null, 2)

    system.speed = d.decision.orbit_speed || 1
}

function pay(){
    window.location.href="/pay"
}


// ===== COSMOS =====
const canvas = document.getElementById("cosmos")
const ctx = canvas.getContext("2d")

canvas.width = innerWidth
canvas.height = innerHeight

let system = { speed:1 }
let t = 0

const stars = Array.from({length:50}, (_,i)=>({
    r: 50 + i*10,
    a: Math.random()*6.28,
    s: Math.random()*0.002,
    c: `hsl(${Math.random()*360},100%,60%)`
}))

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height)

    let cx = canvas.width/2
    let cy = canvas.height/2

    t+=0.01

    stars.forEach(st=>{
        st.a += st.s * system.speed

        let x = cx + Math.cos(st.a)*st.r
        let y = cy + Math.sin(st.a)*st.r

        ctx.beginPath()
        ctx.arc(x,y,2+Math.sin(t+st.a)*2,0,6.28)
        ctx.fillStyle = st.c
        ctx.fill()
    })

    requestAnimationFrame(draw)
}

draw()
