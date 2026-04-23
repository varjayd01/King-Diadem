async function run() {
    const input = document.getElementById("input").value
    const energy = document.getElementById("energy").value
    const food = document.getElementById("food").checked
    const safe = document.getElementById("safe").checked
    const mode = document.getElementById("mode").value

    const res = await fetch("/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            input, energy, food, safe, mode
        })
    })

    const data = await res.json()
    document.getElementById("output").innerText = JSON.stringify(data, null, 2)
}
