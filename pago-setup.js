const checkbox = document.getElementById("acepto");
const btn = document.getElementById("continuarPago");
const textoBox = document.getElementById("textoTerminos");

textoBox.innerHTML = `
<p>
Al continuar, aceptas la <strong>activación estándar del servicio</strong>,
que incluye un pago inicial de setup para la puesta en marcha del sistema.
</p>

<p>
El pago de setup cubre la configuración inicial,
la preparación estratégica y el arranque del servicio.
</p>

<p>
La mensualidad recurrente comenzará a cobrarse
a partir del mes siguiente a la activación.
</p>

<p>
Este documento tiene validez contractual
y no garantiza resultados concretos,
sino la correcta ejecución del proceso acordado.
</p>

<p style="margin-top:12px;">
Consulta el
<a class="contrato"
   href="https://www.mesasllenas.com/terminos-del-servicio.html"
   target="_blank"
   rel="noopener noreferrer">
Contrato
</a>
completo antes de continuar.
</p>
`;

checkbox.addEventListener("change", () => {
  btn.disabled = !checkbox.checked;
  btn.classList.toggle("activo", checkbox.checked);
});

btn.onclick = async () => {
  const resumen = localStorage.getItem("resumenPago");
  if (!resumen) {
    alert("No se encontró el resumen del pago.");
    return;
  }

  const matchMensual = resumen.match(/MENSUALIDAD:\s(\d+)\s€/);
  const matchSetup = resumen.match(/SETUP:\s(\d+)\s€/);

  if (!matchMensual || !matchSetup) {
    alert("Error interno: no se detectó mensualidad o setup.");
    return;
  }

  const mensualidad = parseInt(matchMensual[1], 10);
  const setup = parseInt(matchSetup[1], 10);

  try {
    const res = await fetch(
      "https://stripe-backend-h1z1.vercel.app/api/create-checkout",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo: "setup",
          mensualidad,
          setup
        })
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("BACKEND ERROR:", res.status, errorText);
      alert("Error conectando con el sistema de pago.");
      return;
    }

    const data = await res.json();
    if (!data.url) {
      alert("Stripe no devolvió una URL válida.");
      return;
    }

    window.location.href = data.url;

  } catch (err) {
    console.error("FETCH ERROR:", err);
    alert("Error inesperado al conectar con Stripe.");
  }
};