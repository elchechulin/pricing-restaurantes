function initPricingApp() {

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

  if (
  modalLlamadas.style.display !== "flex" &&
  modalLink.style.display !== "flex" &&
  modalObjeciones.style.display !== "flex"
) {
  document.body.classList.remove("modal-abierto");
}
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

let estadoLlamada = "inicio_universal";
// Estado especial cuando ME PASAN con el dueño
let vieneDueno = false;
// ===============================
// SISTEMA DE OBJECIONES · BASE DE DATOS
// ===============================

const OBJECIONES_DB = [

/* ===============================
   PRECIO
=============================== */

{
  id: "precio_caro",
  texto: "Es caro",
  categoria: "precio",
  frecuencia: 10,
  prioridad: 1,
  palabrasClave: ["caro","precio","coste","dinero"],
  respuesta: `
🗣️ DI ESTO:

“Perfecto.
Entonces no es que no quieras,
es que ahora mismo no te encaja el número.

Si con una sola mesa adicional al mes
esto queda amortizado,
¿sigue siendo un problema de presupuesto?”
`,
  redireccion: "cierre_dudas"
},

{
  id: "no_tengo_presupuesto",
  texto: "No tengo presupuesto ahora",
  categoria: "precio",
  frecuencia: 8,
  prioridad: 1,
  palabrasClave: ["presupuesto","ahora no puedo"],
  respuesta: `
🗣️ DI ESTO:

“Entonces no es que no te interese,
es que ahora mismo no lo tenías previsto.

¿Si esto se pagase solo con una mesa más,
seguiría siendo un problema?”
`,
  redireccion: "cierre_dudas"
},

{
  id: "ya_pago_marketing",
  texto: "Ya pago marketing",
  categoria: "precio",
  frecuencia: 7,
  prioridad: 2,
  palabrasClave: ["ya tengo","agencia","marketing"],
  respuesta: `
🗣️ DI ESTO:

“Perfecto.
Entonces la pregunta no es si pagas,
sino si te está llenando mesas entre semana.”
`,
  redireccion: "cierre_dudas"
},

/* ===============================
   PRIORIDAD
=============================== */

{
  id: "no_es_prioridad",
  texto: "Ahora no es prioridad",
  categoria: "prioridad",
  frecuencia: 9,
  prioridad: 1,
  palabrasClave: ["prioridad","más adelante"],
  respuesta: `
🗣️ DI ESTO:

“Entonces no es que no funcione,
es que ahora mismo no lo estás priorizando.

Si dentro de tres meses sigues igual,
¿seguiría sin ser prioridad?”
`,
  redireccion: "cierre_dudas"
},

{
  id: "no_es_buen_momento",
  texto: "No es buen momento",
  categoria: "prioridad",
  frecuencia: 8,
  prioridad: 2,
  palabrasClave: ["momento","ahora no"],
  respuesta: `
🗣️ DI ESTO:

“Entiendo.
Solo una pregunta:
¿cuándo suele ser buen momento
para dejar de perder mesas?”
`,
  redireccion: "cierre_dudas"
},

{
  id: "estoy_liado",
  texto: "Estoy muy liado",
  categoria: "prioridad",
  frecuencia: 6,
  prioridad: 2,
  palabrasClave: ["liado","tiempo"],
  respuesta: `
🗣️ DI ESTO:

“Precisamente por eso.
Esto no te quita tiempo,
te devuelve ingresos.”
`,
  redireccion: "cierre_dudas"
},

/* ===============================
   RETORNO
=============================== */

{
  id: "no_veo_retorno",
  texto: "No veo claro el retorno",
  categoria: "retorno",
  frecuencia: 8,
  prioridad: 1,
  palabrasClave: ["retorno","resultado"],
  respuesta: `
🗣️ DI ESTO:

“Entonces la duda no es el precio,
es si realmente va a generar mesas.

Por eso hemos hecho el cálculo.”
`,
  redireccion: "cierre_dudas"
},

{
  id: "no_estoy_seguro",
  texto: "No estoy seguro de que funcione",
  categoria: "retorno",
  frecuencia: 7,
  prioridad: 2,
  palabrasClave: ["seguro","funciona"],
  respuesta: `
🗣️ DI ESTO:

“Si fuese seguro al 100%,
no sería una inversión,
sería una máquina de imprimir dinero.

La pregunta es:
¿vale la pena probarlo?”
`,
  redireccion: "cierre_dudas"
},

{
  id: "ya_lo_intente",
  texto: "Ya probé algo parecido",
  categoria: "retorno",
  frecuencia: 6,
  prioridad: 2,
  palabrasClave: ["probé","ya hice"],
  respuesta: `
🗣️ DI ESTO:

“Perfecto.
¿Funcionó o solo generó visibilidad?”
`,
  redireccion: "cierre_dudas"
},

/* ===============================
   DUDAS
=============================== */

{
  id: "dejame_pensar",
  texto: "Déjamelo pensar",
  categoria: "dudas",
  frecuencia: 10,
  prioridad: 1,
  palabrasClave: ["pensar","verlo"],
  respuesta: `
🗣️ DI ESTO:

“Perfecto.
Solo para saber:
¿qué parte quieres pensar?
¿El número o el riesgo?”
`,
  redireccion: "cierre_dudas"
},

{
  id: "hablar_con_socio",
  texto: "Tengo que hablarlo con mi socio",
  categoria: "dudas",
  frecuencia: 7,
  prioridad: 2,
  palabrasClave: ["socio","hablar"],
  respuesta: `
🗣️ DI ESTO:

“Perfecto.
¿Lo hablamos los tres y lo dejamos claro?”
`,
  redireccion: "cierre_dudas"
},

{
  id: "mandame_info",
  texto: "Mándame información",
  categoria: "dudas",
  frecuencia: 6,
  prioridad: 2,
  palabrasClave: ["info","email"],
  respuesta: `
🗣️ DI ESTO:

“Claro.
¿Te la envío para decidir
o para archivarla?”
`,
  redireccion: "cierre_dudas"
},

{
  id: "no_me_interesa",
  texto: "No me interesa",
  categoria: "dudas",
  frecuencia: 8,
  prioridad: 1,
  palabrasClave: ["no interesa"],
  respuesta: `
🗣️ DI ESTO:

“Perfecto.
¿No te interesa generar más mesas
o no te interesa hacerlo de esta forma?”
`,
  redireccion: "cierre_dudas"
},

{
  id: "estamos_llenos",
  texto: "Estamos llenos",
  categoria: "retorno",
  frecuencia: 5,
  prioridad: 2,
  palabrasClave: ["llenos"],
  respuesta: `
🗣️ DI ESTO:

“¿Todos los días entre semana
o solo fines de semana?”
`,
  redireccion: "cierre_dudas"
},

{
  id: "ya_tengo_agencia",
  texto: "Ya tengo agencia",
  categoria: "retorno",
  frecuencia: 7,
  prioridad: 2,
  palabrasClave: ["agencia"],
  respuesta: `
🗣️ DI ESTO:

“Perfecto.
Entonces solo necesito saber
si te están llenando mesas entre semana.”
`,
  redireccion: "cierre_dudas"
}

];
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

  // Ocultar flotantes
  document.getElementById("btnObjecionesFlotante").style.display = "none";
  document.getElementById("btnIrPresupuesto").style.display = "none"; // 🔴 FIX

  // Quitar blur si no hay otros modales abiertos
  if (
    modalLink.style.display !== "flex" &&
    modalObjeciones.style.display !== "flex"
  ) {
    document.body.classList.remove("modal-abierto");
  }

  // Ocultar botón header
  btnVolverPresupuesto.style.display = "none";

  // Mostrar botón continuar guía
  document.getElementById("btnContinuarGuia").style.display = "block";
};
// ===============================
// MODAL · GUÍA DE LLAMADAS (CIERRE SEGURO)
// ===============================
function cerrarModalLlamadasSeguro() {
  modalLlamadas.style.display = "none";
  document.body.classList.remove("modal-abierto");
  document.getElementById("btnObjecionesFlotante").style.display = "none";
  document.getElementById("btnIrPresupuesto").style.display = "none";
  btnVolverPresupuesto.style.display = "none";
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
// ===============================
// PROTECCIÓN ANTI-ANOMALÍAS (SILENCIOSA)
// ===============================

// 1) Rating alto con pocas reseñas → desconfianza
if (rating >= 4.6 && resenas < 50) {
  indice *= 0.85;
}

// 2) Gasto bajo intentando High Ticket → freno
if (gasto < 25 && escenarioAplicado === "High") {
  indice *= 0.88;
}

// 3) Pocas reseñas + índice alto → suavizado
if (resenas < 120 && indice > 1.4) {
  indice = 1.4 + (indice - 1.4) * 0.4;
}

// 4) Negocio pequeño con modelo premium implícito → ajuste
if (gasto < 20 && indice > 1.3) {
  indice *= 0.9;
}

if (resenas < 600) indice *= 1.15;
else indice *= 1.35;

if (["asador","brasa","steak","gastro","grill"].some(k => n.includes(k))) {
      indice *= 1.25; razones.push("formato gastronómico de ticket alto");
    } else if (["bar","caf","tapas","snack","cafeteria"].some(k => n.includes(k))) {
      indice *= 0.9; razones.push("formato de consumo rápido");
    } else {
      razones.push("formato estándar");
    }


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

// ===============================
// ELASTICIDAD DETERMINISTA POR ESCENARIO
// ===============================

let elasticidad = 1;

if (escenarioAplicado === "Low") {
  elasticidad = 0.95;
}

if (escenarioAplicado === "Medium") {
  elasticidad = 1.00;
}

if (escenarioAplicado === "High") {
  elasticidad = 1.08;
}

indice *= elasticidad;

// ===============================
// SUAVIZADO FINAL DE ÍNDICE
// ===============================

// Evita saltos bruscos cerca de umbrales
function suavizarIndice(x) {
  // curva sigmoide suave centrada en 1.3
  const k = 4;      // pendiente (más alto = más agresivo)
  const x0 = 1.3;   // centro de suavizado
  const min = 0.9;  // límite inferior
  const max = 1.4;  // límite superior

  const s = 1 / (1 + Math.exp(-k * (x - x0)));
  return min + (max - min) * s;
}

// Aplicación del suavizado
indice = suavizarIndice(indice);
// ===============================
// LÍMITES DUROS POR ESCENARIO
// ===============================

if (escenarioAplicado === "Low") {
  if (indice > 1.15) indice = 1.15;
}

if (escenarioAplicado === "Medium") {
  if (indice < 1.00) indice = 1.00;
  if (indice > 1.35) indice = 1.35;
}

if (escenarioAplicado === "High") {
  if (indice < 1.20) indice = 1.20;
}

// Aplicación final del índice
let mensual = Math.round(baseMensual * indice);
let setup = Math.round(baseSetup * indice);
// ===============================
// CONTROL PSICOLÓGICO DE PRECIOS
// ===============================

function ajustarPrecioPsicologico(precio) {
  if (precio < 40) return Math.round(precio / 5) * 5;

  if (precio < 80) {
    const opciones = [39, 45, 49, 55, 59, 65, 69, 75, 79];
    return opciones.reduce((prev, curr) =>
      Math.abs(curr - precio) < Math.abs(prev - precio) ? curr : prev
    );
  }

  if (precio < 150) {
    const opciones = [89, 95, 99, 109, 119, 129, 139, 149];
    return opciones.reduce((prev, curr) =>
      Math.abs(curr - precio) < Math.abs(prev - precio) ? curr : prev
    );
  }

  // High ticket → redondeo serio
  return Math.round(precio / 10) * 10;
}

// Aplicación final visible al cliente
mensual = ajustarPrecioPsicologico(mensual);
/* ===============================
   SUELO MÍNIMO SAAS
=============================== */

/* ===============================
   SUELO MÍNIMO SAAS INTELIGENTE
=============================== */

/* ===============================
   SUELOS MÍNIMOS POR ESCENARIO
=============================== */

let minimoFinal = 50; // Low por defecto

if (escenarioAplicado === "Medium") {
  minimoFinal = 70;
}

if (escenarioAplicado === "High") {
  minimoFinal = 110;
}

// Convertimos a base antes del descuento
const minimoBase = Math.ceil(minimoFinal / (1 - DESCUENTO_INMEDIATO));

if (mensual < minimoBase) {
  mensual = minimoBase;
}
// ===============================
// MODO TEST STRIPE · PRUEBA PAGO
// ===============================

if (nombre.trim().toLowerCase() === "prueba pago") {

  // Forzamos mensualidad fija para test
  mensual = 1;

  // Eliminamos setup siempre
  setup = 0;

  // Neutralizamos cualquier modo de cierre
  modoCierre = "inmediato";

}
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
    // GUARDAMOS IMPORTES REALES PARA STRIPE
window.ULTIMA_MENSUALIDAD_FINAL = mensualFinal;
window.ULTIMO_SETUP_FINAL = setupFinal;
    // ===============================
// ANCLAJE DE PÉRDIDA REAL
// ===============================

// estimación conservadora de mesas perdidas entre semana
const mesasPerdidasEstimadas = Math.max(4, Math.round(mesas * 2));

// pérdida económica mensual aproximada
const perdidaMensual = mesasPerdidasEstimadas * ingresoMesa;

const perdidaMensualAjustada = Math.min(perdidaMensual, mensualFinal * 6);

    textoCliente = `
RESTAURANTE: ${nombre}
MUNICIPIO: ${municipio}

ESCENARIO SELECCIONADO: ${escenarioSeleccionado.toUpperCase()}
ESCENARIO APLICADO: ${escenarioAplicado.toUpperCase()} TICKET

MODELO: ${modelo}

MODO DE ACTIVACIÓN:
${textoModo}

Ahora mismo, no llenar entre semana
supone una pérdida aproximada de
${perdidaMensualAjustada} € al mes.

${setupFinal > 0 ? `SETUP: ${setupFinal} €\n` : ""}${
  modoCierre === "inmediato"
    ? `
MENSUALIDAD: <span class="precio-tachado">${mensualBase.toFixed(2)} €</span> – ${mensualFinal.toFixed(2)} €
`
    : `
MENSUALIDAD: ${mensualFinal.toFixed(2)} €
`
}

ANÁLISIS:
- ${razones.join("\n- ")}


Con solo ${mesas} mesas adicionales al mes
(≈ ${ingresoMesa} € por mesa)
la mensualidad queda amortizada.
${infoRecomendado}
`.trim();

resultadoEl.innerHTML = textoCliente.replace(/\n/g, "<br>");

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

[LOG INTERNO]
Escenario aplicado: ${escenarioAplicado}
Índice final: ${indice.toFixed(2)}
ICE: ${ICE.toFixed(2)}
IT: ${IT.toFixed(2)}
IO: ${IO.toFixed(2)}
IR: ${IR.toFixed(2)}
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

resultadoEl.innerHTML += `

────────────────────
${textoCierre}
`;
    // Mostrar botón de consecuencia tras el cálculo
    if (estadoCierre !== "cerrado") {
  document.getElementById("btnModoEstandar").style.display = "block";
  document.getElementById("btnCierreFinal").style.display = "block";
} else {
  document.getElementById("btnModoEstandar").style.display = "none";
  document.getElementById("btnCierreFinal").style.display = "none";
}

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
  .contenido-resultado {
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.6;
}

.precio-tachado {
  text-decoration: line-through;
  opacity: 0.6;
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
  <h3>Por qué estás viendo este documento</h3>
  <div class="box">
    Este informe no es una tarifa estándar ni un precio genérico.<br><br>

    El cálculo que vas a ver a continuación se ha generado a partir de:
    <ul>
      <li>Ticket medio del restaurante</li>
      <li>Capacidad real de retorno entre semana</li>
      <li>Nivel de competencia en tu zona</li>
      <li>Riesgo asumido y oportunidad de mejora</li>
    </ul>

    <strong>Conclusión:</strong><br>
    El precio no se ha pensado para venderte un servicio,
    sino para que el servicio se pague solo.
  </div>
</div>

  <div class="section">
  <h3>Resultado del análisis</h3>
  <div class="box">
    <div class="contenido-resultado">
      ${texto}
    </div>
  </div>
</div>

<div class="section">
  <h3>Qué significa este número</h3>
  <div class="box">
    Si el restaurante genera una sola mesa adicional al mes
    entre semana, la inversión queda amortizada.<br><br>

    Todo lo que ocurra a partir de la segunda mesa
    es margen neto.<br><br>

    <strong>No se trata de gastar más.</strong><br>
    Se trata de dejar de perder ingresos
    que ahora mismo no se están capturando.
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

  const mensualidad = window.ULTIMA_MENSUALIDAD_FINAL;
  // ============================
// BLOQUEO MODO DEMO
// ============================
if (localStorage.getItem("modo_demo") === "true") {
  alert("Modo demo: enlace ficticio generado.");
  return;
}

  if (!mensualidad) {
    alert("No hay mensualidad calculada.");
    return;
  }

  const usuarioId = Number(localStorage.getItem("usuario_id"));

  if (!usuarioId || isNaN(usuarioId)) {
    alert("Sesión inválida. Vuelve a iniciar sesión.");
    return;
  }

  try {
    const res = await fetch(
      "https://stripe-backend-h1z1.vercel.app/api/create-payment-link",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensualidad,
          setup: 0,
          modo: "inmediato",
          closer_id: usuarioId
        })
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Stripe backend error:", errorText);
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
    console.error("Fetch error:", err);
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

  const mensualidad = window.ULTIMA_MENSUALIDAD_FINAL;
  const setup = window.ULTIMO_SETUP_FINAL;
  // ============================
// BLOQUEO MODO DEMO
// ============================
if (localStorage.getItem("modo_demo") === "true") {
  alert("Modo demo: enlace ficticio generado.");
  return;
}

  if (!mensualidad || !setup) {
    alert("No hay importes calculados.");
    return;
  }

  const usuarioId = Number(localStorage.getItem("usuario_id"));

  if (!usuarioId || isNaN(usuarioId)) {
    alert("Sesión inválida. Vuelve a iniciar sesión.");
    return;
  }

  try {
    const res = await fetch(
      "https://stripe-backend-h1z1.vercel.app/api/create-payment-link",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensualidad,
          setup,
          modo: "setup",
          closer_id: usuarioId
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
  
  if (estadoLlamada === "inicio_universal") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Hola, una consulta muy rápida sobre el restaurante.”
    </p>

    <p>
      “Antes de seguir, dime una cosa rápida:
      entre semana, ¿soléis estar llenos
      o hay huecos?”
    </p>

    <p><strong>¿Qué responde?</strong></p>

    <button class="btn-respuesta" data-siguiente="hay_huecos_universal">
      😐 “Hay huecos”
    </button>

    <button class="btn-respuesta" data-siguiente="todo_lleno_universal">
      👍 “Vamos bastante llenos”
    </button>
  `;
}

if (estadoLlamada === "todo_lleno_universal") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Perfecto. Te hago una pregunta muy directa.”
    </p>

    <p>
      “Cuando dices que vais llenos,
      ¿hablamos de lunes a jueves también
      o solo viernes y fin de semana?”
    </p>

    <button class="btn-respuesta" data-siguiente="hay_huecos_universal">
      😐 “Bueno… algunos días flojean”
    </button>

    <button class="btn-respuesta" data-siguiente="cierre_no">
      👍 “No, vamos realmente llenos”
    </button>
  `;
}

if (estadoLlamada === "hay_huecos_universal") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Vale. Entonces estamos hablando de mesas
      que ahora mismo se podrían estar facturando
      y no se están facturando.”
    </p>

    <p>
      “Dime una cosa muy directa:
      ¿esto pasa todas las semanas
      o solo en momentos puntuales?”
    </p>

    <button class="btn-respuesta" data-siguiente="problema_recurrente_universal">
      📉 “Es bastante habitual”
    </button>

    <button class="btn-respuesta" data-siguiente="problema_leve_universal">
      😐 “Solo a veces”
    </button>
  `;
}

if (estadoLlamada === "problema_recurrente_universal") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Entonces no estamos hablando de algo puntual.
      Estamos hablando de ingresos
      que se están dejando encima de la mesa
      todas las semanas.”
    </p>

    <p>
      “Si esto lleva pasando meses,
      la pregunta no es si se puede mejorar,
      sino cuánto dinero se ha dejado de facturar ya.”
    </p>

    <p>
      “Déjame hacerte una pregunta muy directa:
      ¿ahora mismo estás haciendo algo específico
      para corregirlo?”
    </p>

    <button class="btn-respuesta" data-siguiente="no_estan_haciendo_nada_universal">
      ❌ “No realmente”
    </button>

    <button class="btn-respuesta" data-siguiente="estan_probando_algo_universal">
      🔄 “Sí, estamos probando cosas”
    </button>
    
    <button class="btn-respuesta" data-siguiente="transicion_dueno_sugerida">
  👑 Esto debería verlo el dueño
</button>
  `;
}

if (estadoLlamada === "no_estan_haciendo_nada_universal") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Entonces el problema no es la demanda.
      Es que no hay un sistema
      activamente corrigiéndolo.”
    </p>

    <p>
      “Eso significa que cada semana
      se siguen perdiendo mesas
      sin que nadie lo esté midiendo.”
    </p>

    <p>
      “Déjame hacer un cálculo rápido
      para ver si estamos hablando
      de algo relevante o no.”
    </p>

    <p><strong>👉 AHORA:</strong></p>
    <p>
      Rellena los datos y pulsa <strong>Calcular precio</strong>.
    </p>
    
    <button class="btn-respuesta" data-siguiente="transicion_dueno_sugerida">
  👑 Esto debería verlo el dueño
</button>

    <button class="btn-respuesta" data-siguiente="fin_encargado_calculo">
      ✅ Vale
    </button>
  `;
}

if (estadoLlamada === "estan_probando_algo_universal") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Perfecto. Eso es buena señal.”
    </p>

    <p>
      “La pregunta es:
      ¿lo que estáis probando
      está generando reservas medibles
      o solo visibilidad?”
    </p>

    <p>
      “Déjame hacer un cálculo rápido
      para compararlo con números reales.”
    </p>

    <p><strong>👉 AHORA:</strong></p>
    <p>
      Rellena los datos y pulsa <strong>Calcular precio</strong>.
    </p>
    
    <button class="btn-respuesta" data-siguiente="transicion_dueno_sugerida">
  👑 Esto debería verlo el dueño
</button>

    <button class="btn-respuesta" data-siguiente="fin_encargado_calculo">
      ✅ Entendido
    </button>
  `;
}

if (estadoLlamada === "problema_leve_universal") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Perfecto. Entonces no es grave,
      pero tampoco está optimizado.”
    </p>

    <p>
      “Normalmente cuando dicen ‘a veces’,
      significa que hay margen,
      solo que no se está midiendo.”
    </p>

    <p>
      “Déjame hacer un cálculo rápido
      para ver si estamos hablando
      de algo pequeño
      o de dinero relevante.”
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
if (estadoLlamada === "dueno_todo_lleno") {
  modalBody.innerHTML = `
    <p>
      Perfecto entonces.
    </p>

    <p>
      Si entre semana ya vais llenos,
      no tiene sentido tocar nada ahora.
    </p>

    <p>
      Si en algún momento baja la ocupación,
      lo revisamos sin problema.
    </p>
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

    <button class="btn-respuesta" data-siguiente="transicion_dueno">
      👑 Me pasan con el dueño
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
    <p><strong>🗣️ DI ESTO (control total):</strong></p>

    <p>
      “Vale. Entonces ya tenemos claro el número.”
    </p>

    <p>
      “La única pregunta real ahora mismo es:
      ¿prefieres seguir como estás
      o empezar a corregirlo desde esta semana?”
    </p>

    <p>
      (Silencio. Deja que responda.)
    </p>

    <p><strong>Si duda, añade:</strong></p>

    <p>
      “Porque si dentro de 30 días sigues con huecos,
      el coste no habrá sido este,
      habrá sido lo que hayas dejado de facturar.”
    </p>

    <p><strong>¿Qué decide?</strong></p>

    <button class="btn-respuesta" data-siguiente="cierre_si">
      ✅ “Lo activamos”
    </button>

    <button class="btn-respuesta" data-siguiente="cierre_dudas">
      🤔 “Déjame pensarlo”
    </button>

    <button class="btn-respuesta" data-siguiente="cierre_no">
      ❌ “Ahora no”
    </button>
    
    <button class="btn-respuesta" data-siguiente="objecion_universal">
  🧠 Objeción inesperada
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
if (estadoLlamada === "objecion_universal") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO (bloque anti-bloqueo):</strong></p>

    <p>
      “Perfecto, lo respeto.”
    </p>

    <p>
      “Solo para ubicarme mejor,
      ¿es algo de presupuesto,
      de prioridad
      o de que no ves claro el retorno?”
    </p>

    <button class="btn-respuesta" data-siguiente="objecion_presupuesto">
      💰 “Es presupuesto”
    </button>

    <button class="btn-respuesta" data-siguiente="objecion_prioridad">
      ⏳ “No es prioridad”
    </button>

    <button class="btn-respuesta" data-siguiente="objecion_retorno">
      📉 “No veo claro retorno”
    </button>
  `;
}
if (estadoLlamada === "objecion_presupuesto") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO (presupuesto):</strong></p>

    <p>
      “Perfecto. Entonces no es que no quieras,
      es que ahora mismo no te encaja el número.”
    </p>

    <p>
      “Déjame preguntarte algo muy concreto:
      si con una sola mesa adicional al mes
      esto queda amortizado,
      ¿sigue siendo un problema de presupuesto?”
    </p>

    <button class="btn-respuesta" data-siguiente="cierre_si">
      ✅ “Visto así, adelante”
    </button>

    <button class="btn-respuesta" data-siguiente="cierre_no">
      ❌ “Prefiero dejarlo”
    </button>
  `;
}
if (estadoLlamada === "objecion_prioridad") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO (prioridad):</strong></p>

    <p>
      “Perfecto. Entonces no es que no funcione,
      es que ahora mismo no lo estás priorizando.”
    </p>

    <p>
      “Solo te hago una pregunta:
      si dentro de tres meses sigues
      con huecos entre semana,
      ¿seguiría sin ser prioridad?”
    </p>

    <button class="btn-respuesta" data-siguiente="cierre_si">
      ✅ “Lo activamos”
    </button>

    <button class="btn-respuesta" data-siguiente="cierre_no">
      ❌ “Lo dejamos”
    </button>
  `;
}
if (estadoLlamada === "objecion_retorno") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO (retorno):</strong></p>

    <p>
      “Perfecto. Entonces la duda no es el precio,
      es si realmente va a generar mesas.”
    </p>

    <p>
      “Por eso precisamente hemos hecho el cálculo.”
    </p>

    <p>
      “Si no generase al menos una mesa adicional al mes,
      no tendría sentido ni para ti ni para nosotros.”
    </p>

    <button class="btn-respuesta" data-siguiente="cierre_si">
      ✅ “Probamos”
    </button>

    <button class="btn-respuesta" data-siguiente="cierre_no">
      ❌ “No lo veo”
    </button>
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

