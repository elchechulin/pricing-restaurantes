document.getElementById("btnLogin").onclick = async () => {

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl = document.getElementById("error");

  errorEl.textContent = "";

  if (!username || !password) {
    errorEl.textContent = "Completa usuario y contraseña.";
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

    // Guardar sesión
    localStorage.setItem("usuario", JSON.stringify(data));

    // Redirección por rol
    if (data.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "closer.html";
    }

  } catch (err) {
    errorEl.textContent = "Error conectando con el servidor.";
  }
};