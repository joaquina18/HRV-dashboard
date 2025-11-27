// IP del ESP32C6 (cámbiala por la que veas en el Serial Monitor)
const ESP_WS_URL = "ws://192.168.1.33:81";

// Elementos de la UI
const bpmEl   = document.getElementById("bpm");
const rmssdEl = document.getElementById("rmssd");
const sdnnEl  = document.getElementById("sdnn");
const wsEl    = document.getElementById("ws-status");

// Iniciar gráfico ECG
const ctx = document.getElementById('ecgChart').getContext('2d');
const ecgChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Array(250).fill(""),
        datasets: [{
            label: 'ECG (Tiempo real)',
            data: Array(250).fill(0),
            borderColor: '#78a7ff',
            borderWidth: 2,
            fill: false,
            tension: 0.1
        }]
    },
    options: {
        animation: false,
        scales: {
            y: {
                min: 0,
                max: 4095
            }
        }
    }
});

// Añadir punto ECG
function addECGPoint(v) {
    ecgChart.data.datasets[0].data.shift();
    ecgChart.data.datasets[0].data.push(v);
    ecgChart.update();
}

// WebSocket
let socket = null;

function connectWS() {
    socket = new WebSocket(ESP_WS_URL);

    socket.onopen = () => {
        console.log("WS conectado");
        wsEl.textContent = "ON";
        wsEl.style.color = "#4cff4c";
    };

    socket.onclose = () => {
        console.log("WS cerrado, reintentando...");
        wsEl.textContent = "OFF";
        wsEl.style.color = "#ff4c4c";
        setTimeout(connectWS, 2000);
    };

    socket.onerror = (err) => {
        console.error("WS error:", err);
    };

    socket.onmessage = (event) => {
        const data = event.data;

        // Si empieza con '{' es JSON de métricas HRV
        if (data[0] === "{") {
            try {
                const obj = JSON.parse(data);
                if (obj.bpm !== undefined)   bpmEl.textContent   = obj.bpm.toFixed(0);
                if (obj.rmssd !== undefined) rmssdEl.textContent = obj.rmssd.toFixed(0);
                if (obj.sdnn !== undefined)  sdnnEl.textContent  = obj.sdnn.toFixed(0);
            } catch (e) {
                console.error("Error JSON:", e);
            }
        } else {
            // Si no, es un valor numérico de ECG
            const v = Number(data);
            if (!isNaN(v)) addECGPoint(v);
        }
    };
}

connectWS();
