async function send() {

    const msg = document.getElementById("msg").value;

    const res = await fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: msg })
    });

    const data = await res.json();

    const chat = document.getElementById("chat");

    chat.innerHTML += `<p><b>YOU:</b> ${msg}</p>`;
    chat.innerHTML += `<p><b>AI:</b> ${data.reply}</p>`;
}
