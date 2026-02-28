const C = require('./pdf-colors');

/**
 * Helpers gráficos para PDFKit.
 * Cada función recibe el objeto `doc` de PDFKit y dibuja sobre él.
 */

/** Rectángulo relleno */
const fill = (doc, x, y, w, h, color) => doc.rect(x, y, w, h).fill(color);

/** Texto posicionado */
const put = (doc, txt, x, y, opts = {}) => doc.text(txt, x, y, opts);

/** Línea horizontal */
const hline = (doc, y, x0, x1, color = C.rule, w = 0.5) => {
  doc.save().moveTo(x0, y).lineTo(x1, y)
     .lineWidth(w).strokeColor(color).stroke().restore();
};

/** Icono de dumbbell estilizado (formas geométricas) */
const drawDumbbell = (doc, cx, cy, size, color) => {
  const s = size;
  doc.save();
  doc.rect(cx - s * 0.6, cy - s * 0.06, s * 1.2, s * 0.12).fill(color);
  doc.roundedRect(cx - s * 0.85, cy - s * 0.3, s * 0.3, s * 0.6, 3).fill(color);
  doc.roundedRect(cx + s * 0.55, cy - s * 0.3, s * 0.3, s * 0.6, 3).fill(color);
  doc.restore();
};

/** Diamante decorativo */
const drawDiamond = (doc, cx, cy, size, color) => {
  doc.save();
  doc.moveTo(cx, cy - size)
     .lineTo(cx + size, cy)
     .lineTo(cx, cy + size)
     .lineTo(cx - size, cy)
     .closePath().fill(color);
  doc.restore();
};

/** Patrón de líneas diagonales decorativas */
const drawDiagonalPattern = (doc, x, y, w, h, color, spacing = 12) => {
  doc.save().rect(x, y, w, h).clip();
  doc.strokeColor(color).lineWidth(0.4).opacity(0.15);
  for (let i = -h; i < w + h; i += spacing) {
    doc.moveTo(x + i, y).lineTo(x + i + h, y + h).stroke();
  }
  doc.opacity(1).restore();
};

/** Badge numérico circular premium */
const drawBadge = (doc, cx, cy, num) => {
  doc.circle(cx, cy, 16).fill(C.gold);
  doc.circle(cx, cy, 13).fill(C.dark);
  doc.fontSize(12).font('Helvetica-Bold').fillColor(C.gold);
  put(doc, String(num).padStart(2, '0'), cx - 13, cy - 6, { width: 26, align: 'center' });
};

/** Tag / Pill para etiquetas */
const drawTag = (doc, label, x, y, bgColor, textColor) => {
  const w = doc.fontSize(7).font('Helvetica-Bold').widthOfString(label) + 14;
  doc.roundedRect(x, y, w, 16, 8).fill(bgColor);
  doc.fontSize(7).font('Helvetica-Bold').fillColor(textColor);
  put(doc, label, x + 7, y + 4);
  return w;
};

module.exports = {
  fill,
  put,
  hline,
  drawDumbbell,
  drawDiamond,
  drawDiagonalPattern,
  drawBadge,
  drawTag,
};
