async function run() {

    const inputEl = document.getElementById("input");
    const outputEl = document.getElementById("output");

    const text = inputEl.value.trim();

    // ❗ กัน input ว่าง
    if (!text) {
        outputEl.innerText = "⚠️ กรุณาพิมพ์สถานการณ์ก่อน";
        return;
    }

    // ⏳ Loading state
    outputEl.innerText = "⚡ Running Decision Engine...";

    try {

        const res = await fetch("/run", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                input: text
            })
        });

        // ❗ กัน API พัง
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        // ❗ ถ้า backend ไม่มี engine
        if (data.error) {
            outputEl.innerText = "❌ " + data.error;
            return;
        }

        // ✅ แสดงผลสวยขึ้น
        outputEl.innerText = JSON.stringify(data, null, 2);

    } catch (err) {

        console.error(err);

        outputEl.innerText =
            "🚫 SYSTEM ERROR\n" +
            "----------------------\n" +
            err;

    }
}
