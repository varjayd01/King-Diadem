// static/dicision.js
(function () {

  function renderDicision(payload) {
    const el = document.getElementById("decision");
    if (!el) return;

    if (!payload) {
      el.textContent = "no data";
      return;
    }

    const d =
      payload.decision ||
      payload.output ||
      payload.consensus ||
      payload ||
      {};

    const text =
      "action: " + (d.action || d.final_action || "none") + "\n" +
      "message: " + (d.message || "n/a") + "\n" +
      "confidence: " + (d.confidence ?? "n/a") + "\n" +
      "risk: " + (d.risk ?? payload.risk_score ?? "n/a") + "\n" +
      "blocked: " + (d.blocked ?? payload.blocked ?? false);

    el.textContent = text;
  }

  // 👇 ใช้ตรง ๆ ได้เลย ไม่ต้อง event
  function runDicision() {
    const input = document.getElementById("input").value;

    // 🔥 fake engine (กันหน้าขาว)
    let payload;

    if (input.includes("หิว")) {
      payload = {
        decision: { action: "eat", message: "ไปกินก่อน", confidence: 0.6 }
      };
    } else if (input.includes("เหนื่อย")) {
      payload = {
        decision: { action: "rest", message: "พักก่อน", confidence: 0.6 }
      };
    } else {
      payload = {
        decision: { action: "process", message: input, confidence: 0.5 }
      };
    }

    renderDicision(payload);
  }

  window.runDicision = runDicision;

})();
