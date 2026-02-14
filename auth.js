const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
  window.location.href = "login.html";
}

// Protección por rol
if (window.location.pathname.includes("admin.html") && usuario.role !== "admin") {
  window.location.href = "login.html";
}

if (window.location.pathname.includes("closer.html") && usuario.role !== "closer") {
  window.location.href = "login.html";
}

document.getElementById("bienvenida").textContent =
  "Bienvenido, " + usuario.full_name;

document.getElementById("logout").onclick = () => {
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
};