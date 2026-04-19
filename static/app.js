async function run() {
    const input = document.getElementById("input").value;
    const output = document.getElementById("output");

    if (!input.trim()) {
        output.textContent = "กรุณาพิมพ์ก่อน";
        return;
    }

    output.textContent = "thinking...";

    try {
        const res = await fetch("/ENGINE", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                input: input,
                entropy: 40,
                resource: 50,
                stability: 60
            })
        });

        const data = await res.json();

        // 🚫 โดนบล็อก
        if (data.status === "blocked") {
            output.textContent =
                "❌ NO CREDIT\n" +
                "Plan: " + data.plan + "\n" +
                "Credits: " + data.credits;
            return;
        }

        // ❗ error
        if (data.status === "error") {
            output.textContent = "ERROR: " + data.message;
            return;
        }

        // ✅ ปกติ
        let text = "";

        text += "PLAN: " + data.plan + "\n";
        text += "CREDITS LEFT: " + data.credits + "\n\n";

        text += JSON.stringify(data.data, null, 2);

        output.textContent = text;

    } catch (e) {
        output.textContent = "ERROR: " + e.message;
    }
}
