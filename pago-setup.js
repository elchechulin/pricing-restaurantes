document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ JS cargado");

  const checkbox = document.getElementById("acepto");
  const btn = document.getElementById("continuarPago");

  if (!checkbox || !btn) {
    console.error("❌ Elementos no encontrados", { checkbox, btn });
    alert("Error interno: elementos no encontrados");
    return;
  }

  btn.disabled = true;

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    alert("Enlace no válido o caducado.");
    return;
  }
  const textoBox = document.getElementById("textoTerminos");

if (textoBox) {
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
      automáticamente a partir del mes siguiente a la activación.
    </p>

    <p>
      Este documento tiene validez contractual
      y no garantiza resultados concretos,
      sino la correcta ejecución del servicio acordado.
    </p>

    <p style="margin-top:12px;">
      Consulta el
      <a class="contrato"
         href="https://www.mesasllenas.com/terminos-del-servicio.html"
         target="_blank"
         rel="noopener noreferrer">
        contrato completo
      </a>
      antes de continuar.
    </p>
  `;
}

  checkbox.addEventListener("change", () => {
    btn.disabled = !checkbox.checked;
    btn.classList.toggle("activo", checkbox.checked);
  });

  btn.addEventListener("click", async () => {
    console.log("🔥 Click detectado");

    btn.disabled = true;
    btn.textContent = "Redirigiendo a pago...";

    try {
      const res = await fetch(
        "https://stripe-backend-h1z1.vercel.app/api/create-checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modo: "setup",
            token
          })
        }
      );

      console.log("📡 Respuesta backend:", res.status);

      const data = await res.json();
      console.log("📦 Data:", data);

      if (!data.url) {
        alert("Stripe no devolvió URL");
        return;
      }

      window.location.href = data.url;

    } catch (err) {
      console.error("❌ Error fetch:", err);
      alert("Error conectando con el sistema de pago");
    }
  });
});