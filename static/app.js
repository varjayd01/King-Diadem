async function ask(){

let q=document.getElementById("question").value

let thinking=document.getElementById("thinking")
thinking.innerText="กำลังวิเคราะห์ทางเลือก..."

let res=await fetch("/ask",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({question:q})
})

let data=await res.json()

thinking.innerText=""

let box=document.getElementById("response")

box.innerText=data.answer

}

/* CHAT */
async function send(){

let name=document.getElementById("name").value
let msg=document.getElementById("message").value

await fetch("/chat",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({name:name,message:msg})
})

document.getElementById("messages").innerHTML += `<p>${name}: ${msg}</p>`
}

/* FAKE LOGIN (สำหรับ TEST) */
function fakeLogin(type){
document.getElementById("loginStatus").innerText = "Logged in with " + type
}
