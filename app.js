document.addEventListener("DOMContentLoaded", () => {
  
  // ===============================
// MODAL · ENLACE DE PAGO (HELPERS)
// ===============================
const modalLink = document.getElementById("modalLink");
const cerrarModalLink = document.getElementById("cerrarModalLink");
const inputLinkPago = document.getElementById("linkPago");
const btnCopyLink = document.getElementById("btnCopyLink");

function abrirModalLink(url) {
  inputLinkPago.value = url;
  modalLink.style.display = "flex";
  document.body.classList.add("modal-abierto");
}

function cerrarModalPago() {
  modalLink.style.display = "none";
  document.body.classList.remove("modal-abierto");
}

cerrarModalLink.onclick = cerrarModalPago;

btnCopyLink.onclick = () => {
  inputLinkPago.select();
  document.execCommand("copy");
  btnCopyLink.textContent = "✅ Enlace copiado";
  setTimeout(() => {
    btnCopyLink.textContent = "📋 Copiar enlace";
  }, 1500);
};

  /* ===============================
     MODO DE CIERRE (ESTADO GLOBAL)
  =============================== */
  
  let textoCliente = "";
let textoInterno = "";

  // Modo por defecto: activación inmediata con descuento
  let modoCierre = "inmediato";
let forzarModo = false; // "inmediato" | "estandar"

let estadoCierre = "abierto"; // "abierto" | "cerrado"
let volverAGuiaTrasCalculo = false;

let estadoLlamada = "seleccion_rol";
// ===============================
// ONBOARDING (POST-CIERRE)
// ===============================
let onboardingActivo = false;

let datosOnboarding = {
  canal: "",       // whatsapp | email
  decisor: "",     // dueño | encargado | otro
  diasInteres: ""  // ej: martes a jueves
};
  // Configuración económica
  const DESCUENTO_INMEDIATO = 0.20; // 20% de descuento
  const SETUP_ESTANDAR = 390;       // € de activación estándar

  const resultadoEl = document.getElementById("resultado");
  const modalLlamadas = document.getElementById("modalLlamadas");
  const btnVolverPresupuesto = document.getElementById("btnVolverPresupuesto");
  btnVolverPresupuesto.onclick = () => {
  modalLlamadas.style.display = "none";
  document.body.classList.remove("modal-abierto");
  btnVolverPresupuesto.style.display = "none";

  // 👇 VOLVER A MOSTRAR CONTINUAR GUÍA
  document.getElementById("btnContinuarGuia").style.display = "block";
};
// ===============================
// MODAL · GUÍA DE LLAMADAS (CIERRE SEGURO)
// ===============================
function cerrarModalLlamadasSeguro() {
  modalLlamadas.style.display = "none";
  document.body.classList.remove("modal-abierto");
}
  /* ===============================
     GASTO MEDIO 5€ → 200€
  =============================== */
  const gastoSelect = document.getElementById("gasto");
  for (let i = 5; i <= 200; i += 5) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${i}€`;
    if (i === 25) opt.selected = true;
    gastoSelect.appendChild(opt);
  }

  /* ===============================
     AUTORRELLENO CÓDIGO POSTAL
  =============================== */
  const cpInput = document.getElementById("cp");
  const municipioInput = document.getElementById("municipio");

  const CP_CORREGIDOS = {
    "28380": "Colmenar de Oreja"
  };

  cpInput.addEventListener("keyup", async () => {
    const cp = cpInput.value.trim();
    if (cp.length !== 5) return;

    if (CP_CORREGIDOS[cp]) {
      municipioInput.value = CP_CORREGIDOS[cp];
      return;
    }

    try {
      const res = await fetch(`https://api.zippopotam.us/es/${cp}`);
      if (!res.ok) return;
      const data = await res.json();
      municipioInput.value = data.places[0]["place name"];
    } catch {}
  });

  /* ===============================
     FUNCIONES DE RECOMENDADO
  =============================== */
  function analizarCompetenciaSimulada(resenas, rating) {
    let locales = 5;
    if (resenas > 300) locales += 8;
    if (resenas > 600) locales += 12;
    if (rating >= 4.5) locales += 6;
    if (rating >= 4.7) locales += 10;
    return locales;
  }

  function decidirTicketRecomendado({ rating, resenas, gasto }) {
    let score = 0;
    if (rating >= 4.6) score += 3;
    else if (rating >= 4.3) score += 2;
    else score += 1;

    if (resenas >= 600) score += 3;
    else if (resenas >= 200) score += 2;
    else score += 1;

    if (gasto >= 40) score += 3;
    else if (gasto >= 25) score += 2;
    else score += 1;

    if (score >= 8) return "High";
    if (score >= 5) return "Medium";
    return "Low";
  }

  /* ===============================
     CÁLCULO ÚNICO (DEFINITIVO)
  =============================== */
  document.getElementById("calcular").addEventListener("click", (e) => {
  e.preventDefault();

document.getElementById("onboarding").style.display = "none";
document.getElementById("btnWhatsappOnboarding").style.display = "none";
onboardingActivo = false;
  // 🔴 RESET VISUAL DEL BOTÓN CONTINUAR GUÍA
  document.getElementById("btnContinuarGuia").style.display = "none";
    
    if (estadoCierre === "cerrado") {
  const continuar = confirm(
    "Este cliente ya ha aceptado la propuesta.\n\n" +
    "¿Quieres recalcular igualmente?"
  );
  if (!continuar) return;
}
// Reset de modo en cada nuevo cálculo
    if (!forzarModo) {
  modoCierre = "inmediato";
}
    
    const nombre = document.getElementById("nombre").value.trim();
    const municipio = municipioInput.value.trim();
    const rating = parseFloat(document.getElementById("rating").value);
    const resenas = parseInt(document.getElementById("resenas").value);
    const gasto = parseInt(gastoSelect.value);
    const escenarioSeleccionado = document.getElementById("escenario").value;
    
    if (!nombre || isNaN(rating) || isNaN(resenas) || isNaN(gasto)) {
  alert("Completa todos los campos");
  return;
}
    
    let indice = 1.0;
let razones = [];

// ÍNDICES INTERNOS (NO VISIBLES AL CLIENTE)
let ICE = 0; // capacidad económica
let IT  = 0; // tracción
let IO  = 0; // oportunidad
let IR  = 0; // riesgo
    
    // ===============================
// PASO 4 · TRACCIÓN (IT)
// ===============================
if (rating >= 4.6) IT += 0.35;
else if (rating >= 4.3) IT += 0.25;
else IT += 0.1;

if (resenas >= 500) IT += 0.35;
else if (resenas >= 200) IT += 0.2;
else IT += 0.1;


    let escenarioAplicado = escenarioSeleccionado;
    let infoRecomendado = "";

    if (escenarioSeleccionado === "recomendado") {
      const competencia = analizarCompetenciaSimulada(resenas, rating);
      escenarioAplicado = decidirTicketRecomendado({ rating, resenas, gasto });

      infoRecomendado = `
ESCENARIO RECOMENDADO INTELIGENTE
Nivel recomendado: ${escenarioAplicado.toUpperCase()}
Competencia estimada: ${competencia} locales
`;
    }
    // ===============================
// PASO 3 · FACTOR DE ESCENARIO
// ===============================
let factorEscenario = 1.0;

if (escenarioAplicado === "Low") {
  factorEscenario = 0.85;
}

if (escenarioAplicado === "Medium") {
  factorEscenario = 1.0;
}

if (escenarioAplicado === "High") {
  factorEscenario = 1.25;
}

// Aplicación única
indice *= factorEscenario;
    // ===============================
// PASO 5 · OPORTUNIDAD (IO)
// ===============================
if (resenas >= 300) IO += 0.25;
if (gasto >= 30) IO += 0.25;
if (escenarioAplicado === "High") IO += 0.2;
// ===============================
// PASO 6 · RIESGO (IR)
// ===============================
if (resenas < 80) IR += 0.3;
if (rating < 4.1) IR += 0.25;
if (gasto < 20) IR += 0.2;
// ===============================
// PASO 2 · CAPACIDAD ECONÓMICA (ICE)
// ===============================

if (gasto >= 45) ICE += 0.4;
else if (gasto >= 30) ICE += 0.25;
else ICE += 0.1;

const n = nombre.toLowerCase();

if (["asador","brasa","steak","gastro","grill"].some(k => n.includes(k))) {
  ICE += 0.25;
}

// ===============================
// PASO 7 · FACTOR ECONÓMICO REAL
// ===============================

// Normalización de índices
const factorICE = 1 + ICE;        // capacidad de pagar
const factorIT  = 1 + IT;         // tracción
const factorIO  = 1 + IO;         // oportunidad
const factorIR  = 1 - IR;         // riesgo resta

// Factor combinado (controlado)
let factorEconomico =
  (factorICE * 0.35 +
   factorIT  * 0.30 +
   factorIO  * 0.25 +
   factorIR  * 0.10) / 1.0;

// Protección de límites (muy importante)
if (factorEconomico < 0.85) factorEconomico = 0.85;
if (factorEconomico > 1.35) factorEconomico = 1.35;

if (["asador","brasa","steak","gastro","grill"].some(k => n.includes(k))) {
      indice *= 1.25; razones.push("formato gastronómico de ticket alto");
    } else if (["bar","caf","tapas","snack","cafeteria"].some(k => n.includes(k))) {
      indice *= 0.9; razones.push("formato de consumo rápido");
    } else {
      razones.push("formato estándar");
    }

    if (resenas < 50) indice *= 0.85;
    else if (resenas < 600) indice *= 1.15;
    else indice *= 1.35;

    if (rating < 4.0) indice *= 0.9;
    else if (rating < 4.6) indice *= 1.1;
    else indice *= 1.2;
indice *= factorEconomico;

// ===============================
// CONTROL DE PICOS DEL ÍNDICE
// ===============================

// Zona alta: desaceleración suave
if (indice > 1.9 && indice <= 2.4) {
  indice = 1.9 + (indice - 1.9) * 0.6;
}

// Zona extrema: compresión fuerte
if (indice > 2.4) {
  indice = 2.2 + Math.log(indice - 1.4);
}

// Protección inferior (evita infravalorar demasiado)
if (indice < 0.75) {
  indice = 0.75 + (0.75 - indice) * 0.3;
}
// Aplicación FINAL al índice
    
// ===== PRECIOS BASE POR MODELO =====
const BASE = {
  estandar: { mensual: 29, setup: 180 },
  crecimiento: { mensual: 79, setup: 420 },
  premium: { mensual: 149, setup: 800 }
};

function interpolar(a, b, t) {
  return a + (b - a) * t;
}

    let modelo = "Estandar";
let baseMensual = BASE.estandar.mensual;
let baseSetup = BASE.estandar.setup;

if (indice >= 1.6) {
  modelo = "Premium";
  baseMensual = BASE.premium.mensual;
  baseSetup = BASE.premium.setup;
} 
else if (indice >= 1.2) {

  // t va de 0 → 1 entre 1.2 y 1.6
  const t = (indice - 1.2) / (1.6 - 1.2);

  modelo = t < 0.35 ? "Estandar+" : "Crecimiento";

  baseMensual = interpolar(
    BASE.crecimiento.mensual,
    BASE.premium.mensual,
    t
  );

  baseSetup = interpolar(
    BASE.crecimiento.setup,
    BASE.premium.setup,
    t
  );
}



// Aplicación final del índice
let mensual = Math.round(baseMensual * indice);
let setup = Math.round(baseSetup * indice);
// ===== PRECIO BASE (NO SE COMUNICA AL CLIENTE) =====
    const mensualBase = mensual;
    const setupBase = setup; // reservado para modo estándar
    
    // ===== APLICACIÓN DEL MODO DE CIERRE =====
    let mensualFinal = mensualBase;
    let setupFinal = 0;
    let textoModo = "";

    if (modoCierre === "inmediato") {
      mensualFinal = Math.round(mensualBase * (1 - DESCUENTO_INMEDIATO));
      setupFinal = 0;
      textoModo = "ACTIVACIÓN INMEDIATA (tarifa reducida aplicada)";
    } else {
      mensualFinal = mensualBase;
      setupFinal = SETUP_ESTANDAR;
      textoModo = "ACTIVACIÓN ESTÁNDAR (sin descuento)";
    }
    const ingresoMesa = gasto * 4;
    const mesas = Math.max(1, Math.round(mensualFinal / ingresoMesa));

    textoCliente = `
RESTAURANTE: ${nombre}
MUNICIPIO: ${municipio}

ESCENARIO SELECCIONADO: ${escenarioSeleccionado.toUpperCase()}
ESCENARIO APLICADO: ${escenarioAplicado.toUpperCase()} TICKET

MODELO: ${modelo}

MODO DE ACTIVACIÓN:
${textoModo}

${setupFinal > 0 ? `SETUP: ${setupFinal} €\n` : ""}MENSUALIDAD: ${mensualFinal} €

ANÁLISIS:
- ${razones.join("\n- ")}

Con solo ${mesas} mesas adicionales al mes
(≈ ${ingresoMesa} € por mesa)
la mensualidad queda amortizada.
${infoRecomendado}
`.trim();

resultadoEl.textContent = textoCliente;

    resultadoEl.scrollIntoView({ behavior: "smooth" });
    
    /* ===============================
   PASO 10.1 · TEXTO DE CIERRE AUTOMÁTICO
=============================== */

let textoCierre = "";

if (estadoCierre === "cerrado") {
  textoCierre = `
🗣️ CIERRE YA CONFIRMADO

El cliente ha aceptado la propuesta.
Continúa con la activación y onboarding.
`;
}

textoInterno = `
────────────────────
${textoCierre}
`;

let rolActual = "encargado";

if (estadoLlamada.includes("dueno")) {
  rolActual = "dueno";
}
if (estadoCierre !== "cerrado") {

if (rolActual === "encargado") {
  if (modoCierre === "inmediato") {
    textoCierre = `
🗣️ QUÉ DECIR AHORA:

“Con estos números encima de la mesa,
lo importante no es si funciona o no,
sino si prefieres empezar ahora
con condiciones reducidas
o dejarlo para más adelante
con activación estándar.”

“Si empezamos ahora,
nosotros nos encargamos de todo
y tú solo notas más mesas entre semana.”
`;
  } else {
    textoCierre = `
🗣️ QUÉ DECIR AHORA:

“Este sería el escenario normal de trabajo.
No hay descuentos,
pero es la estructura completa
para mejorar ocupación entre semana.”

“Si más adelante quieres optimizar condiciones,
lo revisamos.”
`;
  }
}

if (rolActual === "dueno") {
  textoCierre = `
🗣️ QUÉ DECIR AHORA:

“Con estos números,
la pregunta no es si es caro,
sino cuánto cuesta seguir igual
otros tres meses más.”

“Con una sola mesa adicional al mes,
esto queda amortizado.”
`;
}

}

resultadoEl.textContent += `

────────────────────
${textoCierre}
`;
    // Mostrar botón de consecuencia tras el cálculo
    document.getElementById("btnModoEstandar").style.display = "block";
document.getElementById("btnCierreFinal").style.display = "block";
document.getElementById("btnCrearEnlaceInmediato").style.display = "none";
document.getElementById("btnCrearEnlaceSetup").style.display = "none";
/* ===============================
       PASO 9.7 · AVANCE AUTOMÁTICO DE GUÍA
    =============================== */

    if (volverAGuiaTrasCalculo) {
  volverAGuiaTrasCalculo = false; // 🔴 consumir el estado
  estadoLlamada = "fin_encargado_calculo";
  document.getElementById("btnContinuarGuia").style.display = "block";
}
  });

  /* ===============================
     HELPERS
  =============================== */
  function mostrarOnboarding() {
  const onboardingEl = document.getElementById("onboarding");

  onboardingEl.textContent = `
━━━━━━━━━━━━━━━━━━━━━━
🧩 ONBOARDING INMEDIATO
━━━━━━━━━━━━━━━━━━━━━━

🗣️ DI ESTO AHORA MISMO:

“Perfecto. Entonces empezamos.
Te explico los siguientes pasos
y lo dejamos todo encaminado.”

1️⃣ Canal de contacto
→ “¿Lo llevamos por WhatsApp o por email?”

2️⃣ Decisor operativo
→ “¿Eres tú quien valida esto
o hay alguien más implicado?”

3️⃣ Prioridad real
→ “Entre semana,
¿qué días te interesa más llenar?”

📌 IMPORTANTE:
No prometas resultados.
Promete proceso.
Los primeros movimientos se notan
normalmente en 2–3 semanas.

👉 Cuando termine la llamada:
Pulsa “Enviar onboarding por WhatsApp”.
`;

  onboardingEl.style.display = "block";
  document.getElementById("btnWhatsappOnboarding").style.display = "block";
}
  function obtenerResultadoVisible() {
    const txt = resultadoEl.innerText.trim();
    return txt.length ? txt : null;
  }

  /* ===============================
     WHATSAPP
  =============================== */
  document.getElementById("btnWhatsapp").onclick = () => {
    const texto = obtenerResultadoVisible();
    if (!texto) return alert("Primero calcula un presupuesto.");

    let cierreTexto = "";

if (modoCierre === "inmediato") {
  cierreTexto = `
📊 PROPUESTA CON ACTIVACIÓN INMEDIATA

${texto}

✅ Tarifa reducida aplicada
✅ Sin coste de activación
⏳ Condición válida solo para arranque inmediato

Con una sola mesa adicional al mes,
el sistema queda amortizado.

¿Lo activamos ahora mismo?
`;
} else {
  cierreTexto = `
📊 PROPUESTA CON ACTIVACIÓN ESTÁNDAR

${texto}

🔧 Incluye setup inicial de puesta en marcha
📈 Estrategia completa desde el día 1

Con una sola mesa adicional al mes,
el sistema queda amortizado.

¿Te parece bien este planteamiento?
`;
}

navigator.clipboard.writeText(cierreTexto);
    alert("Resumen copiado para WhatsApp");
  };
  document.getElementById("btnWhatsappOnboarding").onclick = () => {
  if (!onboardingActivo) return;

  const texto = `
👋 Perfecto, empezamos.

Te resumo los siguientes pasos para que lo tengamos todo claro:

1️⃣ Canal de contacto principal
(confírmame si prefieres WhatsApp o email)

2️⃣ Decisor operativo
(confírmame si eres tú o hay alguien más implicado)

3️⃣ Prioridad entre semana
(dime qué días te interesa más llenar)

A partir de ahí,
nosotros nos encargamos del resto.

Seguimos en contacto 👍
`;

  navigator.clipboard.writeText(texto);
  alert("Onboarding copiado para WhatsApp");
};

 /* ===============================
   PDF PROFESIONAL
=============================== */
document.getElementById("btnPdf").onclick = () => {
  const texto = textoCliente;
  if (!texto) {
    alert("Primero calcula un presupuesto.");
    return;
  }

  const w = window.open("", "_blank");

  w.document.write(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Propuesta Estratégica</title>

<style>
  * {
    box-sizing: border-box;
  }

  body {
    font-family: Inter, Arial, Helvetica, sans-serif;
    margin: 0;
    padding: 0;
    color: #111;
    background: #ffffff;
  }

  .page {
    padding: 60px;
  }

  /* ===== PORTADA ===== */
  .cover {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    page-break-after: always;
  }

  .cover img {
    max-width: 160px;
    margin-bottom: 40px;
  }

  .cover h1 {
    font-size: 38px;
    margin-bottom: 14px;
  }

  .cover h2 {
    font-size: 18px;
    font-weight: 400;
    color: #555;
    max-width: 520px;
    line-height: 1.5;
  }

  .cover .meta {
    margin-top: 40px;
    font-size: 14px;
    color: #666;
  }

  /* ===== BLOQUES ===== */
  .section {
    margin-bottom: 50px;
  }

  .section h3 {
    font-size: 20px;
    margin-bottom: 16px;
    border-left: 4px solid #e10600;
    padding-left: 12px;
  }

  .box {
    background: #f9fafb;
    border-radius: 12px;
    padding: 20px;
    line-height: 1.6;
    font-size: 14px;
  }

  /* ===== PRECIO ===== */
  .price-box {
    display: flex;
    gap: 20px;
    margin-top: 20px;
  }

  .price {
    flex: 1;
    background: #111;
    color: #fff;
    border-radius: 14px;
    padding: 24px;
    text-align: center;
  }

  .price span {
    display: block;
    font-size: 13px;
    opacity: 0.7;
  }

  .price strong {
    font-size: 32px;
  }

  /* ===== FOOTER ===== */
  .footer {
    margin-top: 60px;
    font-size: 12px;
    color: #666;
    border-top: 1px solid #ddd;
    padding-top: 20px;
  }

  pre {
    white-space: pre-wrap;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.6;
  }
</style>
</head>

<body>

<!-- PORTADA -->
<div class="cover">
  <img src="assets/logo.png" alt="Logo">
  <h1>Propuesta Estratégica de Pricing</h1>
  <h2>Análisis personalizado para optimizar ocupación e ingresos entre semana</h2>
  <div class="meta">
    Documento confidencial · Uso exclusivo del cliente
  </div>
</div>

<div class="page">

  <div class="section">
    <h3>Resumen ejecutivo</h3>
    <div class="box">
      Este documento presenta una propuesta estratégica basada en el
      potencial real del restaurante, su posicionamiento y su capacidad
      de retorno económico entre semana.
    </div>
  </div>

  <div class="section">
    <h3>Propuesta económica</h3>
    <div class="box">
      <pre>${texto}</pre>
    </div>
  </div>

  <div class="footer">
    ${modoCierre === "inmediato" ? `
    <strong>Condiciones de activación inmediata</strong><br>
    Tarifa reducida aplicada por activación inmediata.<br>
    Sin coste de setup inicial.
    ` : `
    <strong>Condiciones de activación estándar</strong><br>
    Incluye setup inicial de puesta en marcha.<br>
    Mensualidad estable durante el periodo acordado.
    `}
  </div>

</div>

</body>
</html>
`);

  w.document.close();
  w.focus();
  w.print();
};

  /* ===============================
     ARGUMENTOS Y OBJECIONES
  =============================== */
  document.getElementById("btnArgumento").onclick = () => {
    alert(`Este precio está calculado en base al potencial real del negocio,
su competencia, su ticket medio y su capacidad de retorno.

No es un gasto.
Es una inversión que se amortiza con una sola mesa adicional al mes.`);
  };

  document.getElementById("btnObjeciones").onclick = () => {
    

    alert(`OBJECIONES FRECUENTES:

• "Es caro" → Una sola mesa lo cubre.
• "Ahora no es buen momento" → Precisamente por eso.
• "Déjamelo pensar" → La visibilidad no se guarda, se ocupa.`);
  };

/* ===============================
     BOTÓN: CLIENTE NO DECIDE
  =============================== */
  document.getElementById("btnModoEstandar").onclick = () => {
  forzarModo = true;
  modoCierre = "estandar";
  document.getElementById("calcular").click();
  forzarModo = false;

  // 🔽 MOSTRAR BOTÓN DE PAGO CON SETUP
  document.getElementById("btnCrearEnlaceSetup").style.display = "block";
  document.getElementById("btnCrearEnlaceInmediato").style.display = "none";
};

/* ===============================
   BOTÓN: CLIENTE DICE SÍ
=============================== */
document.getElementById("btnCierreFinal").onclick = () => {
  estadoCierre = "cerrado";
  onboardingActivo = true;

  mostrarOnboarding();

  // 🔽 MOSTRAR BOTÓN DE PAGO INMEDIATO
  document.getElementById("btnCrearEnlaceInmediato").style.display = "block";
  document.getElementById("btnCrearEnlaceSetup").style.display = "none";
};

  // Aquí NO hay pagos
  // Aquí NO hay Stripe
  // Solo estado interno de cierre
/* ===============================
   BOTÓN · CREAR ENLACE INMEDIATO
=============================== */
document.getElementById("btnCrearEnlaceInmediato").onclick = async () => {
  const texto = obtenerResultadoVisible();
  if (!texto) {
    alert("Primero calcula un presupuesto.");
    return;
  }

  const matchMensual = texto.match(/MENSUALIDAD:\s(\d+)\s€/);
  if (!matchMensual) {
    alert("No se pudo detectar la mensualidad.");
    return;
  }

  const mensualidad = parseInt(matchMensual[1], 10);

  try {
    const res = await fetch(
      "https://stripe-backend-h1z1.vercel.app/api/create-payment-link",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensualidad,
          setup: 0,
          modo: "inmediato"
        })
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Stripe backend error:", errorText);
      alert("El backend de pago devolvió un error.");
      return;
    }

    const data = await res.json();

    if (!data.url) {
      alert("Stripe no devolvió una URL.");
      return;
    }

    abrirModalLink(data.url);

  } catch (err) {
    console.error("❌ Fetch error:", err);
    alert("No se pudo conectar con el sistema de pago.");
  }
};




/* ===============================
   BOTÓN · CREAR ENLACE SETUP
=============================== */
document.getElementById("btnCrearEnlaceSetup").onclick = async () => {
  const texto = obtenerResultadoVisible();
  if (!texto) {
    alert("Primero calcula un presupuesto.");
    return;
  }

  // Extraer importes del texto
  const matchMensual = texto.match(/MENSUALIDAD:\s(\d+)\s€/);
  const matchSetup = texto.match(/SETUP:\s(\d+)\s€/);

  if (!matchMensual || !matchSetup) {
    alert("No se pudieron detectar los importes.");
    return;
  }

  const mensualidad = parseInt(matchMensual[1], 10);
  const setup = parseInt(matchSetup[1], 10);

  try {
    const res = await fetch(
      "https://stripe-backend-h1z1.vercel.app/api/create-payment-link",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  mensualidad,
  setup,
  modo: "setup"
})
      }
    );

    if (!res.ok) {
      alert("Error creando el enlace de pago.");
      return;
    }

    const data = await res.json();

    if (!data.url) {
      alert("No se recibió una URL válida.");
      return;
    }

    abrirModalLink(data.url);

  } catch (err) {
    console.error(err);
    alert("Error conectando con el backend.");
  }
};
/* ===============================
   GUÍA DE LLAMADAS · MOTOR BASE
=============================== */


// Historial de navegación (para botón atrás)
let historialLlamada = [];
// Contenedor del contenido del modal
const modalBody = document.querySelector("#modalLlamadas .modal-body");
const btnAtras = document.getElementById("modalAtras");
// Botón atrás (NECESARIO ANTES DE USARLO)

function actualizarBotonAtras() {
  if (historialLlamada.length > 0) {
    btnAtras.style.display = "inline";
  } else {
    btnAtras.style.display = "none";
  }
}
// Renderiza el paso actual
function renderPasoLlamada() {
  if (!modalBody) return;

if (estadoLlamada === "seleccion_rol") {
    modalBody.innerHTML = `
      <p><strong>📞 ¿Quién contesta el teléfono?</strong></p>

      <button class="btn-respuesta" data-siguiente="trabajador_inicio">
        👨‍🍳 Trabajador / camarero
      </button>

      <button class="btn-respuesta" data-siguiente="encargado_inicio">
        👔 Encargado / gerente
      </button>

      <button class="btn-respuesta" data-siguiente="dueno_inicio">
  👑 Dueño
</button>
    `;
  }
  
  if (estadoLlamada === "encargado_inicio") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>
    <p>
      “Hola, te llamo rápido.<br>
      ¿Eres tú quien lleva el tema de reservas u ocupación del restaurante?”
    </p>

    <p><strong>¿Qué responde el encargado?</strong></p>

    <button class="btn-respuesta" data-siguiente="encargado_liado">
      🕒 “Ahora mismo estoy liado”
    </button>

    <button class="btn-respuesta" data-siguiente="encargado_escuchar">
      👂 “Dime, ¿de qué se trata?”
    </button>

    <button class="btn-respuesta" data-siguiente="encargado_ya_tengo">
      🔒 “Ya tenemos a alguien”
    </button>
  `;
}
if (estadoLlamada === "dueno_inicio") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Hola, soy Jesús.<br>
      Te llamo directamente a ti porque eres el dueño.”
    </p>

    <p>
      “No te llamo para venderte publicidad
      ni para marearte.”
    </p>

    <p>
      “Solo para ver si ahora mismo
      tu restaurante podría estar facturando más
      entre semana de lo que está facturando.”
    </p>

    <p><strong>¿Qué responde?</strong></p>

    <button class="btn-respuesta" data-siguiente="dueno_directo">
      👂 “Dime”
    </button>

    <button class="btn-respuesta" data-siguiente="dueno_corte">
      ❌ “No me interesa”
    </button>
  `;
}
if (estadoLlamada === "dueno_directo") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Perfecto. Entonces voy directo al grano.”
    </p>

    <p>
      “Ahora mismo, entre semana,
      ¿el restaurante suele estar lleno
      o hay mesas que se quedan vacías?”
    </p>

    <button class="btn-respuesta" data-siguiente="dueno_hay_huecos">
      😐 “Hay huecos”
    </button>

    <button class="btn-respuesta" data-siguiente="dueno_todo_lleno">
      👍 “Vamos bien”
    </button>
  `;
}
if (estadoLlamada === "dueno_hay_huecos") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Perfecto. Entonces tiene todo el sentido mirarlo.”
    </p>

    <p>
      “Si te parece, hago un cálculo rápido
      para ver si merece la pena ayudarte
      o no.”
    </p>

    <p>
      “No es una oferta,
      es solo un número realista.”
    </p>

    <p><strong>👉 AHORA:</strong></p>
    <p>
      Rellena los datos del restaurante
      y pulsa <strong>Calcular precio</strong>.
    </p>

    <button class="btn-respuesta" data-siguiente="fin_encargado_calculo">
      ✅ Vale
    </button>
  `;
}
if (estadoLlamada === "dueno_corte") {
  modalBody.innerHTML = `
    <p>
      Perfecto, no te quito más tiempo.
    </p>

    <p>
      Si en algún momento notas
      que entre semana baja la ocupación,
      lo vemos sin problema.
    </p>

    <p>
      Gracias por atenderme.
    </p>
  `;
}
if (estadoLlamada === "encargado_escuchar") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Te llamo porque estamos ayudando
      a restaurantes de la zona
      a llenar mesas entre semana
      sin hacer descuentos.”
    </p>

    <p>
      “Antes de seguir, dime una cosa rápida:
      ¿entre semana soléis tener huecos?”
    </p>

    <button class="btn-respuesta" data-siguiente="encargado_interes">
      😐 “Sí, hay huecos”
    </button>

    <button class="btn-respuesta" data-siguiente="encargado_cierre_sano">
      👍 “No, va bastante bien”
    </button>
  `;
}
if (estadoLlamada === "encargado_ya_tengo") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Perfecto, es buena señal.<br>
      La mayoría de restaurantes con los que hablamos
      ya tienen a alguien.”
    </p>

    <p>
      “No te llamo para sustituirlo ni competir con nadie.”
    </p>

    <p>
      “Solo para comprobar una cosa rápida:
      si lo que tienes ahora mismo
      realmente te está llenando mesas
      entre semana.”
    </p>

    <button class="btn-respuesta" data-siguiente="encargado_valida_problema">
      ➡️ “Bueno, dime”
    </button>

    <button class="btn-respuesta" data-siguiente="encargado_corte_suave">
      ❌ “No me interesa”
    </button>
  `;
}
if (estadoLlamada === "encargado_valida_problema") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Dime una cosa muy directa:
      ¿entre semana
      el restaurante suele estar lleno
      o hay huecos?”
    </p>

    <button class="btn-respuesta" data-siguiente="encargado_interes">
      😐 “Hay huecos”
    </button>

    <button class="btn-respuesta" data-siguiente="encargado_cierre_sano">
      👍 “Va bastante bien”
    </button>
  `;
}
if (estadoLlamada === "encargado_cierre_sano") {
  modalBody.innerHTML = `
    <p>
      👍 Perfecto entonces.<br><br>
      Si ahora mismo os funciona bien,
      no tiene sentido tocar nada.
    </p>

    <p>
      Te agradezco el tiempo
      y si en algún momento
      notas que entre semana flojea,
      hablamos sin problema.
    </p>
  `;
}
if (estadoLlamada === "encargado_corte_suave") {
  modalBody.innerHTML = `
    <p>
      Perfecto, no te quito más tiempo.<br><br>
      Gracias por atenderme y que tengas buen servicio.
    </p>
  `;
}
if (estadoLlamada === "encargado_liado") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>
    <p>
      “Lo entiendo perfectamente.<br>
      No te llamo para venderte nada ahora.”
    </p>

    <p>
      “Solo dime una cosa rápida y te cuelgo:
      ¿entre semana soléis tener mesas libres?”
    </p>

    <button class="btn-respuesta" data-siguiente="encargado_interes">
      👍 “Sí”
    </button>

    <button class="btn-respuesta" data-siguiente="encargado_corte_suave">
      👎 “Ahora no”
    </button>
  `;
}
if (estadoLlamada === "encargado_interes") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>
    <p>
      “Genial. Entonces voy al grano.”
    </p>

    <p>
      “Estamos ayudando a restaurantes de la zona
      a llenar mesas entre semana sin depender de descuentos.”
    </p>

    <p>
      “Si te parece, en 30 segundos te digo
      si tu restaurante encaja o no, y decides tú.”
    </p>

    <button class="btn-respuesta" data-siguiente="puente_calculo">
      ➡️ “Vale, dime”
    </button>
  `;
}
if (estadoLlamada === "puente_calculo") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Perfecto. Entonces hago esto:
      te hago 4 preguntas muy rápidas
      y en base a eso te digo si tiene sentido
      ayudarte o no.”
    </p>

    <p>
      “No es una oferta ni un compromiso,
      es solo un cálculo realista
      para ver si merece la pena.”
    </p>

    <p><strong>👉 AHORA:</strong></p>
    <p>
      Rellena los datos del restaurante
      en el formulario y pulsa <strong>Calcular precio</strong>.
    </p>

    <button class="btn-respuesta" data-siguiente="fin_encargado_calculo">
      ✅ Entendido
    </button>
  `;
}
if (estadoLlamada === "fin_encargado_calculo") {
  modalBody.innerHTML = `
    <p>
      📊 Ya tienes el cálculo delante.
    </p>

    <p>
      Léelo al cliente con calma
      y cuando termines,
      continúa la conversación.
    </p>

    <button class="btn-respuesta" data-siguiente="post_precio_opciones">
      ➡️ Continuar
    </button>
  `;
}
if (estadoLlamada === "post_precio_opciones") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Vale, con estos números encima de la mesa,
      ahora lo importante es decidir si lo activamos
      o no.”
    </p>

    <p><strong>¿Qué responde?</strong></p>

    <button class="btn-respuesta" data-siguiente="cierre_si">
      ✅ “Sí, adelante”
    </button>

    <button class="btn-respuesta" data-siguiente="cierre_dudas">
      🤔 “Déjamelo pensar”
    </button>

    <button class="btn-respuesta" data-siguiente="cierre_no">
      ❌ “Ahora no”
    </button>
  `;
}
if (estadoLlamada === "cierre_si") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Perfecto. Entonces lo hacemos fácil.”
    </p>

    <p>
      “Te activo el sistema con estas condiciones
      y empezamos a trabajar desde hoy mismo.”
    </p>

    <p>
      “Ahora mismo te explico los siguientes pasos.”
    </p>

    <p>
      ✅ Cierre confirmado.
    </p>
  `;
}
if (estadoLlamada === "cierre_dudas") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Es normal pensarlo.”
    </p>

    <p>
      “Déjame preguntarte solo una cosa,
      para saber si tiene sentido que lo dejes en pausa.”
    </p>

    <p>
      “Si dentro de un mes sigues igual
      entre semana,
      ¿te parecería caro
      no haberlo probado?”
    </p>

    <button class="btn-respuesta" data-siguiente="cierre_si">
      ✅ “Visto así, adelante”
    </button>

    <button class="btn-respuesta" data-siguiente="cierre_no">
      ❌ “Prefiero dejarlo”
    </button>
  `;
}
if (estadoLlamada === "cierre_no") {
  modalBody.innerHTML = `
    <p>
      Perfecto, sin problema.
    </p>

    <p>
      Si ahora mismo no es el momento,
      no tiene sentido forzarlo.
    </p>

    <p>
      Te agradezco el tiempo
      y si más adelante quieres revisarlo,
      lo vemos con calma.
    </p>
  `;
}
  if (estadoLlamada === "trabajador_inicio") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>
    <p>
      “Hola, ¿hablo con el responsable del restaurante?”
    </p>

    <p><strong>¿Qué responde?</strong></p>

    <button class="btn-respuesta" data-siguiente="trabajador_no_esta">
      ❌ “No está ahora”
    </button>

    <button class="btn-respuesta" data-siguiente="trabajador_de_que_va">
      ❓ “¿De qué se trata?”
    </button>

    <button class="btn-respuesta" data-siguiente="trabajador_no_interesa">
      🚫 “No estamos interesados”
    </button>

    <button class="btn-respuesta" data-siguiente="trabajador_pasa_whatsapp">
      📲 “Pásame un WhatsApp”
    </button>
  `;
}
if (estadoLlamada === "trabajador_no_esta") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>
    <p>
      “Perfecto, ¿sabes más o menos a qué hora suele estar disponible?”
    </p>

    <button class="btn-respuesta" data-siguiente="trabajador_fin">
      Continuar
    </button>
  `;
}

