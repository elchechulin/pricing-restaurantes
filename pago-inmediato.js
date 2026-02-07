const checkbox = document.getElementById("acepto");
const btn = document.getElementById("continuarPago");

checkbox.addEventListener("change", () => {
  btn.disabled = !checkbox.checked;
});

btn.onclick = async () => {
  const resumen = localStorage.getItem("resumenPago");
  if (!resumen) {
    alert("No se encontró el resumen del pago.");
    return;
  }

  const match = resumen.match(/MENSUALIDAD:\s(\d+)\s€/);
  if (!match) {
    alert("No se pudo detectar la mensualidad.");
    return;
  }

  const mensualidad = parseInt(match[1], 10);

  const res = await fetch(
  "https://stripe-backend-h1z1.vercel.app/api/create-checkout",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      modo: "inmediato",
      mensualidad
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
  console.error("Respuesta Stripe:", data);
  return;
}

window.location.href = checkoutUrl;
};