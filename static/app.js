async function run() {
    let input = document.getElementById("input").value;

    let res = await fetch("/ask", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({input})
    });

    let data = await res.json();

    document.getElementById("decision").innerText = data.decision;
    document.getElementById("survival").innerText = data.survival;
    document.getElementById("risk").innerText = data.risk;
}
