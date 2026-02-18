const successSound = new Audio("assets/sounds/success.mp3");
const errorSound = new Audio("assets/sounds/error.mp3");

const loginCard = document.querySelector(".login-card");
const errorEl = document.getElementById("error");

function playSuccess() {
  successSound.currentTime = 0;
  successSound.play().catch(() => {});
}

function playError() {
  errorSound.currentTime = 0;
  errorSound.play().catch(() => {});
}

function triggerErrorAnimation() {
  loginCard.classList.remove("login-error-animate");
  void loginCard.offsetWidth; // reset animation
  loginCard.classList.add("login-error-animate");

  setTimeout(() => {
    loginCard.classList.remove("login-error-animate");
  }, 500);
}

document.getElementById("btnLogin").onclick = async () => {

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  errorEl.textContent = "";

  if (!username || !password) {
    errorEl.textContent = "Completa usuario y contraseña.";
    playError();
    triggerErrorAnimation();
    return;
  }

  // ============================
  // MODO DEMO
  // ============================
  if (username === "demo_closer" && password === "demo123") {

    playSuccess();

    localStorage.setItem("sesion_activa", "true");
    localStorage.setItem("usuario_id", "demo");
    localStorage.setItem("usuario_nombre", "Closer Demo");
    localStorage.setItem("usuario_rol", "closer_demo");
    localStorage.setItem("modo_demo", "true");
    localStorage.setItem("password_updated_at", "demo");

    setTimeout(() => {
      window.location.href = "closer.html";
    }, 350);

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
      playError();
      triggerErrorAnimation();
      return;
    }

    playSuccess();

    localStorage.setItem("sesion_activa", "true");
    localStorage.setItem("usuario_id", data.id);
    localStorage.setItem("usuario_nombre", data.username);
    localStorage.setItem("usuario_rol", data.role);
    localStorage.setItem("password_updated_at", data.password_updated_at);

    setTimeout(() => {
      if (data.role === "admin") {
        window.location.href = "admin.html";
      } else if (data.role === "closer") {
        window.location.href = "closer.html";
      } else {
        window.location.href = "login.html";
      }
    }, 350);

  } catch (err) {
    errorEl.textContent = "Error conectando con el servidor.";
    playError();
    triggerErrorAnimation();
  }
};