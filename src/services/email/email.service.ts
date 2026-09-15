import nodemailer, { type Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function parseSender(fromStr?: string): { name: string; email: string } {
  const defaultSender = {
    name: 'Descalifica2',
    email: 'ignaciotaborda2014@gmail.com',
  };

  if (!fromStr) return defaultSender;

  const match = fromStr.match(/^(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)$/);
  if (match) {
    return {
      name: match[1]?.trim() || defaultSender.name,
      email: match[2]?.trim() || defaultSender.email,
    };
  }

  return { name: defaultSender.name, email: fromStr };
}

async function getTransporter(): Promise<Transporter> {
  if (transporter) {
    return transporter;
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return transporter;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; color: #ffffff; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #e10600; margin: 0; font-size: 26px;">Descalifica2</h1>
        <p style="color: #a0a0a0; font-size: 14px;">Recuperación de contraseña</p>
      </div>
      <div style="background-color: #262626; padding: 24px; border-radius: 6px; border: 1px solid #333333;">
        <p style="font-size: 16px; line-height: 1.5; color: #e0e0e0;">
          Hola, recibimos una solicitud para restablecer la contraseña de tu cuenta.
        </p>
        <p style="font-size: 14px; color: #a0a0a0;">
          Haz clic en el siguiente botón para crear una nueva contraseña. Este enlace expira en <strong>15 minutos</strong>.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #e10600; color: #ffffff; text-decoration: none; padding: 12px 28px; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 15px;">
            Restablecer Contraseña
          </a>
        </div>
        <p style="font-size: 12px; color: #777777; line-height: 1.4;">
          Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br/>
          <a href="${resetUrl}" style="color: #e10600; word-break: break-all;">${resetUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #333333; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777777; margin: 0;">
          Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña no cambiará.
        </p>
      </div>
    </div>
  `;

  const text = `Recibimos una solicitud para restablecer tu contraseña en Descalifica2. Visita el siguiente enlace para continuar (expira en 15 minutos): ${resetUrl}`;

  // Prioridad 1: Brevo HTTP API (Puerto 443 HTTPS - 100% inmune a bloqueos de puertos en Railway)
  const brevoApiKey =
    process.env.BREVO_API_KEY ||
    (process.env.SMTP_PASS?.startsWith('xkeysib-')
      ? process.env.SMTP_PASS
      : undefined);

  if (brevoApiKey) {
    try {
      console.log('[EmailService] Enviando correo mediante Brevo HTTP API (HTTPS)...');
      const sender = parseSender(process.env.EMAIL_FROM);

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender,
          to: [{ email: to }],
          subject: 'Recuperación de contraseña - Descalifica2',
          htmlContent: html,
          textContent: text,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(
          `Error ${response.status} en Brevo API: ${JSON.stringify(errJson)}`,
        );
      }

      const result = await response.json();
      console.log(`📧 Correo enviado con éxito (vía Brevo API) a: ${to}`, result);
      return result;
    } catch (apiError: any) {
      console.error('[EmailService] Falló el envío por Brevo API:', apiError.message || apiError);
      throw apiError;
    }
  }

  // Prioridad 2: SMTP con Nodemailer (como fallback o para otros servidores)
  try {
    const mailer = await getTransporter();
    const from =
      process.env.EMAIL_FROM || '"Descalifica2" <no-reply@descalifica2.com>';

    const info = await mailer.sendMail({
      from,
      to,
      subject: 'Recuperación de contraseña - Descalifica2',
      text,
      html,
    });

    console.log(`📧 Correo de recuperación enviado a: ${to}`);
    return info;
  } catch (smtpError: any) {
    transporter = null;
    console.error('[EmailService] Error al enviar email vía SMTP:', smtpError.message || smtpError);
    throw smtpError;
  }
}
