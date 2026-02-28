const PDFDocument = require('pdfkit');
const C = require('../helpers/pdf-colors');
const {
  fill, put, hline,
  drawDumbbell, drawDiamond, drawDiagonalPattern,
  drawBadge, drawTag,
} = require('../helpers/pdf-drawing');

/**
 * Servicio de generación de PDF — toda la lógica gráfica.
 */

/**
 * Genera un PDF de pauta y lo emite al stream dado.
 * @param {object} pauta       - Pauta con ejercicios incluidos
 * @param {WritableStream} out - Stream de salida (normalmente res)
 * @returns {string} filename sugerido
 */
function generatePautaPdf(pauta, out) {
  const ejercicios = pauta.ejercicios;

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    bufferPages: true,
  });

  const safeTitle = pauta.titulo.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const filename  = `pauta_${safeTitle}_${pauta.mes}_${pauta.anio}.pdf`;
  doc.pipe(out);

  const PW = doc.page.width;   // 595
  const PH = doc.page.height;  // 842
  const ML = 40;
  const MR = 40;
  const TW = PW - ML - MR;     // 515

  /* ══════════════════════════════════════════
     PORTADA
     ══════════════════════════════════════════ */
  const drawCover = () => {
    fill(doc, 0, 0, PW, PH, C.dark);
    drawDiagonalPattern(doc, 0, 0, PW, PH * 0.55, C.gold, 18);

    fill(doc, 0, 0, PW, 6, C.gold);
    fill(doc, 0, 6, PW, 2, C.goldDark);

    const blockY = 220;
    const blockH = 260;

    hline(doc, blockY, ML, ML + TW, C.goldDark, 0.75);
    hline(doc, blockY + blockH, ML, ML + TW, C.goldDark, 0.75);

    drawDiamond(doc, ML, blockY, 4, C.gold);
    drawDiamond(doc, ML + TW, blockY, 4, C.gold);
    drawDiamond(doc, ML, blockY + blockH, 4, C.gold);
    drawDiamond(doc, ML + TW, blockY + blockH, 4, C.gold);

    const labelY = blockY + 30;
    doc.fontSize(10).font('Helvetica').fillColor(C.gold);
    put(doc, 'P L A N   D E   E N T R E N A M I E N T O', ML, labelY, {
      width: TW, align: 'center', characterSpacing: 1.5,
    });

    const lw = 80;
    const lcx = PW / 2;
    const ly = labelY + 18;
    hline(doc, ly, lcx - lw - 30, lcx - 30, C.goldDark, 0.5);
    hline(doc, ly, lcx + 30, lcx + lw + 30, C.goldDark, 0.5);
    drawDiamond(doc, lcx, ly, 3, C.gold);

    doc.fontSize(32).font('Helvetica-Bold').fillColor(C.white);
    put(doc, pauta.titulo.toUpperCase(), ML, labelY + 40, {
      width: TW, align: 'center', lineGap: 8,
    });

    const titleH = doc.fontSize(32).font('Helvetica-Bold')
                      .heightOfString(pauta.titulo.toUpperCase(), { width: TW, lineGap: 8 });
    const sepY = labelY + 40 + titleH + 20;
    hline(doc, sepY, lcx - 60, lcx + 60, C.gold, 1);

    doc.fontSize(16).font('Helvetica').fillColor(C.goldLight);
    put(doc, `${pauta.mes.toUpperCase()}  ·  ${pauta.anio}`, ML, sepY + 16, {
      width: TW, align: 'center', characterSpacing: 3,
    });

    drawDumbbell(doc, PW / 2, blockY + blockH - 30, 28, C.goldDark);

    if (pauta.descripcion) {
      const descY = blockY + blockH + 40;
      doc.fontSize(10).font('Helvetica-Oblique').fillColor(C.silver);
      put(doc, pauta.descripcion, ML + 30, descY, {
        width: TW - 60, align: 'center', lineGap: 4,
      });
    }

    fill(doc, 0, PH - 50, PW, 50, C.darkCard);
    fill(doc, 0, PH - 52, PW, 2, C.gold);
    doc.fontSize(7.5).font('Helvetica').fillColor(C.dimGray);
    put(doc, 'PROGRAMA PERSONALIZADO DE ENTRENAMIENTO', ML, PH - 32, {
      width: TW, align: 'center', characterSpacing: 2,
    });
  };

  /* ══════════════════════════════
     HEADER PÁGINAS INTERNAS
     ══════════════════════════════ */
  const drawPageHeader = () => {
    fill(doc, 0, 0, PW, 52, C.darkCard);
    fill(doc, 0, 52, PW, 3, C.gold);

    doc.fontSize(9).font('Helvetica-Bold').fillColor(C.offWhite);
    put(doc, pauta.titulo.toUpperCase(), ML + 8, 18, { width: TW * 0.6 });

    doc.fontSize(8).font('Helvetica').fillColor(C.gold);
    put(doc, `${pauta.mes.toUpperCase()} ${pauta.anio}`, ML, 20, { width: TW - 8, align: 'right' });

    drawDumbbell(doc, ML + TW - 6, 38, 10, C.goldDark);
  };

  /* ══════════════════════════════
     FOOTER
     ══════════════════════════════ */
  const drawFooter = (num) => {
    fill(doc, 0, PH - 36, PW, 36, C.darkCard);
    fill(doc, 0, PH - 38, PW, 2, C.gold);

    const px = PW / 2;
    const py = PH - 18;
    doc.circle(px, py, 10).fill(C.gold);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(C.dark);
    put(doc, String(num), px - 10, py - 5, { width: 20, align: 'center' });

    doc.fontSize(7).font('Helvetica').fillColor(C.dimGray);
    put(doc, pauta.titulo, ML + 8, PH - 22);
  };

  /* ══════════════════════════════
     SECCIÓN TÍTULO
     ══════════════════════════════ */
  const sectionTitle = (label, y) => {
    fill(doc, ML, y, TW, 28, C.surface);
    fill(doc, ML, y, 4, 28, C.gold);

    doc.fontSize(11).font('Helvetica-Bold').fillColor(C.offWhite);
    put(doc, label, ML + 16, y + 8);

    const textW = doc.widthOfString(label) + ML + 24;
    hline(doc, y + 14, textW, ML + TW - 12, C.ruleLight, 0.5);

    return y + 40;
  };

  /* ══════════════════════════════════════════════════
     CONSTRUCCIÓN DEL PDF
     ══════════════════════════════════════════════════ */
  drawCover();
  doc.addPage();
  let pageNum = 2;

  fill(doc, 0, 0, PW, PH, C.dark);
  drawPageHeader();
  let curY = 68;

  /* ── CALENTAMIENTO ── */
  if (pauta.calentamiento) {
    curY = sectionTitle('CALENTAMIENTO', curY);
    curY += 4;

    const pad = 16;
    const tW  = TW - pad * 2;
    const tH  = doc.fontSize(9.5).font('Helvetica')
                   .heightOfString(pauta.calentamiento, { width: tW, lineGap: 4 });
    const boxH = tH + pad * 2;

    doc.roundedRect(ML, curY, TW, boxH, 6).fill(C.darkSoft);
    doc.roundedRect(ML, curY, 4, boxH, 2).fill(C.gold);
    doc.roundedRect(ML, curY, TW, boxH, 6)
       .lineWidth(0.75).strokeColor(C.ruleLight).stroke();

    doc.save();
    const flameX = ML + pad + 2;
    const flameY = curY + pad + 2;
    doc.moveTo(flameX, flameY + 10)
       .lineTo(flameX + 5, flameY)
       .lineTo(flameX + 10, flameY + 10)
       .quadraticCurveTo(flameX + 5, flameY + 8, flameX, flameY + 10)
       .fill(C.copper);
    doc.restore();

    doc.fontSize(9.5).font('Helvetica').fillColor(C.offWhite);
    put(doc, pauta.calentamiento, ML + pad + 16, curY + pad, {
      width: tW - 16, align: 'left', lineGap: 4,
    });
    curY += boxH + 20;
  }

  /* ── SECCIÓN EJERCICIOS ── */
  curY = sectionTitle(`EJERCICIOS  (${ejercicios.length})`, curY);
  curY += 8;

  const BADGE_R = 16;
  const BADGE_W = BADGE_R * 2 + 10;
  const CONT_X  = ML + BADGE_W + 6;
  const CONT_W  = TW - BADGE_W - 10;
  const CPAD    = 14;
  const FOOTER_ZONE = 50;

  const accentColors = [C.gold, C.teal, C.coral, C.copper, C.sky, C.lime];

  const cardHeight = (ej) => {
    let h = 0;
    h += doc.fontSize(11).font('Helvetica-Bold')
             .heightOfString(ej.nombre || '', { width: CONT_W - 16, lineGap: 2 }) + 4;
    h += 10;
    if (ej.series_repeticiones) {
      h += 20;
      h += doc.fontSize(9).font('Helvetica')
               .heightOfString(ej.series_repeticiones, { width: CONT_W - 24, lineGap: 3 }) + 10;
    }
    if (ej.cargas_kg) {
      h += 20;
      h += doc.fontSize(9).font('Helvetica')
               .heightOfString(ej.cargas_kg, { width: CONT_W - 24, lineGap: 3 }) + 10;
    }
    if (ej.observaciones) {
      h += 20;
      h += doc.fontSize(9).font('Helvetica')
               .heightOfString(ej.observaciones, { width: CONT_W - 24, lineGap: 3 }) + 10;
    }
    if (ej.video_url) h += 22;
    return h + CPAD * 2 + 4;
  };

  ejercicios.forEach((ej, idx) => {
    const cH = cardHeight(ej);

    if (curY + cH > PH - FOOTER_ZONE) {
      drawFooter(pageNum);
      doc.addPage();
      pageNum++;
      fill(doc, 0, 0, PW, PH, C.dark);
      drawPageHeader();
      curY = 68;
    }

    doc.roundedRect(ML, curY, TW, cH, 8).fill(C.darkCard);
    doc.roundedRect(ML, curY, TW, cH, 8)
       .lineWidth(0.5).strokeColor(C.rule).stroke();

    const ejAccent = accentColors[idx % accentColors.length];
    doc.roundedRect(ML, curY, 5, cH, 3).fill(ejAccent);
    drawDiagonalPattern(doc, ML + 5, curY, TW - 5, cH, C.white, 20);

    drawBadge(doc, ML + BADGE_W / 2 + 4, curY + 28, idx + 1);

    let ty = curY + CPAD;

    doc.fontSize(11).font('Helvetica-Bold').fillColor(C.white);
    put(doc, ej.nombre || '', CONT_X + 4, ty, { width: CONT_W - 16, lineGap: 2 });
    ty += doc.fontSize(11).font('Helvetica-Bold')
             .heightOfString(ej.nombre || '', { width: CONT_W - 16, lineGap: 2 }) + 4;

    hline(doc, ty, CONT_X, ML + TW - 12, C.ruleLight, 0.5);
    ty += 10;

    if (ej.series_repeticiones) {
      drawTag(doc, 'SERIES / REPS', CONT_X + 4, ty, C.surface, C.lime);
      ty += 20;
      doc.fontSize(9).font('Helvetica').fillColor(C.silver);
      put(doc, ej.series_repeticiones, CONT_X + 12, ty, { width: CONT_W - 24, lineGap: 3 });
      ty += doc.fontSize(9).font('Helvetica')
               .heightOfString(ej.series_repeticiones, { width: CONT_W - 24, lineGap: 3 }) + 10;
    }

    if (ej.cargas_kg) {
      drawTag(doc, 'CARGAS (KG)', CONT_X + 4, ty, C.surface, C.teal);
      ty += 20;
      doc.fontSize(9).font('Helvetica').fillColor(C.silver);
      put(doc, ej.cargas_kg, CONT_X + 12, ty, { width: CONT_W - 24, lineGap: 3 });
      ty += doc.fontSize(9).font('Helvetica')
               .heightOfString(ej.cargas_kg, { width: CONT_W - 24, lineGap: 3 }) + 10;
    }

    if (ej.observaciones) {
      drawTag(doc, 'OBSERVACIONES', CONT_X + 4, ty, C.surface, C.coral);
      ty += 20;
      doc.fontSize(9).font('Helvetica-Oblique').fillColor(C.silver);
      put(doc, ej.observaciones, CONT_X + 12, ty, { width: CONT_W - 24, lineGap: 3 });
      ty += doc.fontSize(9).font('Helvetica')
               .heightOfString(ej.observaciones, { width: CONT_W - 24, lineGap: 3 }) + 10;
    }

    if (ej.video_url) {
      doc.save();
      const playX = CONT_X + 8;
      const playY = ty + 4;
      doc.moveTo(playX, playY)
         .lineTo(playX, playY + 10)
         .lineTo(playX + 8, playY + 5)
         .closePath().fill(C.sky);
      doc.restore();

      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(C.sky);
      put(doc, 'Ver video demostrativo', CONT_X + 22, ty + 3, {
        link: ej.video_url, underline: true,
      });
    }

    curY += cH + 12;
  });

  /* ── Frase motivacional ── */
  if (ejercicios.length > 0 && curY + 60 < PH - FOOTER_ZONE) {
    curY += 16;
    hline(doc, curY, PW / 2 - 80, PW / 2 + 80, C.goldDark, 0.75);
    curY += 6;
    drawDiamond(doc, PW / 2, curY + 3, 3, C.gold);
    curY += 14;

    doc.fontSize(10).font('Helvetica-Oblique').fillColor(C.dimGray);
    put(doc, '"El unico entrenamiento malo es el que no se hace"', ML, curY, {
      width: TW, align: 'center',
    });
    curY += 18;
    hline(doc, curY, PW / 2 - 80, PW / 2 + 80, C.goldDark, 0.75);
  }

  drawFooter(pageNum);
  doc.end();

  return filename;
}

module.exports = { generatePautaPdf };
