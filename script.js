const API_URL = "https://proyecto-instrumentacion-production.up.railway.app/process_rr";

// Recibir datos desde el Arduino vía Railway API
async function updateMetrics() {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ rr: [800,805,810,820,830] }) 
            // ⚠️ esta parte será reemplazada por el Arduino
        });

        const data = await response.json();
        console.log("API:", data);

        document.getElementById("bpm").innerText   = data.bpm ?? "...";
        document.getElementById("rmssd").innerText = data.rmssd ?? "...";
        document.getElementById("sdnn").innerText  = data.sdnn ?? "...";

    } catch (error) {
        console.error("Error:", error);
    }
}

// Actualizar cada 2.5 segundos
setInterval(updateMetrics, 2500);
