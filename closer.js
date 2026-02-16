const userId = localStorage.getItem("usuario_id");
const rol = localStorage.getItem("usuario_rol");

// Solo aplicar a closers reales
if (rol === "closer" && userId) {

  async function checkSessionStatus() {

    try {

      const res = await fetch(
        "https://stripe-backend-h1z1.vercel.app/api/login?user_id=" + userId
      );

      if (!res.ok) {
        localStorage.clear();
        window.location.href = "login.html";
        return;
      }

      const data = await res.json();

      if (!data.active) {
        localStorage.clear();
        alert("Tu cuenta ha sido desactivada.");
        window.location.href = "login.html";
      }

    } catch (err) {
      console.error("Error comprobando sesión");
    }
  }

  setInterval(checkSessionStatus, 5000); // cada 5 segundos
}