if (estadoLlamada === "transicion_dueno") {
  vieneDueno = true;

  modalBody.innerHTML = `
    <p><strong>🧠 CAMBIO DE CONTEXTO</strong></p>

    <p>
      Te pasan con el dueño ahora mismo.
    </p>

    <p>
      No repitas nada anterior.
      Entra directo a ocupación.
    </p>

    <button class="btn-respuesta" data-siguiente="dueno_reentrada">
      ➡️ Continuar con el dueño
    </button>
  `;
}

if (estadoLlamada === "transicion_dueno_sugerida") {
  vieneDueno = true;

  modalBody.innerHTML = `
    <p><strong>🧠 CAMBIO ESTRATÉGICO</strong></p>

    <p>
      Si esto es algo recurrente,
      lo más lógico es que lo vea quien toma decisiones.
    </p>

    <p>
      No es un tema operativo.
      Es un tema de ingresos.
    </p>

    <p>
      ¿Te parece si me pasas con el dueño
      y se lo explico en 30 segundos?
    </p>

    <button class="btn-respuesta" data-siguiente="dueno_reentrada_directa">
      👑 Me pasan con el dueño
    </button>

    <button class="btn-respuesta" data-siguiente="puente_calculo">
      📊 Prefiere que lo calculemos ahora
    </button>
  `;
}

