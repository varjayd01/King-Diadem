const API_KEY = "ใส่_api_key_พี่";
const MODE = "chat"; // chat หรือ decision

async function send(){

const msgInput = document.getElementById("msg")
const chat = document.getElementById("chat")

const text = msgInput.value
if(!text) return

// user
chat.innerHTML += `<div class="msg user">🧑 ${text}</div>`

msgInput.value=""

// scroll
chat.scrollTop = chat.scrollHeight

// call API
const res = await fetch("/decision", {
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
api_key:API_KEY,
question:text,
mode:MODE
})
})

const data = await res.json()

// bot
if(data.type === "chat"){
chat.innerHTML += `<div class="msg bot">🤖 ${data.reply}</div>`
}else{
chat.innerHTML += `<div class="msg bot">👑 ${data.reply.text}</div>`
}

// scroll
chat.scrollTop = chat.scrollHeight
}
