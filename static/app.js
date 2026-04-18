async function run(){

  const text = document.getElementById("input").value

  const output = document.getElementById("output")
  output.textContent = "processing..."

  try{
    const res = await fetch("/ENGINE", {
      method:"POST",
      headers:{ "Content-Type":"application/json"},
      body: JSON.stringify({
        input: text,
        entropy: 40,
        resource: 50,
        stability: 60
      })
    })

    const data = await res.json()

    output.textContent = JSON.stringify(data, null, 2)

  }catch(e){
    output.textContent = "ERROR: " + e
  }
}
