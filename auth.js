const sesion = localStorage.getItem("sesion_activa");
const rol = localStorage.getItem("usuario_rol");
const nombre = localStorage.getItem("usuario_nombre");
const userId = localStorage.getItem("usuario_id");

// 🔒 Si no hay sesión → fuera
if (!sesion || sesion !== "true" || !userId) {
  localStorage.clear();
  window.location.href = "login.html";
}

// 🔒 Protección por rol
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

// ===========================================
// 🔥 VALIDACIÓN GLOBAL CONTRA BACKEND
// ===========================================

async function checkSession() {
  try {
    const res = await fetch(
      `https://stripe-backend-h1z1.vercel.app/api/login?user_id=${userId}`
    );

    // Usuario eliminado
    if (res.status === 404) {
      forceLogout("Tu cuenta ha sido eliminada.");
      return;
    }

    if (!res.ok) {
      forceLogout("Sesión inválida.");
      return;
    }

    const data = await res.json();

    // Usuario dado de baja
    if (!data.active) {
      forceLogout("Tu cuenta ha sido desactivada.");
      return;
    }

    // 🔐 Contraseña cambiada
const currentStoredPasswordUpdatedAt = localStorage.getItem("password_updated_at");

if (
  currentStoredPasswordUpdatedAt &&
  data.password_updated_at &&
  new Date(currentStoredPasswordUpdatedAt).getTime() !==
  new Date(data.password_updated_at).getTime()
) {
  forceLogout("Tu contraseña ha sido restablecida. Vuelve a iniciar sesión.");
  return;
}

  } catch (err) {
    console.error("Error comprobando sesión");
  }
}

function forceLogout(message) {
  localStorage.clear();
  alert(message || "Sesión cerrada.");
  window.location.href = "login.html";
}

// Comprobar cada 5 segundos
setInterval(checkSession, 5000);
// ===========================================
// 🟢 HEARTBEAT · PRESENCIA EN TIEMPO REAL
// ===========================================

async function enviarHeartbeat() {
  try {
    await fetch("https://stripe-backend-h1z1.vercel.app/api/health", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: Number(userId)
      })
    });
  } catch (err) {
    console.error("Error enviando heartbeat");
  }
}

// Enviar cada 5 segundos
setInterval(enviarHeartbeat, 5000);

// Enviar uno inmediato al cargar
enviarHeartbeat();

// Comprobar también al cargar
checkSession();

// Logout manual
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.onclick = () => {
    localStorage.clear();
    window.location.href = "login.html";
  };
}