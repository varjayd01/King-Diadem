// ASK
async function ask(){

let q=document.getElementById("q").value

let res=await fetch("/ask",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({question:q})
})

let data=await res.json()

document.getElementById("res").innerText=data.answer
}

// NOTE SYSTEM
function process(){

let t=document.getElementById("note").value

let arr=t.split(/,|\n|และ/)

let html=""

arr.forEach(x=>{
html+=`<p>☑ ${x}</p>`
})

document.getElementById("out").innerHTML=html
}

// SAVE PERSONA
async function save(){

let name=document.getElementById("name").value
let style=document.getElementById("style").value

await fetch("/save_profile",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({name,style})
})

alert("saved")
}
