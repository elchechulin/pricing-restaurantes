const sesion = localStorage.getItem("sesion_activa");
const rol = localStorage.getItem("usuario_rol");
const nombre = localStorage.getItem("usuario_nombre");
const userId = localStorage.getItem("usuario_id");

// Si no hay sesión activa → fuera
if (!sesion || sesion !== "true" || !userId) {
  localStorage.clear();
  window.location.href = "login.html";
}

// Protección por rol
if (window.location.pathname.includes("admin.html") && rol !== "admin") {
  localStorage.clear();
  window.location.href = "login.html";
}

if (
  window.location.pathname.includes("closer.html") &&
  rol !== "closer" &&
  rol !== "closer_demo"
) {
  localStorage.clear();
  window.location.href = "login.html";
}

// Mostrar nombre
const bienvenida = document.getElementById("bienvenida");
if (bienvenida && nombre) {
  bienvenida.textContent = "Bienvenido, " + nombre;
}


// Logout manual
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.onclick = () => {
    localStorage.clear();
    window.location.href = "login.html";
  };
}