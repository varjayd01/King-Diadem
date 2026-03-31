const API_KEY = "ใส่ api_key";
const MODE = "chat"; // เปลี่ยนเป็น decision ได้

async function send(){

const msg=document.getElementById("msg").value
const chat=document.getElementById("chat")

chat.innerHTML+=`<div>🧑 ${msg}</div>`

const res=await fetch("/decision",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
api_key:API_KEY,
question:msg,
mode:MODE
})
})

const data=await res.json()

if(data.type==="chat"){
chat.innerHTML+=`<div>🤖 ${data.reply}</div>`
}
else{
chat.innerHTML+=`<div>👑 ${data.reply.text}</div>`
}
}
