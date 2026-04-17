// static/decision.js
(function () {

  function renderDecision(payload) {
    const target = window.KD?.byId("decision");
    if (!target) return;

    const decision = payload?.decision || payload?.output || payload || {};

    const lines = [
      `status: ${payload?.status || "ok"}`,
      `action: ${decision.action || decision.final_action || "none"}`,
      `message: ${decision.message || "n/a"}`,
      `confidence: ${decision.confidence ?? "n/a"}`,
      `blocked: ${decision.blocked ?? payload?.blocked ?? false}`,
      `risk: ${decision.risk ?? "n/a"}`
    ];

    target.textContent = lines.join("\n");
  }

  // expose globally
  window.renderDecision = renderDecision;

  // event hook
  window.addEventListener("KD:response", (event) => {
    renderDecision(event.detail);
  });

})();
