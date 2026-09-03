import PDFDocument from 'pdfkit';

const AZUL_POR_DEFECTO = '#1E3A8A';

function crearBuffer(dibujar: (doc: PDFKit.PDFDocument) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    dibujar(doc);
    doc.end();
  });
}

interface Optica {
  nombre: string;
  nit?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  color_primario?: string | null;
}

interface Paciente {
  nombre_completo: string;
  tipo_documento: string;
  numero_documento: string;
}

function dibujarMembrete(doc: PDFKit.PDFDocument, optica: Optica) {
  const color = optica.color_primario || AZUL_POR_DEFECTO;
  doc.fillColor(color).fontSize(18).font('Helvetica-Bold').text(optica.nombre, { align: 'left' });
  doc.fontSize(9).font('Helvetica').fillColor('#444444');
  const lineaContacto = [optica.nit ? `NIT ${optica.nit}` : null, optica.direccion, optica.telefono]
    .filter(Boolean)
    .join(' · ');
  if (lineaContacto) doc.text(lineaContacto);
  doc.moveTo(50, doc.y + 8).lineTo(545, doc.y + 8).strokeColor(color).lineWidth(1.5).stroke();
  doc.moveDown(1.5);
  doc.fillColor('#000000');
}

function dibujarDatosPaciente(doc: PDFKit.PDFDocument, paciente: Paciente, fecha: Date) {
  doc.fontSize(10).font('Helvetica-Bold').text('Paciente: ', { continued: true }).font('Helvetica').text(paciente.nombre_completo);
  doc
    .font('Helvetica-Bold')
    .text('Documento: ', { continued: true })
    .font('Helvetica')
    .text(`${paciente.tipo_documento} ${paciente.numero_documento}`);
  doc
    .font('Helvetica-Bold')
    .text('Fecha: ', { continued: true })
    .font('Helvetica')
    .text(fecha.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }));
  doc.moveDown(1);
}

interface FormulaOptions {
  optica: Optica;
  paciente: Paciente;
  historia: any;
}

export function generarFormulaPDF({ optica, paciente, historia }: FormulaOptions): Promise<Buffer> {
  return crearBuffer((doc) => {
    dibujarMembrete(doc, optica);
    doc.fontSize(14).font('Helvetica-Bold').text('FÓRMULA ÓPTICA', { align: 'center' });
    doc.moveDown(1);
    dibujarDatosPaciente(doc, paciente, new Date(historia.fecha_atencion));

    const filas = [
      ['', 'Esfera', 'Cilindro', 'Eje', 'Adición'],
      ['OD', historia.formula_od_esfera, historia.formula_od_cilindro, historia.formula_od_eje, historia.formula_od_adicion],
      ['OI', historia.formula_oi_esfera, historia.formula_oi_cilindro, historia.formula_oi_eje, historia.formula_oi_adicion],
    ];

    const colX = [50, 130, 230, 330, 430];
    const colW = [80, 100, 100, 100, 100];
    let y = doc.y;
    filas.forEach((fila, i) => {
      doc.font(i === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(11);
      fila.forEach((celda, j) => {
        doc.text(celda ?? '—', colX[j], y, { width: colW[j] });
      });
      y += 22;
    });
    doc.y = y + 10;

    if (historia.distancia_interpupilar) {
      doc.font('Helvetica-Bold').text('Distancia interpupilar: ', { continued: true }).font('Helvetica').text(historia.distancia_interpupilar);
    }
    if (historia.tipo_lente) {
      doc.font('Helvetica-Bold').text('Tipo de lente: ', { continued: true }).font('Helvetica').text(historia.tipo_lente);
    }
    if (historia.material_lente) {
      doc.font('Helvetica-Bold').text('Material: ', { continued: true }).font('Helvetica').text(historia.material_lente);
    }
    if (historia.tratamientos) {
      doc.font('Helvetica-Bold').text('Tratamientos: ', { continued: true }).font('Helvetica').text(historia.tratamientos);
    }

    const diagnosticos = (historia.diagnosticos ?? []) as { codigo: string; descripcion: string }[];
    if (diagnosticos.length > 0) {
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Diagnóstico: ', { continued: true });
      doc.font('Helvetica').text(diagnosticos.map((d) => `${d.codigo} — ${d.descripcion}`).join(', '));
    }

    doc.moveDown(3);
    doc.font('Helvetica').fontSize(10);
    doc.text('_______________________________');
    doc.text(historia.firma_nombre);
    doc.text(`Registro profesional: ${historia.firma_registro_profesional}`);

    doc.moveDown(2);
    doc.fontSize(8).fillColor('#888888').text('Documento generado por Bioptica.', { align: 'center' });
  });
}

interface ConsentimientoOptions {
  optica: Optica;
  paciente: Paciente;
  consentimiento: any;
}

export function generarConsentimientoPDF({ optica, paciente, consentimiento }: ConsentimientoOptions): Promise<Buffer> {
  return crearBuffer((doc) => {
    dibujarMembrete(doc, optica);
    doc.fontSize(13).font('Helvetica-Bold').text('CONSENTIMIENTO INFORMADO Y AUTORIZACIÓN DE DATOS PERSONALES', { align: 'center' });
    doc.moveDown(1);
    dibujarDatosPaciente(doc, paciente, new Date(consentimiento.firmado_en));

    doc.fontSize(9.5).font('Helvetica').fillColor('#000000').text(consentimiento.texto_consentimiento, {
      align: 'justify',
      lineGap: 3,
    });

    doc.moveDown(1.5);
    doc.font('Helvetica-Bold').fontSize(10).text('Firma del paciente:');
    doc.moveDown(0.3);

    const base64 = String(consentimiento.firma_imagen_base64).split(',')[1] ?? '';
    if (base64) {
      const buffer = Buffer.from(base64, 'base64');
      doc.image(buffer, { width: 220, height: 90 });
    }

    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10).text(consentimiento.nombre_paciente_firma);
    doc.text(`Documento: ${consentimiento.documento_paciente_firma}`);

    doc.moveDown(2);
    doc.fontSize(8).fillColor('#888888').text('Documento generado por Bioptica.', { align: 'center' });
  });
}
