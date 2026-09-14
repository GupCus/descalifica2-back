import nodemailer, { type Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporter) {
    return transporter;
  }

  // Si hay credenciales en el .env (modo producción / SMTP real)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE !== 'false', // true por defecto para puerto 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('[EmailService] Usando servidor SMTP configurado en .env');
  } else {
    // Si no hay credenciales (desarrollo local) -> Ethereal Email
    console.log('[EmailService] Creando cuenta de prueba en Ethereal Email...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[EmailService] Conectado a Ethereal (Sandbox para pruebas)');
  }

  return transporter;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
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

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('====================================================');
    console.log('📧 [Ethereal Email] Enlace para ver el correo de prueba:');
    console.log(previewUrl);
    console.log(`🔗 Enlace directo de reseteo: ${resetUrl}`);
    console.log('====================================================');
  } else {
    console.log(`📧 Correo de recuperación enviado a: ${to}`);
  }

  return info;
}
