async function run() {
  const text = document.getElementById("input").value;

  const res = await fetch("/decision", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ input: text })
  });

  const data = await res.json();

  // 🔥 FIX ตัวที่พี่พัง
  document.getElementById("tier").innerText = "Tier: " + (data.tier || "N/A");
  document.getElementById("risk").innerText = "Risk: " + (data.risk ?? 0);

  log(data.response || "NO RESPONSE");
}

function stop() {
  log("⛔ STOP");
}

function log(msg) {
  const box = document.getElementById("log");
  box.innerHTML += "<div>> " + msg + "</div>";
}
