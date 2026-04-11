document.getElementById('runDecision').addEventListener('click', async () => {
    const outputDiv = document.getElementById('output');
    outputDiv.innerText = "PROCESSING VIA ENGINE...";

    try {
        const response = await fetch('/api/decision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ drift: 0.1, exposure: 0.5, remaining_choices: 10 })
        });
        const result = await response.json();
        outputDiv.innerHTML = `<strong>RESULT:</strong> ${result.decision} <br> <strong>RISK:</strong> ${result.risk_score}`;
    } catch (error) {
        outputDiv.innerText = "CONNECTION ERROR: CHECK ENGINE";
    }
});
