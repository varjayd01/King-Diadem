async function askAI() {

    const input = document.getElementById("question")

    const question = input.value

    if (!question) return

    const response = await fetch("/ask", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question: question
        })
    })

    const data = await response.json()

    renderOptions(data.options)

}


function renderOptions(options){

    const container = document.getElementById("result")

    container.innerHTML = ""

    options.forEach((opt,i)=>{

        const div = document.createElement("div")

        div.className="option"

        div.innerHTML = (i+1)+". "+opt

        container.appendChild(div)

    })

}


async function loadFreedom(){

    const res = await fetch("/freedom")

    const data = await res.json()

    const el = document.getElementById("freedom")

    if(!el) return

    el.innerHTML =
        "Freedom Index: "+data.freedom_index+
        " ("+data.status+")"

}


async function loadGalaxy(){

    const res = await fetch("/galaxy")

    const data = await res.json()

    console.log("Galaxy Nodes:",data)

}


async function loadDecisionMap(){

    const res = await fetch("/decision/map")

    const data = await res.json()

    console.log("Decision Map:",data)

}


window.onload=function(){

    loadFreedom()

    loadGalaxy()

    loadDecisionMap()

}
