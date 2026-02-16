console.log("Panel closer cargado");

// Obtener ID del usuario logueado
const userId = localStorage.getItem("usuario_id");

if (!userId) {
  localStorage.clear();
  window.location.href = "login.html";
}

// Función que valida si el usuario sigue activo o si la contraseña cambió
async function checkSession() {
  try {
    const res = await fetch(
      "https://stripe-backend-h1z1.vercel.app/api/login?user_id=" + userId
    );

    if (!res.ok) {
      forceLogout("Sesión inválida.");
      return;
    }

    const data = await res.json();

    const storedPasswordUpdatedAt = localStorage.getItem("password_updated_at");

    // 🔴 Si el usuario ya no está activo
    if (!data.active) {
      forceLogout("Tu cuenta ha sido desactivada.");
      return;
    }

    // 🔐 Si la contraseña fue cambiada desde el admin
    if (
      storedPasswordUpdatedAt &&
      data.password_updated_at &&
      storedPasswordUpdatedAt !== data.password_updated_at
    ) {
      forceLogout("Tu contraseña ha sido restablecida. Vuelve a iniciar sesión.");
      return;
    }

  } catch (err) {
    console.error("Error comprobando sesión");
  }
}

// Forzar cierre de sesión
function forceLogout(message) {
  localStorage.clear();
  alert(message || "Sesión cerrada.");
  window.location.href = "login.html";
}

// Comprobar cada 5 segundos
setInterval(checkSession, 5000);

// Comprobar también al cargar
checkSession();