if (estadoLlamada === "dueno_reentrada") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO:</strong></p>

    <p>
      “Hola, soy Jesús.
      Me acaban de pasar contigo.”
    </p>

    <p>
      “Voy directo:
      entre semana,
      ¿el restaurante suele llenarse
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

if (estadoLlamada === "dueno_reentrada_directa") {
  modalBody.innerHTML = `
    <p><strong>🗣️ DI ESTO (reinicio limpio):</strong></p>

    <p>
      “Hola, soy Jesús.
      Te llamo muy rápido por un tema concreto.”
    </p>

    <p>
      “Voy directo:
      entre semana,
      ¿el restaurante suele llenarse
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

// Añadir botón global de cambio a dueño al FINAL del render
if (
  !estadoLlamada.startsWith("dueno") &&
  !estadoLlamada.startsWith("cierre") &&
  estadoLlamada !== "transicion_dueno" &&
  estadoLlamada !== "transicion_dueno_sugerida" &&
  estadoLlamada !== "fin_encargado_calculo" &&
  estadoLlamada !== "post_precio_opciones"
) {
  const btnCambioDueno = document.createElement("button");
btnCambioDueno.textContent = "👑 Me pasan con el dueño ahora";
btnCambioDueno.className = "btn-respuesta";
btnCambioDueno.dataset.siguiente = "dueno_reentrada_directa";
btnCambioDueno.style.marginTop = "14px";
btnCambioDueno.style.background = "#111";
btnCambioDueno.style.color = "#fff";

modalBody.appendChild(btnCambioDueno);
}
  // Asignar eventos a botones
  modalBody.querySelectorAll(".btn-respuesta").forEach(btn => {
  btn.addEventListener("click", () => {

    // Si tiene data-siguiente, usamos flujo normal
    if (btn.dataset.siguiente) {

      historialLlamada.push(estadoLlamada);

      if (estadoLlamada === "puente_calculo") {
  volverAGuiaTrasCalculo = true;
  historialLlamada = [];

  // 🔴 Ocultamos botón flotante de presupuesto
  document.getElementById("btnIrPresupuesto").style.display = "none";

  cerrarModalLlamadasSeguro();
  return;
}

      estadoLlamada = btn.dataset.siguiente;

// 🔴 Si es cierre, activar lógica real
if (estadoLlamada === "cierre_si") {
  estadoCierre = "cerrado";
  onboardingActivo = true;
  mostrarOnboarding();
  document.getElementById("btnCrearEnlaceInmediato").style.display = "block";
  document.getElementById("btnCrearEnlaceSetup").style.display = "none";
}

renderPasoLlamada();
return;
    }

  });
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
  document.getElementById("btnObjecionesFlotante").style.display = "flex";
  document.getElementById("btnIrPresupuesto").style.display = "flex";

  btnVolverPresupuesto.style.display = "inline-block";

  renderPasoLlamada();
  actualizarBotonAtras();
};
/* ===============================
   BOTÓN FLOTANTE · IR A PRESUPUESTO
=============================== */

const btnIrPresupuesto = document.getElementById("btnIrPresupuesto");

if (btnIrPresupuesto) {
  btnIrPresupuesto.onclick = () => {

    // Cerramos modal SIN resetear estado
    modalLlamadas.style.display = "none";

    // Ocultamos flotantes
    document.getElementById("btnObjecionesFlotante").style.display = "none";
    btnIrPresupuesto.style.display = "none"; // 🔴 ESTE ES EL FIX

    // Quitamos blur si no hay otros modales abiertos
    if (
      modalLink.style.display !== "flex" &&
      modalObjeciones.style.display !== "flex"
    ) {
      document.body.classList.remove("modal-abierto");
    }

    // Mostramos botón continuar guía
    document.getElementById("btnContinuarGuia").style.display = "block";

    // Mostrar botón volver presupuesto cuando reentres
    btnVolverPresupuesto.style.display = "inline-block";
  };
}
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
  document.getElementById("btnIrPresupuesto").style.display = "none";
btnVolverPresupuesto.style.display = "none";
  document.body.classList.remove("modal-abierto");
  document.getElementById("btnObjecionesFlotante").style.display = "none";
};
// Abrir modal
if (btnAbrirLlamadas) {
  btnAbrirLlamadas.onclick = () => {
    historialLlamada = [];
    estadoLlamada = "inicio_universal";
    renderPasoLlamada();
    modalLlamadas.style.display = "flex";
    document.getElementById("btnObjecionesFlotante").style.display = "flex";
    document.getElementById("btnIrPresupuesto").style.display = "flex";
    document.body.classList.add("modal-abierto");
  };
}
/* ===============================
   MOTOR · RENDER OBJECIONES
=============================== */

const modalObjecionesBody = document.getElementById("modalObjecionesBody");
/* ===============================
   MOTOR · RENDER OBJECIONES (LIMPIO)
=============================== */

let filtroCategoria = "todas";
let objecionesInicializadas = false;
let vistaActualObjeciones = "lista"; 
// "lista" | "detalle"

function renderObjeciones() {

  if (!objecionesInicializadas) {
    renderEstructuraObjeciones();
    objecionesInicializadas = true;
  }

  renderListaObjeciones();
}

function renderEstructuraObjeciones() {

  modalObjecionesBody.innerHTML = `
  
  <div class="obj-header">
    <h3>🔥 OBJECIONES Y SUJECIONES</h3>
    <button class="obj-search" id="btnActivarBusqueda">🔍</button>
  </div>

  <div id="buscadorContainer" style="display:none; margin-bottom:12px;">
    <input 
      type="text" 
      id="inputBusquedaObjeciones" 
      placeholder="Buscar objeción..."
      style="
        width:100%;
        padding:8px 10px;
        border-radius:10px;
        border:none;
        font-size:13px;
      "
    />
  </div>

  <div class="categorias-scroll">
    <button class="categoria-pill" data-filtro="todas">TODAS</button>
    <button class="categoria-pill" data-filtro="precio">PRECIO</button>
    <button class="categoria-pill" data-filtro="dudas">DUDAS</button>
    <button class="categoria-pill" data-filtro="prioridad">PRIORIDAD</button>
    <button class="categoria-pill" data-filtro="retorno">RETORNO</button>
  </div>

  <div id="listaObjeciones"></div>
  `;

  asignarEventosCategorias();
  activarBuscador();
}

function renderListaObjeciones(listaPersonalizada = null) {

  let lista = listaPersonalizada ? listaPersonalizada : [...OBJECIONES_DB];

  if (!listaPersonalizada && filtroCategoria !== "todas") {
    lista = lista.filter(o => o.categoria === filtroCategoria);
  }

  lista.sort((a, b) => b.frecuencia - a.frecuencia);

  const top10 = lista.slice(0, 10);

  const contenedor = document.getElementById("listaObjeciones");

  contenedor.innerHTML = top10.map(obj => `
    <button class="btn-objecion" data-id="${obj.id}">
      ${obj.texto}
    </button>
  `).join("");

  actualizarCategoriaActiva();
  asignarEventosObjecionIndividual();
}

function asignarEventosCategorias() {
  modalObjecionesBody.querySelectorAll("[data-filtro]").forEach(btn => {
    btn.onclick = () => {
      filtroCategoria = btn.dataset.filtro;
      renderListaObjeciones();
    };
  });
}

function actualizarCategoriaActiva() {
  modalObjecionesBody.querySelectorAll(".categoria-pill").forEach(btn => {
    btn.classList.remove("activa");
    if (btn.dataset.filtro === filtroCategoria) {
      btn.classList.add("activa");
    }
  });
}

function asignarEventosObjecionIndividual() {
  modalObjecionesBody.querySelectorAll("[data-id]").forEach(btn => {
    btn.onclick = () => {
      const obj = OBJECIONES_DB.find(o => o.id === btn.dataset.id);
      if (!obj) return;

      vistaActualObjeciones = "detalle";

      modalObjecionesBody.innerHTML = `
        <div class="obj-header">
          <button id="btnVolverListaObjeciones" class="btn-volver-obj">
            ← Volver
          </button>
        </div>

        <div class="obj-detalle">
          <p>${obj.respuesta}</p>

          <button class="btn-objecion" id="btnAplicarRedireccion">
            ➡️ Aplicar en llamada
          </button>
        </div>
      `;

      document.getElementById("btnVolverListaObjeciones").onclick = () => {
  vistaActualObjeciones = "lista";
  objecionesInicializadas = false;   // 🔴 fuerza reconstrucción limpia
  renderObjeciones();
};

      document.getElementById("btnAplicarRedireccion").onclick = () => {
  if (obj.redireccion) {
    estadoLlamada = obj.redireccion;
    renderPasoLlamada();

    // 🔴 RESET COMPLETO SISTEMA OBJECIONES
    vistaActualObjeciones = "lista";
    objecionesInicializadas = false;

    modalObjeciones.style.display = "none";
  }
};
    };
  });
}

function activarBuscador() {

  const btnBuscar = document.getElementById("btnActivarBusqueda");
  const buscadorContainer = document.getElementById("buscadorContainer");
  const inputBusqueda = document.getElementById("inputBusquedaObjeciones");

  btnBuscar.onclick = () => {
    buscadorContainer.style.display =
      buscadorContainer.style.display === "none" ? "block" : "none";
    inputBusqueda.focus();
  };

  inputBusqueda.oninput = () => {

    const valor = inputBusqueda.value.toLowerCase().trim();

    let listaFiltrada = OBJECIONES_DB.filter(obj => {
      const coincideTexto = obj.texto.toLowerCase().includes(valor);
      const coincideKeywords = obj.palabrasClave.some(k =>
        k.toLowerCase().includes(valor)
      );
      return coincideTexto || coincideKeywords;
    });

    if (filtroCategoria !== "todas") {
      listaFiltrada = listaFiltrada.filter(
        o => o.categoria === filtroCategoria
      );
    }

    renderListaObjeciones(listaFiltrada);
  };
}
/* ===============================
   MODAL · OBJECIONES (OPEN / CLOSE)
=============================== */

const btnObjecionesFlotante = document.getElementById("btnObjecionesFlotante");
const modalObjeciones = document.getElementById("modalObjeciones");
const cerrarModalObjeciones = document.getElementById("cerrarModalObjeciones");

// Abrir modal de objeciones
if (btnObjecionesFlotante) {
  btnObjecionesFlotante.onclick = () => {

    // 🔴 Siempre reconstruir desde cero
    vistaActualObjeciones = "lista";
    objecionesInicializadas = false;

    renderObjeciones();
    modalObjeciones.style.display = "flex";
    document.body.classList.add("modal-abierto");
  };
}

// Cerrar modal de objeciones
if (cerrarModalObjeciones) {
  cerrarModalObjeciones.onclick = () => {
    modalObjeciones.style.display = "none";

    // Solo quitamos blur si no queda ningún modal abierto
    if (
  modalLlamadas.style.display !== "flex" &&
  modalLink.style.display !== "flex" &&
  modalObjeciones.style.display !== "flex"
) {
  document.body.classList.remove("modal-abierto");
}
  };
}
}