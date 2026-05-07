const m00 = document.getElementById("m00");
const m01 = document.getElementById("m01");
const m10 = document.getElementById("m10");
const m11 = document.getElementById("m11");

const txtMensaje    = document.getElementById("txtMensaje");
const cajaResultado = document.getElementById("cajaResultado");
const logText       = document.getElementById("logText");
const statusBadge   = document.getElementById("status-badge");

// ── Carga una clave predefinida en los inputs ─────────────────────────────────
const cargarClave = (a, b, c, d) => {
    m00.value = a; m01.value = b;
    m10.value = c; m11.value = d;

    // Actualiza el badge inmediatamente al cargar la clave
    const resultado = validarMatriz(a, b, c, d);
    statusBadge.innerHTML = resultado.msg;
    statusBadge.style.color = resultado.ok ? '#4ade80' : '#ef4444';
};

// ── Cifrar / Descifrar ────────────────────────────────────────────────────────
const procesarMensaje = (tipoAccion) => {
    const a = parseInt(m00.value) || 0;
    const b = parseInt(m01.value) || 0;
    const c = parseInt(m10.value) || 0;
    const d = parseInt(m11.value) || 0;
    const textoCrudo = txtMensaje.value.trim();

    if (!textoCrudo) {
        mostrarError("Escribe un mensaje para continuar.");
        return;
    }

    logText.innerHTML = `Validando matriz clave...<br/>`;

    const validacion = validarMatriz(a, b, c, d);
    statusBadge.innerHTML = validacion.msg;

    if (!validacion.ok) {
        statusBadge.style.color = '#ef4444';
        mostrarError(`Llave Defectuosa: ${validacion.msg}`);
        return;
    }

    statusBadge.style.color = '#4ade80';
    logText.innerHTML += `${validacion.msg}<br/>`;

    try {
        logText.innerHTML += `Ejecutando algoritmo de ${tipoAccion}...<br/>`;

        let stringRespuesta = tipoAccion === "cifrar"
            ? cifrarMensaje(textoCrudo, a, b, c, d)
            : descifrarMensaje(textoCrudo, a, b, c, d);

        cajaResultado.innerHTML = `<span style="color: #60a5fa">${stringRespuesta}</span>`;
        logText.innerHTML += `[Finalizado]`;

    } catch (err) {
        mostrarError("Error del sistema: " + err.message);
    }
};

// ── Error helper ──────────────────────────────────────────────────────────────
const mostrarError = (mensaje) => {
    statusBadge.innerHTML = "Error";
    statusBadge.style.color = '#ef4444';
    cajaResultado.innerHTML = `<span style="color: #ef4444; font-size: 0.9rem">${mensaje}</span>`;
    logText.innerHTML += `Se detuvo el procesamiento.<br/>`;
};

// ── Validación en vivo al cambiar cualquier input de la matriz ────────────────
[m00, m01, m10, m11].forEach(input => {
    input.addEventListener("input", () => {
        const a = parseInt(m00.value) || 0;
        const b = parseInt(m01.value) || 0;
        const c = parseInt(m10.value) || 0;
        const d = parseInt(m11.value) || 0;
        const resultado = validarMatriz(a, b, c, d);
        statusBadge.innerHTML = resultado.msg;
        statusBadge.style.color = resultado.ok ? '#4ade80' : '#ef4444';
    });
});