if (estadoLlamada === "trabajador_de_que_va") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>
    <p>
      “Nada de publicidad, es solo una consulta rápida sobre el restaurante.”
    </p>

    <button class="btn-respuesta" data-siguiente="trabajador_fin">
      Continuar
    </button>
  `;
}

if (estadoLlamada === "trabajador_no_interesa") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>
    <p>
      “Lo entiendo, solo quería saber si entre semana suelen tener mesas libres.”
    </p>

    <button class="btn-respuesta" data-siguiente="trabajador_fin">
      Continuar
    </button>
  `;
}

if (estadoLlamada === "trabajador_pasa_whatsapp") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>
    <p>
      “Perfecto, ¿se lo enseñas tú al responsable o prefieres que le llame yo?”
    </p>

    <button class="btn-respuesta" data-siguiente="trabajador_fin">
      Continuar
    </button>
  `;
}

if (estadoLlamada === "trabajador_fin") {
  modalBody.innerHTML = `
    <p>
      ✅ Objetivo cumplido.<br>
      Has avanzado la llamada correctamente.
    </p>
  `;
}
  // Asignar eventos a botones
  modalBody.querySelectorAll(".btn-respuesta").forEach(btn => {
  btn.onclick = () => {
    // Guardar estado actual en el historial
    historialLlamada.push(estadoLlamada);
if (estadoLlamada === "puente_calculo") {
  volverAGuiaTrasCalculo = true;
  historialLlamada = []; // reset lógico
  cerrarModalLlamadasSeguro();
}
    // Avanzar al siguiente estado
    estadoLlamada = btn.dataset.siguiente;

    renderPasoLlamada();
  };
});
actualizarBotonAtras();
}
/* ===============================
   PASO 9.8 · CONTINUAR GUÍA MANUAL
=============================== */

const btnContinuarGuia = document.getElementById("btnContinuarGuia");

btnContinuarGuia.onclick = () => {
  btnContinuarGuia.style.display = "none";

  volverAGuiaTrasCalculo = false;

  modalLlamadas.style.display = "flex";
  document.body.classList.add("modal-abierto");

  // 👇 AÑADE ESTA LÍNEA
  btnVolverPresupuesto.style.display = "inline-block";

  renderPasoLlamada();
  actualizarBotonAtras();
};
/* ===============================
   MODAL · GUÍA DE LLAMADAS (OPEN / CLOSE)
=============================== */

// Botón que abrirá el modal (lo añadiremos visualmente luego)
const btnAbrirLlamadas = document.getElementById("btnGuiaLlamadas");

// Modal y botón cerrar
const cerrarModalLlamadas = document.getElementById("cerrarModalLlamadas");


// Botón ATRÁS (volver al estado anterior)
btnAtras.onclick = () => {
  if (historialLlamada.length === 0) return;

  // Recuperar último estado
  estadoLlamada = historialLlamada.pop();

  renderPasoLlamada();
  actualizarBotonAtras();
};
// Cerrar modal SOLO con la X
cerrarModalLlamadas.onclick = () => {
  modalLlamadas.style.display = "none";
  document.body.classList.remove("modal-abierto");
};
// Abrir modal
if (btnAbrirLlamadas) {
btnAbrirLlamadas.onclick = () => {
  historialLlamada = [];
  estadoLlamada = "seleccion_rol";
  renderPasoLlamada();
  modalLlamadas.style.display = "flex";
  document.body.classList.add("modal-abierto");
};
}
});