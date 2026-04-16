async function runEngine() {

    const username = localStorage.getItem("user")
    if (!username) {
        alert("login first")
        return
    }

    const data = {
        username,
        location: document.getElementById("location").value,
        food: document.getElementById("food").value,
        money: document.getElementById("money").value,
        risk: document.getElementById("risk").value
    }

    const r = await fetch("/ENGINE", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })

    const d = await r.json()

    console.log("FULL SYSTEM:", d)

    // 🔥 แสดง decision
    let output = "=== DECISION ===\n"
    output += JSON.stringify(d.decision, null, 2)

    // 🔥 tool
    output += "\n\n=== TOOL ===\n"
    output += JSON.stringify(d.tool_execution, null, 2)

    // 🔥 system risk
    output += "\n\n=== SYSTEM RISK ===\n"
    output += JSON.stringify(d.system_risk, null, 2)

    alert(output)
}
