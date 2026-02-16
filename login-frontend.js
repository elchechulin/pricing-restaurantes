document.getElementById("btnLogin").onclick = async () => {

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl = document.getElementById("error");

  errorEl.textContent = "";

  if (!username || !password) {
    errorEl.textContent = "Completa usuario y contraseña.";
    return;
  }
  // ============================
// MODO DEMO (NO USA BACKEND)
// ============================
if (username === "demo_closer" && password === "demo123") {

  localStorage.setItem("sesion_activa", "true");
  localStorage.setItem("usuario_id", "demo");
  localStorage.setItem("usuario_nombre", "Closer Demo");
  localStorage.setItem("usuario_rol", "closer_demo");
  localStorage.setItem("modo_demo", "true");
  localStorage.setItem("password_updated_at", "demo");

  window.location.href = "closer.html";
  return;
}

  try {
    const res = await fetch(
      "https://stripe-backend-h1z1.vercel.app/api/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || "Error de login";
      return;
    }

    // Guardar sesión segura
localStorage.setItem("sesion_activa", "true");
localStorage.setItem("usuario_id", data.id);
localStorage.setItem("usuario_nombre", data.username);
localStorage.setItem("usuario_rol", data.role);
localStorage.setItem("password_updated_at", data.password_updated_at);

    // Redirigir según rol
if (data.role === "admin") {
  window.location.href = "admin.html";
} else if (data.role === "closer") {
  window.location.href = "closer.html";
} else {
  window.location.href = "login.html";
}

  } catch (err) {
    errorEl.textContent = "Error conectando con el servidor.";
  }
};