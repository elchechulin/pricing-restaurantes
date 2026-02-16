console.log("Panel closer cargado");

// Obtener ID del usuario logueado
const userId = localStorage.getItem("usuario_id");

if (!userId) {
  localStorage.clear();
  window.location.href = "login.html";
}

// Forzar cierre de sesión
function forceLogout(message) {
  localStorage.clear();
  alert(message || "Sesión cerrada.");
  window.location.href = "login.html";
}