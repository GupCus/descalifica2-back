import nodemailer, { type Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporter) {
    return transporter;
  }

  // Validar que las credenciales existan
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      '[EmailService] Faltan configurar las variables SMTP_USER y SMTP_PASS.',
    );
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
    connectionTimeout: 8000, // 8s máx para conectar
    greetingTimeout: 8000,   // 8s máx esperando respuesta
    socketTimeout: 10000,    // 10s máx de inactividad
  });

  console.log(
    `[EmailService] Servidor SMTP configurado: ${process.env.SMTP_HOST || 'smtp-relay.brevo.com'}:${port} (secure: ${isSecure})`,
  );

  return transporter;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
  try {
    const mailer = await getTransporter();

    const from =
      process.env.EMAIL_FROM || '"Descalifica2" <no-reply@descalifica2.com>';

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

    const info = await mailer.sendMail({
      from,
      to,
      subject: 'Recuperación de contraseña - Descalifica2',
      text: `Recibimos una solicitud para restablecer tu contraseña en Descalifica2. Visita el siguiente enlace para continuar (expira en 15 minutos): ${resetUrl}`,
      html,
    });

    console.log(`📧 Correo de recuperación enviado a: ${to}`);
    return info;
  } catch (error: any) {
    // Si falló, reseteamos la instancia para no reusar una conexión muerta
    transporter = null;
    console.error('[EmailService] Error al enviar email:', error.message || error);
    throw error;
  }
}
