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