console.log("Panel closer cargado");

// Obtener ID del usuario logueado
const userId = localStorage.getItem("usuario_id");

if (!userId) {
  localStorage.clear();
  window.location.href = "login.html";
}

// Función que valida si el usuario sigue activo
async function checkSession() {
  try {
    const res = await fetch(
      "https://stripe-backend-h1z1.vercel.app/api/login?user_id=" + userId
    );

    if (!res.ok) return;

    const data = await res.json();

    if (!data.active) {
      forceLogout();
    }

  } catch (err) {
    console.error("Error comprobando sesión");
  }
}

// Forzar cierre de sesión
function forceLogout() {
  localStorage.clear();
  alert("Tu cuenta ha sido desactivada.");
  window.location.href = "login.html";
}

// Comprobar cada 5 segundos
setInterval(checkSession, 5000);

// Comprobar también al cargar
checkSession();