document.getElementById("pdf").onclick = () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.setFontSize(14);
  pdf.text("Propuesta Estratégica de Pricing", 20, 20);

  let y = 40;
  Object.entries(datosGlobales).forEach(([k, v]) => {
    pdf.text(`${k.toUpperCase()}: ${v}`, 20, y);
    y += 10;
  });

  pdf.save("Propuesta_Pricing.pdf");
};