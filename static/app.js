// static/app.js
async function run() {
  const payload = window.KD.readInputs();

  window.KD.setText("thinking", "Processing...");
  window.KD.setText("summary", "Running core...");
  window.KD.writeJSON("output", payload);

  try {
    const response = await fetch(window.KD.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    window.KD.setState(data);
    window.KD.writeJSON("output", data);
    window.KD.writeJSON("decision", data.decision || {});
    window.KD.writeJSON("council", data.council || {});

    const status = data.status || "ok";
    const action = data.output?.action || data.consensus?.final_action || "none";
    const reason = data.output?.reason || data.reason || "clear";

    window.KD.setText("summary", `status=${status} | action=${action} | reason=${reason}`);
    window.KD.setText("thinking", "Done.");

  } catch (error) {
    const msg = `ERROR: ${error?.message || error}`;
    window.KD.setText("thinking", "Failed.");
    window.KD.setText("summary", msg);
    window.KD.setText("output", msg);
  }
}

function resetSystem() {
  ["input", "entropy", "resource", "stability", "choices", "confidence"].forEach((id) => {
    const el = window.KD.byId(id);
    if (!el) return;
    if (id === "input") el.value = "";
    if (id === "entropy") el.value = 40;
    if (id === "resource") el.value = 50;
    if (id === "stability") el.value = 60;
    if (id === "choices") el.value = 1;
    if (id === "confidence") el.value = 0.5;
  });

  window.KD.setText("thinking", "Ready.");
  window.KD.setText("summary", "Waiting...");
  window.KD.setText("decision", "Waiting...");
  window.KD.setText("council", "Waiting...");
  window.KD.setText("output", "Waiting...");
}

window.run = run;
window.resetSystem = resetSystem;

document.addEventListener("DOMContentLoaded", () => {
  window.KD.bind("runBtn", "click", run);
  window.KD.bind("resetBtn", "click", resetSystem);
});
