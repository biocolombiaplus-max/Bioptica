import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null | undefined;

function obtenerTransporter(): nodemailer.Transporter | null {
  if (transporter !== undefined) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

interface EnviarFormulaInput {
  destinatario: string;
  nombrePaciente: string;
  nombreOptica: string;
  pdf: Buffer;
}

export class CorreoNoConfiguradoError extends Error {
  status = 503;
  constructor() {
    super('El envío de correos no está configurado en esta óptica todavía');
  }
}

export async function enviarFormulaPorCorreo({ destinatario, nombrePaciente, nombreOptica, pdf }: EnviarFormulaInput) {
  const cliente = obtenerTransporter();
  if (!cliente) {
    throw new CorreoNoConfiguradoError();
  }

  await cliente.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: destinatario,
    subject: `Tu fórmula óptica — ${nombreOptica}`,
    text: `Hola ${nombrePaciente},\n\nAdjuntamos tu fórmula óptica de ${nombreOptica}.\n\nSaludos.`,
    attachments: [{ filename: 'formula-optica.pdf', content: pdf }],
  });
}
