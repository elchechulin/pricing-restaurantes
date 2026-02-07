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
<a
  class="contrato"
  href="https://www.mesasllenas.com/terminos-del-servicio.html"
  target="_blank"
  rel="noopener noreferrer"
>
Contrato
</a>
completo antes de continuar.
</p>
`;

checkbox.addEventListener("change", () => {
  if (checkbox.checked) {
    btn.classList.add("activo");
    btn.disabled = false;
  } else {
    btn.classList.remove("activo");
    btn.disabled = true;
  }
});

btn.onclick = async () => {
  const resumen = localStorage.getItem("resumenPago");
  if (!resumen) {
    alert("No se encontró el resumen del pago.");
    return;
  }

  const matchMensual = resumen.match(/MENSUALIDAD:\s(\d+)\s€/);
const matchSetup = resumen.match(/SETUP:\s(\d+)\s€/);

if (!matchMensual) {
  alert("No se pudo detectar la mensualidad.");
  return;
}

const mensualidad = parseInt(matchMensual[1], 10);
const setup = matchSetup ? parseInt(matchSetup[1], 10) : null;

  const res = await fetch(
    "https://stripe-backend-h1z1.vercel.app/api/create-checkout",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  modo: "setup",
  mensualidad,
  ...(setup ? { setup } : {})
})
    }
  );

  if (!res.ok) {
    alert("Error conectando con el sistema de pago.");
    return;
  }

  const data = await res.json();
  const checkoutUrl =
    data.url ||
    data.checkoutUrl ||
    (data.session && data.session.url);

  if (!checkoutUrl) {
    alert("Stripe no devolvió una URL válida.");
    return;
  }

  window.location.href = checkoutUrl;
};