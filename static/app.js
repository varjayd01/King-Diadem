let currentUser = ""

function show(msg){
    document.getElementById("out").innerText = msg
}

// ===== REGISTER =====
async function reg(){
    const f = new FormData()
    f.append("username", document.getElementById("r_user").value)
    f.append("password", document.getElementById("r_pass").value)

    const res = await fetch('/register',{
        method:'POST',
        body:f
    })

    const data = await res.json()
    show(JSON.stringify(data,null,2))
}

// ===== LOGIN =====
async function login(){
    const f = new FormData()
    f.append("username", document.getElementById("l_user").value)
    f.append("password", document.getElementById("l_pass").value)

    const res = await fetch('/login',{
        method:'POST',
        body:f
    })

    const data = await res.json()

    if(data.status === "ok"){
        currentUser = document.getElementById("l_user").value
        show("✅ LOGIN SUCCESS")
    }else{
        show(JSON.stringify(data,null,2))
    }
}

// ===== ENGINE =====
async function run(){
    if(!currentUser){
        show("❌ LOGIN ก่อน")
        return
    }

    const res = await fetch('/ENGINE',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            location: document.getElementById("location").value,
            food: document.getElementById("food").value,
            money: parseInt(document.getElementById("money").value || 0),
            risk: parseInt(document.getElementById("risk").value || 0),
            username: currentUser
        })
    })

    const data = await res.json()
    show(JSON.stringify(data,null,2))
}
